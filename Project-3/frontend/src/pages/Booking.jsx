import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getPropertyById } from "../api/propertyApi";
import BookingForm from "../components/booking/BookingForm";

function Booking() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProperty = async () => {
      try {
        setLoading(true);
        const response = await getPropertyById(id);
        setProperty(response.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load property for booking.");
      } finally {
        setLoading(false);
      }
    };

    if (id) loadProperty();
  }, [id]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-rose-500" />
          <p className="mt-4 text-sm text-gray-500">Loading booking page...</p>
        </div>
      </main>
    );
  }

  if (error || !property) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-16">
        <div className="mx-auto max-w-2xl rounded-xl border border-red-200 bg-red-50 p-8 text-center">
          <h1 className="text-xl font-semibold text-red-700">Property Unavailable</h1>
          <p className="mt-2 text-sm text-red-600">{error || "Could not load property."}</p>
          <Link to="/search" className="mt-6 inline-block rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white">
            Back to Search
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-4xl px-6">
        <Link to={`/properties/${id}`} className="text-sm font-medium text-gray-600 hover:text-rose-500">
          ← Back to Property
        </Link>

        <h1 className="mt-4 text-3xl font-bold text-gray-900">Request to Book</h1>
        <p className="mt-1 text-gray-500">{property.title} — {property.city}, {property.country}</p>

        <div className="mt-8 flex justify-center">
          <BookingForm property={property} propertyId={property.id} pricePerNight={property.price_per_night} />
        </div>
      </div>
    </main>
  );
}

export default Booking;