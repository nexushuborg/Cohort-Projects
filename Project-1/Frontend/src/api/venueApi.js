import api from "./axios";
export const getVenues = async () => (await api.get("/venues")).data;
export const createVenue = async (data) => (await api.post("/venues", data)).data;
export const addSeats = async (venueId, seats) => (await api.post(`/venues/${venueId}/seats`, { seats })).data;
export const getVenueSeats = async (venueId) => (await api.get(`/venues/${venueId}/seats`)).data;
