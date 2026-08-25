import api from "./axios";

export const getOrganizerAnalytics = async () => (await api.get("/analytics/organizer")).data;
export const getAdminAnalytics = async () => (await api.get("/analytics/admin")).data;
