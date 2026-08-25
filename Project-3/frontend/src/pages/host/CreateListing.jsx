import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

function CreateListing() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    address: "",
    city: "",
    state: "",
    country: "",
    price_per_night: "",
    max_guests: 1,
    bedrooms: 1,
    bathrooms: 1,
    beds: 1,
    property_type_id: "",
    amenity_ids: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const propertyData = {
        ...form,
        price_per_night: Number(form.price_per_night),
        max_guests: Number(form.max_guests),
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
        beds: Number(form.beds),
        property_type_id: form.property_type_id
          ? Number(form.property_type_id)
          : null,
      };

      await api.post("/properties", propertyData);

      setSuccess("Property created successfully!");

      setTimeout(() => {
        navigate("/host/listings");
      }, 1000);
    } catch (err) {
      console.error("Create property error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to create property."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-6 py-10">

        <button
          onClick={() => navigate("/host/listings")}
          className="text-sm font-medium text-gray-600 hover:text-rose-500"
        >
          ← Back to My Listings
        </button>

        <div className="mt-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Create Listing
          </h1>

          <p className="mt-2 text-gray-500">
            Add your property to RentalHub.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
        >

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-600">
              {success}
            </div>
          )}

          {/* Basic information */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900">
              Basic Information
            </h2>

            <div className="mt-5 space-y-4">

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Property Title
                </label>

                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  placeholder="Beautiful apartment in Bhubaneswar"
                  className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  rows="5"
                  placeholder="Describe your property..."
                  className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-rose-500"
                />
              </div>

            </div>
          </section>

          {/* Location */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900">
              Location
            </h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">

              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                required
                placeholder="Address"
                className="rounded-lg border border-gray-300 p-3 outline-none focus:border-rose-500 sm:col-span-2"
              />

              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                required
                placeholder="City"
                className="rounded-lg border border-gray-300 p-3 outline-none focus:border-rose-500"
              />

              <input
                name="state"
                value={form.state}
                onChange={handleChange}
                required
                placeholder="State"
                className="rounded-lg border border-gray-300 p-3 outline-none focus:border-rose-500"
              />

              <input
                name="country"
                value={form.country}
                onChange={handleChange}
                required
                placeholder="Country"
                className="rounded-lg border border-gray-300 p-3 outline-none focus:border-rose-500"
              />

            </div>
          </section>

          {/* Property details */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900">
              Property Details
            </h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">

              <div>
                <label className="mb-1 block text-sm text-gray-600">
                  Price per night
                </label>

                <input
                  type="number"
                  name="price_per_night"
                  min="0"
                  value={form.price_per_night}
                  onChange={handleChange}
                  required
                  placeholder="2000"
                  className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-gray-600">
                  Maximum Guests
                </label>

                <input
                  type="number"
                  name="max_guests"
                  min="1"
                  value={form.max_guests}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-gray-600">
                  Bedrooms
                </label>

                <input
                  type="number"
                  name="bedrooms"
                  min="1"
                  value={form.bedrooms}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-gray-600">
                  Beds
                </label>

                <input
                  type="number"
                  name="beds"
                  min="1"
                  value={form.beds}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-gray-600">
                  Bathrooms
                </label>

                <input
                  type="number"
                  name="bathrooms"
                  min="1"
                  value={form.bathrooms}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-gray-600">
                  Property Type ID
                </label>

                <input
                  type="number"
                  name="property_type_id"
                  min="1"
                  value={form.property_type_id}
                  onChange={handleChange}
                  required
                  placeholder="1"
                  className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-rose-500"
                />
              </div>

            </div>
          </section>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-rose-500 py-3 font-semibold text-white hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating Listing..." : "Create Listing"}
          </button>

        </form>
      </div>
    </main>
  );
}

export default CreateListing;