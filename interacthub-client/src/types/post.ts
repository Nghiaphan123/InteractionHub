// src/types/post.ts
export interface Post {
  id: string;
  author: {
    id: string;
    fullName: string;
    avatarUrl: string;
    username: string;
  };
  content: string;
  imageUrl?: string;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
}