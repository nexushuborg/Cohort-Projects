import { useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";

const events = [
  {
    id: 1,
    title: "Tech Conference 2026",
    date: "September 15, 2026",
    location: "Kolkata",
    venue: "Science City",
    ticketPrice: 499,
  },
  {
    id: 2,
    title: "Music Festival",
    date: "September 20, 2026",
    location: "Mumbai",
    venue: "Mahalaxmi Grounds",
    ticketPrice: 999,
  },
  {
    id: 3,
    title: "Startup Workshop",
    date: "September 25, 2026",
    location: "Bangalore",
    venue: "Innovation Hub",
    ticketPrice: 299,
  },
];

function Checkout() {
  const [searchParams] = useSearchParams();

  const eventId = Number(searchParams.get("eventId"));

  const event = events.find((event) => event.id === eventId);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      quantity: 1,
    },
  });

  const quantity = Number(watch("quantity"));

  const subtotal = event ? event.ticketPrice * quantity : 0;

  const onSubmit = (data) => {
    console.log("Booking Data:", {
      eventId,
      quantity: Number(data.quantity),
      subtotal,
    });
  };

  if (!event) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">

          <h1 className="text-3xl font-bold text-slate-900">
            Event Not Found
          </h1>

          <p className="mt-3 text-slate-600">
            We couldn't find the event you're trying to book.
          </p>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10">

          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Booking
          </p>

          <h1 className="mt-2 text-4xl font-bold text-slate-900">
            Checkout
          </h1>

          <p className="mt-3 text-slate-600">
            Complete your booking for {event.title}.
          </p>

        </div>
      </section>


      <section className="mx-auto max-w-7xl px-6 py-12">

        <div className="grid gap-8 lg:grid-cols-3">

          <div className="lg:col-span-2">

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="rounded-xl border border-slate-200 bg-white p-8"
            >

              <h2 className="text-2xl font-bold text-slate-900">
                Ticket Selection
              </h2>

              <p className="mt-2 text-slate-600">
                Select how many tickets you want to purchase.
              </p>


              <div className="mt-8">

                <label
                  htmlFor="quantity"
                  className="block text-sm font-medium text-slate-700"
                >
                  Number of Tickets
                </label>

                <select
                  id="quantity"
                  {...register("quantity", {
                    required: "Please select a quantity.",
                    min: {
                      value: 1,
                      message: "At least 1 ticket is required.",
                    },
                    max: {
                      value: 10,
                      message: "You can book a maximum of 10 tickets.",
                    },
                  })}
                  className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                >

                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((number) => (
                    <option key={number} value={number}>
                      {number} {number === 1 ? "Ticket" : "Tickets"}
                    </option>
                  ))}

                </select>

                {errors.quantity && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.quantity.message}
                  </p>
                )}

              </div>


              <button
                type="submit"
                className="mt-8 w-full rounded-lg bg-slate-900 px-5 py-3 font-medium text-white hover:bg-slate-700"
              >
                Continue to Payment
              </button>

            </form>

          </div>


          <div>

            <div className="rounded-xl border border-slate-200 bg-white p-6">

              <h2 className="text-xl font-bold text-slate-900">
                Order Summary
              </h2>


              <div className="mt-6">

                <h3 className="font-semibold text-slate-900">
                  {event.title}
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  {event.date}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {event.location}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {event.venue}
                </p>

              </div>


              <div className="my-6 border-t border-slate-200" />


              <div className="flex justify-between text-sm text-slate-600">

                <span>
                  ₹{event.ticketPrice} × {quantity}
                </span>

                <span>
                  ₹{subtotal}
                </span>

              </div>


              <div className="my-6 border-t border-slate-200" />


              <div className="flex justify-between">

                <span className="font-semibold text-slate-900">
                  Total
                </span>

                <span className="text-2xl font-bold text-slate-900">
                  ₹{subtotal}
                </span>

              </div>

            </div>

          </div>

        </div>

      </section>

    </div>
  );
}

export default Checkout;