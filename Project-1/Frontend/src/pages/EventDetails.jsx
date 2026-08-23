import { Link, useParams } from "react-router-dom";

const events = [
  {
    id: 1,
    title: "Tech Conference 2026",
    date: "September 15, 2026",
    time: "10:00 AM",
    location: "Kolkata",
    venue: "Science City",
    category: "Technology",
    price: "₹499",
    description:
      "Join developers, engineers and technology enthusiasts for a day of talks, networking and discussions about the future of technology.",
  },
  {
    id: 2,
    title: "Music Festival",
    date: "September 20, 2026",
    time: "5:00 PM",
    location: "Mumbai",
    venue: "Mahalaxmi Grounds",
    category: "Music",
    price: "₹999",
    description:
      "Experience live performances from talented artists and enjoy an exciting evening filled with music and entertainment.",
  },
  {
    id: 3,
    title: "Startup Workshop",
    date: "September 25, 2026",
    time: "11:00 AM",
    location: "Bangalore",
    venue: "Innovation Hub",
    category: "Workshop",
    price: "₹299",
    description:
      "Learn the fundamentals of building a startup, validating ideas and turning your concepts into real products.",
  },
  {
    id: 4,
    title: "Photography Exhibition",
    date: "October 2, 2026",
    time: "12:00 PM",
    location: "Delhi",
    venue: "National Art Gallery",
    category: "Art",
    price: "₹199",
    description:
      "Explore a collection of creative photographs from artists and photographers across the country.",
  },
  {
    id: 5,
    title: "AI & Machine Learning Summit",
    date: "October 10, 2026",
    time: "9:00 AM",
    location: "Hyderabad",
    venue: "HICC",
    category: "Technology",
    price: "₹799",
    description:
      "Discover the latest developments in artificial intelligence and machine learning through talks, demonstrations and discussions.",
  },
  {
    id: 6,
    title: "College Cultural Fest",
    date: "October 18, 2026",
    time: "4:00 PM",
    location: "Kolkata",
    venue: "College Campus",
    category: "Festival",
    price: "₹149",
    description:
      "Enjoy performances, competitions, food and entertainment at this exciting college cultural festival.",
  },
];

function EventDetails() {
  const { id } = useParams();

  const event = events.find((event) => event.id === Number(id));

  if (!event) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900">
            Event Not Found
          </h1>

          <p className="mt-3 text-slate-600">
            The event you are looking for does not exist.
          </p>

          <Link
            to="/events"
            className="mt-6 inline-block rounded-lg bg-slate-900 px-5 py-3 text-white hover:bg-slate-700"
          >
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">

      <section className="bg-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-6 py-16">

          <span className="rounded-full bg-slate-700 px-3 py-1 text-sm">
            {event.category}
          </span>

          <h1 className="mt-5 text-4xl font-bold md:text-5xl">
            {event.title}
          </h1>

          <p className="mt-5 max-w-2xl text-lg text-slate-300">
            {event.description}
          </p>

        </div>
      </section>


      <section className="mx-auto max-w-7xl px-6 py-12">

        <div className="grid gap-8 md:grid-cols-3">

          <div className="md:col-span-2">

            <div className="rounded-xl border border-slate-200 bg-white p-8">

              <h2 className="text-2xl font-bold text-slate-900">
                Event Information
              </h2>

              <div className="mt-8 grid gap-6 sm:grid-cols-2">

                <div>
                  <p className="text-sm text-slate-500">
                    Date
                  </p>

                  <p className="mt-1 font-medium text-slate-900">
                    {event.date}
                  </p>
                </div>


                <div>
                  <p className="text-sm text-slate-500">
                    Time
                  </p>

                  <p className="mt-1 font-medium text-slate-900">
                    {event.time}
                  </p>
                </div>


                <div>
                  <p className="text-sm text-slate-500">
                    Location
                  </p>

                  <p className="mt-1 font-medium text-slate-900">
                    {event.location}
                  </p>
                </div>


                <div>
                  <p className="text-sm text-slate-500">
                    Venue
                  </p>

                  <p className="mt-1 font-medium text-slate-900">
                    {event.venue}
                  </p>
                </div>

              </div>

            </div>

          </div>


          <div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

              <p className="text-sm text-slate-500">
                Ticket Price
              </p>

              <p className="mt-1 text-3xl font-bold text-slate-900">
                {event.price}
              </p>

              <p className="mt-2 text-sm text-slate-500">
                per ticket
              </p>


              <Link
                to={`/checkout?eventId=${event.id}`}
                className="mt-6 block rounded-lg bg-slate-900 px-5 py-3 text-center font-medium text-white hover:bg-slate-700"
              >
                Book Tickets
              </Link>


              <Link
                to="/events"
                className="mt-3 block rounded-lg border border-slate-300 px-5 py-3 text-center font-medium text-slate-700 hover:bg-slate-50"
              >
                Back to Events
              </Link>

            </div>

          </div>

        </div>

      </section>

    </div>
  );
}

export default EventDetails;