import { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Heart, MessageCircle, Share2, Lock, UserPlus } from 'lucide-react';
import { Post } from '@/types';

interface PostCardProps {
  post: Post;
  onRequestAccess?: (postId: string) => void;
}

export default function PostCard({ post, onRequestAccess }: PostCardProps) {
  const { data: session } = useSession();
  const [isLiked, setIsLiked] = useState(false);

  const isPrivate = post.visibility === 'PRIVATE';
  const isRequestOnly = post.visibility === 'REQUEST_ONLY';
  const isUserAuthor = session?.user?.id === post.author.id;
  const canViewPost = !isPrivate || isUserAuthor;

  const handleLikeToggle = () => {
    setIsLiked(!isLiked);
  };

  const handleRequestAccess = () => {
    if (onRequestAccess) {
      onRequestAccess(post.id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b">
        <div className="flex items-center">
          <Link href={`/profile/${post.author.id}`}>
            <img
              src={post.author.image || `https://ui-avatars.com/api/?name=${post.author.name}`}
              alt={post.author.name || 'Автор'}
              className="h-10 w-10 rounded-full object-cover mr-3"
            />
          </Link>
          <div>
            <Link href={`/profile/${post.author.id}`} className="font-medium text-gray-900 hover:underline">
              {post.author.name || 'Пользователь'}
            </Link>
            <p className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ru })}

              {!canViewPost && (
                <span className="inline-flex items-center ml-2 text-gray-500">
                  <Lock className="h-3 w-3 mr-1" />
                  {isRequestOnly ? 'По запросу' : 'Приватный'}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {canViewPost ? (
        <>
          <Link href={`/post/${post.id}`}>
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
              <p className="text-gray-700 line-clamp-3">{post.content}</p>
            </div>
          </Link>

          {post.tags && post.tags.length > 0 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1">
              {post.tags.map(postTag => (
                <Link
                  key={postTag.tag.id}
                  href={`/tag/${postTag.tag.name}`}
                  className="inline-block bg-gray-100 rounded-full px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-200"
                >
                  #{postTag.tag.name}
                </Link>
              ))}
            </div>
          )}

          <div className="flex px-4 py-3 border-t">
            <button
              onClick={handleLikeToggle}
              className={`flex items-center mr-4 ${isLiked ? 'text-red-500' : 'text-gray-500'} hover:text-red-500`}
            >
              <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
              <span className="ml-1 text-sm">{post._count?.likes || 0}</span>
            </button>

            <Link href={`/post/${post.id}#comments`} className="flex items-center mr-4 text-gray-500 hover:text-indigo-500">
              <MessageCircle className="h-5 w-5" />
              <span className="ml-1 text-sm">{post._count?.comments || 0}</span>
            </Link>

            <button className="flex items-center text-gray-500 hover:text-indigo-500">
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </>
      ) : (
        <div className="p-8 flex flex-col items-center justify-center text-center">
          <Lock className="h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">Этот пост приватный</h3>

          {isRequestOnly && session && (
            <>
              <p className="text-gray-500 mb-4">
                Вам нужно запросить доступ у автора, чтобы просмотреть этот контент.
              </p>
              <button
                onClick={handleRequestAccess}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Запросить доступ
              </button>
            </>
          )}

          {!session && (
            <p className="text-gray-500">
              <Link href="/auth/signin" className="text-indigo-600 hover:text-indigo-500">
                Войдите
              </Link>, чтобы запросить доступ.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
