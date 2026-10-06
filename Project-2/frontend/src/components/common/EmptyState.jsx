export default function EmptyState({ message = 'No items found', action, onAction }) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <p className="text-gray-500 mb-3">{message}</p>
        {action && onAction && (
          <button
            onClick={onAction}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            {action}
          </button>
        )}
      </div>
    </div>
  );
}
