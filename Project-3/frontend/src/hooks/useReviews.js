import { useState } from "react";
import api from "../api/axios";

export default function useReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 1. Fetch all reviews for a property (GET)
  const fetchReviews = (propertyId) => {
    setLoading(true);
    setError("");
    api.get(`/reviews/property/${propertyId}`)
      .then((response) => {
        setReviews(response.data.data || []);
      })
      .catch((err) => {
        console.error(err);
        setError(err.response?.data?.message || "Failed to load reviews.");
        setReviews([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // 2. Submit property review (POST)
  const addPropertyReview = (propertyId, reviewData, onSuccess, onError) => {
    setLoading(true);
    setError("");
    api.post(`/reviews/property/${propertyId}`, reviewData)
      .then((response) => {
        setReviews((prev) => [response.data.data, ...prev]);
        if (onSuccess) onSuccess(response.data);
      })
      .catch((err) => {
        console.error(err);
        setError(err.response?.data?.message || "Failed to submit review.");
        if (onError) onError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // 3. Submit guest review (POST)
  const addGuestReview = (bookingId, reviewData, onSuccess, onError) => {
    setLoading(true);
    setError("");
    api.post(`/reviews/guest/${bookingId}`, reviewData)
      .then((response) => {
        if (onSuccess) onSuccess(response.data);
      })
      .catch((err) => {
        console.error(err);
        setError(err.response?.data?.message || "Failed to submit guest review.");
        if (onError) onError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // 4. Delete a review (DELETE)
  const removeReview = (reviewId) => {
    setLoading(true);
    setError("");
      api.delete(`/reviews/${reviewId}`)
      .then(() => { 
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      })
      .catch((err) => {
        console.error(err);
        setError(err.response?.data?.message || "Failed to delete review.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return {
    reviews,
    loading,
    error,
    fetchReviews,
    addPropertyReview,
    addGuestReview,
    removeReview,
  };
}