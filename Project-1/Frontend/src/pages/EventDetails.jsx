import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getEventById } from "../api/eventApi";
import { createReview, getReviews } from "../api/reviewApi";
import useAuthStore from "../stores/authStore";

const money = (amount) => `₹${Number(amount).toLocaleString("en-IN")}`;

function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [error, setError] = useState("");
  const [reviews, setReviews] = useState([]); const [rating, setRating] = useState(5); const [text, setText] = useState(""); const user = useAuthStore((state) => state.user);

  useEffect(() => {
    getEventById(id).then((response) => setEvent(response.data)).catch(() => setError("This event could not be found."));
    getReviews(id).then((response) => setReviews(response.data.items)).catch(() => {});
  }, [id]);
  const submitReview = async (e) => { e.preventDefault(); try { await createReview(id, { rating: Number(rating), text }); const response = await getReviews(id); setReviews(response.data.items); setText(""); } catch (err) { setError(err.response?.data?.error?.message || "Could not submit review."); } };

  if (error) return <div className="p-12 text-center"><h1 className="text-3xl font-bold">Event Not Found</h1><Link to="/events" className="mt-6 inline-block underline">Back to Events</Link></div>;
  if (!event) return <div className="p-12 text-center text-slate-600">Loading event…</div>;
  const availableTiers = event.ticketTiers.filter((tier) => tier.sold_quantity < tier.total_quantity);

  return <div className="min-h-screen bg-slate-50">
    <section className="bg-slate-900 text-white"><div className="mx-auto max-w-7xl px-6 py-16">
      <span className="rounded-full bg-slate-700 px-3 py-1 text-sm">{event.category}</span>
      <h1 className="mt-5 text-4xl font-bold md:text-5xl">{event.title}</h1>
      <p className="mt-5 max-w-2xl text-lg text-slate-300">{event.description || "Event details will be shared soon."}</p>
    </div></section>
    <section className="mx-auto grid max-w-7xl gap-8 px-6 py-12 md:grid-cols-3">
      <div className="rounded-xl border border-slate-200 bg-white p-8 md:col-span-2"><h2 className="text-2xl font-bold">Event Information</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 text-slate-700"><div><p className="text-sm text-slate-500">Date and time</p><p>{new Date(event.event_date).toLocaleString()}</p></div><div><p className="text-sm text-slate-500">Venue</p><p>{event.venue_name ? `${event.venue_name}, ${event.venue_city}` : "To be announced"}</p></div></div>
        <div className="mt-10 border-t pt-6"><h2 className="text-2xl font-bold">Reviews</h2>{reviews.map((review) => <article key={review.id} className="mt-4 rounded-lg bg-slate-50 p-4"><p className="font-medium">{review.user_name} · {"★".repeat(review.rating)}</p><p className="mt-1 text-slate-700">{review.text}</p></article>)}{user?.role === "attendee" && <form onSubmit={submitReview} className="mt-5 space-y-3"><select value={rating} onChange={(e) => setRating(e.target.value)} className="rounded border p-2">{[5,4,3,2,1].map((value) => <option key={value} value={value}>{value} stars</option>)}</select><textarea required value={text} onChange={(e) => setText(e.target.value)} placeholder="Share your experience" className="block w-full rounded border p-3"/><button className="rounded bg-slate-900 px-4 py-2 text-white">Submit review</button></form>}</div>
      </div>
      <aside className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-bold">Ticket options</h2><div className="mt-4 space-y-3">
        {availableTiers.map((tier) => <Link key={tier.id} to={`/checkout?eventId=${event.id}&tierId=${tier.id}`} className="block rounded-lg border border-slate-300 p-4 hover:border-slate-900"><div className="flex justify-between gap-3"><span className="font-medium">{tier.name}</span><span className="font-bold">{money(tier.price)}</span></div><p className="mt-1 text-sm text-slate-500">{tier.total_quantity - tier.sold_quantity} remaining</p></Link>)}
      </div>{availableTiers.length === 0 && <p className="mt-4 text-sm text-slate-600">Tickets are not available yet.</p>}<Link to="/events" className="mt-5 block text-center text-sm underline">Back to Events</Link></aside>
    </section>
  </div>;
}

export default EventDetails;
