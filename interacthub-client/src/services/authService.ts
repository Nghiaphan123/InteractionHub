import axios from "../api/axios";

type LoginPayload = {
  email: string;
  password: string;
};

type RegisterPayload = {
  username: string;
  email: string;
  password: string;
  fullName: string;
};

// LOGIN
export const loginAPI = async (data: LoginPayload) => {
  try {
    const res = await axios.post("/auth/login", data);

    return res.data;
  } catch (err: any) {
    throw err.response?.data || { message: "Login failed" };
  }
};

// REGISTER
export const registerAPI = async (data: RegisterPayload) => {
  try {
    const res = await axios.post("/auth/register", data);

    return res.data;
  } catch (err: any) {
    throw err.response?.data || { message: "Đăng ký thất bại" };
  }
};

export const getMeAPI = () => {
  return axios.get("/auth/me");
};