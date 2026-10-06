import api from "./axios";

// Get all users
// Mainly used by admin
export const getAllUsers = async (params = {}) => {
  const response = await api.get("/users", {
    params,
  });

  return response.data;
};

// Get the currently logged-in user's profile
export const updateProfile = async (profileData) => {
  const response = await api.put(
    "/users/profile",
    profileData
  );

  return response.data;
};

// Get a user's public profile
export const getPublicProfile = async (userId) => {
  const response = await api.get(
    `/users/${userId}/public`
  );

  return response.data;
};