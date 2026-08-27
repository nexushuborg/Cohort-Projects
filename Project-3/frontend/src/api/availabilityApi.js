import api from "./axios";

// Get availability / blocked dates for a property
export const getPropertyAvailability = async (propertyId) => {
  const response = await api.get(
    `/availability/${propertyId}`
  );

  return response.data;
};

// Block dates for a property
export const blockPropertyDates = async (
  propertyId,
  availabilityData
) => {
  const response = await api.post(
    `/availability/${propertyId}/block`,
    availabilityData
  );

  return response.data;
};

// Remove a blocked-date entry
export const deleteAvailabilityBlock = async (
  blockId
) => {
  const response = await api.delete(
    `/availability/blocks/${blockId}`
  );

  return response.data;
};