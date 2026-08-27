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

  let displayPhotos = validPhotos;

  if (displayPhotos.length === 0) {
    const lowerTitle = (propertyTitle || "").toLowerCase();
    let defaultImg = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80";
    
    if (lowerTitle.includes("penthouse") || lowerTitle.includes("apartment")) {
      defaultImg = "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80";
    } else if (lowerTitle.includes("cabin") || lowerTitle.includes("mountain")) {
      defaultImg = "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80";
    } else if (lowerTitle.includes("palace") || lowerTitle.includes("heritage")) {
      defaultImg = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80";
    }

    displayPhotos = [defaultImg];
  }

  return (
    <div className="w-full">
      {/* Main Image */}
      <div className="relative overflow-hidden rounded-xl bg-gray-100">
        <img
          src={displayPhotos[selectedImage] || displayPhotos[0]}
          alt={`${propertyTitle} ${selectedImage + 1}`}
          className="h-[400px] w-full object-cover"
        />

        {/* Image Counter */}
        {displayPhotos.length > 1 && (
          <div className="absolute bottom-4 right-4 rounded-full bg-black/60 px-3 py-1 text-sm text-white">
            {selectedImage + 1} / {displayPhotos.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {displayPhotos.length > 1 && (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
          {displayPhotos.map((photo, index) => (
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