"use client";

import React from "react";
import { HiExclamationCircle } from "react-icons/hi2";

type InputFieldProps = {
  label?: string;
  type?: string;
  placeholder?: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, type = "text", placeholder, error, ...props }, ref) => {
    return (
      <div className="mb-4">
        {label && (
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          {...props}
          className={`w-full px-4 py-2 border-[1.5px] border-gray-300 rounded-md placeholder:text-gray-400 placeholder:text-sm transition-all duration-200 focus:outline-none focus:border-blue-500 ${
            error ? "border-red-500" : ""
          }`}
        />
        {error && (
          <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
            <HiExclamationCircle className="w-4 h-4" />
            {error}
          </p>
        )}
      </div>
    );
  }
);

InputField.displayName = "InputField";

export default InputField;
