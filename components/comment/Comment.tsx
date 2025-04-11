import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Comment as CommentType } from '@/types';

interface CommentProps {
  comment: CommentType;
}

export default function Comment({ comment }: CommentProps) {
  return (
    <div className="py-4 border-b border-gray-200">
      <div className="flex items-start">
        <Link href={`/profile/${comment.author.id}`}>
          <img
            src={comment.author.image || `https://ui-avatars.com/api/?name=${comment.author.name}`}
            alt={comment.author.name || 'Автор'}
            className="h-10 w-10 rounded-full object-cover mr-3"
          />
        </Link>
        <div className="flex-1">
          <div className="flex items-center mb-1">
            <Link
              href={`/profile/${comment.author.id}`}
              className="font-medium text-gray-900 hover:underline mr-2"
            >
              {comment.author.name || 'Пользователь'}
            </Link>
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: ru })}
            </span>
          </div>
          <p className="text-gray-700">{comment.content}</p>
        </div>
      </div>
    </div>
  );
}
