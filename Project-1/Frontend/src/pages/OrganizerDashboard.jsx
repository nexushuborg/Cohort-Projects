import { Link } from "react-router-dom";

function OrganizerDashboard() {
  const stats = [
    {
      title: "Total Events",
      value: "6",
      description: "Events created",
    },
    {
      title: "Tickets Sold",
      value: "248",
      description: "Across all events",
    },
    {
      title: "Revenue",
      value: "₹1,24,500",
      description: "Total earnings",
    },
  ];

  const events = [
    {
      id: 1,
      title: "Tech Conference 2026",
      date: "September 15, 2026",
      location: "Kolkata",
      ticketsSold: 120,
      revenue: 59880,
      status: "Published",
    },
    {
      id: 2,
      title: "Startup Workshop",
      date: "September 25, 2026",
      location: "Bangalore",
      ticketsSold: 78,
      revenue: 23322,
      status: "Published",
    },
    {
      id: 3,
      title: "College Cultural Fest",
      date: "October 18, 2026",
      location: "Kolkata",
      ticketsSold: 50,
      revenue: 7450,
      status: "Draft",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">

      
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10">

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                Organizer
              </p>

              <h1 className="mt-2 text-4xl font-bold text-slate-900">
                Organizer Dashboard
              </h1>

              <p className="mt-3 text-slate-600">
                Manage your events and track their performance.
              </p>
            </div>

            <Link to="/create-event" className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-700">Create Event</Link>
          </div>

        </div>
      </section>


      
      <section className="mx-auto max-w-7xl px-6 py-10">

        <div className="grid gap-6 md:grid-cols-3">

          {stats.map((stat) => (
            <div
              key={stat.title}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <p className="text-sm font-medium text-slate-500">
                {stat.title}
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {stat.value}
              </p>

              <p className="mt-2 text-sm text-slate-500">
                {stat.description}
              </p>
            </div>
          ))}

        </div>


        
        <div className="mt-10">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Your Events
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Manage events created by you.
              </p>
            </div>

          </div>


          <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

            <div className="overflow-x-auto">

              <table className="w-full text-left">

                <thead className="border-b border-slate-200 bg-slate-50">

                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                      Event
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                      Date
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                      Tickets Sold
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                      Revenue
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                      Status
                    </th>
                  </tr>

                </thead>


                <tbody className="divide-y divide-slate-200">

                  {events.map((event) => (

                    <tr key={event.id}>

                      <td className="px-6 py-5">

                        <p className="font-semibold text-slate-900">
                          {event.title}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {event.location}
                        </p>

                      </td>


                      <td className="px-6 py-5 text-sm text-slate-600">
                        {event.date}
                      </td>


                      <td className="px-6 py-5 text-sm font-medium text-slate-900">
                        {event.ticketsSold}
                      </td>


                      <td className="px-6 py-5 text-sm font-medium text-slate-900">
                        ₹{event.revenue}
                      </td>


                      <td className="px-6 py-5">

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            event.status === "Published"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {event.status}
                        </span>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

        </div>

      </section>


      
      <section className="mx-auto max-w-7xl px-6 pb-12">

        <div className="rounded-xl border border-slate-200 bg-white p-6">

          <h2 className="text-xl font-bold text-slate-900">
            Quick Actions
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">

            <Link
              to="/events"
              className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              View Events
            </Link>

            <Link
              to="/profile"
              className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              My Profile
            </Link>

          </div>

        </div>

      </section>

    </div>
  );
}

export default OrganizerDashboard;