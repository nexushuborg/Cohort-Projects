import { useEffect, useState } from "react";
import { getProperties } from "../api/propertyApi";
import PropertyGrid from "../components/property/PropertyGrid";

function Search() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProperties = async () => {
      try {
        setLoading(true);

        const response = await getProperties();

        setProperties(response.data || []);
      } catch (err) {
        console.error("Failed to load properties:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load properties."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <h1 className="text-3xl font-bold text-gray-900">
            Find your perfect stay
          </h1>

          <p className="mt-2 text-gray-500">
            Browse available properties on RentalHub
          </p>
        </div>
      </section>

      {/* Properties */}
      <section className="mx-auto max-w-7xl px-6 py-10">

        {loading && (
          <div className="py-20 text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-rose-500" />

            <p className="mt-4 text-sm text-gray-500">
              Loading properties...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-center text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="mb-6">
              <p className="text-sm text-gray-500">
                {properties.length}{" "}
                {properties.length === 1
                  ? "property"
                  : "properties"}{" "}
                available
              </p>
            </div>

            <PropertyGrid properties={properties} />
          </>
        )}

      </section>
    </main>
  );
}

export default Search;