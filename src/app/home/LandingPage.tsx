import React, { useState, useEffect } from "react";
import {
  Search,
  MapPin,
  ShoppingBag,
  Users,
  Package,
  Star,
  Filter,
  ChevronDown,
  AlertCircle,
  Loader,
} from "lucide-react";

interface Vendor {
  business_name: string;
  email: string;
  firstname: string;
  id: number;
  lastname: string;
  phone: string;
  profile_pic: string | null;
}

interface Storefront {
  id: number;
  business_name: string;
  description: string;
  established_at: string;
  business_banner: string | null;
  ratings: number;
  vendor: Vendor | null;
}

interface APIResponse {
  count: number;
  storefronts: Storefront[];
}

const LandingPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [distance, setDistance] = useState<string>("2 km");
  const [openOnly, setOpenOnly] = useState<boolean>(false);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [storefronts, setStorefronts] = useState<Storefront[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Fetch storefronts from API
  useEffect(() => {
    const fetchStorefronts = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          "https://server.bizengo.com/api/admin/storefronts",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch storefronts: ${response.status}`);
        }

        const data: APIResponse = await response.json();
        setStorefronts(data.storefronts);
      } catch (err: any) {
        setError(err.message || "Failed to load storefronts");
        console.error("Error fetching storefronts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStorefronts();
  }, []);

  // Helper function to format establishment date
  const formatEstablishedDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 1) return "Established today";
      if (diffDays <= 7) return `Established ${diffDays} days ago`;
      if (diffDays <= 30)
        return `Established ${Math.ceil(diffDays / 7)} weeks ago`;
      if (diffDays <= 365)
        return `Established ${Math.ceil(diffDays / 30)} months ago`;
      return `Established ${Math.ceil(diffDays / 365)} years ago`;
    } catch {
      return "Recently established";
    }
  };

  // Generate fallback image based on business name
  const getFallbackImage = (businessName: string): string => {
    const colors = ["blue", "green", "purple", "orange", "red", "teal"];
    const colorIndex = businessName.length % colors.length;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      businessName
    )}&background=${colors[colorIndex]}&color=fff&size=300`;
  };

  // Filter storefronts based on search and filters
  const filteredStorefronts = storefronts.filter((store) => {
    // Search filter
    if (
      searchTerm &&
      !store.business_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !store.description?.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }

    // Category filter (you might want to add a category field to your API)
    // For now, we'll skip category filtering since it's not in the API response

    // Verified only filter (stores with vendor info are considered "verified")
    if (verifiedOnly && !store.vendor) return false;

    return true;
  });

  return (
    <>
      {/* Storefronts Section */}
      <section className="min-h-screen py-12 bg-gray-50">
        <div className="px-4 mx-auto max-w-7xl">
          <div className="mb-8">
            <h2 className="mb-2 text-3xl font-bold text-gray-900">
              Explore Nearby Storefronts
            </h2>
            <p className="text-gray-600">
              Find the best local services and products from verified sellers.
              {!loading && ` (${filteredStorefronts.length} storefronts found)`}
            </p>
          </div>

          {/* Search and Filters */}
          <div className="p-6 mb-8 bg-white rounded-lg shadow-sm">
            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                <input
                  type="text"
                  placeholder="Search storefronts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center space-x-2">
                <label className="font-medium text-gray-700">Distance</label>
                <select
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="1 km">1 km</option>
                  <option value="2 km">2 km</option>
                  <option value="5 km">5 km</option>
                  <option value="10 km">10 km</option>
                </select>
              </div>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700">Verified Only</span>
              </label>

              <button
                onClick={() => {
                  setSearchTerm("");
                  setVerifiedOnly(false);
                  setDistance("2 km");
                }}
                className="text-sm font-medium text-orange-500 hover:text-orange-600"
              >
                Clear All Filters
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <Loader className="w-8 h-8 mx-auto mb-4 text-orange-500 animate-spin" />
                <p className="text-gray-600">Loading storefronts...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-6 mb-8 border border-red-200 rounded-lg bg-red-50">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <h3 className="font-medium text-red-800">
                  Failed to load storefronts
                </h3>
              </div>
              <p className="mt-2 text-red-700">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 mt-4 text-white transition-colors bg-red-500 rounded hover:bg-red-600"
              >
                Try Again
              </button>
            </div>
          )}

          {/* No Results */}
          {!loading && !error && filteredStorefronts.length === 0 && (
            <div className="py-16 text-center">
              <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="mb-2 text-xl font-medium text-gray-900">
                No storefronts found
              </h3>
              <p className="text-gray-600">
                {searchTerm || verifiedOnly
                  ? "Try adjusting your search or filters."
                  : "Be the first to create a storefront in your area!"}
              </p>
            </div>
          )}

          {/* Storefront Grid */}
          {!loading && !error && filteredStorefronts.length > 0 && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
              {filteredStorefronts.map((store) => (
                <div
                  key={store.id}
                  className="overflow-hidden transition-shadow bg-white rounded-lg shadow-md hover:shadow-lg"
                >
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200">
                    <img
                      src={
                        store.business_banner ||
                        getFallbackImage(store.business_name)
                      }
                      alt={store.business_name}
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = getFallbackImage(
                          store.business_name
                        );
                      }}
                    />
                    {store.vendor && (
                      <div className="absolute flex items-center px-2 py-1 space-x-1 text-xs text-white bg-green-500 rounded-full top-2 right-2">
                        <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                        <span>Verified</span>
                      </div>
                    )}
                    {store.ratings > 0 && (
                      <div className="absolute flex items-center px-2 py-1 space-x-1 text-xs text-gray-800 rounded-full top-2 left-2 bg-white/90 backdrop-blur-sm">
                        <Star className="w-3 h-3 text-orange-400 fill-current" />
                        <span>{store.ratings.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="mb-2 text-xl font-bold text-gray-900">
                      {store.business_name}
                    </h3>
                    <p className="text-gray-600 mb-3 min-h-[2.5rem]">
                      {store.description || "No description available"}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <div className="text-gray-500">
                        {formatEstablishedDate(store.established_at)}
                      </div>
                      {store.vendor && (
                        <div className="flex items-center space-x-1 font-medium text-green-600">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Active</span>
                        </div>
                      )}
                    </div>
                    {store.vendor && (
                      <div className="pt-3 mt-3 border-t border-gray-100">
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-orange-500 rounded-full">
                            {store.vendor.firstname.charAt(0)}
                          </div>
                          <span className="text-sm text-gray-700">
                            {store.vendor.firstname} {store.vendor.lastname}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default LandingPage;
