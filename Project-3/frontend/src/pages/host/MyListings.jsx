import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyProperties } from "../../api/propertyApi";

function MyListings() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProperties = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getMyProperties();

        setProperties(response.data || response || []);
      } catch (err) {
        console.error("Failed to load listings:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load your listings."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-rose-500" />
          <p className="mt-4 text-sm text-gray-500">
            Loading your listings...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-10">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <p className="text-sm font-medium text-rose-500">
              Host
            </p>

            <h1 className="mt-1 text-3xl font-bold text-gray-900">
              My Listings
            </h1>

            <p className="mt-2 text-gray-500">
              Manage the properties you have listed.
            </p>
          </div>

          <Link
            to="/host/create-listing"
            className="rounded-lg bg-rose-500 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-rose-600"
          >
            + Create Listing
          </Link>

        </div>

        {/* Error */}
        {error && (
          <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-5 text-red-600">
            {error}
          </div>
        )}

        {/* Empty state */}
        {!error && properties.length === 0 && (
          <div className="mt-10 rounded-2xl border border-gray-200 bg-white p-12 text-center">

            <div className="text-6xl">🏠</div>

            <h2 className="mt-5 text-xl font-semibold text-gray-900">
              No listings yet
            </h2>

            <p className="mt-2 text-gray-500">
              Create your first property listing to start hosting.
            </p>

            <Link
              to="/host/create-listing"
              className="mt-6 inline-block rounded-lg bg-rose-500 px-6 py-3 font-semibold text-white hover:bg-rose-600"
            >
              Create Your First Listing
            </Link>

          </div>
        )}

        {/* Listings */}
        {!error && properties.length > 0 && (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

            {properties.map((property) => (
              <div
                key={property.id}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
              >

                {/* Image */}
                <div className="flex h-48 items-center justify-center bg-gray-200">
                  {property.photos?.length > 0 ? (
                    <img
                      src={
                        property.photos[0]?.url ||
                        property.photos[0]?.image_url
                      }
                      alt={property.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-5xl">🏠</span>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">

                  <div className="flex items-start justify-between gap-3">

                    <h2 className="font-semibold text-gray-900">
                      {property.title}
                    </h2>

                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium capitalize text-gray-600">
                      {property.status || "active"}
                    </span>

                  </div>

                  <p className="mt-2 text-sm text-gray-500">
                    {property.city}, {property.country}
                  </p>

                  <p className="mt-4 text-lg font-bold text-gray-900">
                    ₹{property.price_per_night}
                    <span className="text-sm font-normal text-gray-500">
                      {" "} / night
                    </span>
                  </p>

                  <div className="mt-5 flex gap-3">

                    <Link
                      to={`/properties/${property.id}`}
                      className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      View
                    </Link>

                    <Link
                      to={`/host/edit-listing/${property.id}`}
                      className="flex-1 rounded-lg bg-gray-900 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-gray-800"
                    >
                      Edit
                    </Link>

                  </div>

                </div>
              </div>
            ))}

          </div>
        )}

      </div>
    </main>
  );
}

export default MyListings;