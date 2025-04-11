import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { prisma } from '@/lib/prisma';
import { UpdatePostInput } from '@/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Метод не разрешен' });
  }

  try {
    const session = await getSession({ req });

    if (!session) {
      return res.status(401).json({ message: 'Не авторизован' });
    }

    const { id } = req.query as { id: string };
    const { title, content, visibility, tags } = req.body as UpdatePostInput;

    if (!title || !content) {
      return res.status(400).json({ message: 'Заголовок и содержание обязательны' });
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

    if (post.author.id !== session.user.id) {
      return res.status(403).json({ message: 'Нет прав на редактирование этого поста' });
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        title,
        content,
        visibility,
      },
    });

    // Обновляем теги
    if (tags !== undefined) {
      // Удаляем все существующие связи тегов с постом
      await prisma.postTag.deleteMany({
        where: { postId: id },
      });

      // Добавляем новые теги
      for (const tagName of tags) {
        const normalizedTagName = tagName.toLowerCase().trim();

        if (!normalizedTagName) continue;

        let tag = await prisma.tag.findUnique({
          where: { name: normalizedTagName },
        });

        if (!tag) {
          tag = await prisma.tag.create({
            data: { name: normalizedTagName },
          });
        }

        await prisma.postTag.create({
          data: {
            post: { connect: { id } },
            tag: { connect: { id: tag.id } },
          },
        });
      }
    }

    const finalPost = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    res.status(200).json({ post: finalPost });
  } catch (error) {
    console.error('Ошибка обновления поста:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
}
