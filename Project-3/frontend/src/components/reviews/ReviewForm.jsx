import { useState } from "react";
import api from "../../api/axios";

function ReviewForm({ propertyId, bookingId, onReviewSubmit }) {
  const [formData, setFormData] = useState({
    rating: 5,
    cleanliness_rating: 5,
    accuracy_rating: 5,
    communication_rating: 5,
    location_rating: 5,
    value_rating: 5,
    text: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRatingClick = (category, ratingValue) => {
    setFormData((prev) => ({
      ...prev,
      [category]: ratingValue,
    }));
  };

  const handleTextChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      text: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      booking_id: bookingId,
      ...formData,
    };

    api.post(`/reviews/property/${propertyId}`, payload)
      .then((response) => {
        if (onReviewSubmit) {
          onReviewSubmit(response.data.data || response.data);
        }
      })
      .catch((err) => {
        console.error(err);
        setError(err.response?.data?.message || "Failed to submit review.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const renderStarSelector = (category, currentVal) => {
    return (
      <div className="flex gap-1">
        {Array.from({ length: 5 }, (_, i) => {
          const starVal = i + 1;
          return (
            <button
              key={starVal}
              type="button"
              onClick={() => handleRatingClick(category, starVal)}
              className={`text-xl cursor-pointer ${
                starVal <= currentVal ? "text-amber-500" : "text-gray-200"
              }`}
            >
              ★
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-gray-200">
      <h3 className="text-lg font-bold text-gray-900">How was your stay?</h3>
      <p className="text-xs text-gray-500 mt-1">Submit your rating and review for this property.</p>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100">
          {error}
        </div>
      )}

      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700">Overall Rating</span>
          {renderStarSelector("rating", formData.rating)}
        </div>

        <hr className="border-gray-100" />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Cleanliness</span>
            {renderStarSelector("cleanliness_rating", formData.cleanliness_rating)}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Accuracy</span>
            {renderStarSelector("accuracy_rating", formData.accuracy_rating)}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Communication</span>
            {renderStarSelector("communication_rating", formData.communication_rating)}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Location</span>
            {renderStarSelector("location_rating", formData.location_rating)}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Value</span>
            {renderStarSelector("value_rating", formData.value_rating)}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Write about your experience</label>
        <textarea
          rows="4"
          required
          value={formData.text}
          onChange={handleTextChange}
          placeholder="What did you love? How was the host? Any tips for future guests?"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-100 text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full rounded-lg bg-rose-500 py-3 font-semibold text-white transition hover:bg-rose-600 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
      >
        {loading ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}

export default ReviewForm;