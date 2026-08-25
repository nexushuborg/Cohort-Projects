import React from "react";

function Loader({
  size = "medium",
  text = "",
  fullScreen = false,
}) {
  const sizes = {
    small: "h-4 w-4 border-2",
    medium: "h-8 w-8 border-4",
    large: "h-12 w-12 border-4",
  };

  const loader = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`
          ${sizes[size] || sizes.medium}
          animate-spin
          rounded-full
          border-gray-200
          border-t-blue-600
        `}
        role="status"
        aria-label="Loading"
      />

      {text && (
        <p className="text-sm text-gray-600">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80">
        {loader}
      </div>
    );
  }

  return loader;
}

export default Loader;