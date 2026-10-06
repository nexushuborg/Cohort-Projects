import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getEvents } from "../api/eventApi";

function Events() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEvents()
      .then((response) => setEvents(response.data.items.filter((event) => event.status === "published")))
      .catch(() => setError("Events could not be loaded. Please try again."))
      .finally(() => setLoading(false));
  }, []);
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
                    📅 {new Date(event.event_date).toLocaleString()}
                  </p>

                  <p>
                    📍 {event.venue_id ? "Venue selected" : "Venue to be announced"}
                  </p>

                </div>


                <div className="mt-6 flex items-center justify-between">

                  <div>
                    <p className="text-xs text-slate-500">
                      Starting from
                    </p>

                    <p className="text-lg font-bold text-slate-900">
                      See ticket options
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

        {error && <p className="mt-6 text-sm text-red-600">{error}</p>}

        {loading && <p className="mt-6 text-slate-600">Loading events…</p>}

        {!loading && !error && events.length === 0 && (
          <p className="mt-6 text-slate-600">No published events are available yet.</p>
        )}

      </section>

    </div>
  );
}

export default Events;
