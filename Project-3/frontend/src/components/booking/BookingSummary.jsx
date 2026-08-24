import { useNavigate } from "react-router-dom";

const BookingSummary = ({ property, nights = 1, guestsCount = 1 }) => {
  const navigate = useNavigate();

  const pricePerNight = property?.price_per_night || 0;
  const subtotal = nights * pricePerNight;
  const platformFee = nights > 0 ? 100 : 0;
  const gst = Math.floor(subtotal * 0.18);
  const total = subtotal + platformFee + gst;

  const handlePayment = () => {
    if (nights <= 0) return;

    navigate("/checkout", {
      state: {
        property,
        nights,
        guestsCount,
        total,
      },
    });
  };

  return (
    <div className="w-[350px] bg-white p-6 rounded-2xl border border-gray-200 shadow-xl h-fit sticky top-24">
      <h2 className="text-xl font-bold mb-6 border-b border-gray-100 pb-4 text-gray-900">
        Booking Summary
      </h2>

      <div className="space-y-4 mb-8">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">
            {property?.title || "Property"} ({nights} Nights)
          </span>
          <span className="font-semibold text-gray-900">₹{subtotal}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Platform Fee</span>
          <span className="font-semibold text-gray-900">₹{platformFee}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-500">GST (18%)</span>
          <span className="font-semibold text-gray-900">₹{gst}</span>
        </div>

        <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-4 mt-4">
          <span className="text-rose-500">Total Amount</span>
          <span className="text-rose-500">₹{total}</span>
        </div>
      </div>

      <button
        onClick={handlePayment}
        disabled={nights <= 0}
        className={`w-full py-4 rounded-xl font-bold transition-all duration-200 ${
          nights > 0
            ? "bg-rose-500 text-white hover:scale-[1.02] cursor-pointer shadow-lg shadow-rose-500/20"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        Proceed to Payment
      </button>

      {nights <= 0 && (
        <p className="text-xs text-center text-red-500 mt-3 font-medium">
          Please select valid dates
        </p>
      )}
    </div>
  );
};

export default BookingSummary;