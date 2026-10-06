import api from "./axios";

export const getMyTickets = async () => {
  const response = await api.get("/tickets/me");
  return response.data;
};

export const getTicketQr = async (ticketId) => {
  const response = await api.get(`/tickets/${ticketId}/qr`);
  return response.data;
};

export const checkInTicket = async (ticketId) => (await api.post("/tickets/check-in", { ticketId })).data;
