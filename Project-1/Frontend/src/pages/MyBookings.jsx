import { Link } from "react-router-dom";

const bookings = [
  {
    id: "BK-2026-001",
    event: "Tech Conference 2026",
    date: "September 15, 2026",
    location: "Kolkata",
    venue: "Science City",
    tickets: 2,
    amount: 998,
    status: "Confirmed",
  },
  {
    id: "BK-2026-002",
    event: "Music Festival",
    date: "September 20, 2026",
    location: "Mumbai",
    venue: "Mahalaxmi Grounds",
    tickets: 1,
    amount: 999,
    status: "Confirmed",
  },
  {
    id: "BK-2026-003",
    event: "Startup Workshop",
    date: "September 25, 2026",
    location: "Bangalore",
    venue: "Innovation Hub",
    tickets: 3,
    amount: 897,
    status: "Cancelled",
  },
];

function MyBookings() {
  return (
    <div className="min-h-screen bg-slate-50">
      
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Account
          </p>

          <h1 className="mt-2 text-4xl font-bold text-slate-900">
            My Bookings
          </h1>

          <p className="mt-3 text-slate-600">
            View and manage all your event bookings.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="space-y-6">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-bold text-slate-900">
                      {booking.event}
                    </h2>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        booking.status === "Confirmed"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-slate-500">
                    Booking ID: {booking.id}
                  </p>

                  <div className="mt-4 space-y-1 text-sm text-slate-600">
                    <p>📅 {booking.date}</p>
                    <p>📍 {booking.location}</p>
                    <p>🏛️ {booking.venue}</p>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-5 md:border-l md:border-t-0 md:pl-8 md:pt-0">
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                    <div>
                      <p className="text-slate-500">Tickets</p>
                      <p className="mt-1 font-semibold text-slate-900">
                        {booking.tickets}
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-500">Total</p>
                      <p className="mt-1 font-semibold text-slate-900">
                        ₹{booking.amount}
                      </p>
                    </div>
                  </div>

                  {booking.status === "Confirmed" && (
                    <Link
                      to="/my-tickets"
                      className="mt-5 block rounded-lg bg-slate-900 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-slate-700"
                    >
                      View Tickets
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default MyBookings;