import { useState } from "react";
import api from "../api/axios";

export default function useBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 1. Fetch guest trips (GET)
  const fetchGuestTrips = () => {
    setLoading(true);
    setError("");
    api.get("/bookings/my")
      .then((response) => {
        setBookings(response.data.data || []);
      })
      .catch((err) => {
        console.error(err);
        setError(err.response?.data?.message || "Failed to retrieve trips.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // 2. Fetch host bookings (GET)
  const fetchHostBookings = () => {
    setLoading(true);
    setError("");
    api.get("/bookings/host")
      .then((response) => {
        setBookings(response.data.data || []);
      })
      .catch((err) => {
        console.error(err);
        setError(err.response?.data?.message || "Failed to retrieve host bookings.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // 3. Create booking request (POST)
  const createBooking = (bookingData, onSuccess, onError) => {
    setLoading(true);
    setError("");
    api.post("/bookings", bookingData)
      .then((response) => {
        if (onSuccess) onSuccess(response.data);
      })
      .catch((err) => {
        console.error(err);
        setError(err.response?.data?.message || "Booking request failed.");
        if (onError) onError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // 4. Approve a booking (POST)
  const approveBooking = (bookingId) => {
    setLoading(true);
    setError("");
    api.post(`/bookings/${bookingId}/approve`)
      .then(() => {
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status: "approved" } : b))
        );
      })
      .catch((err) => {
        console.error(err);
        setError(err.response?.data?.message || "Failed to approve booking.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // 5. Decline a booking (POST)
  const declineBooking = (bookingId) => {
    setLoading(true);
    setError("");
    api.post(`/bookings/${bookingId}/decline`)
      .then(() => {
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status: "declined" } : b))
        );
      })
      .catch((err) => {
        console.error(err);
        setError(err.response?.data?.message || "Failed to decline booking.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // 6. Cancel a booking (POST)
  const cancelBooking = (bookingId) => {
    setLoading(true);
    setError("");
    api.post(`/bookings/${bookingId}/cancel`)
      .then(() => {
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status: "cancelled" } : b))
        );
      })
      .catch((err) => {
        console.error(err);
        setError(err.response?.data?.message || "Failed to cancel booking.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return {
    bookings,
    loading,
    error,
    fetchGuestTrips,
    fetchHostBookings,
    createBooking,
    approveBooking,
    declineBooking,
    cancelBooking,
  };
}