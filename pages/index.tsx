import { useState } from 'react';
import type { GetServerSideProps } from 'next';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { ArrowRight, TrendingUp, Filter } from 'lucide-react';
import { Post, Tag } from '@/types';
import { prisma } from '@/lib/prisma';
import Layout from '@/components/layout/Layout';
import PostCard from '@/components/post/PostCard';

interface HomeProps {
  posts: Post[];
  popularTags: (Tag & { _count: { posts: number } })[];
}

export default function Home({ posts, popularTags }: HomeProps) {
  const { data: session } = useSession();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const filteredPosts = selectedTag
    ? posts.filter(post => post.tags?.some(pt => pt.tag.name === selectedTag))
    : posts;

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
    <Layout title="Главная | БлогСервис">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-3/4">
          <section className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Популярные посты</h2>
              <Link href="/explore" className="text-indigo-600 hover:text-indigo-800 flex items-center text-sm font-medium">
                Смотреть все <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            {session ? (
              <div className="grid grid-cols-1 gap-6">
                {filteredPosts.length > 0 ? (
                  filteredPosts.map(post => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onRequestAccess={handleRequestAccess}
                    />
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    {selectedTag
                      ? `Нет постов с тегом #${selectedTag}`
                      : 'Нет доступных постов'}
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <h3 className="text-xl font-medium text-gray-900 mb-2">Добро пожаловать в БлогСервис!</h3>
                <p className="text-gray-600 mb-6">
                  Присоединяйтесь к нашему сообществу, чтобы делиться своими мыслями и читать интересный контент.
                </p>
                <div className="flex justify-center space-x-4">
                  <Link href="/auth/signup" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-md font-medium">
                    Регистрация
                  </Link>
                  <Link href="/auth/signin" className="border border-gray-300 hover:border-indigo-500 text-gray-700 hover:text-indigo-600 px-5 py-2 rounded-md font-medium">
                    Войти
                  </Link>
                </div>
              </div>
            )}
          </section>
        </div>

        <div className="md:w-1/4">
          <div className="bg-white rounded-lg shadow-md p-4 sticky top-4">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 text-indigo-500 mr-2" />
              Популярные теги
            </h3>

            <div className="space-y-1">
              <button
                onClick={() => setSelectedTag(null)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                  selectedTag === null
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Все посты
              </button>

              {popularTags.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => setSelectedTag(tag.name)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                    selectedTag === tag.name
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  # {tag.name}
                  <span className="text-xs text-gray-500 ml-1">({tag._count.posts})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const posts = await prisma.post.findMany({
    where: {
      visibility: 'PUBLIC',
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
    take: 10,
  });

  const popularTags = await prisma.tag.findMany({
    include: {
      _count: {
        select: {
          posts: true,
        },
      },
    },
    orderBy: {
      posts: {
        _count: 'desc',
      },
    },
    take: 10,
  });

  return {
    props: {
      posts: JSON.parse(JSON.stringify(posts)),
      popularTags: JSON.parse(JSON.stringify(popularTags)),
    },
  };
};
