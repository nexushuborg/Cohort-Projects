import React, { useEffect, useState } from "react";

function PropertyFilters({
  initialFilters = {},
  propertyTypes = [],
  amenities = [],
  onApplyFilters,
  onResetFilters,
}) {
  const [filters, setFilters] = useState({
    q: initialFilters.q || "",
    city: initialFilters.city || "",
    country: initialFilters.country || "",
    minPrice: initialFilters.minPrice || "",
    maxPrice: initialFilters.maxPrice || "",
    guests: initialFilters.guests || "",
    propertyTypeId: initialFilters.propertyTypeId || "",
    amenityIds: initialFilters.amenityIds || [],
    sort: initialFilters.sort || "",
    page: initialFilters.page || 1,
    limit: initialFilters.limit || 20,
  });

  useEffect(() => {
    setFilters({
      q: initialFilters.q || "",
      city: initialFilters.city || "",
      country: initialFilters.country || "",
      minPrice: initialFilters.minPrice || "",
      maxPrice: initialFilters.maxPrice || "",
      guests: initialFilters.guests || "",
      propertyTypeId: initialFilters.propertyTypeId || "",
      amenityIds: initialFilters.amenityIds || [],
      sort: initialFilters.sort || "",
      page: initialFilters.page || 1,
      limit: initialFilters.limit || 20,
    });
  }, [initialFilters]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFilters((previous) => ({
      ...previous,
      [name]: value,
      page: 1,
    }));
  };

  const handleAmenityChange = (amenityId) => {
    setFilters((previous) => {
      const exists = previous.amenityIds.includes(amenityId);

      return {
        ...previous,
        amenityIds: exists
          ? previous.amenityIds.filter(
              (id) => id !== amenityId
            )
          : [...previous.amenityIds, amenityId],
        page: 1,
      };
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const params = {};

    if (filters.q.trim()) {
      params.q = filters.q.trim();
    }

    if (filters.city.trim()) {
      params.city = filters.city.trim();
    }

    if (filters.country.trim()) {
      params.country = filters.country.trim();
    }

    if (filters.minPrice !== "") {
      params.minPrice = Number(filters.minPrice);
    }

    if (filters.maxPrice !== "") {
      params.maxPrice = Number(filters.maxPrice);
    }

    if (filters.guests !== "") {
      params.guests = Number(filters.guests);
    }

    if (filters.propertyTypeId) {
      params.propertyTypeId = filters.propertyTypeId;
    }

    if (filters.amenityIds.length > 0) {
      params.amenityIds = filters.amenityIds;
    }

    if (filters.sort) {
      params.sort = filters.sort;
    }

    params.page = 1;
    params.limit = Number(filters.limit) || 20;

    if (onApplyFilters) {
      onApplyFilters(params);
    }
  };

  const handleReset = () => {
    const resetFilters = {
      q: "",
      city: "",
      country: "",
      minPrice: "",
      maxPrice: "",
      guests: "",
      propertyTypeId: "",
      amenityIds: [],
      sort: "",
      page: 1,
      limit: 20,
    };

    setFilters(resetFilters);

    if (onResetFilters) {
      onResetFilters();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
    >
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-gray-900">
          Search & Filters
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Find a property based on your requirements.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Text Search */}
        <div className="lg:col-span-3">
          <label
            htmlFor="filter-q"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Search
          </label>

          <input
            id="filter-q"
            name="q"
            type="text"
            value={filters.q}
            onChange={handleChange}
            placeholder="Search properties, locations, or descriptions"
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        {/* City */}
        <div>
          <label
            htmlFor="filter-city"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            City
          </label>

          <input
            id="filter-city"
            name="city"
            type="text"
            value={filters.city}
            onChange={handleChange}
            placeholder="Enter city"
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        {/* Country */}
        <div>
          <label
            htmlFor="filter-country"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Country
          </label>

          <input
            id="filter-country"
            name="country"
            type="text"
            value={filters.country}
            onChange={handleChange}
            placeholder="Enter country"
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        {/* Guests */}
        <div>
          <label
            htmlFor="filter-guests"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Guests
          </label>

          <input
            id="filter-guests"
            name="guests"
            type="number"
            min="1"
            value={filters.guests}
            onChange={handleChange}
            placeholder="Number of guests"
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        {/* Minimum Price */}
        <div>
          <label
            htmlFor="filter-min-price"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Minimum Price
          </label>

          <input
            id="filter-min-price"
            name="minPrice"
            type="number"
            min="0"
            value={filters.minPrice}
            onChange={handleChange}
            placeholder="₹ Minimum"
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        {/* Maximum Price */}
        <div>
          <label
            htmlFor="filter-max-price"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Maximum Price
          </label>

          <input
            id="filter-max-price"
            name="maxPrice"
            type="number"
            min="0"
            value={filters.maxPrice}
            onChange={handleChange}
            placeholder="₹ Maximum"
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        {/* Property Type */}
        <div>
          <label
            htmlFor="filter-property-type"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Property Type
          </label>

          <select
            id="filter-property-type"
            name="propertyTypeId"
            value={filters.propertyTypeId}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          >
            <option value="">All property types</option>

            {propertyTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div>
          <label
            htmlFor="filter-sort"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Sort By
          </label>

          <select
            id="filter-sort"
            name="sort"
            value={filters.sort}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          >
            <option value="">Default</option>
            <option value="price_asc">
              Price: Low to High
            </option>
            <option value="price_desc">
              Price: High to Low
            </option>
            <option value="rating_desc">
              Highest Rated
            </option>
            <option value="newest">
              Newest
            </option>
          </select>
        </div>
      </div>

      {/* Amenities */}
      {amenities.length > 0 && (
        <div className="mt-5">
          <h3 className="mb-3 text-sm font-medium text-gray-700">
            Amenities
          </h3>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {amenities.map((amenity) => (
              <label
                key={amenity.id}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 transition hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={filters.amenityIds.includes(
                    amenity.id
                  )}
                  onChange={() =>
                    handleAmenityChange(amenity.id)
                  }
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />

                <span className="text-sm text-gray-700">
                  {amenity.name}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Apply Filters
        </button>

        <button
          type="button"
          onClick={handleReset}
          className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
        >
          Reset
        </button>
      </div>
    </form>
  );
}

export default PropertyFilters;