import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface CommentFormProps {
  postId: string;
  onSubmit: (content: string) => Promise<void>;
  isSubmitting: boolean;
}

export default function CommentForm({ postId, onSubmit, isSubmitting }: CommentFormProps) {
  const { data: session } = useSession();
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      setError('Содержание комментария обязательно');
      return;
    }

    setError('');
    await onSubmit(content);
    setContent('');
  };

  if (!session) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg text-center">
        <p className="text-gray-700">
          <Link href="/auth/signin" className="text-indigo-600 hover:text-indigo-500 font-medium">
            Войдите
          </Link>
          {' '}или{' '}
          <Link href="/auth/signup" className="text-indigo-600 hover:text-indigo-500 font-medium">
            зарегистрируйтесь
          </Link>
          , чтобы оставить комментарий.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <div className="flex items-start">
        <img
          src={session.user.image || `https://ui-avatars.com/api/?name=${session.user.name}`}
          alt={session.user.name || 'Пользователь'}
          className="h-10 w-10 rounded-full object-cover mr-3"
        />
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Напишите комментарий..."
            className={`block w-full rounded-md border ${
              error ? 'border-red-500' : 'border-gray-300'
            } px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500`}
            rows={3}
          />
          {error && (
            <p className="mt-1 text-sm text-red-500">{error}</p>
          )}
          <div className="mt-2 text-right">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Отправка...' : 'Отправить'}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
