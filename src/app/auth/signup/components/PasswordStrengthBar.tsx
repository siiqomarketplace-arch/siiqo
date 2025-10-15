import React from "react";

const PasswordStrengthBar = ({
  strength,
  password,
}: {
  strength: number;
  password: string;
}) => {
  let color = "red";
  let strengthText = "Poor";

  if (strength >= 2) {
    color = "yellow";
    strengthText = "Weak";
  }
  if (strength >= 4) {
    color = "green";
    strengthText = "Strong";
  }

  return (
    <div>
      {password && (
        <>
          <div
            className={`text-xs mb-1 ${
              strengthText === "Poor"
                ? "text-red-600"
                : strengthText === "Weak"
                ? "text-yellow-500"
                : "text-green-600"
            }`}
          >
            {strengthText}
          </div>
          <div className="w-full h-1 bg-gray-200 rounded-full">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(strength * 25, 100)}%`,
                backgroundColor: color,
              }}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default PasswordStrengthBar;
