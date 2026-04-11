// src/types/post.ts
export interface Post {
  id: string;
  author: {
    fullName: string;
    avatarUrl: string;
  };
  content: string;
  imageUrl?: string;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
}