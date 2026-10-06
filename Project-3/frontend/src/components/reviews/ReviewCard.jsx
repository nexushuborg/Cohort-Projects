
function ReviewCard({ review, currentUserId, onDelete }) {
  const { id, rating, text, created_at, guest, guest_id } = review;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const renderStars = (num) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span key={index} className={index < num ? "text-amber-500" : "text-gray-200"}>
        ★
      </span>
    ));
  };

  return (
    <div className="border-b border-gray-100 py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={guest.avatar || "https://picsum.photos/100"}
            alt={guest.name}
            className="h-12 w-12 rounded-full object-cover"
          />
          <div>
            <h4 className="font-semibold text-gray-900">{guest.name}</h4>
            <p className="text-xs text-gray-400">{formatDate(created_at)}</p>
          </div>
        </div>

        {currentUserId === guest_id && onDelete && (
          <button
            onClick={() => onDelete(id)}
            className="text-xs font-semibold text-red-500 hover:text-red-600 cursor-pointer"
          >
            Delete
          </button>
        )}
      </div>

      <div className="mt-3 flex items-center gap-1 text-sm">
        {renderStars(rating)}
      </div>

      <p className="mt-3 text-sm leading-relaxed text-gray-600">{text}</p>
    </div>
  );
}

export default ReviewCard;