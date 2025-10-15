import React, { useState } from "react";

interface BusinessHours {
  day: string;
  hours: string;
  isToday: boolean;
}

interface Business {
  name: string;
  description: string;
  story?: string;
  hours: BusinessHours[];
}

interface AboutSectionProps {
  business: Business;
}

const AboutSection: React.FC<AboutSectionProps> = ({ business }) => {
  return (
    <div className="space-y-8">
      {/* Business Description */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-text-primary">
          About {business.name}
        </h2>
        <div className="prose-sm prose max-w-none">
          <p className="mb-4 leading-relaxed text-text-secondary">
            {business.description}
          </p>
          {business.story && (
            <div>
              <h3 className="mb-2 text-lg font-medium text-text-primary">
                Our Story
              </h3>
              <p className="leading-relaxed text-text-secondary">
                {business.story}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Business Details */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Business Hours */}
        <div>
          <h3 className="mb-4 text-lg font-medium text-text-primary">
            Business Hours
          </h3>
          <div className="space-y-2">
            {business.hours.map((day, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b border-border last:border-b-0"
              >
                <span className="font-medium text-text-primary">{day.day}</span>
                <span
                  className={`text-sm ${
                    day.isToday
                      ? "text-primary font-medium"
                      : "text-text-secondary"
                  }`}
                >
                  {day.hours}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutSection;
