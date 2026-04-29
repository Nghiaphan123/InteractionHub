import axios from "../api/axios";
import { axiosAuthClient } from "../api/axios";

export const loginAPI = (data: { email: string; password: string }) => {
  return axiosAuthClient.post("/auth/login", data);
};

export const getMeAPI = () => {
  return axios.get("/users/me");
};

export type RegisterPayload = {
  username: string;
  email: string;
  password: string;
  fullName: string;
};

export const registerAPI = async (data: RegisterPayload) => {
  return axiosAuthClient.post("/auth/register", data);
};