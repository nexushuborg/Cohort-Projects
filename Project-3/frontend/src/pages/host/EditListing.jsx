import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useProperties from "../../hooks/useProperties";

function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { property, loading, error, fetchPropertyById, updateProperty } = useProperties();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    address: "",
    city: "",
    country: "",
    price_per_night: "",
    max_guests: 1,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    status: "draft",
  });

  // Load listing details when the page opens
  useEffect(() => {
    fetchPropertyById(id);
  }, [id]);

  // Sync state when details are loaded from the backend
  useEffect(() => {
    if (property) {
      setFormData({
        title: property.title || "",
        description: property.description || "",
        address: property.address || "",
        city: property.city || "",
        country: property.country || "",
        price_per_night: property.price_per_night || property.pricePerNight || "",
        max_guests: property.max_guests || property.maxGuests || 1,
        bedrooms: property.bedrooms || 1,
        beds: property.beds || 1,
        bathrooms: property.bathrooms || 1,
        status: property.status || "draft",
      });
    }
  }, [property]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProperty(
      id,
      formData,
      () => {
        alert("Listing updated successfully!");
        navigate("/host/listings");
      },
      (err) => {
        alert("Failed to update listing: " + (err.response?.data?.message || "Error"));
      }
    );
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Loading details...</div>;

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-3xl mx-auto bg-white p-8 border rounded-2xl shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Edit Property Listing</h1>
        <p className="text-sm text-gray-500 mt-1">Make changes to your property details.</p>

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-600 border border-red-100 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700">Property Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">Description</label>
            <textarea
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-rose-500"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-gray-700">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">Country</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">Exact Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-rose-500"
            />
          </div>

          <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700">Max Guests</label>
              <input
                type="number"
                name="max_guests"
                value={formData.max_guests}
                onChange={handleChange}
                min="1"
                className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-center"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700">Bedrooms</label>
              <input
                type="number"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-center"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700">Beds</label>
              <input
                type="number"
                name="beds"
                value={formData.beds}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-center"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700">Bathrooms</label>
              <input
                type="number"
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-center"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-gray-700">Price per Night (₹)</label>
              <input
                type="number"
                name="price_per_night"
                value={formData.price_per_night}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 outline-none focus:border-rose-500"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="unlisted">Unlisted</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate("/host/listings")}
              className="flex-1 rounded-lg border border-gray-300 py-3 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-rose-500 py-3 text-center text-sm font-semibold text-white hover:bg-rose-600"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default EditListing;