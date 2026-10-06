import { useEffect, useState } from "react";
import useBookings from "../../hooks/useBookings";

function Earnings() {
  const { bookings, loading, error, fetchHostBookings } = useBookings();
  const [totals, setTotals] = useState({
    totalEarnings: 0,
    approvedBookings: 0,
  });

  useEffect(() => {
    fetchHostBookings();
  }, []);

  // Compute stats on booking load
  useEffect(() => {
    if (bookings.length > 0) {
      const approved = bookings.filter(
        (b) => b.status === "approved" || b.status === "completed"
      );
      const sum = approved.reduce(
        (acc, curr) => acc + parseFloat(curr.total_price),
        0
      );

      setTotals({
        totalEarnings: sum,
        approvedBookings: approved.length,
      });
    }
  }, [bookings]);

  if (loading) return <div className="p-10 text-center text-gray-500">Loading earnings...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900">Earnings</h1>
        <p className="text-gray-500 mt-2">Track payouts and details of approved stays.</p>

        {error && (
          <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 mt-8">
          <div className="bg-white p-6 rounded-2xl border shadow-sm">
            <h3 className="text-sm font-semibold text-gray-500">Total Earnings</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">
              ₹{totals.totalEarnings.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl border shadow-sm">
            <h3 className="text-sm font-semibold text-gray-500">Stays Completed</h3>
            <p className="text-3xl font-bold text-rose-500 mt-2">
              {totals.approvedBookings}
            </p>
          </div>
        </div>

        {/* Payout History */}
        <div className="mt-8 bg-white border rounded-2xl overflow-hidden shadow-sm">
          <div className="border-b px-6 py-5">
            <h3 className="font-bold text-gray-900 text-lg">Transaction History</h3>
          </div>
          {bookings.filter((b) => b.status === "approved" || b.status === "completed").length === 0 ? (
            <p className="p-8 text-center text-gray-400">No completed transactions found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-4 text-sm font-semibold text-gray-600">Booking ID</th>
                    <th className="p-4 text-sm font-semibold text-gray-600">Property</th>
                    <th className="p-4 text-sm font-semibold text-gray-600">Check-out Date</th>
                    <th className="p-4 text-sm font-semibold text-gray-600">Payout</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {bookings
                    .filter((b) => b.status === "approved" || b.status === "completed")
                    .map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="p-4 text-sm text-gray-600">{booking.id}</td>
                        <td className="p-4 font-semibold text-gray-900">
                          {booking.property_title || "Rental Hub Home"}
                        </td>
                        <td className="p-4 text-sm text-gray-600">{booking.check_out}</td>
                        <td className="p-4 text-green-600 font-semibold">+ ₹{booking.total_price}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Earnings;