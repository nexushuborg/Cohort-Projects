import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { createEvent, createTicketTier } from "../api/eventApi";
import { createVenue, getVenues, addSeats } from "../api/venueApi";
import { useEffect, useState } from "react";

function CreateEvent() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm();
  const [venues, setVenues] = useState([]); const [newVenue, setNewVenue] = useState(false);
  useEffect(() => { getVenues().then((response) => setVenues(response.data.items)).catch(() => {}); }, []);
  useEffect(() => { if (newVenue) setValue("venueCountry", "India"); }, [newVenue, setValue]);
  const onSubmit = async (data) => {
    try {
      let venueId = data.venueId || null;
      if (newVenue) { const venue = await createVenue({ name: data.venueName, address: data.venueAddress, city: data.venueCity, country: data.venueCountry || "India", capacity: Number(data.venueCapacity) }); venueId = venue.data.id; const count = Number(data.seatCount || 0); if (count) await addSeats(venueId, Array.from({ length: count }, (_, i) => ({ seatNumber: `S${i + 1}` }))); }
      const event = await createEvent({ title: data.title, description: data.description, category: data.category, venueId, eventDate: new Date(`${data.date}T${data.time}`).toISOString() });
      await createTicketTier(event.data.id, { name: data.tierName, price: Number(data.price), totalQuantity: Number(data.quantity) });
      navigate("/organizer-dashboard");
    } catch (error) { alert(error.response?.data?.error?.message || "The event could not be created."); }
  };
  return <div className="min-h-screen bg-slate-50"><section className="border-b bg-white"><div className="mx-auto max-w-3xl px-6 py-10"><p className="text-sm font-semibold uppercase text-slate-500">Organizer</p><h1 className="mt-2 text-4xl font-bold">Create Event</h1><p className="mt-3 text-slate-600">Your event starts as a draft. Add a ticket tier now, then publish it from the API/admin workflow.</p></div></section>
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto my-10 max-w-3xl rounded-xl border bg-white p-8 shadow-sm"><div className="grid gap-6 md:grid-cols-2">
      <label className="md:col-span-2">Event title<input {...register("title", { required: "Event title is required." })} className="mt-2 w-full rounded-lg border p-3" />{errors.title && <small className="text-red-600">{errors.title.message}</small>}</label>
      <label>Date<input type="date" {...register("date", { required: true })} className="mt-2 w-full rounded-lg border p-3" /></label><label>Time<input type="time" {...register("time", { required: true })} className="mt-2 w-full rounded-lg border p-3" /></label>
      <label>Category<select {...register("category", { required: true })} className="mt-2 w-full rounded-lg border p-3"><option value="">Select a category</option><option>Technology</option><option>Music</option><option>Workshop</option><option>Art</option><option>Festival</option></select></label>
      <label>Venue<select disabled={newVenue} {...register("venueId")} className="mt-2 w-full rounded-lg border p-3"><option value="">No reserved seating / venue TBA</option>{venues.map((venue) => <option key={venue.id} value={venue.id}>{venue.name} — {venue.city}</option>)}</select></label>
      <label className="md:col-span-2 flex items-center gap-2"><input type="checkbox" checked={newVenue} onChange={(e) => setNewVenue(e.target.checked)} /> Create a new venue for this event</label>
      {newVenue && <><label>Venue name<input {...register("venueName", { required: newVenue })} className="mt-2 w-full rounded-lg border p-3" /></label><label>City<input {...register("venueCity", { required: newVenue })} className="mt-2 w-full rounded-lg border p-3" /></label><label className="md:col-span-2">Address<input {...register("venueAddress", { required: newVenue })} className="mt-2 w-full rounded-lg border p-3" /></label><label>Capacity<input type="number" min="1" {...register("venueCapacity", { required: newVenue, min: 1 })} className="mt-2 w-full rounded-lg border p-3" /></label><label>Reserved seats (optional)<input type="number" min="0" {...register("seatCount", { min: 0 })} className="mt-2 w-full rounded-lg border p-3" /></label><input type="hidden" {...register("venueCountry")} /></>}
      <label>Ticket tier name<input defaultValue="General Admission" {...register("tierName", { required: true })} className="mt-2 w-full rounded-lg border p-3" /></label><label>Ticket price<input type="number" min="0" step="0.01" {...register("price", { required: true, min: 0 })} className="mt-2 w-full rounded-lg border p-3" /></label><label>Tickets available<input type="number" min="1" {...register("quantity", { required: true, min: 1 })} className="mt-2 w-full rounded-lg border p-3" /></label>
      <label className="md:col-span-2">Description<textarea rows="5" {...register("description", { required: true })} className="mt-2 w-full rounded-lg border p-3" /></label>
    </div><button disabled={isSubmitting} className="mt-8 w-full rounded-lg bg-slate-900 px-5 py-3 font-medium text-white disabled:opacity-50">{isSubmitting ? "Creating…" : "Create event"}</button></form></div>;
}
export default CreateEvent;
