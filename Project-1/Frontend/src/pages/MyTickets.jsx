import { Link } from "react-router-dom";

const tickets = [
  {
    id: "TKT-2026-001",
    event: "Tech Conference 2026",
    date: "September 15, 2026",
    time: "10:00 AM",
    location: "Kolkata",
    venue: "Science City",
    seat: "A12",
    status: "Valid",
  },
  {
    id: "TKT-2026-002",
    event: "Music Festival",
    date: "September 20, 2026",
    time: "5:00 PM",
    location: "Mumbai",
    venue: "Mahalaxmi Grounds",
    seat: "B24",
    status: "Valid",
  },
];

function MyTickets() {
  return (
    <div className="min-h-screen bg-slate-50">
      
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Account
          </p>

          <h1 className="mt-2 text-4xl font-bold text-slate-900">
            My Tickets
          </h1>

          <p className="mt-3 text-slate-600">
            Access your event tickets and QR codes.
          </p>
        </div>
      </section>

      
      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="space-y-6">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="grid md:grid-cols-3">
                
                <div className="p-6 md:col-span-2">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Digital Ticket
                      </p>

                      <h2 className="mt-1 text-2xl font-bold text-slate-900">
                        {ticket.event}
                      </h2>
                    </div>

                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                      {ticket.status}
                    </span>
                  </div>

                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    <div>
                      <p className="text-sm text-slate-500">Ticket ID</p>
                      <p className="mt-1 font-semibold text-slate-900">
                        {ticket.id}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-500">Seat</p>
                      <p className="mt-1 font-semibold text-slate-900">
                        {ticket.seat}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-500">Date</p>
                      <p className="mt-1 font-semibold text-slate-900">
                        {ticket.date}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-500">Time</p>
                      <p className="mt-1 font-semibold text-slate-900">
                        {ticket.time}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-500">Location</p>
                      <p className="mt-1 font-semibold text-slate-900">
                        {ticket.location}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-500">Venue</p>
                      <p className="mt-1 font-semibold text-slate-900">
                        {ticket.venue}
                      </p>
                    </div>
                  </div>
                </div>

                
                <div className="flex flex-col items-center justify-center border-t border-slate-200 bg-slate-50 p-6 md:border-l md:border-t-0">
                  <div className="flex h-36 w-36 items-center justify-center rounded-lg border-4 border-slate-900 bg-white">
                    <div className="grid grid-cols-5 gap-1">
                      {Array.from({ length: 25 }).map((_, index) => (
                        <div
                          key={index}
                          className={`h-4 w-4 ${
                            (index * 7 + 3) % 5 < 2
                              ? "bg-slate-900"
                              : "bg-white"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="mt-4 text-sm font-medium text-slate-700">
                    Scan at entry
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Ticket QR Code
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        
        <div className="mt-8">
          <Link
            to="/my-bookings"
            className="inline-block rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            ← Back to Bookings
          </Link>
        </div>
      </section>
    </div>
  );
}

export default MyTickets;