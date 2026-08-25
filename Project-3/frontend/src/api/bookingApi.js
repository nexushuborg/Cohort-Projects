import api from "./axios";

export const checkAvailability = async (
  propertyId,
  checkIn,
  checkOut
) => {
  const response = await api.get(
    `/availability/${propertyId}`,
    {
      params: {
        check_in: checkIn,
        check_out: checkOut,
      },
    }
  );

  return response.data;
};

export const createBooking = async (bookingData) => {
  const response = await api.post(
    "/bookings",
    bookingData
  );

  return response.data;
};

export const getMyBookings = async () => {
  const response = await api.get("/bookings/my");
  return response.data;
};

export const getHostBookings = async () => {
  const response = await api.get("/bookings/host");
  return response.data;
};

export const approveBooking = async (id) => {
  const response = await api.post(`/bookings/${id}/approve`);
  return response.data;
};

export const declineBooking = async (id) => {
  const response = await api.post(`/bookings/${id}/decline`);
  return response.data;
};

export const cancelBooking = async (id, cancellationReason = "") => {
  const response = await api.post(`/bookings/${id}/cancel`, { cancellation_reason: cancellationReason });
  return response.data;
};