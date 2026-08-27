import { useEffect } from "react";
import useBookings from "../../hooks/useBookings";

function HostBookings() {
  const { bookings, loading, error, fetchHostBookings, approveBooking, declineBooking } = useBookings();

  // Load incoming booking requests
  useEffect(() => {
    fetchHostBookings();
  }, []);

  const getStatusClass = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700";
      case "declined":
        return "bg-red-100 text-red-700";
      case "cancelled":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Loading requests...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900">Booking Requests</h1>
        <p className="text-gray-500 mt-2">Approve or decline requests from guests.</p>

        {error && (
          <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg text-sm border border-red-200">
            {error}
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="mt-8 bg-white p-16 rounded-2xl border text-center text-gray-400">
            <span className="text-5xl block mb-4">📅</span>
            No booking requests received yet.
          </div>
        ) : (
          <div className="mt-8 bg-white border rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-4 text-sm font-semibold text-gray-600">Property</th>
                    <th className="p-4 text-sm font-semibold text-gray-600">Guest</th>
                    <th className="p-4 text-sm font-semibold text-gray-600">Dates</th>
                    <th className="p-4 text-sm font-semibold text-gray-600">Guests Count</th>
                    <th className="p-4 text-sm font-semibold text-gray-600">Total price</th>
                    <th className="p-4 text-sm font-semibold text-gray-600">Status</th>
                    <th className="p-4 text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="p-4">
                        <p className="font-semibold text-gray-900">{booking.property_title || "Rental Hub Home"}</p>
                        <p className="text-xs text-gray-400 mt-1">ID: {booking.id}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-medium text-gray-900">{booking.guest_name || "Guest"}</p>
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {booking.check_in} to {booking.check_out}
                      </td>
                      <td className="p-4 text-sm text-gray-600">{booking.guests_count}</td>
                      <td className="p-4 font-semibold text-gray-900">
                        ₹{booking.total_price}
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusClass(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="p-4">
                        {booking.status === "pending" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => approveBooking(booking.id)}
                              className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => declineBooking(booking.id)}
                              className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 cursor-pointer"
                            >
                              Decline
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default HostBookings;