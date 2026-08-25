import api from "./axios";

// 1. Fetch reviews for a property
export const getPropertyReviews = async (propertyId) => {
  const response = await api.get(`/reviews/property/${propertyId}`);
  return response.data;
};

// 2. Submit a review for a property (Guest reviews property)
export const createPropertyReview = async (propertyId, reviewData) => {
  const response = await api.post(`/reviews/property/${propertyId}`, reviewData);
  return response.data;
};

// 3. Submit a review for a guest (Host reviews guest)
export const createGuestReview = async (bookingId, reviewData) => {
  const response = await api.post(`/reviews/guest/${bookingId}`, reviewData);
  return response.data;
};

// 4. Update an existing review
export const updateReview = async (reviewId, reviewData) => {
  const response = await api.put(`/reviews/${reviewId}`, reviewData);
  return response.data;
};

// 5. Delete a review
export const deleteReview = async (reviewId) => {
  const response = await api.delete(`/reviews/${reviewId}`);
  return response.data;
};