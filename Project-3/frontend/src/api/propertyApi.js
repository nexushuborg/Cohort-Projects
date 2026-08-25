import api from "./axios";

// Get properties with optional search/filter parameters
export const getProperties = async (params = {}) => {
  const response = await api.get("/properties", {
    params,
  });

  return response.data;
};

// Get a single property by ID
export const getPropertyById = async (id) => {
  const response = await api.get(`/properties/${id}`);

  return response.data;
};

// Get properties belonging to the logged-in host
export const getMyProperties = async () => {
  const response = await api.get("/properties/my");

  return response.data;
};

// Create a new property
export const createProperty = async (propertyData) => {
  const response = await api.post(
    "/properties",
    propertyData
  );

  return response.data;
};

// Update an existing property
export const updateProperty = async (id, propertyData) => {
  const response = await api.put(
    `/properties/${id}`,
    propertyData
  );

  return response.data;
};

// Delete a property
export const deleteProperty = async (id) => {
  const response = await api.delete(
    `/properties/${id}`
  );

  return response.data;
};

// Update property status
export const updatePropertyStatus = async (
  id,
  status
) => {
  const response = await api.put(
    `/properties/${id}/status`,
    { status }
  );

  return response.data;
};

// Get available property types
export const getPropertyTypes = async () => {
  const response = await api.get(
    "/properties/types"
  );

  return response.data;
};

// Get available amenities
export const getAmenities = async () => {
  const response = await api.get(
    "/properties/amenities"
  );

  return response.data;
};

// Upload a property photo
export const uploadPropertyPhoto = async (
  propertyId,
  formDataOrFile
) => {
  const formData = formDataOrFile instanceof FormData 
    ? formDataOrFile 
    : (() => {
        const fd = new FormData();
        fd.append("photo", formDataOrFile);
        return fd;
      })();

  const response = await api.post(
    `/properties/${propertyId}/photos`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );

  return response.data;
};

// Search properties
export const searchProperties = async (params = {}) => {
  const response = await api.get("/search", {
    params,
  });

  return response.data;
};
