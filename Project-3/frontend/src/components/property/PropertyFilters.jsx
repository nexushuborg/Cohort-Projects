import React, { useState } from "react";

function PropertyFilters({
  initialFilters = {},
  onApplyFilters,
  onResetFilters,
}) {
  const [city, setCity] = useState(initialFilters.city || "");
  const [minPrice, setMinPrice] = useState(
    initialFilters.minPrice || ""
  );
  const [maxPrice, setMaxPrice] = useState(
    initialFilters.maxPrice || ""
  );
  const [guests, setGuests] = useState(
    initialFilters.guests || ""
  );

  const handleSubmit = (event) => {
    event.preventDefault();

    const filters = {};

    if (city.trim()) {
      filters.city = city.trim();
    }

    if (minPrice !== "") {
      filters.minPrice = Number(minPrice);
    }

    if (maxPrice !== "") {
      filters.maxPrice = Number(maxPrice);
    }

    if (guests !== "") {
      filters.guests = Number(guests);
    }

    if (onApplyFilters) {
      onApplyFilters(filters);
    }
  };

  const handleReset = () => {
    setCity("");
    setMinPrice("");
    setMaxPrice("");
    setGuests("");

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
          Search Filters
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Find properties based on your requirements.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
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
            type="text"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            placeholder="Enter city"
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
            type="number"
            min="0"
            value={minPrice}
            onChange={(event) => setMinPrice(event.target.value)}
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
            type="number"
            min="0"
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
            placeholder="₹ Maximum"
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
            type="number"
            min="1"
            value={guests}
            onChange={(event) => setGuests(event.target.value)}
            placeholder="Number of guests"
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>
      </div>

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