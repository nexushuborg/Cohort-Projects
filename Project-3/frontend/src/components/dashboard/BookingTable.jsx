import axios from "axios";

function BookingTable({ bookings = [], onRefresh }) {
  const handleApprove = (id) => {
    const token = localStorage.getItem("accessToken") || localStorage.getItem("token");

    axios
      .put(
        `http://localhost:5000/api/bookings/${id}/status`,
        { status: "approved" },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        alert("Booking Approved!");
        if (onRefresh) onRefresh();
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to approve booking.");
      });
  };

  const handleDecline = (id) => {
    const token = localStorage.getItem("accessToken") || localStorage.getItem("token");

    axios
      .put(
        `http://localhost:5000/api/bookings/${id}/status`,
        { status: "declined" },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        alert("Booking Declined.");
        if (onRefresh) onRefresh();
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to decline booking.");
      });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {bookings.length === 0 ? (
        <div className="p-8 text-center text-gray-500 text-sm">
          No bookings found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Property</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Dates</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Guests</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Price</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 text-sm">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="p-4 font-bold text-gray-900">
                    {booking.property_title || "Listing"}
                  </td>
                  <td className="p-4 text-gray-600">
                    {booking.check_in} to {booking.check_out}
                  </td>
                  <td className="p-4 text-gray-600">{booking.guests_count}</td>
                  <td className="p-4 font-bold text-gray-900">₹{booking.total_price}</td>
                  <td className="p-4">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 capitalize">
                      {booking.status}
                    </span>
                  </td>
                  <td className="p-4">
                    {booking.status === "pending" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(booking.id)}
                          className="bg-green-500 hover:bg-green-600 text-white font-bold px-3 py-1 rounded-lg text-xs"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleDecline(booking.id)}
                          className="bg-red-500 hover:bg-red-600 text-white font-bold px-3 py-1 rounded-lg text-xs"
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
      )}
    </div>
  );
}

export default BookingTable;