import api from "./axios";

export const getProperties = async () => {
  const response = await api.get("/properties");
  return response.data;
};

export const getPropertyById = async (id) => {
  const response = await api.get(`/properties/${id}`);
  return response.data;
};

export const getMyProperties = async () => {
  const response = await api.get("/properties/my");
  return response.data;
};

export const getPropertyTypes = async () => {
  const response = await api.get("/properties/types");
  return response.data;
};

export const getAmenities = async () => {
  const response = await api.get("/properties/amenities");
  return response.data;
};

export const createProperty = async (propertyData) => {
  const response = await api.post("/properties", propertyData);
  return response.data;
};

export const updateProperty = async (id, propertyData) => {
  const response = await api.put(`/properties/${id}`, propertyData);
  return response.data;
};

export const deleteProperty = async (id) => {
  const response = await api.delete(`/properties/${id}`);
  return response.data;
};

export const uploadPropertyPhoto = async (id, formData) => {
  const response = await api.post(
    `/properties/${id}/photos`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};