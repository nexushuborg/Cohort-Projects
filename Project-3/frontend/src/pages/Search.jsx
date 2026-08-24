import { useState } from "react";
import axios from "axios";

function Search() {
  const [city, setCity] = useState("");
  const [minPrice, setMinPrice] = useState(1000);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [guests, setGuests] = useState(1);

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGuestDecrease = () => {
    if (guests > 1) {
      setGuests(guests - 1);
    }
  };

  const handleGuestIncrease = () => {
    if (guests < 20) {
      setGuests(guests + 1);
    }
  };

  const handleSearch = async () => {
  console.log("SEARCH BUTTON CLICKED");

  setLoading(true);
  setError("");
    try {
      const response = await axios.get(
        "http://localhost:5000/properties",
        {
          params: {
            city,
            minPrice,
            maxPrice,
            guests,
          },
        }
      );

      setProperties(response.data.data.items || []);
    } catch (err) {
      console.error(err);
      setError("Unable to fetch properties.");
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero */}
      <section className="bg-gradient-to-r from-rose-500 to-pink-500 px-6 py-16 text-white">
        <div className="mx-auto max-w-7xl">

          <h1 className="text-4xl font-bold md:text-5xl">
            Find your perfect stay
          </h1>

          <p className="mt-3 text-lg text-rose-100">
            Search thousands of properties and find a place
            that feels like home.
          </p>

        </div>
      </section>

      {/* Search Box */}
      <section className="mx-auto -mt-8 max-w-6xl px-6">

        <div className="rounded-2xl bg-white p-6 shadow-xl">

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-5">

            {/* City */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Where
              </label>

              <input
                type="text"
                placeholder="Enter city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
              />
            </div>

            {/* Min Price */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Min Price
              </label>

              <input
                type="number"
                min="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
              />
            </div>

            {/* Max Price */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Max Price
              </label>

              <input
                type="number"
                min="0"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
              />
            </div>

            {/* Guests */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Guests
              </label>

              <div className="flex h-[50px] items-center justify-between rounded-lg border border-gray-300 px-3">

                <button
                  onClick={handleGuestDecrease}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-lg hover:bg-gray-100"
                >
                  −
                </button>

                <span className="font-medium">
                  {guests}
                </span>

                <button
                  onClick={handleGuestIncrease}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-lg hover:bg-gray-100"
                >
                  +
                </button>

              </div>
            </div>

            {/* Search Button */}
            <div className="flex items-end">

              <button
                onClick={handleSearch}
                className="h-[50px] w-full rounded-lg bg-rose-500 px-6 font-semibold text-white transition hover:bg-rose-600 active:scale-95"
              >
                Search
              </button>

            </div>

          </div>
        </div>

      </section>

      {/* Results */}
      <section className="mx-auto max-w-7xl px-6 py-12">

        <div className="mb-6 flex items-center justify-between">

          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Available Properties
            </h2>

            <p className="mt-1 text-gray-500">
              Find a place that matches your needs
            </p>
          </div>

          {properties.length > 0 && (
            <span className="text-sm text-gray-500">
              {properties.length} properties found
            </span>
          )}

        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="py-12 text-center">

            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-rose-500"></div>

            <p className="mt-4 text-gray-500">
              Searching properties...
            </p>

          </div>
        )}

        {/* Empty */}
        {!loading && properties.length === 0 && !error && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-20 text-center">

            <div className="text-5xl">
              🏠
            </div>

            <h3 className="mt-4 text-xl font-semibold text-gray-800">
              Search for a property
            </h3>

            <p className="mt-2 text-gray-500">
              Enter a city and your preferences above.
            </p>

          </div>
        )}

        {/* Property Cards */}
        {!loading && properties.length > 0 && (

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

            {properties.map((property) => (

              <div
                key={property.id}
                className="group overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >

                {/* Image */}
                <div className="relative h-56 overflow-hidden bg-gray-200">

                  {property.photos?.length > 0 ? (

                    <img
                      src={property.photos[0].url}
                      alt={property.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />

                  ) : (

                    <div className="flex h-full items-center justify-center text-gray-400">
                      No Image
                    </div>

                  )}

                  <div className="absolute right-3 top-3 rounded-full bg-white px-3 py-1 text-sm font-semibold shadow">
                    ★ {property.avgRating || "New"}
                  </div>

                </div>

                {/* Details */}
                <div className="p-5">

                  <h3 className="truncate text-lg font-bold text-gray-900">
                    {property.title}
                  </h3>

                  <p className="mt-1 text-gray-500">
                    📍 {property.city}
                  </p>

                  <div className="mt-4 flex items-center justify-between">

                    <div>
                      <span className="text-lg font-bold text-gray-900">
                        ₹{property.price_per_night || property.pricePerNight}
                      </span>

                      <span className="text-sm text-gray-500">
                        {" "}/ night
                      </span>
                    </div>

                    <span className="text-sm text-gray-500">
                      👥 {property.max_guests || property.maxGuests}
                    </span>

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </section>

    </div>
  );
}

export default Search;