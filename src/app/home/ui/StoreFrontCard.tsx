import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import Skeleton from "../../../components/skeleton";
import { Storefront } from "@/types/storeFront";

export const StorefrontCard = ({ storefront }: { storefront: Storefront }) => {
  const router = useRouter();

  useEffect(() => {
    sessionStorage.setItem(
      "selectedVendorEmail",
      storefront.vendor?.email || ""
    );
    sessionStorage.setItem(
      "selectedBusinessName",
      storefront.business_name || ""
    );

    if (!storefront.business_name) {
      console.error("Missing vendor email or business name");
    }
  }, [storefront]);

  const formatEstablishedDate = (dateString: string | undefined): string => {
    if (!dateString) {
      return "Established 1 year ago";
    }
    try {
      const date = new Date(dateString);
      const now = new Date();
      let years = now.getFullYear() - date.getFullYear();
      
      // If the calculation results in NaN or a negative number, default to 1
      if (isNaN(years) || years < 0) {
        years = 1;
      }
      
      // If years is 0, show "Established this year"
      if (years === 0) {
        return "Established this year";
      }

      return `Established ${years} year${years > 1 ? 's' : ''} ago`;
    } catch {
      return "Established 1 year ago";
    }
  };

  const getFallbackImage = (businessName: string): string => {
    const colors = ["blue", "green", "purple", "orange", "red", "teal"];
    const colorIndex = businessName.length % colors.length;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      businessName
    )}&background=${colors[colorIndex]}&color=fff&size=300`;
  };

  const handleClick = () => {
    if (storefront.business_name && storefront.vendor?.email) {
      const slugify = (text: string) =>
        text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "");

      const businessSlug = slugify(storefront.business_name);

      // Save vendor email temporarily in sessionStorage
      sessionStorage.setItem("selectedVendorEmail", storefront.vendor.email);
      sessionStorage.setItem(
        "selectedBusinessName",
        storefront.business_name
      );

      // Navigate without exposing email in URL
      router.push(`/storefront/${encodeURIComponent(businessSlug)}`);
    } else {
      console.warn("Business name or vendor email missing");
    }
  };

  return (
    <div
      onClick={handleClick}
      className="overflow-hidden transition-all duration-200 bg-white rounded-lg cursor-pointer hover:-translate-y-1 hover:shadow-md"
    >
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200">
        <img
          src={
            storefront.business_banner ||
            getFallbackImage(storefront.business_name)
          }
          alt={storefront.business_name}
          className="object-cover w-full h-full"
          onError={e => {
            (e.target as HTMLImageElement).src = getFallbackImage(
              storefront.business_name
            );
          }}
        />
        {storefront.vendor && (
          <div className="absolute flex items-center px-2 py-1 space-x-1 text-xs text-white bg-green-500 rounded-full top-2 right-2">
            <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
            <span>Verified</span>
          </div>
        )}
        {storefront.ratings > 0 && (
          <div className="absolute flex items-center px-2 py-1 space-x-1 text-xs text-gray-800 rounded-full top-2 left-2 bg-white/90 backdrop-blur-sm">
            <Star className="w-3 h-3 text-orange-400 fill-current" />
            <span>{storefront.ratings.toFixed(1)}</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="mb-2 text-lg font-bold text-gray-900">
          {storefront.business_name}
        </h3>
        <p className="text-gray-600 mb-3 min-h-[2rem] text-sm">
          {storefront.description || "No description available"}
        </p>
        <div className="flex items-center justify-between text-sm">
          <div className="text-gray-500">
            {formatEstablishedDate(storefront.vendor_info?.member_since)}
          </div>
          {storefront.vendor && (
            <div className="flex items-center space-x-1 font-medium text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Active</span>
            </div>
          )}
        </div>
        {storefront.vendor && (
          <div className="pt-3 mt-3 border-t border-gray-100">
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-orange-500 rounded-full">
                {storefront.vendor.firstname.charAt(0)}
              </div>
              <span className="text-sm text-gray-700">
                {storefront.vendor.firstname} {storefront.vendor.lastname}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Storefront Skeleton
interface StorefrontSkeletonProps {
  count?: number;
}

export const StorefrontSkeleton: React.FC<StorefrontSkeletonProps> = ({
  count = 6,
}) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden bg-white border border-gray-200 rounded-lg"
        >
          <Skeleton width="100%" height="192px" className="rounded-t-lg" />
          <div className="p-4">
            <Skeleton width="70%" height="24px" className="mb-2" />
            <Skeleton count={2} width="100%" height="16px" className="mb-1" />
            <div className="flex items-center justify-between mt-3">
              <Skeleton width="120px" height="14px" />
              <Skeleton width="60px" height="14px" />
            </div>
            <div className="pt-3 mt-3 border-t border-gray-100">
              <div className="flex items-center space-x-2">
                <Skeleton type="circle" width="24px" height="24px" />
                <Skeleton width="100px" height="14px" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default StorefrontSkeleton;
