import axios from "axios";

const baseURL = localStorage.getItem("ai_base_url") || "";

const apiClient = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;
