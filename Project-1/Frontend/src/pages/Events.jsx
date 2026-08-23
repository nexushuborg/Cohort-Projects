import { Link } from "react-router-dom";

const events = [
  {
    id: 1,
    title: "Tech Conference 2026",
    date: "September 15, 2026",
    location: "Kolkata",
    category: "Technology",
    price: "₹499",
  },
  {
    id: 2,
    title: "Music Festival",
    date: "September 20, 2026",
    location: "Mumbai",
    category: "Music",
    price: "₹999",
  },
  {
    id: 3,
    title: "Startup Workshop",
    date: "September 25, 2026",
    location: "Bangalore",
    category: "Workshop",
    price: "₹299",
  },
  {
    id: 4,
    title: "Photography Exhibition",
    date: "October 2, 2026",
    location: "Delhi",
    category: "Art",
    price: "₹199",
  },
  {
    id: 5,
    title: "AI & Machine Learning Summit",
    date: "October 10, 2026",
    location: "Hyderabad",
    category: "Technology",
    price: "₹799",
  },
  {
    id: 6,
    title: "College Cultural Fest",
    date: "October 18, 2026",
    location: "Kolkata",
    category: "Festival",
    price: "₹149",
  },
];

function Events() {
  return (
    <div className="min-h-screen bg-slate-50">

      <section className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-6 py-12">

          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Explore
          </p>

          <h1 className="mt-2 text-4xl font-bold text-slate-900">
            Upcoming Events
          </h1>

          <p className="mt-3 max-w-2xl text-slate-600">
            Discover exciting events and find the perfect experience for you.
          </p>

        </div>
      </section>


      <section className="mx-auto max-w-7xl px-6 py-12">

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

          {events.map((event) => (

            <div
              key={event.id}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >

              <div className="flex h-40 items-center justify-center bg-slate-900">
                <span className="text-lg font-semibold text-white">
                  {event.category}
                </span>
              </div>


              <div className="p-6">

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  {event.category}
                </span>

                <h2 className="mt-4 text-xl font-semibold text-slate-900">
                  {event.title}
                </h2>

                <div className="mt-4 space-y-2 text-sm text-slate-600">

                  <p>
                    📅 {event.date}
                  </p>

                  <p>
                    📍 {event.location}
                  </p>

                </div>


                <div className="mt-6 flex items-center justify-between">

                  <div>
                    <p className="text-xs text-slate-500">
                      Starting from
                    </p>

                    <p className="text-lg font-bold text-slate-900">
                      {event.price}
                    </p>
                  </div>


                  <Link
                    to={`/events/${event.id}`}
                    className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
                  >
                    View Event
                  </Link>

                </div>

              </div>

            </div>

          ))}

        </div>

      </section>

    </div>
  );
}

export default Events;