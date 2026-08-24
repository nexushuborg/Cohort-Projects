import { useState } from "react";
import { createBooking } from "../../api/bookingApi";
import BookingSummary from "./BookingSummary";

function BookingForm({ property, propertyId, pricePerNight }) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);

  const [booking, setBooking] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;

    const start = new Date(checkIn);
    const end = new Date(checkOut);

    return Math.ceil(
      (end - start) / (1000 * 60 * 60 * 24)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    const nights = calculateNights();

    if (nights <= 0) {
      setError("Check-out date must be after check-in date.");
      return;
    }

    try {
      setLoading(true);

      const bookingData = {
        property_id: propertyId,
        check_in: checkIn,
        check_out: checkOut,
        guests_count: Number(guests),
      };

      const response = await createBooking(bookingData);

      console.log("Booking response:", response);

      setBooking(response.data);

      setMessage(
        "Booking request submitted successfully!"
      );
    } catch (err) {
      console.error("Booking error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to create booking. Please check your dates."
      );
    } finally {
      setLoading(false);
    }
  };

  const nights = calculateNights();

  return (
    <div className="flex w-full flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-center">

      {/* Booking Form */}
      {!booking && (
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-md">

          <h2 className="mb-4 text-xl font-bold text-gray-900">
            ₹{pricePerNight}
            <span className="text-sm font-normal text-gray-500">
              {" "} / night
            </span>
          </h2>

          {message && (
            <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm font-semibold text-green-600">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-600">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >

            {/* Check-in */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Check-In Date
              </label>

              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                required
                className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-rose-500"
              />
            </div>

            {/* Check-out */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Check-Out Date
              </label>

              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                min={
                  checkIn ||
                  new Date().toISOString().split("T")[0]
                }
                required
                className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-rose-500"
              />
            </div>

            {/* Guests */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Number of Guests
              </label>

              <input
                type="number"
                min="1"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-rose-500"
              />
            </div>

            {nights > 0 && (
              <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
                {nights} night{nights !== 1 ? "s" : ""}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-rose-500 py-3 font-bold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Submitting..." : "Request to Book"}
            </button>

          </form>
        </div>
      )}

      {/* Booking Summary */}
      {booking && (
        <BookingSummary
          property={property}
          booking={booking}
          nights={booking.total_nights}
          guestsCount={booking.guests_count}
        />
      )}

    </div>
  );
}

export default BookingForm;