import axiosClient from "../api/axios";
import type { Post } from "../types/post";

const mapPostDtoToPost = (dto: any): Post => {
  return {
    id: String(dto.id),
    content: dto.content,
    imageUrl: dto.imageUrl ?? undefined,
    createdAt: dto.createdAt,
    likesCount: dto.likesCount,
    commentsCount: dto.commentsCount,
    isLiked: !!dto.isLikedByCurrentUser,
    author: {
      id: String(dto.userId),
      fullName: dto.fullName ?? "",
      avatarUrl: dto.avatarUrl ?? "",
      username: dto.username ?? "",
    },
  };
};

export const getPostsAPI = async (): Promise<Post[]> => {
  try {
    const response = await axiosClient.get("/posts");
    return (response.data || []).map(mapPostDtoToPost);
  } catch (error) {
    console.error("Failed to fetch posts:", error);
    throw error;
  }
};

export const getPostByIdAPI = async (id: string): Promise<Post> => {
  const response = await axiosClient.get(`/posts/${id}`);
  return mapPostDtoToPost(response.data);
};

export const createPostAPI = async (data: { content: string; imageUrl?: string }): Promise<Post> => {
  const response = await axiosClient.post("/posts", data);
  return mapPostDtoToPost(response.data);
};

export const updatePostAPI = async (id: string, data: { content: string; imageUrl?: string }): Promise<Post> => {
  const response = await axiosClient.put(`/posts/${id}`, data);
  return mapPostDtoToPost(response.data);
};

export const deletePostAPI = (id: string) => {
  return axiosClient.delete(`/posts/${id}`);
};

export const likePostAPI = (id: string) => {
  return axiosClient.post(`/posts/${id}/like`);
};

export const unlikePostAPI = (id: string) => {
  return axiosClient.delete(`/posts/${id}/like`);
};

export const addCommentAPI = (postId: string, data: { content: string }) => {
  return axiosClient.post(`/posts/${postId}/comments`, data);
};

export const getCommentsAPI = async (postId: string) => {
  const response = await axiosClient.get(`/posts/${postId}/comments`);
  return response.data || [];
};

export const deleteCommentAPI = (postId: string, commentId: string) => {
  return axiosClient.delete(`/posts/${postId}/comments/${commentId}`);
};
