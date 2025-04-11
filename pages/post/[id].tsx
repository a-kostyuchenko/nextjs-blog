import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { getSession, useSession } from 'next-auth/react';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Heart, MessageCircle, Share2, Edit, Trash2, Lock, UserPlus } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { Post, Comment as CommentType } from '@/types';
import Layout from '@/components/layout/Layout';
import Comment from '@/components/comment/Comment';
import CommentForm from '@/components/comment/CommentForm';

interface PostDetailProps {
  post: Post | null;
  isPrivate: boolean;
  isRequestOnly: boolean;
  hasAccess: boolean;
}

export default function PostDetail({ post, isPrivate, isRequestOnly, hasAccess }: PostDetailProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isUserAuthor = session?.user?.id === post?.author.id;
  const canViewPost = !isPrivate || isUserAuthor || hasAccess;

  useEffect(() => {
    if (post && canViewPost) {
      fetchComments();
    }
  }, [post, canViewPost]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/posts/${post?.id}/comments`);

      if (response.ok) {
        const data = await response.json();
        setComments(data.comments);
      }
    } catch (error) {
      console.error('Ошибка загрузки комментариев:', error);
    }
  };

  const handleLikeToggle = () => {
    setIsLiked(!isLiked);
  };

  const handleCommentSubmit = async (content: string) => {
    if (!post) return;

    setIsSubmittingComment(true);

    try {
      const response = await fetch(`/api/posts/${post.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (response.ok) {
        const data = await response.json();
        setComments([data.comment, ...comments]);
      } else {
        const data = await response.json();
        alert(`Ошибка: ${data.message || 'Не удалось добавить комментарий'}`);
      }
    } catch (error) {
      console.error('Ошибка добавления комментария:', error);
      alert('Ошибка при добавлении комментария');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleRequestAccess = async () => {
    if (!post) return;

    try {
      const response = await fetch('/api/posts/request-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId: post.id }),
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

  const handleDelete = async () => {
    if (!post) return;

    if (!confirm('Вы уверены, что хотите удалить этот пост?')) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/posts/${post.id}/delete`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.replace('/');
      } else {
        const data = await response.json();
        alert(`Ошибка: ${data.message || 'Не удалось удалить пост'}`);
        setIsDeleting(false);
      }
    } catch (error) {
      console.error('Ошибка удаления поста:', error);
      alert('Ошибка при удалении поста');
      setIsDeleting(false);
    }
  };

  if (!post) {
    return (
      <Layout title="Пост не найден | БлогСервис">
        <div className="max-w-3xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Пост не найден</h1>
          <p className="text-gray-600 mb-6">
            Пост, который вы ищете, не существует или был удален.
          </p>
          <Link href="/" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-md font-medium">
            Вернуться на главную
          </Link>
        </div>
      </Layout>
    );
  }

  if (!canViewPost) {
    return (
      <Layout title="Доступ ограничен | БлогСервис">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Lock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Доступ ограничен</h1>
            <p className="text-gray-600 mb-6">
              {isRequestOnly
                ? 'Этот пост доступен только по запросу.'
                : 'Этот пост является приватным и доступен только автору.'}
            </p>

            {isRequestOnly && session && (
              <button
                onClick={handleRequestAccess}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Запросить доступ
              </button>
            )}

            {!session && (
              <Link href="/auth/signin" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                Войти
              </Link>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`${post.title} | БлогСервис`}>
      <article className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex items-center mb-4">
              <Link href={`/profile/${post.author.id}`}>
                <img
                  src={post.author.image || `https://ui-avatars.com/api/?name=${post.author.name}`}
                  alt={post.author.name || 'Автор'}
                  className="h-12 w-12 rounded-full object-cover mr-3"
                />
              </Link>
              <div>
                <Link href={`/profile/${post.author.id}`} className="font-medium text-lg text-gray-900 hover:underline">
                  {post.author.name || 'Пользователь'}
                </Link>
                <p className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ru })}

                  {isPrivate && (
                    <span className="inline-flex items-center ml-2 text-gray-500">
                      <Lock className="h-3 w-3 mr-1" />
                      {isRequestOnly ? 'По запросу' : 'Приватный'}
                    </span>
                  )}
                </p>
              </div>

              {isUserAuthor && (
                <div className="ml-auto flex items-center space-x-2">
                  <Link
                    href={`/post/${post.id}/edit`}
                    className="p-2 text-gray-500 hover:text-indigo-600 focus:outline-none"
                  >
                    <Edit className="h-5 w-5" />
                  </Link>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="p-2 text-gray-500 hover:text-red-600 focus:outline-none"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>

            <div className="prose max-w-none mb-6">
              {post.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4">{paragraph}</p>
              ))}
            </div>

            {post.tags && post.tags.length > 0 && (
              <div className="mb-6 flex flex-wrap gap-1">
                {post.tags.map(postTag => (
                  <Link
                    key={postTag.tag.id}
                    href={`/tag/${postTag.tag.name}`}
                    className="inline-block bg-gray-100 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 hover:bg-gray-200"
                  >
                    #{postTag.tag.name}
                  </Link>
                ))}
              </div>
            )}

            <div className="flex pt-4 border-t">
              <button
                onClick={handleLikeToggle}
                className={`flex items-center mr-6 ${isLiked ? 'text-red-500' : 'text-gray-500'} hover:text-red-500`}
              >
                <Heart className={`h-6 w-6 ${isLiked ? 'fill-current' : ''}`} />
                <span className="ml-2">{post._count?.likes || 0}</span>
              </button>

              <a href="#comments" className="flex items-center mr-6 text-gray-500 hover:text-indigo-500">
                <MessageCircle className="h-6 w-6" />
                <span className="ml-2">{comments.length}</span>
              </a>

              <button className="flex items-center text-gray-500 hover:text-indigo-500">
                <Share2 className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        <section id="comments" className="mt-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Комментарии ({comments.length})</h2>

          <div className="bg-white rounded-lg shadow-md p-6">
            <CommentForm
              postId={post.id}
              onSubmit={handleCommentSubmit}
              isSubmitting={isSubmittingComment}
            />

            {comments.length > 0 ? (
              <div className="mt-6">
                {comments.map(comment => (
                  <Comment key={comment.id} comment={comment} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center mt-6 py-4">
                Будьте первым, кто оставит комментарий!
              </p>
            )}
          </div>
        </section>
      </article>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  const { id } = context.params as { id: string };

  const post = await prisma.post.findUnique({
    where: { id },
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
  });

  if (!post) {
    return {
      props: {
        post: null,
        isPrivate: false,
        isRequestOnly: false,
        hasAccess: false,
      },
    };
  }

  const isPrivate = post.visibility === 'PRIVATE';
  const isRequestOnly = post.visibility === 'REQUEST_ONLY';
  const isUserAuthor = session?.user?.id === post.author.id;

  let hasAccess = false;

  if (isRequestOnly && session && !isUserAuthor) {
    // Проверяем, есть ли у пользователя одобренный запрос на доступ
    const accessRequest = await prisma.accessRequest.findFirst({
      where: {
        postId: id,
        userId: session.user.id,
        status: 'APPROVED',
      },
    });

    hasAccess = !!accessRequest;
  }

  // Если пост приватный и пользователь не автор и нет доступа, скрываем содержимое поста
  const canViewPost = !isPrivate || isUserAuthor || hasAccess;

  return {
    props: {
      post: JSON.parse(JSON.stringify(post)),
      isPrivate,
      isRequestOnly,
      hasAccess,
    },
  };
};
