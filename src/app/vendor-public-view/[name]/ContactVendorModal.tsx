"use client";

import React from "react";
import Icon from "@/components/ui/AppIcon";

interface ContactVendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendorName: string;
  phone: string | null;
  socialLinks: Record<string, string>;
  workingHours: Record<string, { start?: string; end?: string }>;
  countryCode?: string;
}

const ContactVendorModal: React.FC<ContactVendorModalProps> = ({
  isOpen,
  onClose,
  vendorName,
  phone,
  socialLinks,
  workingHours,
  countryCode = "234", // Default to Nigeria (+234)
}) => {
  if (!isOpen) return null;

  // Map social links to display-friendly names and icons
  const getSocialIcon = (platform: string): React.ReactNode => {
    const platform_lower = platform.toLowerCase();
    switch (platform_lower) {
      case "facebook":
        return <Icon name="Facebook" size={20} />;
      case "twitter":
        return <Icon name="Twitter" size={20} />;
      case "instagram":
        return <Icon name="Instagram" size={20} />;
      case "linkedin":
        return <Icon name="Linkedin" size={20} />;
      case "whatsapp":
        return <Icon name="MessageCircle" size={20} />;
      case "tiktok":
        return <Icon name="Music" size={20} />;
      case "youtube":
        return <Icon name="Youtube" size={20} />;
      default:
        return <Icon name="Link" size={20} />;
    }
  };

  // Map social links to display-friendly names
  const hasSocialLinks = Object.keys(socialLinks).length > 0;
  const hasPhone = phone && phone.trim() !== "";
  const hasWorkingHours = Object.keys(workingHours).length > 0;

  // Debug logging
  console.log("ContactVendorModal - phone:", phone, "hasPhone:", hasPhone);
  console.log(
    "ContactVendorModal - socialLinks:",
    socialLinks,
    "hasSocialLinks:",
    hasSocialLinks
  );
  console.log(
    "ContactVendorModal - workingHours:",
    workingHours,
    "hasWorkingHours:",
    hasWorkingHours
  );

  // Get current day's working hours
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const today = daysOfWeek[new Date().getDay()];
  const todayHours = workingHours[today];

  const handleSocialClick = (url: string, platform: string) => {
    if (!url) return;

    const platform_lower = platform.toLowerCase();

    // Special handling for WhatsApp - add country code if needed
    if (platform_lower === "whatsapp") {
      let phoneNumber = url;
      // Remove any leading zeros or special characters
      phoneNumber = phoneNumber.replace(/^0+/, "").replace(/\D/g, "");

      // If phone number doesn't start with country code, prepend it
      if (!phoneNumber.startsWith(countryCode)) {
        phoneNumber = `${countryCode}${phoneNumber}`;
      }

      const whatsappUrl = `https://wa.me/${phoneNumber}`;
      window.open(whatsappUrl, "_blank");
      return;
    }

    // For other platforms, normalize the URL
    let fullUrl = url;

    // If URL doesn't start with http/https, add it
    if (!fullUrl.startsWith("http://") && !fullUrl.startsWith("https://")) {
      fullUrl = `https://${fullUrl}`;
    }

    window.open(fullUrl, "_blank");
  };

  const handlePhoneClick = () => {
    if (phone) {
      window.location.href = `tel:${phone}`;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 h- overflow-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-bold">Contact {vendorName}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            aria-label="Close modal"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Working Hours */}
          {/* {hasWorkingHours && (
						<div>
							<h3 className="text-sm font-bold uppercase tracking-widest mb-3 opacity-70">
								Working Hours
							</h3>
							<div className="space-y-2">
								{Object.entries(workingHours).map(([day, hours]) => (
									<div key={day} className="flex justify-between text-sm">
										<span className="font-medium">{day}</span>
										<span className="text-text-secondary">
											{hours.start && hours.end
												? `${hours.start} - ${hours.end}`
												: hours.start
													? `From ${hours.start}`
													: "Closed"}
										</span>
									</div>
								))}
								{todayHours && (
									<div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
										<p className="text-xs text-blue-600 font-medium">
											Today ({today}): {todayHours.start && todayHours.end ? `${todayHours.start} - ${todayHours.end}` : todayHours.start ? `From ${todayHours.start}` : "Closed"}
										</p>
									</div>
								)}
							</div>
						</div>
					)} */}

          {/* Contact by Phone */}
          {hasPhone && (
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest mb-3 opacity-70">
                Contact by Phone
              </h3>
              <button
                onClick={handlePhoneClick}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-green-500 hover:bg-green-600 text-white rounded-lg transition font-medium"
              >
                <Icon name="Phone" size={18} />
                Call {phone}
              </button>
            </div>
          )}

          {/* Contact by Social Media */}
          {hasSocialLinks && (
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest mb-3 opacity-70">
                Contact by Socials
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(socialLinks).map(([platform, url]) => (
                  <button
                    key={platform}
                    onClick={() => handleSocialClick(url, platform)}
                    className="flex flex-col items-center gap-2 py-3 px-2 border rounded-lg hover:bg-gray-50 transition"
                    title={`Open ${platform}`}
                  >
                    {getSocialIcon(platform)}
                    <span className="text-xs font-medium capitalize">
                      {platform}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {!hasSocialLinks && !hasPhone && !hasWorkingHours && (
            <div className="text-center py-6">
              <p className="text-sm text-text-secondary">
                No contact information available yet.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t">
          <button
            onClick={onClose}
            className="w-full py-2 px-4 border rounded-lg hover:bg-gray-50 transition font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactVendorModal;
