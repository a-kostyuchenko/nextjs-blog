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

    if (userId === session.user.id) {
      return res.status(400).json({ message: 'Нельзя подписаться на самого себя' });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        followerId: session.user.id,
        followingId: userId,
      },
    });

    if (existingSubscription) {
      return res.status(400).json({ message: 'Вы уже подписаны на этого пользователя' });
    }

    const subscription = await prisma.subscription.create({
      data: {
        follower: {
          connect: { id: session.user.id },
        },
        following: {
          connect: { id: userId },
        },
      },
    });

    res.status(201).json({ subscription });
  } catch (error) {
    console.error('Ошибка подписки:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
}
