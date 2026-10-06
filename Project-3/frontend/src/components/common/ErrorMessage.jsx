import React from "react";

function ErrorMessage({
  message,
  title = "Something went wrong",
  onRetry,
  className = "",
}) {
  if (!message) {
    return null;
  }

  return (
    <div
      className={`
        w-full
        rounded-lg
        border
        border-red-200
        bg-red-50
        px-4
        py-3
        ${className}
      `}
      role="alert"
    >
      <div className="flex items-start gap-3">
        {/* Error Icon */}
        <div className="flex-shrink-0">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-600">
            !
          </span>
        </div>

        {/* Error Content */}
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-red-800">
            {title}
          </h3>

          <p className="mt-1 text-sm text-red-700">
            {message}
          </p>

          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-2 text-sm font-medium text-red-700 underline hover:text-red-900"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ErrorMessage;