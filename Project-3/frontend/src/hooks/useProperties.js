import { useState } from "react";
import api from "../api/axios";

export default function useProperties() {
  const [properties, setProperties] = useState([]);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });

  // 1. Fetch search properties matching filters (GET)
  const fetchProperties = (filters = {}) => {
    setLoading(true);
    setError("");
    api.get("/properties/search", { params: filters })
      .then((response) => {
        setProperties(response.data.data.items || []);
        setPagination(response.data.data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
      })
      .catch((err) => {
        console.error(err);
        setError(err.response?.data?.message || "Failed to load properties.");
        setProperties([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // 2. Fetch single property details by ID (GET)
  const fetchPropertyById = (id) => {
    setLoading(true);
    setError("");
    api.get(`/properties/${id}`)
      .then((response) => {
        setProperty(response.data.data || response.data);
      })
      .catch((err) => {
        console.error(err);
        setError(err.response?.data?.message || "Failed to load property details.");
        setProperty(null);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // 3. Create a listing (POST)
  const createProperty = (propertyData, onSuccess, onError) => {
    setLoading(true);
    setError("");
    api.post("/properties", propertyData)
      .then((response) => {
        if (onSuccess) onSuccess(response.data);
      })
      .catch((err) => {
        console.error(err);
        setError(err.response?.data?.message || "Failed to create property.");
        if (onError) onError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // 4. Update a listing (PUT)
  const updateProperty = (id, propertyData, onSuccess, onError) => {
    setLoading(true);
    setError("");
    api.put(`/properties/${id}`, propertyData)
      .then((response) => {
        if (onSuccess) onSuccess(response.data);
      })
      .catch((err) => {
        console.error(err);
        setError(err.response?.data?.message || "Failed to update property.");
        if (onError) onError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // 5. Delete a listing (DELETE)
  const deleteProperty = (id, onSuccess) => {
    setLoading(true);
    setError("");
    api.delete(`/properties/${id}`)
      .then((response) => {
        setProperties((prev) => prev.filter((p) => p.id !== id));
        if (onSuccess) onSuccess(response.data);
      })
      .catch((err) => {
        console.error(err);
        setError(err.response?.data?.message || "Failed to delete property.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return {
    properties,
    property,
    loading,
    error,
    pagination,
    fetchProperties,
    fetchPropertyById,
    createProperty,
    updateProperty,
    deleteProperty,
  };
}