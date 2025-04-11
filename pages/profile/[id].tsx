import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { getSession, useSession } from 'next-auth/react';
import { Tab } from '@headlessui/react';
import { prisma } from '@/lib/prisma';
import { Post, User } from '@/types';
import Layout from '@/components/layout/Layout';
import PostCard from '@/components/post/PostCard';
import FollowButton from '@/components/profile/FollowButton';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

interface ProfileProps {
  user: User;
  posts: Post[];
  isFollowing: boolean;
  followersCount: number;
  followingCount: number;
}

export default function Profile({ user, posts, isFollowing: initialIsFollowing, followersCount: initialFollowersCount, followingCount }: ProfileProps) {
  const { data: session } = useSession();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [followersCount, setFollowersCount] = useState(initialFollowersCount);
  const [userPosts, setUserPosts] = useState(posts);

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

  const handleFollow = async () => {
    try {
      const response = await fetch('/api/users/follow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });

      if (response.ok) {
        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
      } else {
        const data = await response.json();
        alert(`Ошибка: ${data.message || 'Не удалось подписаться'}`);
      }
    } catch (error) {
      console.error('Ошибка подписки:', error);
      alert('Ошибка при подписке');
    }
  };

  const handleUnfollow = async () => {
    try {
      const response = await fetch('/api/users/unfollow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });

      if (response.ok) {
        setIsFollowing(false);
        setFollowersCount(prev => Math.max(0, prev - 1));
      } else {
        const data = await response.json();
        alert(`Ошибка: ${data.message || 'Не удалось отписаться'}`);
      }
    } catch (error) {
      console.error('Ошибка отписки:', error);
      alert('Ошибка при отписке');
    }
  };

  return (
    <Layout title={`${user.name || 'Профиль'} | БлогСервис`}>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col md:flex-row items-center md:items-start">
              <img
                src={user.image || `https://ui-avatars.com/api/?name=${user.name}`}
                alt={user.name || 'Пользователь'}
                className="h-24 w-24 rounded-full object-cover mb-4 md:mb-0 md:mr-6"
              />

              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  {user.name || 'Пользователь'}
                </h1>

                <div className="flex justify-center md:justify-start space-x-4 mb-3 text-sm text-gray-500">
                  <span>{userPosts.length} постов</span>
                  <span>{followersCount} подписчиков</span>
                  <span>{followingCount} подписок</span>
                </div>

                {user.bio && (
                  <p className="text-gray-700 mb-4">{user.bio}</p>
                )}

                <div className="flex justify-center md:justify-start">
                  <FollowButton
                    userId={user.id}
                    isFollowing={isFollowing}
                    onFollow={handleFollow}
                    onUnfollow={handleUnfollow}
                  />
                </div>
              </div>
            </div>
          </div>

          <Tab.Group>
            <Tab.List className="flex border-t">
              <Tab
                className={({ selected }) =>
                  classNames(
                    'flex-1 py-3 px-4 text-center focus:outline-none',
                    selected
                      ? 'text-indigo-600 border-b-2 border-indigo-600 font-medium'
                      : 'text-gray-500 hover:text-indigo-600'
                  )
                }
              >
                Посты
              </Tab>
              <Tab
                className={({ selected }) =>
                  classNames(
                    'flex-1 py-3 px-4 text-center focus:outline-none',
                    selected
                      ? 'text-indigo-600 border-b-2 border-indigo-600 font-medium'
                      : 'text-gray-500 hover:text-indigo-600'
                  )
                }
              >
                Подписки
              </Tab>
            </Tab.List>

            <Tab.Panels>
              <Tab.Panel className="p-6">
                {userPosts.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6">
                    {userPosts.map(post => (
                      <PostCard
                        key={post.id}
                        post={post}
                        onRequestAccess={handleRequestAccess}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Нет доступных постов</p>
                  </div>
                )}
              </Tab.Panel>

              <Tab.Panel className="p-6">
                <div className="text-center py-8">
                  <p className="text-gray-500">Функция просмотра подписок будет доступна в ближайшее время</p>
                </div>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  const { id } = context.params as { id: string };

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      bio: true,
      createdAt: true,
    },
  });

  if (!user) {
    return {
      notFound: true,
    };
  }

  let isFollowing = false;

  if (session) {
    const subscription = await prisma.subscription.findFirst({
      where: {
        followerId: session.user.id,
        followingId: id,
      },
    });

    isFollowing = !!subscription;
  }

  // Получаем количество подписчиков и подписок
  const followersCount = await prisma.subscription.count({
    where: {
      followingId: id,
    },
  });

  const followingCount = await prisma.subscription.count({
    where: {
      followerId: id,
    },
  });

  // Получаем посты пользователя
  const where = {
    authorId: id,
    ...(session?.user.id !== id ? { visibility: 'PUBLIC' } : {}),
  };

  const posts = await prisma.post.findMany({
    where,
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
      user: JSON.parse(JSON.stringify(user)),
      posts: JSON.parse(JSON.stringify(posts)),
      isFollowing,
      followersCount,
      followingCount,
    },
  };
};
