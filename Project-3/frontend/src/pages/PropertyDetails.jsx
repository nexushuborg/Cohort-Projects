import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getPropertyById } from "../api/propertyApi";
import PropertyGallery from "../components/property/PropertyGallery";
import ReviewList from "../components/reviews/ReviewList";

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

    if (id) {
      loadProperty();
    }
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

  if (error || !property) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-16">
        <div className="mx-auto max-w-2xl rounded-xl border border-red-200 bg-red-50 p-8 text-center">
          <h1 className="text-xl font-semibold text-red-700">
            Property unavailable
          </h1>

          <p className="mt-2 text-sm text-red-600">
            {error || "Could not load property."}
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

  const photos = Array.isArray(property.photos)
    ? property.photos
    : [];

  const amenities = Array.isArray(property.amenities)
    ? property.amenities
    : [];

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-10">

        {/* Back */}
        <Link
          to="/search"
          className="text-sm font-medium text-gray-600 transition hover:text-rose-500"
        >
          ← Back to properties
        </Link>

        {/* Header */}
        <div className="mt-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {property.title}
              </h1>

              <p className="mt-2 text-gray-500">
                {property.city}, {property.state},{" "}
                {property.country}
              </p>
            </div>

            {property.property_type_name && (
              <span className="w-fit rounded-full bg-gray-100 px-4 py-2 text-sm font-medium capitalize text-gray-700">
                {property.property_type_name}
              </span>
            )}

          </div>
        </div>

       {/* Property Gallery */}
        <div className="mt-8">
          <PropertyGallery
            photos={property.photos}
            title={property.title}
          />
        </div>

        {/* Main content */}
        <div className="mt-8 grid gap-10 lg:grid-cols-3">

          {/* Left */}
          <div className="lg:col-span-2">

            {/* About */}
            <section className="border-b border-gray-200 pb-8">
              <h2 className="text-2xl font-semibold text-gray-900">
                About this property
              </h2>

              <p className="mt-4 leading-7 text-gray-600">
                {property.description ||
                  "No description has been provided for this property."}
              </p>
            </section>

            {/* Property details */}
            <section className="border-b border-gray-200 py-8">
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
            </section>

            {/* Amenities */}
            <section className="border-b border-gray-200 py-8">
              <h2 className="text-xl font-semibold text-gray-900">
                Amenities
              </h2>

              {amenities.length > 0 ? (
                <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">

                  {amenities.map((amenity, index) => (
                    <div
                      key={amenity.id || index}
                      className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700"
                    >
                      {amenity.name ||
                        amenity.title ||
                        amenity}
                    </div>
                  ))}

                </div>
              ) : (
                <p className="mt-4 text-sm text-gray-500">
                  No amenities listed.
                </p>
              )}
            </section>

            {/* Location */}
            <section className="border-b border-gray-200 py-8">
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
            </section>

            {/* Host */}
            <section className="py-8">
              <h2 className="text-xl font-semibold text-gray-900">
                Hosted by
              </h2>

              <div className="mt-5 flex items-center gap-4">

                {property.host_avatar ? (
                  <img
                    src={property.host_avatar}
                    alt={property.host_name || "Host"}
                    className="h-14 w-14 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-200 text-xl">
                    👤
                  </div>
                )}

                <div>
                  <p className="font-semibold text-gray-900">
                    {property.host_name || "Property Host"}
                  </p>

                  {property.host_email && (
                    <p className="text-sm text-gray-500">
                      {property.host_email}
                    </p>
                  )}
                </div>

              </div>
            </section>

            {/* Guest Reviews & Ratings */}
            <ReviewList propertyId={property.id} />

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

              <div className="mt-6 space-y-4 border-t border-gray-200 pt-6">

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    Maximum guests
                  </span>

                  <span className="font-medium text-gray-900">
                    {property.max_guests}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    Bedrooms
                  </span>

                  <span className="font-medium text-gray-900">
                    {property.bedrooms}
                  </span>
                </div>

              </div>

              <Link
                to={`/properties/${property.id}/book`}
                className="mt-6 block w-full rounded-lg bg-rose-500 py-3 text-center font-semibold text-white transition hover:bg-rose-600"
              >
                Reserve
              </Link>

              <p className="mt-3 text-center text-xs text-gray-400">
                You won't be charged yet
              </p>

            </div>
          </aside>

        </div>

      </div>
    </main>
  );
}

export default PropertyDetails;