import api from "./axios";

export const getAvailability = async (propertyId) => {
  const response = await api.get(`/availability/${propertyId}`);
  return response.data;
};

export const blockDates = async (propertyId, blockData) => {
  const response = await api.post(`/availability/${propertyId}/block`, blockData);
  return response.data;
};

export const unblockDates = async (blockId) => {
  const response = await api.delete(`/availability/blocks/${blockId}`);
  return response.data;
};