import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { prisma } from '@/lib/prisma';
import { CreatePostInput } from '@/types';

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

    const { title, content, visibility, tags } = req.body as CreatePostInput;

    if (!title || !content) {
      return res.status(400).json({ message: 'Заголовок и содержание обязательны' });
    }

    const post = await prisma.post.create({
      data: {
        title,
        content,
        visibility: visibility || 'PUBLIC',
        author: {
          connect: { id: session.user.id },
        },
      },
    });

    if (tags && tags.length > 0) {
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
            post: { connect: { id: post.id } },
            tag: { connect: { id: tag.id } },
          },
        });
      }
    }

    const createdPost = await prisma.post.findUnique({
      where: { id: post.id },
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

    res.status(201).json({ post: createdPost });
  } catch (error) {
    console.error('Ошибка создания поста:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
}
