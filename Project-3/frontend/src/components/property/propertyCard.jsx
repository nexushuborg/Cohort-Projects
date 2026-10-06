import { Link } from "react-router-dom";

function PropertyCard({ property }) {
  const getImageUrl = () => {
    if (property.photos && property.photos.length > 0) {
      const first = property.photos[0];
      const url = typeof first === "string" ? first : first.url || first.photo_url;
      if (url) {
        return url.startsWith("http") ? url : `http://localhost:5000${url}`;
      }
    }
    if (property.image_url) {
      return property.image_url.startsWith("http")
        ? property.image_url
        : `http://localhost:5000${property.image_url}`;
    }

    const lowerTitle = (property.title || "").toLowerCase();
    if (lowerTitle.includes("penthouse") || lowerTitle.includes("apartment")) {
      return "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80";
    }
    if (lowerTitle.includes("cabin") || lowerTitle.includes("mountain")) {
      return "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80";
    }
    if (lowerTitle.includes("palace") || lowerTitle.includes("heritage")) {
      return "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80";
    }

    return "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80";
  };

  const imageUrl = getImageUrl();

  return (
    <Link
      to={`/properties/${property.id}`}
      className="group block overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:-translate-y-1 hover:shadow-lg"
    >
      {/* Property Image */}
      <div className="h-56 w-full overflow-hidden bg-gray-100">
        <img
          src={imageUrl}
          alt={property.title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
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
          {property.city}, {property.country || property.state}
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