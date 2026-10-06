import api from "./axios";

// Process payment for a booking
export const processPayment = async (paymentData) => {
  const response = await api.post(
    "/payments/process",
    paymentData
  );

  return response.data;
};

// Get payment details for a booking
export const getPaymentByBookingId = async (bookingId) => {
  const response = await api.get(
    `/payments/${bookingId}`
  );

  return response.data;
};