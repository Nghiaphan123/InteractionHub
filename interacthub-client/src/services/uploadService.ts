import axiosClient from "../api/axios";

export const uploadImageAPI = (file: File) => {
  const formData = new FormData();
  formData.append("imageFile", file);

  return axiosClient.post("/uploads/image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

