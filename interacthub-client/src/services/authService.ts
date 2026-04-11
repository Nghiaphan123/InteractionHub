import axiosClient from "../api/axios";

export const loginAPI = (data: { email: string; password: string }) => {
  return axiosClient.post("/auth/login", data);
};