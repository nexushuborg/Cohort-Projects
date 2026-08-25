import React, { useState } from "react";

function PropertyGallery({ photos = [], propertyTitle = "Property" }) {
  const [selectedImage, setSelectedImage] = useState(0);

  const getImageUrl = (photo) => {
    if (!photo) return "";

    if (typeof photo === "string") {
      return photo;
    }

    return photo.photo_url || photo.url || photo.image_url || "";
  };

  const validPhotos = photos
    .map(getImageUrl)
    .filter((url) => url);

  if (validPhotos.length === 0) {
    return (
      <div className="w-full">
        <div className="flex h-[400px] items-center justify-center rounded-xl bg-gray-100">
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-200">
              <span className="text-2xl text-gray-500">🏠</span>
            </div>

            <p className="text-gray-500">
              No property images available
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Main Image */}
      <div className="relative overflow-hidden rounded-xl bg-gray-100">
        <img
          src={validPhotos[selectedImage]}
          alt={`${propertyTitle} ${selectedImage + 1}`}
          className="h-[400px] w-full object-cover"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />

        {/* Image Counter */}
        {validPhotos.length > 1 && (
          <div className="absolute bottom-4 right-4 rounded-full bg-black/60 px-3 py-1 text-sm text-white">
            {selectedImage + 1} / {validPhotos.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {validPhotos.length > 1 && (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
          {validPhotos.map((photo, index) => (
            <button
              key={`${photo}-${index}`}
              type="button"
              onClick={() => setSelectedImage(index)}
              className={`
                flex-shrink-0 overflow-hidden rounded-lg border-2
                ${
                  selectedImage === index
                    ? "border-blue-600"
                    : "border-transparent"
                }
              `}
              aria-label={`View image ${index + 1}`}
            >
              <img
                src={photo}
                alt={`${propertyTitle} thumbnail ${index + 1}`}
                className="h-20 w-24 object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default PropertyGallery;