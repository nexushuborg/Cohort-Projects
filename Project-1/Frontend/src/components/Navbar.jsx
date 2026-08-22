function Navbar() {
  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        <div className="text-xl font-bold text-slate-900">EventHub</div>

        <div className="flex items-center gap-6">
          
          <a href="/" className="text-slate-600 hover:text-slate-900">Home</a>
          <a href="/events" className="text-slate-600 hover:text-slate-900">Events</a>
          <a href="/my-bookings" className="text-slate-600 hover:text-slate-900">My Bookings</a>
          <a href="/my-tickets" className="text-slate-600 hover:text-slate-900">My Tickets</a>
          <a href="/login" className="rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-700">Login</a>
          
        </div>

      </div>
    </nav>
  )
}

export default Navbar