import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Метод не разрешен' });
  }

  try {
    const session = await getSession({ req });

    if (!session) {
      return res.status(401).json({ message: 'Не авторизован' });
    }

    const { id } = req.query as { id: string };

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: true,
      },
    });

    if (!post) {
      return res.status(404).json({ message: 'Пост не найден' });
    }

    if (post.author.id !== session.user.id) {
      return res.status(403).json({ message: 'Нет прав на удаление этого поста' });
    }

    // Удаляем связанные данные
    // Комментарии, теги и запросы доступа будут удалены автоматически благодаря onDelete: Cascade в схеме Prisma
    await prisma.post.delete({
      where: { id },
    });

    res.status(200).json({ message: 'Пост успешно удален' });
  } catch (error) {
    console.error('Ошибка удаления поста:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
}
