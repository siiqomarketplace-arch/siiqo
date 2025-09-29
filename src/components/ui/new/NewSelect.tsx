"use client";

import React, { useState, useId } from "react";
import { ChevronDown, Check, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "./Button";
import Input from "./Input";

interface Option {
  label: string;
  value: string | number;
  description?: string;
  disabled?: boolean;
}

interface SelectProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "value"> {
  className?: string;
  options?: Option[];
  value?: string | number | (string | number)[];
  defaultValue?: string | number;
  placeholder?: string;
  multiple?: boolean;
  disabled?: boolean;
  required?: boolean;
  label?: string;
  description?: string;
  error?: string;
  searchable?: boolean;
  clearable?: boolean;
  loading?: boolean;
  id?: string;
  name?: string;
  onChange?: (value: any) => void;
  onOpenChange?: (open: boolean) => void;
}

const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      className,
      options = [],
      value,
      defaultValue,
      placeholder = "Select an option",
      multiple = false,
      disabled = false,
      required = false,
      label,
      description,
      error,
      searchable = false,
      clearable = false,
      loading = false,
      id,
      name,
      onChange,
      onOpenChange,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const reactId = useId();
    const selectId = id || reactId;

    const filteredOptions =
      searchable && searchTerm
        ? options.filter(
            (option) =>
              option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
              option.value
                .toString()
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
          )
        : options;

    const getSelectedDisplay = () => {
      if (!value) return placeholder;

      if (multiple && Array.isArray(value)) {
        const selected = options.filter((opt) => value.includes(opt.value));
        return selected.length === 1
          ? selected[0].label
          : `${selected.length} items selected`;
      }

      const selected = options.find((opt) => opt.value === value);
      return selected ? selected.label : placeholder;
    };

    const handleToggle = () => {
      if (!disabled) {
        const open = !isOpen;
        setIsOpen(open);
        onOpenChange?.(open);
        if (!open) setSearchTerm("");
      }
    };

    const handleOptionSelect = (option: Option) => {
      if (multiple && Array.isArray(value)) {
        const updated = value.includes(option.value)
          ? value.filter((v) => v !== option.value)
          : [...value, option.value];
        onChange?.(updated);
      } else {
        onChange?.(option.value);
        setIsOpen(false);
        onOpenChange?.(false);
      }
    };

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange?.(multiple ? [] : "");
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
    };

    const isSelected = (optionValue: Option["value"]) => {
      if (multiple && Array.isArray(value)) {
        return value.includes(optionValue);
      }
      return value === optionValue;
    };

    const hasValue = multiple
      ? (value as any[])?.length > 0
      : value !== undefined && value !== "";

    // Helper function to get the correct value for the hidden select element
    const getHiddenSelectValue = () => {
      if (multiple) {
        // Convert array to string array for HTML select multiple
        return Array.isArray(value) ? value.map((v) => v.toString()) : [];
      } else {
        // Convert single value to string for HTML select
        return value !== undefined ? value.toString() : "";
      }
    };

    return (
      <div className={cn("relative", className)}>
        {label && (
          <label
            htmlFor={selectId}
            className={cn(
              "text-sm font-medium mb-2 block",
              error ? "text-destructive" : "text-foreground"
            )}
          >
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          <button
            ref={ref}
            id={selectId}
            type="button"
            className={cn(
              "flex h-10 w-full items-center justify-between rounded-md border border-input bg-white text-black px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-destructive focus:ring-destructive",
              !hasValue && "text-muted-foreground"
            )}
            onClick={handleToggle}
            disabled={disabled}
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            {...props}
          >
            <span className="truncate">{getSelectedDisplay()}</span>
            <div className="flex items-center gap-1">
              {loading && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              )}
              {clearable && hasValue && !loading && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4"
                  onClick={handleClear}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  isOpen && "rotate-180"
                )}
              />
            </div>
          </button>

          <select
            name={name}
            value={getHiddenSelectValue()}
            onChange={() => {}}
            className="sr-only"
            tabIndex={-1}
            multiple={multiple}
            required={required}
          >
            <option value="">Select...</option>
            {options.map((option) => (
              <option key={option.value} value={option.value.toString()}>
                {option.label}
              </option>
            ))}
          </select>

          {isOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white text-black border border-border rounded-md shadow-md">
              {searchable && (
                <div className="p-2 border-b">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search options..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                      className="pl-8"
                    />
                  </div>
                </div>
              )}
              <div className="py-1 max-h-60 overflow-auto">
                {filteredOptions.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    {searchTerm ? "No options found" : "No options available"}
                  </div>
                ) : (
                  filteredOptions.map((option) => (
                    <div
                      key={option.value}
                      className={cn(
                        "relative flex cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                        isSelected(option.value) &&
                          "bg-primary text-primary-foreground",
                        option.disabled && "pointer-events-none opacity-50"
                      )}
                      onClick={() =>
                        !option.disabled && handleOptionSelect(option)
                      }
                    >
                      <span className="flex-1">{option.label}</span>
                      {multiple && isSelected(option.value) && (
                        <Check className="h-4 w-4" />
                      )}
                      {option.description && (
                        <span className="text-xs text-muted-foreground ml-2">
                          {option.description}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {description && !error && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
        {error && <p className="text-sm text-destructive mt-1">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;
