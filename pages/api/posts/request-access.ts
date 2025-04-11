import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Метод не разрешен' });
  }

  try {
    const session = await getSession({ req });

    if (!session) {
      return res.status(401).json({ message: 'Не авторизован' });
    }

    const { postId } = req.body as { postId: string };

    if (!postId) {
      return res.status(400).json({ message: 'ID поста обязателен' });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: true,
      },
    });

    if (!post) {
      return res.status(404).json({ message: 'Пост не найден' });
    }

    if (post.visibility !== 'REQUEST_ONLY') {
      return res.status(400).json({ message: 'Для этого поста не нужен запрос доступа' });
    }

    if (post.author.id === session.user.id) {
      return res.status(400).json({ message: 'Вы автор этого поста' });
    }

    const existingRequest = await prisma.accessRequest.findFirst({
      where: {
        postId,
        userId: session.user.id,
      },
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'Запрос уже отправлен' });
    }

    const accessRequest = await prisma.accessRequest.create({
      data: {
        post: {
          connect: { id: postId },
        },
        user: {
          connect: { id: session.user.id },
        },
        status: 'PENDING',
      },
    });

    res.status(201).json({ accessRequest });
  } catch (error) {
    console.error('Ошибка запроса доступа:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
}
