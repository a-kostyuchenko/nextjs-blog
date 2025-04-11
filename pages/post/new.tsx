import { useState } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { getSession } from 'next-auth/react';
import Layout from '@/components/layout/Layout';
import PostForm from '@/components/post/PostForm';
import { CreatePostInput } from '@/types';

export default function NewPost() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: CreatePostInput) => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/posts/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const { post } = await response.json();
        router.push(`/post/${post.id}`);
      } else {
        const data = await response.json();
        alert(`Ошибка: ${data.message || 'Не удалось создать пост'}`);
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Ошибка создания поста:', error);
      alert('Ошибка при создании поста');
      setIsSubmitting(false);
    }
  };

  return (
    <Layout title="Новый пост | БлогСервис">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Создать новый пост</h1>
        <PostForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
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

  return {
    props: {},
  };
};
