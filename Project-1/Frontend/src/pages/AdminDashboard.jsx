import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAdminAnalytics } from "../api/analyticsApi";
import { getEvents } from "../api/eventApi";

function AdminDashboard() {
  const [stats, setStats] = useState(null); const [events, setEvents] = useState([]); const [message, setMessage] = useState("");
  useEffect(() => { Promise.all([getAdminAnalytics(), getEvents()]).then(([analytics, eventList]) => { setStats(analytics.data); setEvents(eventList.data.items.slice(0, 10)); }).catch(() => setMessage("Please log in with an admin account.")); }, []);
  if (message) return <div className="p-12 text-center">{message}</div>; if (!stats) return <div className="p-12 text-center">Loading dashboard…</div>;
  const cards = [["Total Users", stats.totalUsers], ["Total Events", stats.totalEvents], ["Tickets", stats.totalTickets], ["Revenue", `₹${stats.totalRevenue.toLocaleString("en-IN")}`]];
  return <div className="min-h-screen bg-slate-50"><section className="border-b bg-white"><div className="mx-auto max-w-7xl px-6 py-10"><p className="text-sm font-semibold uppercase text-slate-500">Administration</p><h1 className="mt-2 text-4xl font-bold">Admin Dashboard</h1></div></section><section className="mx-auto max-w-7xl px-6 py-10"><div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{cards.map(([title, value]) => <div key={title} className="rounded-xl border bg-white p-6 shadow-sm"><p className="text-sm text-slate-500">{title}</p><p className="mt-2 text-3xl font-bold">{value}</p></div>)}</div><div className="mt-10 overflow-hidden rounded-xl border bg-white"><table className="w-full text-left"><thead className="bg-slate-50"><tr><th className="p-4">Event</th><th className="p-4">Date</th><th className="p-4">Status</th><th className="p-4">Action</th></tr></thead><tbody>{events.map((event) => <tr key={event.id} className="border-t"><td className="p-4 font-medium">{event.title}</td><td className="p-4">{new Date(event.event_date).toLocaleDateString()}</td><td className="p-4 capitalize">{event.status}</td><td className="p-4"><Link to={`/events/${event.id}`} className="underline">View</Link></td></tr>)}</tbody></table></div></section></div>;
}
export default AdminDashboard;
