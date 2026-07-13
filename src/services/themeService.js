import apiClient from "./apiClient";

export const fetchAppTheme = async () => {
  const appCode = import.meta.env.VITE_APP_CODE;
  // Endpoint: /theme/load/{appcode}
  const response = await apiClient.get(`/theme/load/${appCode}`);
  return response.data;
};
