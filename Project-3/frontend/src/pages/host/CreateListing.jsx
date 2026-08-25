import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import {getPropertyTypes, getAmenities,} from "../../api/propertyApi";

function CreateListing() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    address: "",
    city: "",
    state: "",
    country: "",
    zip_code: "",
    latitude: "",
    longitude: "",
    price_per_night: "",
    max_guests: 1,
    bedrooms: 1,
    bathrooms: 1,
    beds: 1,
    min_nights: 1,
    max_nights: 30,
    cancellation_policy: "moderate",
    property_type_id: "",
    amenity_ids: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  useEffect(() => {
  const loadPropertyOptions = async () => {
    try {
      setLoadingOptions(true);

      const [typesResponse, amenitiesResponse] = await Promise.all([
        getPropertyTypes(),
        getAmenities(),
      ]);

      setPropertyTypes(typesResponse.data || []);
      setAmenities(amenitiesResponse.data || []);
    } catch (err) {
      console.error("Failed to load property options:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load property types and amenities."
      );
    } finally {
      setLoadingOptions(false);
    }
  };

  loadPropertyOptions();
}, []);
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Frontend validation
    if (form.title.trim().length < 5) {
      setError("Property title must be at least 5 characters.");
      return;
    }

    if (form.title.trim().length > 255) {
      setError("Property title cannot exceed 255 characters.");
      return;
    }

    if (form.address.trim().length < 10) {
      setError("Address must be at least 10 characters.");
      return;
    }

    if (form.address.trim().length > 500) {
      setError("Address cannot exceed 500 characters.");
      return;
    }

    if (form.city.trim().length < 2 || form.city.trim().length > 100) {
      setError("City must be between 2 and 100 characters.");
      return;
    }

    if (
      form.country.trim().length < 2 ||
      form.country.trim().length > 100
    ) {
      setError("Country must be between 2 and 100 characters.");
      return;
    }

    if (Number(form.price_per_night) < 1) {
      setError("Price per night must be at least 1.");
      return;
    }

    if (
      Number(form.max_guests) < 1 ||
      Number(form.max_guests) > 20
    ) {
      setError("Maximum guests must be between 1 and 20.");
      return;
    }

    if (Number(form.bedrooms) < 0) {
      setError("Bedrooms cannot be negative.");
      return;
    }

    if (Number(form.bathrooms) < 0) {
      setError("Bathrooms cannot be negative.");
      return;
    }

    if (Number(form.beds) < 0) {
      setError("Beds cannot be negative.");
      return;
    }

    if (Number(form.min_nights) < 1) {
      setError("Minimum nights must be at least 1.");
      return;
    }

    if (Number(form.max_nights) < 1) {
      setError("Maximum nights must be at least 1.");
      return;
    }

    if (Number(form.max_nights) < Number(form.min_nights)) {
      setError(
        "Maximum nights must be greater than or equal to minimum nights."
      );
      return;
    }

    try {
      setLoading(true);

      const propertyData = {
        ...form,

        price_per_night: Number(form.price_per_night),
        max_guests: Number(form.max_guests),
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
        beds: Number(form.beds),
        min_nights: Number(form.min_nights),
        max_nights: Number(form.max_nights),

        property_type_id: form.property_type_id || null,

        latitude: form.latitude
          ? Number(form.latitude)
          : null,

        longitude: form.longitude
          ? Number(form.longitude)
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
          err.response?.data?.error?.message ||
          "Failed to create property."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-6 py-10">

        {/* Back Button */}
        <button
          onClick={() => navigate("/host/listings")}
          className="text-sm font-medium text-gray-600 hover:text-rose-500"
        >
          ← Back to My Listings
        </button>

        {/* Header */}
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

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-600">
              {success}
            </div>
          )}

          {/* ================= BASIC INFORMATION ================= */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900">
              Basic Information
            </h2>

            <div className="mt-5 space-y-4">

              {/* Title */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Property Title
                </label>

                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  minLength={5}
                  maxLength={255}
                  required
                  placeholder="Beautiful apartment in Bhubaneswar"
                  className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-rose-500"
                />

                <p className="mt-1 text-xs text-gray-400">
                  5–255 characters
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  maxLength={5000}
                  rows="5"
                  placeholder="Describe your property..."
                  className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-rose-500"
                />

                <p className="mt-1 text-xs text-gray-400">
                  Maximum 5000 characters
                </p>
              </div>

            </div>
          </section>

          {/* ================= LOCATION ================= */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900">
              Location
            </h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">

              {/* Address */}
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Address
                </label>

                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  minLength={10}
                  maxLength={500}
                  required
                  placeholder="123 Beach Road, Calangute"
                  className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-rose-500"
                />
              </div>

              {/* City */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  City
                </label>

                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  minLength={2}
                  maxLength={100}
                  required
                  placeholder="Goa"
                  className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-rose-500"
                />
              </div>

              {/* State */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  State
                </label>

                <input
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  maxLength={100}
                  placeholder="Goa"
                  className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-rose-500"
                />
              </div>

              {/* Country */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Country
                </label>

                <input
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  minLength={2}
                  maxLength={100}
                  required
                  placeholder="India"
                  className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-rose-500"
                />
              </div>

              {/* ZIP Code */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  ZIP / Postal Code
                </label>

                <input
                  name="zip_code"
                  value={form.zip_code}
                  onChange={handleChange}
                  maxLength={20}
                  placeholder="403516"
                  className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-rose-500"
                />
              </div>

              {/* Latitude */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Latitude
                </label>

                <input
                  type="number"
                  name="latitude"
                  value={form.latitude}
                  onChange={handleChange}
                  min="-90"
                  max="90"
                  step="any"
                  placeholder="15.5167"
                  className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-rose-500"
                />
              </div>

              {/* Longitude */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Longitude
                </label>

                <input
                  type="number"
                  name="longitude"
                  value={form.longitude}
                  onChange={handleChange}
                  min="-180"
                  max="180"
                  step="any"
                  placeholder="73.7626"
                  className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-rose-500"
                />
              </div>

            </div>
          </section>

          {/* ================= PROPERTY DETAILS ================= */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900">
              Property Details
            </h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">

              {/* Price */}
              <div>
                <label className="mb-1 block text-sm text-gray-600">
                  Price per night
                </label>

                <input
                  type="number"
                  name="price_per_night"
                  min="1"
                  step="0.01"
                  value={form.price_per_night}
                  onChange={handleChange}
                  required
                  placeholder="3500"
                  className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-rose-500"
                />
              </div>

              {/* Maximum Guests */}
              <div>
                <label className="mb-1 block text-sm text-gray-600">
                  Maximum Guests
                </label>

                <input
                  type="number"
                  name="max_guests"
                  min="1"
                  max="20"
                  value={form.max_guests}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-rose-500"
                />

                <p className="mt-1 text-xs text-gray-400">
                  1–20 guests
                </p>
              </div>

              {/* Bedrooms */}
              <div>
                <label className="mb-1 block text-sm text-gray-600">
                  Bedrooms
                </label>

                <input
                  type="number"
                  name="bedrooms"
                  min="0"
                  value={form.bedrooms}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-rose-500"
                />
              </div>

              {/* Beds */}
              <div>
                <label className="mb-1 block text-sm text-gray-600">
                  Beds
                </label>

                <input
                  type="number"
                  name="beds"
                  min="0"
                  value={form.beds}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-rose-500"
                />
              </div>

              {/* Bathrooms */}
              <div>
                <label className="mb-1 block text-sm text-gray-600">
                  Bathrooms
                </label>

                <input
                  type="number"
                  name="bathrooms"
                  min="0"
                  value={form.bathrooms}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-rose-500"
                />
              </div>

              {/* Property Type ID */}
              <div>
                <label className="mb-1 block text-sm text-gray-600">
                  Property Type
                </label>

                <select
                  name="property_type_id"
                  value={form.property_type_id}
                  onChange={handleChange}
                  required
                  disabled={loadingOptions}
                  className="w-full rounded-lg border border-gray-300 bg-white p-3 outline-none focus:border-rose-500 disabled:bg-gray-100"
                >
                  <option value="">
                    {loadingOptions
                      ? "Loading property types..."
                      : "Select property type"}
                  </option>

                  {propertyTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Minimum Nights */}
              <div>
                <label className="mb-1 block text-sm text-gray-600">
                  Minimum Nights
                </label>

                <input
                  type="number"
                  name="min_nights"
                  min="1"
                  value={form.min_nights}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-rose-500"
                />
              </div>

              {/* Maximum Nights */}
              <div>
                <label className="mb-1 block text-sm text-gray-600">
                  Maximum Nights
                </label>

                <input
                  type="number"
                  name="max_nights"
                  min="1"
                  value={form.max_nights}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-rose-500"
                />
              </div>

              {/* Cancellation Policy */}
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm text-gray-600">
                  Cancellation Policy
                </label>

                <select
                  name="cancellation_policy"
                  value={form.cancellation_policy}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-white p-3 outline-none focus:border-rose-500"
                >
                  <option value="flexible">
                    Flexible
                  </option>

                  <option value="moderate">
                    Moderate
                  </option>

                  <option value="strict">
                    Strict
                  </option>
                </select>
              </div>

            </div>
          </section>
          {/* ================= AMENITIES ================= */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900">
              Amenities
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Select all amenities available at your property.
            </p>

            {loadingOptions ? (
              <p className="mt-5 text-sm text-gray-500">
                Loading amenities...
              </p>
            ) : (
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {amenities.map((amenity) => (
                  <label
                    key={amenity.id}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3 hover:border-rose-400"
                  >
                    <input
                      type="checkbox"
                      value={amenity.id}
                      checked={form.amenity_ids.includes(amenity.id)}
                      onChange={(e) => {
                        const { checked, value } = e.target;

                        setForm((prev) => ({
                          ...prev,
                          amenity_ids: checked
                            ? [...prev.amenity_ids, value]
                            : prev.amenity_ids.filter(
                                (id) => id !== value
                              ),
                        }));
                      }}
                      className="h-4 w-4 accent-rose-500"
                    />

                    <span className="text-sm text-gray-700">
                      {amenity.name}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </section>

          {/* ================= SUBMIT ================= */}
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