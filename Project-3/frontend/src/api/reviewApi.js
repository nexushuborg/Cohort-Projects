import api from "./axios";

// Create a review for a property
export const createPropertyReview = async (reviewData) => {
  const response = await api.post(
    "/reviews/property",
    reviewData
  );

  return response.data;
};

// Get reviews for a property
export const getPropertyReviews = async (propertyId) => {
  const response = await api.get(
    `/reviews/property/${propertyId}`
  );

  return response.data;
};

// Create a guest review for a booking
export const createGuestReview = async (
  bookingId,
  reviewData
) => {
  const response = await api.post(
    `/reviews/guest/${bookingId}`,
    reviewData
  );

  return response.data;
};

// Update an existing review
export const updateReview = async (
  reviewId,
  reviewData
) => {
  const response = await api.put(
    `/reviews/${reviewId}`,
    reviewData
  );

  return response.data;
};

// Delete a review
export const deleteReview = async (reviewId) => {
  const response = await api.delete(
    `/reviews/${reviewId}`
  );

  return response.data;
};