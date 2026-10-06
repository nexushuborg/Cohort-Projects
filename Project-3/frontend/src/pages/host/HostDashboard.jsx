import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyProperties } from "../../api/propertyApi";
import AvailabilityCalendar from "../../components/calendar/AvailabilityCalendar";

function HostDashboard() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProperties = async () => {
      try {
        setLoading(true);

        const response = await getMyProperties();

        setProperties(response.data || response || []);
      } catch (err) {
        console.error("Failed to load host dashboard:", err);
        setError(
          err.response?.data?.message ||
            "Unable to load your properties."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
  }, []);

  const activeListings = properties.filter(
    (property) => property.status === "active"
  ).length;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-10">

        {/* Header */}
        <section>
          <p className="text-sm font-medium text-rose-500">
            Host Dashboard
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            Welcome, Host 👋
          </h1>

          <p className="mt-2 text-gray-500">
            Manage your properties and hosting activity.
          </p>
        </section>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        {/* Stats */}
        <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <p className="text-sm text-gray-500">
              Total Listings
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {loading ? "—" : properties.length}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <p className="text-sm text-gray-500">
              Active Listings
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              {loading ? "—" : activeListings}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <p className="text-sm text-gray-500">
              Properties
            </p>

            <p className="mt-2 text-3xl font-bold text-rose-500">
              {loading ? "—" : properties.length}
            </p>
          </div>

        </section>

        {/* Quick Actions */}
        <section className="mt-10">
          <h2 className="text-xl font-bold text-gray-900">
            Quick Actions
          </h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">

            <Link
              to="/host/listings"
              className="rounded-2xl border border-gray-200 bg-white p-6 transition hover:border-rose-300"
            >
              <h3 className="text-lg font-semibold text-gray-900">
                My Listings
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                View and manage your properties.
              </p>
            </Link>

            <Link
              to="/host/create-listing"
              className="rounded-2xl bg-rose-500 p-6 text-white transition hover:bg-rose-600"
            >
              <h3 className="text-lg font-semibold">
                Create Listing
              </h3>

              <p className="mt-2 text-sm text-rose-100">
                Add a new property to RentalHub.
              </p>
            </Link>

          </div>
        </section>

        {/* Your Listings */}
        <section className="mt-10">

          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              Your Listings
            </h2>

            <Link
              to="/host/listings"
              className="text-sm font-semibold text-rose-500"
            >
              View all
            </Link>
          </div>

          {loading ? (
            <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-10 text-center">
              <p className="text-gray-500">
                Loading your properties...
              </p>
            </div>
          ) : properties.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-10 text-center">
              <div className="text-5xl">🏠</div>

              <h3 className="mt-4 font-semibold text-gray-900">
                No listings yet
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Create your first property listing.
              </p>

              <Link
                to="/host/create-listing"
                className="mt-5 inline-block rounded-lg bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white"
              >
                Create Listing
              </Link>
            </div>
          ) : (
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

              {properties.slice(0, 3).map((property) => (
                <div
                  key={property.id}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <h3 className="font-semibold text-gray-900">
                    {property.title}
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    {property.city}, {property.country}
                  </p>

                  <p className="mt-4 font-bold text-gray-900">
                    ₹{property.price_per_night}
                    <span className="font-normal text-gray-500">
                      {" "} / night
                    </span>
                  </p>

                  <Link
                    to={`/properties/${property.id}`}
                    className="mt-4 block text-sm font-semibold text-rose-500"
                  >
                    View Property →
                  </Link>

                  <button
                    onClick={() => setSelectedProperty(property)}
                    className="mt-4 w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
                  >
                    Manage Availability
                  </button>
                </div>
              ))}

            </div>
          )}

        </section>

        {/* Availability Calendar */}
        {selectedProperty && (
          <section className="mt-10 rounded-2xl border border-gray-200 bg-white p-6">

            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Availability
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {selectedProperty.title}
                </p>
              </div>

              <button
                onClick={() => setSelectedProperty(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>

            <AvailabilityCalendar
              propertyId={selectedProperty.id}
            />

          </section>
        )}

      </div>
    </main>
  );
}

export default HostDashboard;