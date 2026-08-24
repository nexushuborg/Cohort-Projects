import PropertyCard from "./PropertyCard";

function PropertyGrid({ properties }) {
  if (!properties || properties.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 py-16 text-center">
        <h3 className="text-lg font-semibold text-gray-800">
          No properties found
        </h3>

        <p className="mt-2 text-sm text-gray-500">
          There are currently no published properties available.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {properties.map((property) => (
        <PropertyCard
          key={property.id}
          property={property}
        />
      ))}
    </div>
  );
}

export default PropertyGrid;