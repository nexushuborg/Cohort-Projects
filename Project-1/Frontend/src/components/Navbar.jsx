import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        <Link  to="/" className="text-xl font-bold text-slate-900">EventHub</Link>

        <div className="flex items-center gap-6">

          <Link to="/" className="text-slate-600 hover:text-slate-900" >Home</Link>

          <Link to="/events"className="text-slate-600 hover:text-slate-900"> Events </Link>

          <Link to="/my-bookings" className="text-slate-600 hover:text-slate-900">My Bookings</Link>

          <Link to="/my-tickets" className="text-slate-600 hover:text-slate-900">My Tickets</Link>

          <Link
            to="/login"
            className="rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
          >
            Login
          </Link>

        </div>
      </div>
    </nav>
  )
}

export default Navbar