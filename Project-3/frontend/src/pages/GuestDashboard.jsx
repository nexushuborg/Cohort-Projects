import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyBookings } from "../api/bookingApi";
import api from "../api/axios";

function GuestDashboard() {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [userResponse, bookingsResponse] =
          await Promise.all([
            api.get("/auth/me"),
            getMyBookings(),
          ]);

        setUser(userResponse.data);
        setBookings(bookingsResponse.data || []);
      } catch (error) {
        console.error("Dashboard loading error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-rose-500" />
          <p className="mt-4 text-sm text-gray-500">
            Loading dashboard...
          </p>
        </div>
      </main>
    );
  }

  const pending = bookings.filter(
    (booking) => booking.status === "pending"
  ).length;

  const approved = bookings.filter(
    (booking) => booking.status === "approved"
  ).length;

  const declined = bookings.filter(
    (booking) => booking.status === "declined"
  ).length;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-10">

        {/* Welcome */}
        <div>
          <p className="text-sm font-medium text-rose-500">
            Guest Dashboard
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            Welcome{user?.name ? `, ${user.name}` : ""}! 👋
          </h1>

          <p className="mt-2 text-gray-500">
            Manage your trips and bookings from here.
          </p>
        </div>

        {/* Quick actions */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">

          <Link
            to="/search"
            className="rounded-2xl bg-rose-500 p-6 text-white transition hover:bg-rose-600"
          >
            <h2 className="text-xl font-bold">
              Explore Properties
            </h2>

            <p className="mt-2 text-sm text-rose-100">
              Find your next stay.
            </p>
          </Link>

          <Link
            to="/trips"
            className="rounded-2xl border border-gray-200 bg-white p-6 transition hover:border-rose-300"
          >
            <h2 className="text-xl font-bold text-gray-900">
              My Trips
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              View all your bookings.
            </p>
          </Link>

        </div>

        {/* Stats */}
        <div className="mt-8 grid gap-5 sm:grid-cols-3">

          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <p className="text-sm text-gray-500">
              Total Bookings
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {bookings.length}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <p className="text-sm text-gray-500">
              Pending
            </p>

            <p className="mt-2 text-3xl font-bold text-yellow-600">
              {pending}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <p className="text-sm text-gray-500">
              Approved
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              {approved}
            </p>
          </div>

        </div>

        {/* Recent bookings */}
        <section className="mt-10">

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Recent Trips
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Your latest booking activity.
              </p>
            </div>

            {bookings.length > 0 && (
              <Link
                to="/trips"
                className="text-sm font-semibold text-rose-500 hover:text-rose-600"
              >
                View all
              </Link>
            )}
          </div>

          {bookings.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-10 text-center">
              <div className="text-5xl">🧳</div>

              <h3 className="mt-4 font-semibold text-gray-900">
                No trips yet
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Start exploring properties to plan your first trip.
              </p>

              <Link
                to="/search"
                className="mt-5 inline-block rounded-lg bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-600"
              >
                Explore Properties
              </Link>
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {bookings.slice(0, 3).map((booking) => (
                <div
                  key={booking.id}
                  className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {booking.property_title ||
                        "Property Booking"}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      {booking.check_in} →{" "}
                      {booking.check_out}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold capitalize text-gray-700">
                      {booking.status}
                    </span>

                    <span className="font-semibold text-gray-900">
                      ₹{booking.total_price}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

        </section>

        {/* Profile shortcut */}
        <div className="mt-10 rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-bold text-gray-900">
            Your Account
          </h2>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs text-gray-400">
                Name
              </p>
              <p className="font-medium text-gray-900">
                {user?.name || "Not available"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-400">
                Email
              </p>
              <p className="font-medium text-gray-900">
                {user?.email || "Not available"}
              </p>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}

export default GuestDashboard;