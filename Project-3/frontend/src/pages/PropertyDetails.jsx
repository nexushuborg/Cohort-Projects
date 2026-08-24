import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getPropertyById } from "../api/propertyApi";

function PropertyDetails() {
  const { id } = useParams();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProperty = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getPropertyById(id);

        setProperty(response.data);
      } catch (err) {
        console.error("Failed to load property:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load this property."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProperty();
  }, [id]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-rose-500" />
          <p className="mt-4 text-sm text-gray-500">
            Loading property...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-16">
        <div className="mx-auto max-w-2xl rounded-xl border border-red-200 bg-red-50 p-8 text-center">
          <h1 className="text-xl font-semibold text-red-700">
            Property unavailable
          </h1>

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>

          <Link
            to="/search"
            className="mt-6 inline-block rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white"
          >
            Back to Search
          </Link>
        </div>
      </main>
    );
  }

  if (!property) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-10">

        {/* Back */}
        <Link
          to="/search"
          className="text-sm font-medium text-gray-600 hover:text-rose-500"
        >
          ← Back to properties
        </Link>

        {/* Property header */}
        <div className="mt-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {property.title}
          </h1>

          <p className="mt-2 text-gray-500">
            {property.city}, {property.state}, {property.country}
          </p>
        </div>

        {/* Property image placeholder */}
        <div className="mt-8 flex h-96 items-center justify-center overflow-hidden rounded-2xl bg-gray-200">
          <span className="text-7xl">🏠</span>
        </div>

        {/* Main content */}
        <div className="mt-8 grid gap-10 lg:grid-cols-3">

          {/* Details */}
          <div className="lg:col-span-2">

            <div className="border-b border-gray-200 pb-8">
              <h2 className="text-2xl font-semibold text-gray-900">
                About this property
              </h2>

              <p className="mt-4 leading-7 text-gray-600">
                {property.description ||
                  "No description has been provided for this property."}
              </p>
            </div>

            {/* Property information */}
            <div className="border-b border-gray-200 py-8">
              <h2 className="text-xl font-semibold text-gray-900">
                Property details
              </h2>

              <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-4">

                <div>
                  <p className="text-sm text-gray-500">
                    Bedrooms
                  </p>
                  <p className="mt-1 font-semibold text-gray-900">
                    {property.bedrooms}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Beds
                  </p>
                  <p className="mt-1 font-semibold text-gray-900">
                    {property.beds}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Bathrooms
                  </p>
                  <p className="mt-1 font-semibold text-gray-900">
                    {property.bathrooms}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Guests
                  </p>
                  <p className="mt-1 font-semibold text-gray-900">
                    {property.max_guests}
                  </p>
                </div>

              </div>
            </div>

            {/* Location */}
            <div className="py-8">
              <h2 className="text-xl font-semibold text-gray-900">
                Location
              </h2>

              <p className="mt-4 text-gray-600">
                {property.address}
              </p>

              <p className="mt-1 text-gray-600">
                {property.city}, {property.state},{" "}
                {property.country}
              </p>
            </div>

          </div>

          {/* Booking card */}
          <aside>
            <div className="sticky top-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">

              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-bold text-gray-900">
                    ₹{property.price_per_night}
                  </span>

                  <span className="text-gray-500">
                    {" "} / night
                  </span>
                </div>
              </div>

              <div className="mt-6 border-t border-gray-200 pt-6">

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    Maximum guests
                  </span>

                  <span className="font-medium text-gray-900">
                    {property.max_guests}
                  </span>
                </div>

              </div>

              <Link
                to={`/properties/${property.id}/book`}
                className="mt-6 block w-full rounded-lg bg-rose-500 py-3 text-center font-semibold text-white transition hover:bg-rose-600"
              >
                Reserve
              </Link>

            </div>
          </aside>

        </div>
      </div>
    </main>
  );
}

export default PropertyDetails;