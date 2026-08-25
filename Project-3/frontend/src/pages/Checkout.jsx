import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { processPayment } from "../api/paymentApi";

function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    bookingId,
    property,
    booking,
    nights,
    guestsCount,
    total,
  } = location.state || {};

  const [method, setMethod] = useState("upi");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  // Prevent opening /checkout directly without booking data
  if (!bookingId || !property) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-gray-900">
            Checkout unavailable
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Please select a booking before proceeding to payment.
          </p>

          <Link
            to="/trips"
            className="mt-6 inline-block rounded-lg bg-rose-500 px-5 py-3 font-semibold text-white"
          >
            Go to My Trips
          </Link>
        </div>
      </main>
    );
  }

  const handlePayment = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const paymentData = {
        booking_id: bookingId,
        amount: Number(total),
        method,
      };

      const response = await processPayment(paymentData);

      console.log("Payment response:", response);

      setSuccess(response.data);
    } catch (err) {
      console.error("Payment error:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error?.message ||
          "Payment failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Payment successful
  if (success) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-12">
        <div className="mx-auto max-w-lg">

          <div className="rounded-2xl border border-green-200 bg-white p-8 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
              ✓
            </div>

            <h1 className="mt-5 text-2xl font-bold text-gray-900">
              Payment Successful
            </h1>

            <p className="mt-2 text-gray-500">
              Your payment has been processed successfully.
            </p>

            {success.transaction_id && (
              <div className="mt-6 rounded-lg bg-gray-50 p-4 text-left">
                <p className="text-xs text-gray-500">
                  Transaction ID
                </p>

                <p className="mt-1 break-all font-semibold text-gray-900">
                  {success.transaction_id}
                </p>
              </div>
            )}

            <div className="mt-6 flex gap-3">

              <Link
                to="/trips"
                className="flex-1 rounded-lg bg-rose-500 py-3 font-semibold text-white hover:bg-rose-600"
              >
                My Trips
              </Link>

              <Link
                to="/search"
                className="flex-1 rounded-lg border border-gray-300 py-3 font-semibold text-gray-700 hover:bg-gray-50"
              >
                Browse More
              </Link>

            </div>

          </div>

        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-5xl">

        <Link
          to="/trips"
          className="text-sm font-medium text-gray-600 hover:text-rose-500"
        >
          ← Back to My Trips
        </Link>

        <h1 className="mt-5 text-3xl font-bold text-gray-900">
          Checkout
        </h1>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">

          {/* Payment form */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

              <h2 className="text-xl font-bold text-gray-900">
                Payment Method
              </h2>

              <form
                onSubmit={handlePayment}
                className="mt-6 space-y-6"
              >

                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <div className="space-y-3">

                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 p-4 hover:border-rose-400">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="upi"
                      checked={method === "upi"}
                      onChange={(e) =>
                        setMethod(e.target.value)
                      }
                    />

                    <div>
                      <p className="font-semibold text-gray-900">
                        UPI
                      </p>

                      <p className="text-sm text-gray-500">
                        Pay using UPI
                      </p>
                    </div>
                  </label>

                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 p-4 hover:border-rose-400">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={method === "card"}
                      onChange={(e) =>
                        setMethod(e.target.value)
                      }
                    />

                    <div>
                      <p className="font-semibold text-gray-900">
                        Card
                      </p>

                      <p className="text-sm text-gray-500">
                        Credit or debit card
                      </p>
                    </div>
                  </label>

                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 p-4 hover:border-rose-400">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="netbanking"
                      checked={method === "netbanking"}
                      onChange={(e) =>
                        setMethod(e.target.value)
                      }
                    />

                    <div>
                      <p className="font-semibold text-gray-900">
                        Net Banking
                      </p>

                      <p className="text-sm text-gray-500">
                        Pay through your bank
                      </p>
                    </div>
                  </label>

                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-rose-500 py-4 font-bold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading
                    ? "Processing Payment..."
                    : `Pay ₹${total}`}
                </button>

              </form>
            </div>
          </div>

          {/* Booking summary */}
          <aside>
            <div className="sticky top-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

              <h2 className="border-b border-gray-100 pb-4 text-xl font-bold text-gray-900">
                Your Booking
              </h2>

              <div className="mt-5 space-y-4">

                <div>
                  <p className="text-sm text-gray-500">
                    Property
                  </p>

                  <p className="mt-1 font-semibold text-gray-900">
                    {property.title}
                  </p>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    Check-in
                  </span>

                  <span className="font-medium text-gray-900">
                    {booking?.check_in}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    Check-out
                  </span>

                  <span className="font-medium text-gray-900">
                    {booking?.check_out}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    Nights
                  </span>

                  <span className="font-medium text-gray-900">
                    {nights}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    Guests
                  </span>

                  <span className="font-medium text-gray-900">
                    {guestsCount}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>

                    <span className="text-rose-500">
                      ₹{total}
                    </span>
                  </div>
                </div>

              </div>

            </div>
          </aside>

        </div>

      </div>
    </main>
  );
}

export default Checkout;