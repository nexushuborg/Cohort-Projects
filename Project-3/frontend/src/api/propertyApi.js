import api from "./axios";

export const getProperties = async () => {
  const response = await api.get("/properties");
  return response.data;
};

export const getPropertyById = async (id) => {
  const response = await api.get(`/properties/${id}`);
  return response.data;
};
export const getMyProperties = async () => {
  const response = await api.get("/properties/my");
  return response.data;
};