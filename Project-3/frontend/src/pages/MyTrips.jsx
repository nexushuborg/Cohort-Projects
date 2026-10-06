import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyBookings } from "../api/bookingApi";
import BookingCard from "../components/booking/BookingCard";

function MyTrips() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadBookings = async () => {
      try {
        setLoading(true);

        const response = await getMyBookings();

        setBookings(response.data || []);
      } catch (err) {
        console.error("Failed to load bookings:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load your trips."
        );
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, []);

  const getStatusClass = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700";

      case "declined":
        return "bg-red-100 text-red-700";

      case "cancelled":
        return "bg-gray-100 text-gray-700";

      case "pending":
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-rose-500" />

          <p className="mt-4 text-sm text-gray-500">
            Loading your trips...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-6 py-10">

        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            My Trips
          </h1>

          <p className="mt-2 text-gray-500">
            View and manage your booking requests.
          </p>
        </div>

        {error && (
          <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-5 text-red-600">
            {error}
          </div>
        )}

        {!error && bookings.length === 0 && (
          <div className="mt-10 rounded-2xl border border-gray-200 bg-white p-12 text-center">
            <div className="text-5xl">🧳</div>

            <h2 className="mt-5 text-xl font-semibold text-gray-900">
              No trips yet
            </h2>

            <p className="mt-2 text-gray-500">
              You haven't made any booking requests yet.
            </p>

            <Link
              to="/search"
              className="mt-6 inline-block rounded-lg bg-rose-500 px-6 py-3 font-semibold text-white hover:bg-rose-600"
            >
              Explore Properties
            </Link>
          </div>
        )}

        {!error && bookings.length > 0 && (
          <div className="mt-8 space-y-5">
            {bookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                isHost={false}
              />
            ))}
          </div>
        )}

      </div>
    </main>
  );
}

export default MyTrips;