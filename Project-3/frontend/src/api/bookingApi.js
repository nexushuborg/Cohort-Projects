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