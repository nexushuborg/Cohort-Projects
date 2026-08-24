import api from "./axios";

export const processPayment = async (paymentData) => {
  const response = await api.post(
    "/payments/process",
    paymentData
  );

  return response.data;
};

export const getPaymentByBooking = async (bookingId) => {
  const response = await api.get(
    `/payments/${bookingId}`
  );

  return response.data;
};