import api from "./axios";

export const createBooking = async (bookingData) => {
  const response = await api.post("/bookings", bookingData);
  return response.data;
};

export const getMyBookings = async () => {
  const response = await api.get("/bookings/me");
  return response.data;
};

export const cancelBooking = async (bookingId) => {
  const response = await api.post(`/bookings/${bookingId}/cancel`);
  return response.data;
};

export const processPayment = async (bookingId) => {
  const response = await api.post("/payments/process", {
    bookingId,
    method: "simulated",
  });
  return response.data;
};

export const holdSeat = async (seatId) => (await api.post("/bookings/hold-seat", { seatId })).data;
