import axios from "axios";

function BookingCard({ booking, isHost, onRefresh }) {
  const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const handleApprove = () => {
    axios
      .post(`http://localhost:5000/api/bookings/${booking.id}/approve`, {}, { headers })
      .then((res) => {
        alert("Booking Approved!");
        if (onRefresh) onRefresh();
      })
      .catch((err) => console.error("Error approving booking", err));
  };

  const handleDecline = () => {
    axios
      .post(`http://localhost:5000/api/bookings/${booking.id}/decline`, {}, { headers })
      .then((res) => {
        alert("Booking Declined.");
        if (onRefresh) onRefresh();
      })
      .catch((err) => console.error("Error declining booking", err));
  };

  const handleCancel = () => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    axios
      .post(`http://localhost:5000/api/bookings/${booking.id}/cancel`, {}, { headers })
      .then((res) => {
        alert("Booking Cancelled.");
        if (onRefresh) onRefresh();
      })
      .catch((err) => console.error("Error cancelling booking", err));
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between gap-4">
      <div className="space-y-2">
        <h3 className="text-lg font-bold text-gray-900">
          {booking.property_title || "Property Booking"}
        </h3>

        <p className="text-sm text-gray-500">
          Status: <span className="font-semibold capitalize text-rose-500">{booking.status}</span>
        </p>

        <p className="text-sm text-gray-600">
          Dates: <strong>{booking.check_in}</strong> to <strong>{booking.check_out}</strong> ({booking.total_nights} Nights)
        </p>

        <p className="text-sm text-gray-600">
          Guests: <strong>{booking.guests_count}</strong>
        </p>

        {isHost && booking.guest_name && (
          <p className="text-xs text-gray-500">
            Booked by: <strong>{booking.guest_name}</strong> ({booking.guest_email})
          </p>
        )}
      </div>

      <div className="flex flex-col justify-between items-end gap-3">
        <span className="text-2xl font-bold text-gray-900">₹{booking.total_price}</span>

        {isHost && booking.status === "pending" && (
          <div className="flex gap-2">
            <button
              onClick={handleApprove}
              className="bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-2 rounded-lg text-xs"
            >
              Approve ✓
            </button>

            <button
              onClick={handleDecline}
              className="bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2 rounded-lg text-xs"
            >
              Decline ✕
            </button>
          </div>
        )}

        {!isHost && (booking.status === "pending" || booking.status === "approved") && (
          <button
            onClick={handleCancel}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold px-4 py-2 rounded-lg text-xs"
          >
            Cancel Booking 🗑️
          </button>
        )}
      </div>
    </div>
  );
}

export default BookingCard;