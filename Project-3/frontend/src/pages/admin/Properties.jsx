import { useEffect, useState } from "react";
import api from "../../api/axios";

function Properties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProperties = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/properties");

        const data = response.data?.data || [];

        setProperties(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load properties:", err);

        setError(
          err.response?.data?.message ||
            err.response?.data?.error?.message ||
            "Unable to load properties."
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
            Loading properties...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-10">

        {/* Header */}
        <div>
          <p className="text-sm font-semibold text-rose-500">
            Administration
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            Properties
          </h1>

          <p className="mt-2 text-gray-500">
            View all properties listed on RentalHub.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Empty */}
        {!error && properties.length === 0 && (
          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-12 text-center">
            <div className="text-5xl">🏠</div>

            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              No properties found
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              There are currently no properties listed.
            </p>
          </div>
        )}

        {/* Properties */}
        {!error && properties.length > 0 && (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

            {properties.map((property) => (
              <div
                key={property.id}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
              >

                {/* Image placeholder */}
                <div className="flex h-48 items-center justify-center bg-gray-200">
                  <span className="text-6xl">🏠</span>
                </div>

                {/* Details */}
                <div className="p-5">

                  <div className="flex items-start justify-between gap-3">

                    <h2 className="font-semibold text-gray-900">
                      {property.title || "Untitled Property"}
                    </h2>

                    <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold capitalize text-green-700">
                      {property.status || "active"}
                    </span>

                  </div>

                  <p className="mt-2 text-sm text-gray-500">
                    {property.city || "City"},{" "}
                    {property.state || "State"},{" "}
                    {property.country || "Country"}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">

                    <div>
                      <p className="text-gray-400">
                        Guests
                      </p>

                      <p className="font-semibold text-gray-900">
                        {property.max_guests || 0}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-400">
                        Bedrooms
                      </p>

                      <p className="font-semibold text-gray-900">
                        {property.bedrooms || 0}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-400">
                        Beds
                      </p>

                      <p className="font-semibold text-gray-900">
                        {property.beds || 0}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-400">
                        Bathrooms
                      </p>

                      <p className="font-semibold text-gray-900">
                        {property.bathrooms || 0}
                      </p>
                    </div>

                  </div>

                  <div className="mt-5 border-t border-gray-100 pt-4">

                    <p className="text-lg font-bold text-gray-900">
                      ₹{property.price_per_night || 0}

                      <span className="text-sm font-normal text-gray-500">
                        {" "} / night
                      </span>
                    </p>

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

export default Properties;