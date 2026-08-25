import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import ReviewCard from "./ReviewCard";

function ReviewList({ propertyId }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [scores, setScores] = useState({
    cleanliness: 0,
    accuracy: 0,
    communication: 0,
    location: 0,
    value: 0,
  });

   // Move the fetchReviews definition inside useEffect
  useEffect(() => {
    const fetchReviews = () => {
      setLoading(true);
      setError("");

      api.get(`/reviews/property/${propertyId}`)
        .then((response) => {
          const items = response.data?.data || [];
          setReviews(items);

          if (items.length > 0) {
            let clean = 0, acc = 0, comm = 0, loc = 0, val = 0;
            items.forEach((r) => {
              clean += r.cleanliness_rating || 5;
              acc += r.accuracy_rating || 5;
              comm += r.communication_rating || 5;
              loc += r.location_rating || 5;
              val += r.value_rating || 5;
            });

            setScores({
              cleanliness: (clean / items.length).toFixed(1),
              accuracy: (acc / items.length).toFixed(1),
              communication: (comm / items.length).toFixed(1),
              location: (loc / items.length).toFixed(1),
              value: (val / items.length).toFixed(1),
            });
          }
        })
        .catch((err) => {
          console.error(err);
          setError("Failed to load reviews.");
        })
        .finally(() => {
          setLoading(false);
        });
    };

    fetchReviews();
  }, [propertyId]);

  const handleDelete = (reviewId) => {
    if (window.confirm("Are you sure you want to delete your review?")) {
      api.delete(`/reviews/${reviewId}`)
        .then(() => {
          setReviews((prev) => prev.filter((r) => r.id !== reviewId));
        })
        .catch((err) => {
          console.error(err);
          alert("Failed to delete review.");
        });
    }
  };

  if (loading) return <div className="text-gray-500 text-sm">Loading reviews...</div>;
  if (error) return <div className="text-red-500 text-sm">{error}</div>;

  return (
    <div className="mt-8 border-t border-gray-200 pt-8">
      <h3 className="text-xl font-bold text-gray-900">
        ★ {reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : "New"}{" "}
        · {reviews.length} reviews
      </h3>

      {reviews.length > 0 && (
        <div className="mt-6 grid gap-x-12 gap-y-4 sm:grid-cols-2">
          {Object.entries(scores).map(([key, val]) => (
            <div key={key} className="flex items-center justify-between py-1">
              <span className="text-sm text-gray-600 capitalize">{key}</span>
              <div className="flex items-center gap-3 w-1/2">
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gray-950 rounded-full"
                    style={{ width: `${(val / 5) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-gray-900">{val}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 space-y-6">
        {reviews.length === 0 ? (
          <p className="text-sm text-gray-400">No reviews yet for this property.</p>
        ) : (
          reviews.map((r) => (
            <ReviewCard
              key={r.id}
              review={r}
              currentUserId={user?.id}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default ReviewList;