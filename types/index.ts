import { Visibility, RequestStatus } from '@prisma/client';

export type User = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  bio?: string | null;
  createdAt: Date;
};

export type Post = {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  visibility: Visibility;
  authorId: string;
  author: User;
  tags?: PostTag[];
  comments?: Comment[];
  _count?: {
    comments?: number;
    likes?: number;
  };
};

export type Comment = {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  author: User;
  postId: string;
};

export type Tag = {
  id: string;
  name: string;
  description?: string | null;
  _count?: {
    posts: number;
  };
};

export type PostTag = {
  id: string;
  postId: string;
  tagId: string;
  tag: Tag;
};

export type Subscription = {
  id: string;
  followerId: string;
  follower: User;
  followingId: string;
  following: User;
  createdAt: Date;
};

export type AccessRequest = {
  id: string;
  postId: string;
  userId: string;
  status: RequestStatus;
  createdAt: Date;
  post: Post;
  user: User;
};

export type CreatePostInput = {
  title: string;
  content: string;
  visibility: Visibility;
  tags: string[];
};

export type UpdatePostInput = CreatePostInput;

export type CreateCommentInput = {
  content: string;
};

export type ApiResponse<T> = {
  data?: T;
  error?: string;
};
