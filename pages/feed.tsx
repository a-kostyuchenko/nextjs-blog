import { useState } from 'react';
import type { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import { prisma } from '@/lib/prisma';
import { Post } from '@/types';
import Layout from '@/components/layout/Layout';
import PostCard from '@/components/post/PostCard';

interface FeedProps {
  posts: Post[];
}

export default function Feed({ posts }: FeedProps) {
  const [feedPosts, setFeedPosts] = useState<Post[]>(posts);

  const handleRequestAccess = async (postId: string) => {
    try {
      const response = await fetch('/api/posts/request-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId }),
      });

      if (response.ok) {
        alert('Запрос на доступ отправлен');
      } else {
        const data = await response.json();
        alert(`Ошибка: ${data.message || 'Не удалось отправить запрос'}`);
      }
    } catch (error) {
      console.error('Ошибка запроса доступа:', error);
      alert('Ошибка при отправке запроса');
    }
  };

  return (
    <Layout title="Моя лента | БлогСервис">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Моя лента</h1>

        {feedPosts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {feedPosts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onRequestAccess={handleRequestAccess}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h3 className="text-xl font-medium text-gray-900 mb-2">Ваша лента пуста</h3>
            <p className="text-gray-600 mb-6">
              Подпишитесь на других пользователей, чтобы видеть их посты в вашей ленте.
            </p>
            <a
              href="/explore"
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-md font-medium"
            >
              Найти пользователей
            </a>
          </div>
        )}
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: '/auth/signin',
        permanent: false,
      },
    };
  }

  // Получаем список ID пользователей, на которых подписан текущий пользователь
  const subscriptions = await prisma.subscription.findMany({
    where: {
      followerId: session.user.id,
    },
    select: {
      followingId: true,
    },
  });

  const followingIds = subscriptions.map(sub => sub.followingId);

  // Если пользователь ни на кого не подписан, возвращаем пустой массив
  if (followingIds.length === 0) {
    return {
      props: {
        posts: [],
      },
    };
  }

  // Получаем посты от пользователей, на которых подписан текущий пользователь
  const posts = await prisma.post.findMany({
    where: {
      authorId: {
        in: followingIds,
      },
      OR: [
        { visibility: 'PUBLIC' },
        {
          visibility: 'REQUEST_ONLY',
          accessRequests: {
            some: {
              userId: session.user.id,
              status: 'APPROVED',
            },
          },
        },
      ],
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
      _count: {
        select: {
          comments: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return {
    props: {
      posts: JSON.parse(JSON.stringify(posts)),
    },
  };
};
