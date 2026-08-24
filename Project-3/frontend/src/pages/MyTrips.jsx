import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyBookings } from "../api/bookingApi";

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
              <div
                key={booking.id}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {booking.property_title ||
                        booking.title ||
                        "Your Rental"}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      Booking ID: {booking.id}
                    </p>
                  </div>

                  <span
                    className={`w-fit rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusClass(
                      booking.status
                    )}`}
                  >
                    {booking.status}
                  </span>

                </div>

                <div className="mt-6 grid gap-5 border-t border-gray-100 pt-6 sm:grid-cols-3">

                  <div>
                    <p className="text-xs font-medium uppercase text-gray-400">
                      Check-in
                    </p>

                    <p className="mt-1 font-medium text-gray-900">
                      {booking.check_in}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase text-gray-400">
                      Check-out
                    </p>

                    <p className="mt-1 font-medium text-gray-900">
                      {booking.check_out}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase text-gray-400">
                      Guests
                    </p>

                    <p className="mt-1 font-medium text-gray-900">
                      {booking.guests}
                    </p>
                  </div>

                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-5">

                  <div>
                    <span className="text-sm text-gray-500">
                      Total
                    </span>

                    <span className="ml-2 font-semibold text-gray-900">
                      ₹{booking.total_price ?? booking.total_amount ?? 0}
                    </span>
                  </div>

                  {booking.status === "approved" && (
                    <Link
                      to={`/payments/${booking.id}`}
                      className="rounded-lg bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-600"
                    >
                      Make Payment
                    </Link>
                  )}

                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}

export default MyTrips;