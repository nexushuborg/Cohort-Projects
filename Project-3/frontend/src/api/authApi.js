import api from "./axios";

export const registerUser = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

export const loginUser = async (userData) => {
  const response = await api.post("/auth/login", userData);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

export const refreshToken = async () => {
  const response = await api.post("/auth/refresh-token");
  return response.data;
};

export const passwordReset = async (resetData) => {
  const response = await api.post("/auth/password-reset", resetData);
  return response.data;
};