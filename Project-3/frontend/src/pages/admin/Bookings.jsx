import { useEffect, useState } from "react";
import api from "../../api/axios";

function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadBookings = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/bookings");

        const data = response.data?.data || [];

        setBookings(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load bookings:", err);

        setError(
          err.response?.data?.message ||
            err.response?.data?.error?.message ||
            "Unable to load bookings."
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
            Loading bookings...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-10">

        {/* Header */}
        <div>
          <p className="text-sm font-semibold text-rose-500">
            Administration
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            Bookings
          </h1>

          <p className="mt-2 text-gray-500">
            Monitor all booking activity on RentalHub.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Empty */}
        {!error && bookings.length === 0 && (
          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-12 text-center">
            <div className="text-5xl">📅</div>

            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              No bookings found
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              There are currently no bookings.
            </p>
          </div>
        )}

        {/* Bookings table */}
        {!error && bookings.length > 0 && (
          <div className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

            <div className="border-b border-gray-100 px-6 py-5">
              <h2 className="text-xl font-bold text-gray-900">
                All Bookings
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {bookings.length} booking
                {bookings.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">

                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                      Property
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                      Guest
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                      Dates
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                      Guests
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                      Total
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">

                  {bookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="transition hover:bg-gray-50"
                    >

                      {/* Property */}
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">
                          {booking.property_title ||
                            booking.title ||
                            "Property Booking"}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          ID: {booking.id}
                        </p>
                      </td>

                      {/* Guest */}
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">
                          {booking.guest_name || "N/A"}
                        </p>

                        {booking.guest_email && (
                          <p className="mt-1 text-xs text-gray-500">
                            {booking.guest_email}
                          </p>
                        )}
                      </td>

                      {/* Dates */}
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <p>
                          {booking.check_in || "N/A"}
                        </p>

                        <p className="mt-1">
                          → {booking.check_out || "N/A"}
                        </p>
                      </td>

                      {/* Guests */}
                      <td className="px-6 py-4 text-gray-600">
                        {booking.guests_count ?? "N/A"}
                      </td>

                      {/* Total */}
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        ₹
                        {booking.total_price ??
                          booking.total_amount ??
                          0}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusClass(
                            booking.status
                          )}`}
                        >
                          {booking.status || "pending"}
                        </span>
                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>
            </div>

          </div>
        )}

      </div>
    </main>
  );
}

export default Bookings;