import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { UserPlus, UserMinus, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface FollowButtonProps {
  userId: string;
  isFollowing: boolean;
  onFollow: () => Promise<void>;
  onUnfollow: () => Promise<void>;
}

export default function FollowButton({ userId, isFollowing, onFollow, onUnfollow }: FollowButtonProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  if (!session) {
    return (
      <Link href="/auth/signin" className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
        <UserPlus className="h-4 w-4 mr-2" />
        Войдите, чтобы подписаться
      </Link>
    );
  }

  if (session.user.id === userId) {
    return null;
  }

  const handleAction = async () => {
    setIsLoading(true);
    try {
      if (isFollowing) {
        await onUnfollow();
      } else {
        await onFollow();
      }
    } catch (error) {
      console.error('Ошибка при изменении подписки:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleAction}
      disabled={isLoading}
      className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${
        isFollowing
          ? 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
          : 'border-transparent text-white bg-indigo-600 hover:bg-indigo-700'
      } focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : isFollowing ? (
        <UserMinus className="h-4 w-4 mr-2" />
      ) : (
        <UserPlus className="h-4 w-4 mr-2" />
      )}
      {isFollowing ? 'Отписаться' : 'Подписаться'}
    </button>
  );
}
