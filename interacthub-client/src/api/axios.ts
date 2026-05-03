import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://interacthub-staging.eba-wgfffkes.ap-southeast-1.elasticbeanstalk.com/api";

// Main axios client with interceptors
const axiosClient = axios.create({
  baseURL: API_BASE_URL,
});

// Separate axios for auth requests (without 401 redirect)
export const axiosAuthClient = axios.create({
  baseURL: API_BASE_URL,
});

// Auth client request logging (no response interceptor to avoid 401 redirect)
axiosAuthClient.interceptors.request.use((config) => {
  console.log(`📤 [Auth Request] ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

axiosAuthClient.interceptors.response.use(
  (response) => {
    console.log(`✅ [Auth Response] ${response.status} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error(`❌ [Auth Error] ${error.response?.status} ${error.config?.url}`, error.response?.data);
    return Promise.reject(error);
  }
);

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  console.log(`📤 [Axios Request] ${config.method?.toUpperCase()} ${config.url}`, token ? "✅ Has token" : "⚠️ No token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

axiosClient.interceptors.response.use(
  (response) => {
    console.log(`✅ [Axios Response] ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`❌ [Axios Error] ${error.response?.status} ${error.config?.url}`, error.response?.data);
    
    if (error.response?.status === 401) {
      console.error("🔴 401 Unauthorized - Removing token and redirecting to login");
      localStorage.removeItem("token");
      localStorage.removeItem("userEmail");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default axiosClient;