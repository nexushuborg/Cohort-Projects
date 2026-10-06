import React from "react";

function PropertyInfo({ property }) {
  if (!property) {
    return null;
  }

  const {
    title,
    description,
    city,
    address,
    bedrooms,
    bathrooms,
    max_guests,
    guests,
    price_per_night,
    property_type,
    property_type_name,
    host,
    host_name,
  } = property;

  const guestCount = max_guests ?? guests;

  const propertyType =
    property_type_name ||
    (typeof property_type === "string" ? property_type : property_type?.name);

  const hostName =
    host_name ||
    (typeof host === "string" ? host : host?.name);

  return (
    <div className="space-y-6">
      {/* Title and Location */}
      <div>
        {title && (
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
            {title}
          </h1>
        )}

        {(city || address) && (
          <p className="mt-2 text-sm text-gray-500">
            {[address, city].filter(Boolean).join(", ")}
          </p>
        )}
      </div>

      {/* Property Basic Information */}
      <div className="flex flex-wrap gap-3">
        {propertyType && (
          <div className="rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-700">
            <span className="font-medium">Type:</span>{" "}
            {propertyType}
          </div>
        )}

        {bedrooms !== undefined && bedrooms !== null && (
          <div className="rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-700">
            <span className="font-medium">Bedrooms:</span>{" "}
            {bedrooms}
          </div>
        )}

        {bathrooms !== undefined && bathrooms !== null && (
          <div className="rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-700">
            <span className="font-medium">Bathrooms:</span>{" "}
            {bathrooms}
          </div>
        )}

        {guestCount !== undefined && guestCount !== null && (
          <div className="rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-700">
            <span className="font-medium">Guests:</span>{" "}
            {guestCount}
          </div>
        )}
      </div>

      {/* Price */}
      {price_per_night !== undefined && price_per_night !== null && (
        <div>
          <span className="text-2xl font-bold text-gray-900">
            ₹{Number(price_per_night).toLocaleString("en-IN")}
          </span>

          <span className="ml-1 text-sm text-gray-500">
            / night
          </span>
        </div>
      )}

      {/* Description */}
      {description && (
        <div>
          <h2 className="mb-2 text-xl font-semibold text-gray-900">
            About this property
          </h2>

          <p className="whitespace-pre-line leading-7 text-gray-600">
            {description}
          </p>
        </div>
      )}

      {/* Host */}
      {hostName && (
        <div className="border-t border-gray-200 pt-5">
          <h2 className="mb-2 text-lg font-semibold text-gray-900">
            Hosted by
          </h2>

          <p className="text-gray-600">
            {hostName}
          </p>
        </div>
      )}
    </div>
  );
}

export default PropertyInfo;