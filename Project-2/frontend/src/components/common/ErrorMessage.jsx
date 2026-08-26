export default function ErrorMessage({ message = 'Something went wrong', onRetry }) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <p className="text-red-600 mb-3">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
