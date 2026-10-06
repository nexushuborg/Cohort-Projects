import { useNavigate } from "react-router-dom";

const BookingSummary = ({
  property,
  booking,
  nights = 1,
  guestsCount = 1,
}) => {
  const navigate = useNavigate();

  const pricePerNight =
    Number(property?.price_per_night) || 0;

  const subtotal = nights * pricePerNight;

  // Use the amount calculated by the backend when available.
  const total =
    Number(booking?.total_price) || subtotal;

  const handlePayment = () => {
    if (!booking?.id || total <= 0) return;

    navigate("/checkout", {
      state: {
        bookingId: booking.id,
        property,
        booking,
        nights,
        guestsCount,
        total,
      },
    });
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">

      <h2 className="mb-6 border-b border-gray-100 pb-4 text-xl font-bold text-gray-900">
        Booking Summary
      </h2>

      <div className="space-y-4">

        <div>
          <p className="text-sm text-gray-500">
            Property
          </p>

          <p className="mt-1 font-semibold text-gray-900">
            {property?.title || "Property"}
          </p>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-500">
            Price per night
          </span>

          <span className="font-semibold text-gray-900">
            ₹{pricePerNight}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-500">
            Nights
          </span>

          <span className="font-semibold text-gray-900">
            {nights}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-500">
            Guests
          </span>

          <span className="font-semibold text-gray-900">
            {guestsCount}
          </span>
        </div>

        <div className="flex justify-between border-t border-gray-200 pt-4 text-lg font-bold">
          <span className="text-gray-900">
            Total
          </span>

          <span className="text-rose-500">
            ₹{total}
          </span>
        </div>

      </div>

      <div className="mt-6 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-700">
        Booking status:{" "}
        <strong className="capitalize">
          {booking?.status || "pending"}
        </strong>
      </div>

      <button
        onClick={handlePayment}
        disabled={!booking?.id || booking?.status !== "approved"}
        className={`mt-6 w-full rounded-xl py-4 font-bold transition ${
          booking?.id && booking?.status === "approved"
            ? "bg-rose-500 text-white hover:bg-rose-600"
            : "cursor-not-allowed bg-gray-300 text-gray-500"
        }`}
      >
        {booking?.status === "approved"
          ? "Proceed to Payment"
          : "Waiting for Host Approval"}
      </button>

    </div>
  );
};

export default BookingSummary;