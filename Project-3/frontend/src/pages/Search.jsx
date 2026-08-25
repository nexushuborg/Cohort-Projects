import { useEffect, useState } from "react";
import axios from "axios";
import PropertyGrid from "../components/property/PropertyGrid";
import PropertyFilters from "../components/property/PropertyFilters";

function Search() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProperties = (filters = {}) => {
    setLoading(true);
    setError("");

    axios
      .get("http://localhost:5000/api/search", { params: filters })
      .then((response) => {
        const items = response.data.data?.items || response.data.data || response.data || [];
        setProperties(Array.isArray(items) ? items : []);
      })
      .catch((err) => {
        console.error(err);
        setError("Unable to load properties.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white py-8 px-6">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold text-gray-900">Find your perfect stay</h1>
          <p className="mt-2 text-gray-500">Browse available properties on RentalHub</p>

          <div className="mt-6">
            <PropertyFilters
              onApplyFilters={(filters) => fetchProperties(filters)}
              onResetFilters={() => fetchProperties()}
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-10">
        {loading && (
          <p className="text-center text-gray-500 font-medium py-10">Loading properties...</p>
        )}

        {error && (
          <div className="p-4 rounded-lg bg-red-50 text-red-600 text-center border border-red-200">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div>
            <p className="mb-6 text-sm font-medium text-gray-500">
              {properties.length} {properties.length === 1 ? "property" : "properties"} available
            </p>
            <PropertyGrid properties={properties} />
          </div>
        )}
      </div>
    </div>
  );
}

export default Search;