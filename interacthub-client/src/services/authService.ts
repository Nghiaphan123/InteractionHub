import axios from "../api/axios";

// LOGIN
export const loginAPI = async (data: { email: string; password: string }) => {
  const res = await axios.post("/auth/login", data);
  return res.data;
};

// REGISTER
export const registerAPI = async (data: {
  username: string;
  email: string;
  password: string;
  fullName: string;
}) => {
  const res = await axios.post("/auth/register", data);
  return res.data;
};

// GET ME
export const getMeAPI = async () => {
  const res = await axios.get("/auth/me");
  return res.data;
};

// FIND ACCOUNT
export const findAccountAPI = async (data: { email: string }) => {
  const res = await axios.post("/auth/find-account", data);
  return res.data;
};

// SEND CODE
export const sendRecoveryCodeAPI = async (data: { value: string }) => {
  const res = await axios.post("/auth/send-recovery-code", data);
  return res.data;
};

// VERIFY CODE
export const verifyRecoveryCodeAPI = async (data: {
  value: string;
  code: string;
}) => {
  const res = await axios.post("/auth/verify-recovery-code", data);
  return res.data;
};

// RESET PASSWORD
export const resetPasswordAPI = async (data: {
  value: string;
  code: string;
  newPassword: string;
}) => {
  const res = await axios.post("/auth/reset-password", data);
  return res.data;
};