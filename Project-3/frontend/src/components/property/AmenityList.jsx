import React from "react";

function AmenityList({ amenities = [] }) {
  if (!amenities || amenities.length === 0) {
    return null;
  }

  const getAmenityName = (amenity) => {
    if (typeof amenity === "string") {
      return amenity;
    }

    return amenity.name || amenity.title || amenity.amenity_name || "";
  };

  const validAmenities = amenities
    .map(getAmenityName)
    .filter((name) => name);

  if (validAmenities.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      <h2 className="mb-4 text-xl font-semibold text-gray-900">
        Amenities
      </h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
        {validAmenities.map((amenity, index) => (
          <div
            key={`${amenity}-${index}`}
            className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              ✓
            </span>

            <span className="text-sm text-gray-700">
              {amenity}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AmenityList;