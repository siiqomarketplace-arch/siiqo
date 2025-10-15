"use client";

import React, { useState } from "react";
import { ChevronDown, Check } from "lucide-react";

interface DropdownProps {
  label: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
  error?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  label,
  options,
  selected,
  onSelect,
  error,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative w-full space-y-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex justify-between items-center border rounded-md px-4 py-2 bg-white text-gray-700 hover:border-blue-400 transition focus:ring-1 focus:ring-blue-500 ${
          error ? "border-red-500" : "border-gray-300"
        }`}
      >
        <span>{selected || `Select ${label.toLowerCase()}`}</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-auto">
          {options.map(option => (
            <li
              key={option}
              onClick={() => {
                onSelect(option);
                setOpen(false);
              }}
              className={`px-4 py-2 flex justify-between items-center cursor-pointer hover:bg-blue-50 ${
                selected === option ? "text-blue-600 font-semibold" : ""
              }`}
            >
              {option}
              {selected === option && (
                <Check className="h-4 w-4 text-blue-500" />
              )}
            </li>
          ))}
        </ul>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default Dropdown;
