import axios from "../api/axios";

export const loginAPI = (data: { email: string; password: string }) => {
  return axios.post("/auth/login", data);
};

export const getMeAPI = () => {
  return axios.get("/users/me");
};

export const registerAPI = async (data: any) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("REGISTER DATA:", data);
      resolve({ success: true });
    }, 500);
  });
};