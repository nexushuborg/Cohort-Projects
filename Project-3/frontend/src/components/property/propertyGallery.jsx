function PropertyGallery({ photos = [], title = "Property" }) {
  if (!photos || photos.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center rounded-2xl bg-gray-200">
        <div className="text-center">
          <div className="text-7xl">🏠</div>

          <p className="mt-3 text-sm text-gray-500">
            No photos available
          </p>
        </div>
      </div>
    );
  }

  const getImageUrl = (photo) => {
    if (typeof photo === "string") {
      return photo;
    }

    return photo.url || photo.image_url || photo.photo_url || "";
  };

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {/* Main image */}
      <div className="h-96 overflow-hidden rounded-2xl bg-gray-200">
        {getImageUrl(photos[0]) ? (
          <img
            src={getImageUrl(photos[0])}
            alt={title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-6xl">🏠</span>
          </div>
        )}
      </div>

      {/* Other images */}
      <div className="grid grid-cols-2 gap-3">
        {photos.slice(1, 5).map((photo, index) => {
          const imageUrl = getImageUrl(photo);

          return (
            <div
              key={photo.id || index}
              className="h-[186px] overflow-hidden rounded-xl bg-gray-200"
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={`${title} ${index + 2}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="text-3xl">🏠</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PropertyGallery;