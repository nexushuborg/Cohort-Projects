import api from "./axios";
export const getReviews = async (eventId) => (await api.get(`/reviews/${eventId}`)).data;
export const createReview = async (eventId, data) => (await api.post(`/reviews/${eventId}`, data)).data;
