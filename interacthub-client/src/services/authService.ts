import axios from "../api/axios";

export const loginAPI = (data: { email: string; password: string }) =>
  axios.post("/auth/login", data).then(r => r.data);

export const registerAPI = (data: {
  username: string;
  email: string;
  password: string;
  fullName: string;
}) =>
  axios.post("/auth/register", data).then(r => r.data);

export const getMeAPI = () =>
  axios.get("/auth/me").then(r => r.data);

// ================= RECOVERY FLOW =================

// tìm tài khoản
export const findAccountAPI = (data: { email: string }) =>
  axios.post("/auth/find-account", data).then(r => r.data);

// gửi mã
export const sendResetCodeAPI = (data: { email: string }) =>
  axios.post("/auth/send-reset-code", data).then(r => r.data);

// verify mã
export const verifyResetCodeAPI = (data: {
  email: string;
  code: string;
}) =>
  axios.post("/auth/verify-reset-code", data).then(r => r.data);

// reset password
export const resetPasswordAPI = (data: {
  email: string;
  code: string;
  newPassword: string;
}) =>
  axios.post("/auth/reset-password", data).then(r => r.data);