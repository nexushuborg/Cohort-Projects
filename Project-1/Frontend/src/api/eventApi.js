import api from "./axios";

export const getEvents = async () => {
  const response = await api.get("/events");
  return response.data;
};

export const getEventById = async (id) => {
  const response = await api.get(`/events/${id}`);
  return response.data;
};

export const createEvent = async (eventData) => {
  const response = await api.post("/events", eventData);
  return response.data;
};

export const createTicketTier = async (eventId, tierData) => {
  const response = await api.post(`/events/${eventId}/tiers`, tierData);
  return response.data;
};

export const publishEvent = async (eventId) => {
  const response = await api.post(`/events/${eventId}/publish`);
  return response.data;
};
