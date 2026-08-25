import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyBookings, cancelBooking } from "../api/bookingApi";

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState("");
  const loadBookings = () => getMyBookings().then((response) => setBookings(response.data.items)).catch(() => setMessage("Please log in to view your bookings."));
  useEffect(() => { loadBookings(); }, []);
  const handleCancel = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await cancelBooking(bookingId);
      loadBookings();
    } catch (error) {
      setMessage(error.response?.data?.error?.message || "Could not cancel booking.");
    }
  };
  return <div className="min-h-screen bg-slate-50"><section className="border-b bg-white"><div className="mx-auto max-w-7xl px-6 py-10"><p className="text-sm font-semibold uppercase text-slate-500">Account</p><h1 className="mt-2 text-4xl font-bold">My Bookings</h1></div></section><section className="mx-auto max-w-5xl space-y-5 px-6 py-10">
    {message && <p className="text-red-600">{message}</p>}{!message && bookings.length === 0 && <p className="text-slate-600">You have no bookings yet.</p>}
    {bookings.map((booking) => <article key={booking.id} className="rounded-xl border bg-white p-6 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="text-xl font-bold">{booking.event_title}</h2><p className="mt-1 text-sm text-slate-500">Booking ID: {booking.id}</p><p className="mt-3 text-sm text-slate-600">Created {new Date(booking.created_at).toLocaleString()}</p></div><div className="text-right"><span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium capitalize">{booking.status}</span><p className="mt-4 text-lg font-bold">₹{Number(booking.total_amount).toLocaleString("en-IN")}</p><div className="mt-3 flex gap-3 justify-end">{booking.status === "confirmed" && <Link to="/my-tickets" className="underline">View tickets</Link>}{(booking.status === "pending" || booking.status === "confirmed") && <button onClick={() => handleCancel(booking.id)} className="text-sm text-red-600 underline">Cancel</button>}</div></div></div></article>)}
  </section></div>;
}

export default MyBookings;
