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

    const { userId } = req.body as { userId: string };

    if (!userId) {
      return res.status(400).json({ message: 'ID пользователя обязателен' });
    }

    const subscription = await prisma.subscription.findFirst({
      where: {
        followerId: session.user.id,
        followingId: userId,
      },
    });

    if (!subscription) {
      return res.status(404).json({ message: 'Подписка не найдена' });
    }

    await prisma.subscription.delete({
      where: { id: subscription.id },
    });

    res.status(200).json({ message: 'Отписка успешно выполнена' });
  } catch (error) {
    console.error('Ошибка отписки:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
}
