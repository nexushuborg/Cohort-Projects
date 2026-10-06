import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getEventById } from "../api/eventApi";
import { createBooking, processPayment } from "../api/bookingApi";
import { holdSeat } from "../api/bookingApi";
import { getVenueSeats } from "../api/venueApi";

const money = (amount) => `₹${Number(amount).toLocaleString("en-IN")}`;

function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const eventId = searchParams.get("eventId");
  const tierId = searchParams.get("tierId");
  const [event, setEvent] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [seats, setSeats] = useState([]); const [selectedSeats, setSelectedSeats] = useState([]);

  useEffect(() => {
    if (!eventId || !tierId) return;
    getEventById(eventId).then((response) => setEvent(response.data)).catch(() => setMessage("This event could not be loaded."));
  }, [eventId, tierId]);
  useEffect(() => { if (event?.venue_id) getVenueSeats(event.venue_id).then((response) => setSeats(response.data.items)).catch(() => setMessage("Seats could not be loaded.")); }, [event]);
  const selectSeat = async (seat) => { if (selectedSeats.includes(seat.id)) return setSelectedSeats(selectedSeats.filter((id) => id !== seat.id)); if (selectedSeats.length >= quantity) return setMessage(`Select up to ${quantity} seat(s).`); try { await holdSeat(seat.id); setSelectedSeats([...selectedSeats, seat.id]); setSeats((items) => items.map((item) => item.id === seat.id ? { ...item, availability: "held" } : item)); } catch (error) { setMessage(error.response?.data?.message || "This seat is no longer available."); } };

  const tier = event?.ticketTiers.find((item) => item.id === tierId);
  const submit = async (submitEvent) => {
    submitEvent.preventDefault();
    if (!tier) return;
    setSubmitting(true); setMessage("");
    try {
      if (seats.length && selectedSeats.length !== quantity) { setMessage(`Please select and hold ${quantity} seat(s).`); setSubmitting(false); return; }
      const booking = await createBooking({ eventId, ticketTierId: tierId, quantity, seatIds: selectedSeats.length ? selectedSeats : undefined });
      await processPayment(booking.data.id);
      navigate("/my-tickets");
    } catch (error) {
      setMessage(error.response?.data?.error?.message || error.response?.data?.message || "Booking could not be completed.");
    } finally { setSubmitting(false); }
  };

  if (!eventId || !tierId) return <div className="p-12 text-center text-slate-700">Select a ticket option before checking out.</div>;
  if (message && !event) return <div className="p-12 text-center text-slate-700">{message}</div>;
  if (!event || !tier) return <div className="p-12 text-center text-slate-600">Loading checkout…</div>;
  const maximum = Math.min(10, tier.total_quantity - tier.sold_quantity);

  return <div className="min-h-screen bg-slate-50 px-6 py-12"><div className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-8">
    <p className="text-sm font-semibold uppercase text-slate-500">Booking</p><h1 className="mt-2 text-3xl font-bold">Checkout</h1>
    <div className="mt-6 rounded-lg bg-slate-50 p-5"><h2 className="font-semibold">{event.title}</h2><p className="mt-1 text-sm text-slate-600">{tier.name} · {money(tier.price)} each</p></div>
    <form onSubmit={submit} className="mt-6"><label className="block text-sm font-medium">Number of tickets</label>
      <select value={quantity} onChange={(item) => { setQuantity(Number(item.target.value)); setSelectedSeats([]); }} className="mt-2 w-full rounded-lg border border-slate-300 p-3">{Array.from({ length: maximum }, (_, index) => index + 1).map((number) => <option key={number} value={number}>{number}</option>)}</select>
      {seats.length > 0 && <div className="mt-6"><p className="font-medium">Choose {quantity} seat(s)</p><div className="mt-3 grid grid-cols-5 gap-2">{seats.map((seat) => { const active = selectedSeats.includes(seat.id); const available = seat.availability === "available" || active; return <button type="button" disabled={!available} onClick={() => selectSeat(seat)} key={seat.id} className={`rounded border p-2 text-sm ${active ? "bg-slate-900 text-white" : available ? "bg-white" : "bg-slate-200 text-slate-400"}`}>{seat.seat_number}</button>; })}</div><p className="mt-2 text-xs text-slate-500">Selected seats are held for 10 minutes.</p></div>}
      <p className="mt-5 text-lg font-bold">Total: {money(tier.price * quantity)}</p>{message && <p className="mt-3 text-sm text-red-600">{message}</p>}
      <button disabled={submitting || maximum < 1} className="mt-6 w-full rounded-lg bg-slate-900 px-5 py-3 font-medium text-white disabled:opacity-50">{submitting ? "Processing…" : "Pay and confirm booking"}</button>
    </form>
  </div></div>;
}

export default Checkout;
