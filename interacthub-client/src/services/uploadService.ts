import axiosClient from "../api/axios";

export const uploadImageAPI = (file: File) => {
  const formData = new FormData();
  formData.append("imageFile", file);

  console.log(`📨 [uploadService] Uploading file:`, file.name, `Size: ${file.size} bytes`);

  return axiosClient.post("/uploads/image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then(response => {
    console.log(`✅ [uploadService] Upload successful, response:`, response.data);
    return response;
  }).catch(error => {
    console.error(`❌ [uploadService] Upload failed:`, error.response?.data || error.message);
    throw error;
  });
};

