import api from "./axios";

export const getMyTickets = async () => {
  const response = await api.get("/tickets/me");
  return response.data;
};