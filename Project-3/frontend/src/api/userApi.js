import api from "./axios";

export const updateProfile = async (userData) => {
  const response = await api.put("/users/profile", userData);
  return response.data;
};

export const getPublicProfile = async (id) => {
  const response = await api.get(`/users/${id}/public`);
  return response.data;
};

export const getAllUsers = async () => {
  const response = await api.get("/users");
  return response.data;
};