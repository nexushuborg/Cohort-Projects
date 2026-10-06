import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

function BookingCard({ booking, isHost, onRefresh }) {
  const navigate = useNavigate();

  const handleApprove = async () => {
    try {
      await api.post(`/bookings/${booking.id}/approve`);

      alert("Booking Approved!");

      if (onRefresh) {
        onRefresh();
      }
    } catch (err) {
      console.error("Error approving booking:", err);

      alert(
        err.response?.data?.message ||
          "Failed to approve booking."
      );
    }
  };

  const handleDecline = async () => {
    try {
      await api.post(`/bookings/${booking.id}/decline`);

      alert("Booking Declined.");

      if (onRefresh) {
        onRefresh();
      }
    } catch (err) {
      console.error("Error declining booking:", err);

      alert(
        err.response?.data?.message ||
          "Failed to decline booking."
      );
    }
  };

  const handlePayment = () => {
    navigate("/checkout", {
      state: {
        bookingId: booking.id,
        booking: booking,
        property: {
          title: booking.property_title,
          price_per_night:
            booking.total_nights > 0
              ? booking.total_price / booking.total_nights
              : booking.total_price,
        },
        nights: booking.total_nights,
        guestsCount: booking.guests_count,
        total: booking.total_price,
      },
    });
  };

  return (
    <div className="flex flex-col justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:flex-row">

      {/* Booking information */}
      <div className="space-y-2">

        <h3 className="text-lg font-bold text-gray-900">
          {booking.property_title || "Property Booking"}
        </h3>

        <p className="text-sm text-gray-500">
          Status:{" "}
          <span className="font-semibold capitalize text-rose-500">
            {booking.status}
          </span>
        </p>

        <p className="text-sm text-gray-600">
          Dates:{" "}
          <strong>{booking.check_in}</strong>{" "}
          to{" "}
          <strong>{booking.check_out}</strong>
        </p>

        <p className="text-sm text-gray-600">
          Nights:{" "}
          <strong>{booking.total_nights}</strong>
        </p>

        <p className="text-sm text-gray-600">
          Guests:{" "}
          <strong>{booking.guests_count}</strong>
        </p>

        {isHost && booking.guest_name && (
          <p className="text-xs text-gray-500">
            Booked by:{" "}
            <strong>{booking.guest_name}</strong>{" "}
            ({booking.guest_email})
          </p>
        )}

      </div>

      {/* Price + actions */}
      <div className="flex flex-col items-end justify-between gap-3">

        <span className="text-2xl font-bold text-gray-900">
          ₹{booking.total_price}
        </span>

        {/* Host actions */}
        {isHost && booking.status === "pending" && (
          <div className="flex gap-2">

            <button
              onClick={handleApprove}
              className="rounded-lg bg-green-500 px-4 py-2 text-xs font-bold text-white hover:bg-green-600"
            >
              Approve ✓
            </button>

            <button
              onClick={handleDecline}
              className="rounded-lg bg-red-500 px-4 py-2 text-xs font-bold text-white hover:bg-red-600"
            >
              Decline ✕
            </button>

          </div>
        )}

        {/* Guest payment */}
        {!isHost && booking.status === "approved" && (
          <button
            onClick={handlePayment}
            className="rounded-lg bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-600"
          >
            Pay Now
          </button>
        )}

        {/* Guest pending */}
        {!isHost && booking.status === "pending" && (
          <span className="rounded-lg bg-yellow-100 px-4 py-2 text-xs font-semibold text-yellow-700">
            Waiting for Host Approval
          </span>
        )}

        {/* Guest declined */}
        {!isHost && booking.status === "declined" && (
          <span className="rounded-lg bg-red-100 px-4 py-2 text-xs font-semibold text-red-700">
            Booking Declined
          </span>
        )}

      </div>
    </div>
  );
}

export default BookingCard;