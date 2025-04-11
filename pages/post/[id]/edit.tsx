import { useState } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { getSession } from 'next-auth/react';
import { prisma } from '@/lib/prisma';
import { Post, UpdatePostInput } from '@/types';
import Layout from '@/components/layout/Layout';
import PostForm from '@/components/post/PostForm';

interface EditPostProps {
  post: Post;
}

export default function EditPost({ post }: EditPostProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: UpdatePostInput) => {
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/posts/${post.id}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.push(`/post/${post.id}`);
      } else {
        const data = await response.json();
        alert(`Ошибка: ${data.message || 'Не удалось обновить пост'}`);
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Ошибка обновления поста:', error);
      alert('Ошибка при обновлении поста');
      setIsSubmitting(false);
    }
  };

  return (
    <Layout title="Редактирование поста | БлогСервис">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Редактирование поста</h1>
        <PostForm
          initialData={post}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
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

  const { id } = context.params as { id: string };

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: true,
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });

  if (!post) {
    return {
      redirect: {
        destination: '/404',
        permanent: false,
      },
    };
  }

  if (post.author.id !== session.user.id) {
    return {
      redirect: {
        destination: '/post/' + id,
        permanent: false,
      },
    };
  }

  return {
    props: {
      post: JSON.parse(JSON.stringify(post)),
    },
  };
};
