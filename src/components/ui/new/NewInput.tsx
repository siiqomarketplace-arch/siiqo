import React, { InputHTMLAttributes, forwardRef } from 'react';

interface InputAltProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputAltProps>(({ label, error, ...props }, ref) => {
  return (
    <div className="mb-2">
      {label && (
        <label className="block text-sm font-medium text-text-secondary mb-1">
          {label}
        </label>
      )}
      <input
        ref={ref}
        {...props}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${error ? 'border-error' : 'border-border'} ${props.className ?? ''}`}
      />
      {error && (
        <p className="text-error text-xs mt-1">{error}</p>
      )}
    </div>
  );
});

export default Input;