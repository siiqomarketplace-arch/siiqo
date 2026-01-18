"use client";

import React, { useState, useRef, useEffect } from "react";
import { MapPin, Loader2, X } from "lucide-react";

const MAPBOX_TOKEN =
  process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
  "pk.eyJ1Ijoic2lpcW82MiIsImEiOiJjbWtlZWo0OGcwNmYwM2VzMDkxM215d3FuIn0.oBw8lmL9hv-N6lCyC5wHSw";

interface LocationSuggestion {
  id: string;
  place_name: string;
  center: [number, number]; // [longitude, latitude]
  context?: any[];
  text: string;
}

interface MapboxAutocompleteProps {
  value: string;
  onChange: (
    value: string,
    coordinates?: { lat: number; lng: number },
    details?: any
  ) => void;
  placeholder?: string;
  onDetectLocation?: () => void;
  isDetecting?: boolean;
  disabled?: boolean;
  className?: string;
  showDetectButton?: boolean;
}

const MapboxAutocomplete: React.FC<MapboxAutocompleteProps> = ({
  value,
  onChange,
  placeholder = "Enter location...",
  onDetectLocation,
  isDetecting = false,
  disabled = false,
  className = "",
  showDetectButton = true,
}) => {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuggestions = async (query: string) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?access_token=${MAPBOX_TOKEN}&autocomplete=true&types=address,place,neighborhood,locality,postcode&limit=5`
      );
      const data = await response.json();

      if (data.features) {
        setSuggestions(data.features);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error("Error fetching location suggestions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Debounce the API call
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(newValue);
    }, 300);
  };

  const handleSuggestionClick = (suggestion: LocationSuggestion) => {
    const [lng, lat] = suggestion.center;

    // Extract location details
    const context = suggestion.context || [];
    const neighborhood = context.find((c: any) =>
      c.id.startsWith("neighborhood")
    )?.text;
    const city = context.find((c: any) => c.id.startsWith("place"))?.text;
    const state = context.find((c: any) => c.id.startsWith("region"))?.text;
    const country = context.find((c: any) => c.id.startsWith("country"))?.text;
    const zipcode = context.find((c: any) => c.id.startsWith("postcode"))?.text;

    const details = {
      address: suggestion.place_name,
      neighborhood,
      city,
      state,
      country,
      zipcode,
    };

    onChange(suggestion.place_name, { lat, lng }, details);
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleClear = () => {
    onChange("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative flex  flex-col md:flex-row gap-2">
        <div className="relative  md:flex-1">
          <MapPin
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() =>
              value && suggestions.length > 0 && setShowSuggestions(true)
            }
            placeholder={placeholder}
            disabled={disabled || isDetecting}
            className={`w-full  pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed text-sm focus:outline-none ${className}`}
          />
          {isLoading && (
            <Loader2
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin"
              size={18}
            />
          )}
          {!isLoading && (
            <button
              onClick={handleClear}
              style={{ visibility: value ? "visible" : "hidden" }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {onDetectLocation && (
          <button
            type="button"
            onClick={onDetectLocation}
            disabled={isDetecting}
            style={{ display: showDetectButton ? "flex" : "none" }}
            className="px-4 py-3 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:opacity-50 text-sm flex items-center gap-2 whitespace-nowrap"
          >
            {isDetecting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <MapPin className="w-4 h-4" />
            )}
            {isDetecting ? "Detecting..." : "Use Current"}
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.id}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                index === selectedIndex ? "bg-blue-50" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <MapPin
                  className="text-gray-400 mt-0.5 flex-shrink-0"
                  size={16}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {suggestion.text}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {suggestion.place_name}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {showSuggestions &&
        !isLoading &&
        value.length >= 3 &&
        suggestions.length === 0 && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center">
            <p className="text-sm text-gray-500">No locations found</p>
          </div>
        )}
    </div>
  );
};

export default MapboxAutocomplete;
