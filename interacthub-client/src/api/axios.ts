import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://127.0.0.1:5162/api",
});

// ================= REQUEST =================
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ================= RESPONSE =================
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const originalRequest = error.config;

    console.error("API ERROR:", {
      url: originalRequest?.url,
      status,
      data: error.response?.data,
    });

    if (
      status === 401 &&
      !originalRequest?.url?.includes("/auth/login") &&
      !originalRequest?.url?.includes("/auth/register")
    ) {
      localStorage.removeItem("token");

      window.location.replace("/login");
    }

    return Promise.reject(error);
  }
);

export default axiosClient;