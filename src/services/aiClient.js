// src/services/aiClient.js
import axios from "axios";

// Ek naya instance bina default baseURL ke
const aiClient = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Ye har request server tak jane se PEHLE trigger hota hai
aiClient.interceptors.request.use(
  (config) => {
    // 1. LocalStorage se user ka set kiya hua dynamic URL uthao
    const dynamicBaseUrl = localStorage.getItem("ai_base_url") || "";
    const cleanBaseUrl = dynamicBaseUrl.endsWith("/")
      ? dynamicBaseUrl.slice(0, -1)
      : dynamicBaseUrl;

    // 2. Base URL set karo dynamically
    config.baseURL = cleanBaseUrl;

    // 3. Token attach karo (agar zarurat ho)
    const token = localStorage.getItem("admin_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default aiClient;
