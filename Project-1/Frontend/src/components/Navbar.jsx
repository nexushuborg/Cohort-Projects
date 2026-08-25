import { Link } from 'react-router-dom'
import useAuthStore from "../stores/authStore";

function Navbar() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        <Link  to="/" className="text-xl font-bold text-slate-900">EventHub</Link>

        <div className="flex items-center gap-6">

          <Link to="/" className="text-slate-600 hover:text-slate-900" >Home</Link>

          <Link to="/events"className="text-slate-600 hover:text-slate-900"> Events </Link>

          {user && (
            <>
              <Link to="/my-bookings" className="text-slate-600 hover:text-slate-900">My Bookings</Link>
              <Link to="/my-tickets" className="text-slate-600 hover:text-slate-900">My Tickets</Link>
            </>
          )}

          {user && (user.role === "organizer" || user.role === "admin") && (
            <>
              <Link to="/organizer-dashboard" className="text-slate-600 hover:text-slate-900">Dashboard</Link>
              <Link to="/create-event" className="text-slate-600 hover:text-slate-900">Create Event</Link>
            </>
          )}

          {user && user.role === "admin" && (
            <Link to="/admin-dashboard" className="text-slate-600 hover:text-slate-900">Admin</Link>
          )}

          {user ? <><Link to="/profile" className="text-slate-600 hover:text-slate-900">Profile</Link><button onClick={logout} className="rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-700">Logout</button></> : <Link to="/login" className="rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-700">Login</Link>}

        </div>
      </div>
    </nav>
  )
}

export default Navbar
