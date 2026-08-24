import { Link } from "react-router-dom";

function AdminDashboard() {
  const stats = [
    {
      title: "Total Users",
      value: "1,250",
      description: "Registered users",
    },
    {
      title: "Total Events",
      value: "86",
      description: "Events on platform",
    },
    {
      title: "Total Bookings",
      value: "3,420",
      description: "Bookings made",
    },
    {
      title: "Revenue",
      value: "₹8,45,600",
      description: "Platform revenue",
    },
  ];

  const events = [
    {
      id: 1,
      title: "Tech Conference 2026",
      organizer: "Tech Community",
      date: "September 15, 2026",
      status: "Published",
    },
    {
      id: 2,
      title: "Music Festival",
      organizer: "Music Events India",
      date: "September 20, 2026",
      status: "Published",
    },
    {
      id: 3,
      title: "Startup Workshop",
      organizer: "Startup Hub",
      date: "September 25, 2026",
      status: "Pending",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Administration
          </p>

          <h1 className="mt-2 text-4xl font-bold text-slate-900">
            Admin Dashboard
          </h1>

          <p className="mt-3 text-slate-600">
            Monitor and manage the EventHub platform.
          </p>
        </div>
      </section>

      
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
          <h2 className="text-2xl font-bold text-slate-900">
            Recent Events
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Review events submitted to the platform.
          </p>

          <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                      Event
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                      Organizer
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                      Date
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                      Status
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                      Action
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
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-600">
                        {event.organizer}
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-600">
                        {event.date}
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

                      <td className="px-6 py-5">
                        <Link
                          to={`/events/${event.id}`}
                          className="text-sm font-medium text-slate-900 hover:underline"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        
        <div className="mt-10 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-bold text-slate-900">
            Quick Actions
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              to="/events"
              className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-700"
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

export default AdminDashboard;