import { useState } from 'react';
import type { GetServerSideProps } from 'next';
import { prisma } from '@/lib/prisma';
import { Post, Tag, User } from '@/types';
import Layout from '@/components/layout/Layout';
import PostCard from '@/components/post/PostCard';
import { Search, TrendingUp, Tag as TagIcon, User as UserIcon } from 'lucide-react';
import Link from 'next/link';

interface ExploreProps {
  posts: Post[];
  popularTags: (Tag & { _count: { posts: number } })[];
  suggestedUsers: User[];
}

export default function Explore({ posts, popularTags, suggestedUsers }: ExploreProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const filteredPosts = posts.filter(post => {
    if (selectedTag) {
      return post.tags?.some(pt => pt.tag.name === selectedTag);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        post.title.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query) ||
        post.author.name?.toLowerCase().includes(query) ||
        post.tags?.some(pt => pt.tag.name.toLowerCase().includes(query))
      );
    }

    return true;
  });

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
    <Layout title="Обзор | БлогСервис">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Обзор</h1>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-3/4">
            <div className="mb-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Поиск постов, тегов или авторов..."
                />
              </div>
            </div>

            <section>
              {selectedTag && (
                <div className="mb-4 flex items-center">
                  <span className="text-sm text-gray-500 mr-2">Фильтр:</span>
                  <span className="inline-flex items-center bg-indigo-100 text-indigo-800 rounded-full px-3 py-1 text-sm mr-2">
                    #{selectedTag}
                  </span>
                  <button
                    onClick={() => setSelectedTag(null)}
                    className="text-xs text-gray-500 hover:text-indigo-600"
                  >
                    Сбросить
                  </button>
                </div>
              )}

              {filteredPosts.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {filteredPosts.map(post => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onRequestAccess={handleRequestAccess}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <p className="text-gray-500">
                    {searchQuery || selectedTag
                      ? 'Ничего не найдено. Попробуйте изменить параметры поиска.'
                      : 'Нет доступных постов.'}
                  </p>
                </div>
              )}
            </section>
          </div>

          <div className="md:w-1/4">
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <h3 className="font-medium text-gray-900 mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 text-indigo-500 mr-2" />
                Популярные теги
              </h3>

              <div className="flex flex-wrap gap-2">
                {popularTags.map(tag => (
                  <button
                    key={tag.id}
                    onClick={() => setSelectedTag(tag.name)}
                    className={`inline-flex items-center rounded-full px-3 py-1 text-sm ${
                      selectedTag === tag.name
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <TagIcon className="h-3 w-3 mr-1" />
                    {tag.name}
                    <span className="ml-1 text-xs">({tag._count.posts})</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="font-medium text-gray-900 mb-4 flex items-center">
                <UserIcon className="h-5 w-5 text-indigo-500 mr-2" />
                Интересные авторы
              </h3>

              {suggestedUsers.length > 0 ? (
                <div className="space-y-4">
                  {suggestedUsers.map(user => (
                    <Link
                      key={user.id}
                      href={`/profile/${user.id}`}
                      className="flex items-center p-2 rounded-md hover:bg-gray-50"
                    >
                      <img
                        src={user.image || `https://ui-avatars.com/api/?name=${user.name}`}
                        alt={user.name || 'Пользователь'}
                        className="h-10 w-10 rounded-full object-cover mr-3"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.bio || 'Нет информации'}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Нет предложений</p>
              )}
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
    take: 20,
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
    take: 15,
  });

  // Получаем активных пользователей (с наибольшим количеством постов)
  const suggestedUsers = await prisma.user.findMany({
    where: {
      posts: {
        some: {
          visibility: 'PUBLIC',
        },
      },
    },
    select: {
      id: true,
      name: true,
      image: true,
      bio: true,
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
    take: 5,
  });

  return {
    props: {
      posts: JSON.parse(JSON.stringify(posts)),
      popularTags: JSON.parse(JSON.stringify(popularTags)),
      suggestedUsers: JSON.parse(JSON.stringify(suggestedUsers)),
    },
  };
};
