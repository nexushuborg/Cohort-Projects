import { useForm } from "react-hook-form";

function CreateEvent() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    console.log("Create Event Data:", data);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Organizer
          </p>

          <h1 className="mt-2 text-4xl font-bold text-slate-900">
            Create Event
          </h1>

          <p className="mt-3 text-slate-600">
            Add the details of your new event.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-10">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm"
        >
          <div className="grid gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700">
                Event Title
              </label>

              <input
                type="text"
                placeholder="Enter event title"
                {...register("title", {
                  required: "Event title is required.",
                })}
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
              />

              {errors.title && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Date
              </label>

              <input
                type="date"
                {...register("date", {
                  required: "Date is required.",
                })}
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
              />

              {errors.date && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.date.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Time
              </label>

              <input
                type="time"
                {...register("time", {
                  required: "Time is required.",
                })}
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
              />

              {errors.time && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.time.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Location
              </label>

              <input
                type="text"
                placeholder="Kolkata"
                {...register("location", {
                  required: "Location is required.",
                })}
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
              />

              {errors.location && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.location.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Venue
              </label>

              <input
                type="text"
                placeholder="Science City"
                {...register("venue", {
                  required: "Venue is required.",
                })}
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
              />

              {errors.venue && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.venue.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Category
              </label>

              <select
                {...register("category", {
                  required: "Category is required.",
                })}
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
              >
                <option value="">Select category</option>
                <option value="Technology">Technology</option>
                <option value="Music">Music</option>
                <option value="Workshop">Workshop</option>
                <option value="Art">Art</option>
                <option value="Festival">Festival</option>
              </select>

              {errors.category && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.category.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Ticket Price
              </label>

              <input
                type="number"
                placeholder="499"
                {...register("price", {
                  required: "Ticket price is required.",
                  min: {
                    value: 0,
                    message: "Price cannot be negative.",
                  },
                })}
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
              />

              {errors.price && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.price.message}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700">
                Description
              </label>

              <textarea
                rows="5"
                placeholder="Describe your event..."
                {...register("description", {
                  required: "Description is required.",
                })}
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
              />

              {errors.description && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.description.message}
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="mt-8 w-full rounded-lg bg-slate-900 px-5 py-3 font-medium text-white hover:bg-slate-700"
          >
            Create Event
          </button>
        </form>
      </section>
    </div>
  );
}

export default CreateEvent;