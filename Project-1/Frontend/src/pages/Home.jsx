import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-screen bg-slate-50">

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid items-center gap-12 md:grid-cols-2">

          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
              Your Event. Your Experience.
            </p>

            <h1 className="text-5xl font-bold leading-tight text-slate-900">
              Discover and book amazing events.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Find concerts, workshops, conferences, festivals and other
              exciting events — all in one place.
            </p>

            <div className="mt-8 flex gap-4">

              <Link
                to="/events"
                className="rounded-lg bg-slate-900 px-6 py-3 font-medium text-white hover:bg-slate-700"
              >
                Explore Events
              </Link>

              <Link
                to="/register"
                className="rounded-lg border border-slate-300 bg-white px-6 py-3 font-medium text-slate-700 hover:bg-slate-100"
              >
                Create Account
              </Link>

            </div>
          </div>

          <div className="rounded-2xl bg-slate-900 p-10 text-white shadow-lg">
            <h2 className="text-2xl font-semibold">
              What's happening?
            </h2>

            <p className="mt-4 text-slate-300">
              Discover events happening around you and book your tickets
              easily through EventHub.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4">

              <div className="rounded-xl bg-slate-800 p-5">
                <p className="text-3xl font-bold">100+</p>
                <p className="mt-1 text-sm text-slate-400">
                  Events
                </p>
              </div>

              <div className="rounded-xl bg-slate-800 p-5">
                <p className="text-3xl font-bold">10K+</p>
                <p className="mt-1 text-sm text-slate-400">
                  Users
                </p>
              </div>

            </div>
          </div>

        </div>
      </section>


      <section className="bg-white py-16">

        <div className="mx-auto max-w-7xl px-6">

          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900">
              Everything you need
            </h2>

            <p className="mt-3 text-slate-600">
              A simple platform for discovering and managing events.
            </p>
          </div>


          <div className="mt-10 grid gap-6 md:grid-cols-3">

            <div className="rounded-xl border border-slate-200 p-6">
              <h3 className="text-xl font-semibold text-slate-900">
                Discover Events
              </h3>

              <p className="mt-3 text-slate-600">
                Browse upcoming events and find something that interests you.
              </p>
            </div>


            <div className="rounded-xl border border-slate-200 p-6">
              <h3 className="text-xl font-semibold text-slate-900">
                Easy Booking
              </h3>

              <p className="mt-3 text-slate-600">
                Select an event, choose your tickets and complete your booking.
              </p>
            </div>


            <div className="rounded-xl border border-slate-200 p-6">
              <h3 className="text-xl font-semibold text-slate-900">
                Manage Tickets
              </h3>

              <p className="mt-3 text-slate-600">
                Keep track of your bookings and access your tickets from one
                place.
              </p>
            </div>

          </div>

        </div>

      </section>

    </div>
  );
}

export default Home;