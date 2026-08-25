import { useEffect, useState } from "react";

import PropertyGrid from "../components/property/PropertyGrid";
import PropertyFilters from "../components/property/PropertyFilters";
import Loader from "../components/common/Loader";
import ErrorMessage from "../components/common/ErrorMessage";

import useProperties from "../hooks/useProperties";

import {
  getPropertyTypes,
  getAmenities,
} from "../api/propertyApi";

function Search() {
  const {
    properties,
    loading,
    error,
    pagination,
    fetchProperties,
  } = useProperties();

  const [propertyTypes, setPropertyTypes] = useState([]);
  const [amenities, setAmenities] = useState([]);

  const [filterLoading, setFilterLoading] = useState(true);
  const [filterError, setFilterError] = useState("");

  const [currentFilters, setCurrentFilters] = useState({
    page: 1,
    limit: 20,
  });

  // Load property types and amenities
  useEffect(() => {
    const loadFilterOptions = async () => {
      setFilterLoading(true);
      setFilterError("");

      try {
        const [typesResponse, amenitiesResponse] =
          await Promise.all([
            getPropertyTypes(),
            getAmenities(),
          ]);

        const types =
          typesResponse?.data || typesResponse || [];

        const amenitiesData =
          amenitiesResponse?.data ||
          amenitiesResponse ||
          [];

        setPropertyTypes(
          Array.isArray(types) ? types : []
        );

        setAmenities(
          Array.isArray(amenitiesData)
            ? amenitiesData
            : []
        );
      } catch (err) {
        console.error(
          "Failed to load filter options:",
          err
        );

        setFilterError(
          err.response?.data?.message ||
            "Unable to load search filters."
        );
      } finally {
        setFilterLoading(false);
      }
    };

    loadFilterOptions();
  }, []);

  // Initial property load
  useEffect(() => {
    fetchProperties({
      page: 1,
      limit: 20,
    });
  }, []);

  // Apply filters
  const handleApplyFilters = (filters) => {
    const newFilters = {
      ...filters,
      page: 1,
      limit: 20,
    };

    setCurrentFilters(newFilters);

    fetchProperties(newFilters);
  };

  // Reset filters
  const handleResetFilters = () => {
    const resetFilters = {
      page: 1,
      limit: 20,
    };

    setCurrentFilters(resetFilters);

    fetchProperties(resetFilters);
  };

  // Change page
  const handlePageChange = (page) => {
    if (page < 1) {
      return;
    }

    if (
      pagination?.totalPages &&
      page > pagination.totalPages
    ) {
      return;
    }

    const updatedFilters = {
      ...currentFilters,
      page,
    };

    setCurrentFilters(updatedFilters);

    fetchProperties(updatedFilters);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const totalPages = pagination?.totalPages || 0;
  const currentPage = pagination?.page || 1;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold text-gray-900">
            Find your perfect stay
          </h1>

          <p className="mt-2 text-gray-500">
            Browse available properties on RentalHub
          </p>

          {/* Filters */}
          <div className="mt-6">
            {filterLoading ? (
              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <p className="text-sm text-gray-500">
                  Loading filters...
                </p>
              </div>
            ) : (
              <PropertyFilters
                propertyTypes={propertyTypes}
                amenities={amenities}
                initialFilters={currentFilters}
                onApplyFilters={handleApplyFilters}
                onResetFilters={handleResetFilters}
              />
            )}
          </div>

          {filterError && (
            <div className="mt-4">
              <ErrorMessage message={filterError} />
            </div>
          )}
        </div>
      </div>

      {/* Property Results */}
      <div className="mx-auto max-w-7xl px-6 py-10">
        {loading && (
          <div className="flex justify-center py-10">
            <Loader
              size="medium"
              text="Loading properties..."
            />
          </div>
        )}

        {!loading && error && (
          <ErrorMessage
            message={error}
            title="Unable to load properties"
            onRetry={() =>
              fetchProperties(currentFilters)
            }
          />
        )}

        {!loading && !error && (
          <div>
            {/* Result Count */}
            <p className="mb-6 text-sm font-medium text-gray-500">
              {pagination?.total ??
                properties.length}{" "}
              {(
                pagination?.total ??
                properties.length
              ) === 1
                ? "property"
                : "properties"}{" "}
              available
            </p>

            {/* Properties */}
            {properties.length > 0 ? (
              <PropertyGrid
                properties={properties}
              />
            ) : (
              <div className="rounded-xl border border-gray-200 bg-white px-6 py-12 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                  <span className="text-2xl">
                    🏠
                  </span>
                </div>

                <h2 className="text-lg font-semibold text-gray-900">
                  No properties found
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Try changing your search filters.
                </p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() =>
                    handlePageChange(
                      currentPage - 1
                    )
                  }
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {Array.from(
                    { length: totalPages },
                    (_, index) => index + 1
                  )
                    .slice(
                      Math.max(
                        0,
                        currentPage - 3
                      ),
                      Math.min(
                        totalPages,
                        currentPage + 2
                      )
                    )
                    .map((page) => (
                      <button
                        key={page}
                        type="button"
                        onClick={() =>
                          handlePageChange(page)
                        }
                        className={`
                          rounded-lg px-3 py-2 text-sm font-medium
                          ${
                            page === currentPage
                              ? "bg-blue-600 text-white"
                              : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                          }
                        `}
                      >
                        {page}
                      </button>
                    ))}
                </div>

                <button
                  type="button"
                  disabled={
                    currentPage >= totalPages
                  }
                  onClick={() =>
                    handlePageChange(
                      currentPage + 1
                    )
                  }
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Search;