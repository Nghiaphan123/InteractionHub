import axiosClient from "../api/axios";
import type { Post } from "../types/post";

export const getPostsAPI = async (): Promise<Post[]> => {
  try {
    const response = await axiosClient.get("/posts");
    return response.data || [];
  } catch (error) {
    console.error("Failed to fetch posts:", error);
    throw error;
  }
};

export const getPostByIdAPI = (id: string) => {
  return axiosClient.get(`/posts/${id}`);
};

export const createPostAPI = (data: { content: string; imageUrl?: string }) => {
  return axiosClient.post("/posts", data);
};

export const updatePostAPI = (id: string, data: { content: string; imageUrl?: string }) => {
  return axiosClient.put(`/posts/${id}`, data);
};

export const deletePostAPI = (id: string) => {
  return axiosClient.delete(`/posts/${id}`);
};

export const likePostAPI = (id: string) => {
  return axiosClient.post(`/posts/${id}/like`);
};

export const unlikePostAPI = (id: string) => {
  return axiosClient.post(`/posts/${id}/unlike`);
};

export const addCommentAPI = (postId: string, data: { content: string }) => {
  return axiosClient.post(`/posts/${postId}/comments`, data);
};

export const deleteCommentAPI = (postId: string, commentId: string) => {
  return axiosClient.delete(`/posts/${postId}/comments/${commentId}`);
};
