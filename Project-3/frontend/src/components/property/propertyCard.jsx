import { Link } from "react-router-dom";

function PropertyCard({ property }) {
  return (
    <Link
      to={`/properties/${property.id}`}
      className="group block overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:-translate-y-1 hover:shadow-lg"
    >
      {/* Image placeholder */}
      <div className="flex h-56 items-center justify-center bg-gray-100">
        <span className="text-5xl">🏠</span>
      </div>

      <div className="p-5">
        <div className="mb-2 flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-rose-500">
            {property.title}
          </h3>

          <span className="whitespace-nowrap text-sm font-semibold text-gray-900">
            ₹{property.price_per_night}
            <span className="font-normal text-gray-500"> / night</span>
          </span>
        </div>

        <p className="text-sm text-gray-500">
          {property.city}, {property.state}
        </p>

        <div className="mt-4 flex gap-4 text-sm text-gray-500">
          <span>{property.bedrooms} bedrooms</span>
          <span>{property.beds} beds</span>
          <span>{property.bathrooms} baths</span>
        </div>

        <div className="mt-4 border-t border-gray-100 pt-4 text-sm text-gray-500">
          Up to {property.max_guests} guests
        </div>
      </div>
    </Link>
  );
}

export default PropertyCard;