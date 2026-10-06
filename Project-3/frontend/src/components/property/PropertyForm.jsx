import React, { useEffect, useState } from "react";

function PropertyForm({
  property = null,
  propertyTypes = [],
  amenities = [],
  onSubmit,
  loading = false,
  error = "",
}) {
  const isEditMode = Boolean(property);

  const [formData, setFormData] = useState({
  title: "",
  description: "",
  address: "",
  city: "",
  state: "",
  country: "",
  zip_code: "",
  latitude: "",
  longitude: "",
  price_per_night: "",
  max_guests: "",
  bedrooms: "",
  bathrooms: "",
  beds: "",
  min_nights: "",
  max_nights: "",
  cancellation_policy: "flexible",
  property_type_id: "",
  amenity_ids: [],
});

  useEffect(() => {
    if (property) {
      setFormData({
        title: property.title || "",
        description: property.description || "",
        address: property.address || "",
        city: property.city || "",
        state: property.state || "",
        country: property.country || "",
        zip_code: property.zip_code || "",
        latitude: property.latitude || "",
        longitude: property.longitude || "",
        price_per_night: property.price_per_night || "",
        max_guests: property.max_guests || "",
        bedrooms: property.bedrooms || "",
        bathrooms: property.bathrooms || "",
        beds: property.beds || "",
        min_nights: property.min_nights || "",
        max_nights: property.max_nights || "",
        cancellation_policy:
          property.cancellation_policy || "flexible",
        property_type_id: property.property_type_id || "",
        amenity_ids: Array.isArray(property.amenity_ids)
          ? property.amenity_ids
          : [],
      });
    }
  }, [property]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleAmenityChange = (amenityId) => {
    setFormData((previous) => {
      const alreadySelected =
        previous.amenity_ids.includes(amenityId);

      return {
        ...previous,
        amenity_ids: alreadySelected
          ? previous.amenity_ids.filter(
              (id) => id !== amenityId
            )
          : [...previous.amenity_ids, amenityId],
      };
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const payload = {
  title: formData.title.trim(),
  description: formData.description.trim(),
  address: formData.address.trim(),
  city: formData.city.trim(),
  state: formData.state.trim(),
  country: formData.country.trim(),

  zip_code: formData.zip_code.trim(),

  latitude:
    formData.latitude === ""
      ? null
      : Number(formData.latitude),

  longitude:
    formData.longitude === ""
      ? null
      : Number(formData.longitude),

  price_per_night: Number(formData.price_per_night),
  max_guests: Number(formData.max_guests),
  bedrooms: Number(formData.bedrooms),
  bathrooms: Number(formData.bathrooms),
  beds: Number(formData.beds),

  min_nights: Number(formData.min_nights),
  max_nights: Number(formData.max_nights),

  cancellation_policy:
    formData.cancellation_policy,
};

    // property_type_id is supported by CREATE.
    if (formData.property_type_id) {
      payload.property_type_id = formData.property_type_id;
    }

    // amenity_ids is supported by CREATE.
    if (formData.amenity_ids.length > 0) {
      payload.amenity_ids = formData.amenity_ids;
    }

    if (onSubmit) {
      onSubmit(payload);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      {/* Heading */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">
          {isEditMode ? "Edit Property" : "Create New Listing"}
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          {isEditMode
            ? "Update your property information."
            : "Add the details of your property to create a listing."}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Basic Information
        </h3>

        {/* Title */}
        <div>
          <label
            htmlFor="title"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Property Title
          </label>

          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter property title"
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Description
          </label>

          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your property"
            rows={5}
            required
            className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>
      </div>

      {/* Location */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Location
        </h3>

        <div>
          <label
            htmlFor="address"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Address
          </label>

          <input
            id="address"
            name="address"
            type="text"
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter full address"
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label
              htmlFor="city"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              City
            </label>

            <input
              id="city"
              name="city"
              type="text"
              value={formData.city}
              onChange={handleChange}
              placeholder="City"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div>
            <label
              htmlFor="state"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              State
            </label>

            <input
              id="state"
              name="state"
              type="text"
              value={formData.state}
              onChange={handleChange}
              placeholder="State"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div>
            <label
              htmlFor="country"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Country
            </label>

            <input
              id="country"
              name="country"
              type="text"
              value={formData.country}
              onChange={handleChange}
              placeholder="Country"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />

          </div>
        <div>
          <label
            htmlFor="zip_code"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            ZIP / Postal Code
          </label>

          <input
            id="zip_code"
            name="zip_code"
            type="text"
            value={formData.zip_code}
            onChange={handleChange}
            placeholder="ZIP / Postal Code"
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label
              htmlFor="latitude"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Latitude
            </label>

            <input
              id="latitude"
              name="latitude"
              type="number"
              step="any"
              value={formData.latitude}
              onChange={handleChange}
              placeholder="e.g. 15.4909"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div>
            <label
              htmlFor="longitude"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Longitude
            </label>

            <input
              id="longitude"
              name="longitude"
              type="number"
              step="any"
              value={formData.longitude}
              onChange={handleChange}
              placeholder="e.g. 73.8278"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>
        </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Pricing
        </h3>

        <div>
          <label
            htmlFor="price_per_night"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Price per Night (₹)
          </label>

          <input
            id="price_per_night"
            name="price_per_night"
            type="number"
            min="0"
            step="0.01"
            value={formData.price_per_night}
            onChange={handleChange}
            placeholder="Enter nightly price"
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>
      </div>

      {/* Property Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Property Details
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Guests */}
          <div>
            <label
              htmlFor="max_guests"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Maximum Guests
            </label>

            <input
              id="max_guests"
              name="max_guests"
              type="number"
              min="1"
              value={formData.max_guests}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* Bedrooms */}
          <div>
            <label
              htmlFor="bedrooms"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Bedrooms
            </label>

            <input
              id="bedrooms"
              name="bedrooms"
              type="number"
              min="1"
              value={formData.bedrooms}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* Bathrooms */}
          <div>
            <label
              htmlFor="bathrooms"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Bathrooms
            </label>

            <input
              id="bathrooms"
              name="bathrooms"
              type="number"
              min="1"
              value={formData.bathrooms}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* Beds */}
          <div>
            <label
              htmlFor="beds"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Beds
            </label>

            <input
              id="beds"
              name="beds"
              type="number"
              min="1"
              value={formData.beds}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>
        </div>
      </div>
      {/* Stay Rules */}
<div className="space-y-4">
  <h3 className="text-lg font-semibold text-gray-900">
    Stay Rules
  </h3>

  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
    {/* Minimum Nights */}
    <div>
      <label
        htmlFor="min_nights"
        className="mb-2 block text-sm font-medium text-gray-700"
      >
        Minimum Nights
      </label>

      <input
        id="min_nights"
        name="min_nights"
        type="number"
        min="1"
        value={formData.min_nights}
        onChange={handleChange}
        required
        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
      />
    </div>

    {/* Maximum Nights */}
    <div>
      <label
        htmlFor="max_nights"
        className="mb-2 block text-sm font-medium text-gray-700"
      >
        Maximum Nights
      </label>

      <input
        id="max_nights"
        name="max_nights"
        type="number"
        min="1"
        value={formData.max_nights}
        onChange={handleChange}
        required
        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
      />
    </div>
  </div>

  {/* Cancellation Policy */}
  <div>
    <label
      htmlFor="cancellation_policy"
      className="mb-2 block text-sm font-medium text-gray-700"
    >
      Cancellation Policy
    </label>

    <select
      id="cancellation_policy"
      name="cancellation_policy"
      value={formData.cancellation_policy}
      onChange={handleChange}
      required
      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
    >
      <option value="flexible">Flexible</option>
      <option value="moderate">Moderate</option>
      <option value="strict">Strict</option>
    </select>
  </div>
</div>

      {/* Property Type */}
      {propertyTypes.length > 0 && (
        <div>
          <label
            htmlFor="property_type_id"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Property Type
          </label>

          <select
            id="property_type_id"
            name="property_type_id"
            value={formData.property_type_id}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          >
            <option value="">Select property type</option>

            {propertyTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Amenities */}
      {amenities.length > 0 && (
        <div>
          <h3 className="mb-3 text-lg font-semibold text-gray-900">
            Amenities
          </h3>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {amenities.map((amenity) => {
              const isSelected =
                formData.amenity_ids.includes(amenity.id);

              return (
                <label
                  key={amenity.id}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 transition hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() =>
                      handleAmenityChange(amenity.id)
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />

                  <span className="text-sm text-gray-700">
                    {amenity.name}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Submit */}
      <div className="flex justify-end border-t border-gray-200 pt-5">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? isEditMode
              ? "Updating..."
              : "Creating..."
            : isEditMode
            ? "Update Property"
            : "Create Listing"}
        </button>
      </div>
    </form>
  );
}

export default PropertyForm;