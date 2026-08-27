import api from "./axios";

// Create a new booking
export const createBooking = async (bookingData) => {
  const response = await api.post(
    "/bookings",
    bookingData
  );

  return response.data;
};

// Get all bookings
// Mainly used by admin
export const getAllBookings = async (params = {}) => {
  const response = await api.get("/bookings", {
    params,
  });

  return response.data;
};

// Get bookings of the logged-in guest
export const getMyBookings = async (params = {}) => {
  const response = await api.get("/bookings/my", {
    params,
  });

  return response.data;
};

// Get bookings for properties owned by the logged-in host
export const getHostBookings = async (params = {}) => {
  const response = await api.get("/bookings/host", {
    params,
  });

  return response.data;
};

// Get a single booking
export const getBookingById = async (id) => {
  const response = await api.get(`/bookings/${id}`);

  return response.data;
};

// Approve a booking request
export const approveBooking = async (id) => {
  const response = await api.post(
    `/bookings/${id}/approve`
  );

  return response.data;
};

// Decline a booking request
export const declineBooking = async (id) => {
  const response = await api.post(
    `/bookings/${id}/decline`
  );

  return response.data;
};

// Cancel a booking
export const cancelBooking = async (id) => {
  const response = await api.post(
    `/bookings/${id}/cancel`
  );

  return response.data;
};