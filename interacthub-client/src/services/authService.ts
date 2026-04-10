import axiosClient from "../api/axios";

export const loginApi = (data: { email: string; password: string }) => {
  return axiosClient.post("/login", data);
};

export const logoutApi = () => {
  return axiosClient.post("/logout");
};