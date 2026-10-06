import api from "./axios";

export const registerUser = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

export const requestPasswordReset = async (email) => (await api.post("/auth/forgot-password", { email })).data;
export const resetPassword = async (token, password) => (await api.post("/auth/reset-password", { token, password })).data;
