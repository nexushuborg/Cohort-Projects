import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCurrentUser } from "../api/authApi";
import useAuthStore from "../stores/authStore";

function Profile() {
  const [user, setUser] = useState(null); const [message, setMessage] = useState(""); const setStoredUser = useAuthStore((state) => state.setUser);
  useEffect(() => { getCurrentUser().then((response) => { setUser(response.data); setStoredUser(response.data); }).catch(() => setMessage("Please log in to view your profile.")); }, [setStoredUser]);
  if (message) return <div className="p-12 text-center">{message}</div>; if (!user) return <div className="p-12 text-center">Loading profile…</div>;
  return <div className="min-h-screen bg-slate-50"><section className="border-b bg-white"><div className="mx-auto max-w-3xl px-6 py-10"><p className="text-sm font-semibold uppercase text-slate-500">Account</p><h1 className="mt-2 text-4xl font-bold">My Profile</h1></div></section><section className="mx-auto max-w-3xl px-6 py-12"><div className="rounded-xl border bg-white p-8 shadow-sm"><div className="flex items-center gap-5 border-b pb-8"><div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-xl font-bold text-white">{user.name.charAt(0).toUpperCase()}</div><div><h2 className="text-2xl font-bold">{user.name}</h2><p className="text-slate-500">{user.email}</p></div></div><dl className="mt-8 space-y-5"><div><dt className="text-sm text-slate-500">Account role</dt><dd className="mt-1 capitalize">{user.role}</dd></div></dl><div className="mt-8 flex gap-3 border-t pt-6"><Link to="/my-bookings" className="rounded-lg bg-slate-900 px-5 py-3 text-white">My Bookings</Link><Link to="/my-tickets" className="rounded-lg border px-5 py-3">My Tickets</Link></div></div></section></div>;
}
export default Profile;
