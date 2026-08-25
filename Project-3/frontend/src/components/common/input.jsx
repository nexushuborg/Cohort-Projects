import React from "react";

function Input({
  label,
  name,
  type = "text",
  value = "",
  onChange,
  placeholder = "",
  error = "",
  disabled = false,
  required = false,
  className = "",
  ...props
}) {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={name}
          className="block mb-2 text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`
          w-full
          rounded-lg
          border
          px-4
          py-2.5
          text-sm
          text-gray-900
          bg-white
          outline-none
          transition
          duration-200
          placeholder:text-gray-400
          focus:ring-2
          disabled:bg-gray-100
          disabled:cursor-not-allowed
          ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-200"
              : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
          }
          ${className}
        `}
        {...props}
      />

      {error && (
        <p className="mt-1.5 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

export default Input;