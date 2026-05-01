import axiosClient from "../api/axios";

export type UpdateProfilePayload = {
  fullName?: string;
  bio?: string;
  avatarUrl?: string;
};

export const updateProfileAPI = (data: UpdateProfilePayload) => {
  return axiosClient.put("/users/me", data);
};
