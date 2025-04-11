import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { prisma } from '@/lib/prisma';
import { Comment } from '@/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query as { id: string };

  if (req.method === 'GET') {
    try {

      const comment = await prisma.comment.create({
        data: {
          content,
          author: {
            connect: { id: session.user.id },
          },
          post: {
            connect: { id },
          },
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

      res.status(201).json({ comment });
    } catch (error) {
      console.error('Ошибка создания комментария:', error);
      res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
  } else {
    res.status(405).json({ message: 'Метод не разрешен' });
  }
}const post = await prisma.post.findUnique({
        where: { id },
        include: {
          author: true,
        },
      });

      if (!post) {
        return res.status(404).json({ message: 'Пост не найден' });
      }

      // Проверяем доступ к приватному посту
      if (post.visibility !== 'PUBLIC') {
        const session = await getSession({ req });

        if (!session) {
          return res.status(401).json({ message: 'Не авторизован' });
        }

        const isAuthor = post.author.id === session.user.id;

        if (!isAuthor && post.visibility === 'PRIVATE') {
          return res.status(403).json({ message: 'У вас нет доступа к этому посту' });
        }

        if (!isAuthor && post.visibility === 'REQUEST_ONLY') {
          const hasAccess = await prisma.accessRequest.findFirst({
            where: {
              postId: id,
              userId: session.user.id,
              status: 'APPROVED',
            },
          });

          if (!hasAccess) {
            return res.status(403).json({ message: 'У вас нет доступа к этому посту' });
          }
        }
      }

      const comments = await prisma.comment.findMany({
        where: { postId: id },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      res.status(200).json({ comments });
    } catch (error) {
      console.error('Ошибка получения комментариев:', error);
      res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
  } else if (req.method === 'POST') {
    try {
      const session = await getSession({ req });

      if (!session) {
        return res.status(401).json({ message: 'Не авторизован' });
      }

      const { content } = req.body as { content: string };

      if (!content) {
        return res.status(400).json({ message: 'Содержание комментария обязательно' });
      }

      const post = await prisma.post.findUnique({
        where: { id },
        include: {
          author: true,
        },
      });

      if (!post) {
        return res.status(404).json({ message: 'Пост не найден' });
      }

      // Проверяем доступ к приватному посту
      const isAuthor = post.author.id === session.user.id;

      if (!isAuthor && post.visibility === 'PRIVATE') {
        return res.status(403).json({ message: 'У вас нет доступа к этому посту' });
      }

      if (!isAuthor && post.visibility === 'REQUEST_ONLY') {
        const hasAccess = await prisma.accessRequest.findFirst({
          where: {
            postId: id,
            userId: session.user.id,
            status: 'APPROVED',
          },
        });

        if (!hasAccess) {
          return res.status(403).json({ message: 'У вас нет доступа к этому посту' });
        }
      }
