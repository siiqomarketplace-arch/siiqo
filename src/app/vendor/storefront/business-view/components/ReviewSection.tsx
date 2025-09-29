import React, { useState, ChangeEvent } from "react";
import Icon, { type LucideIconName } from "@/components/AppIcon";
import Image from "@/components/ui/alt/AppImageAlt";
import Button from "@/components/ui/new/Button";

// --- START OF TYPESCRIPT CONVERSION ---

interface User {
  name: string;
  avatar: string;
}

interface BusinessReply {
  date: string; // ISO date string
  message: string;
}

// interface Review {
// 	id: number | string;
// 	user: User;
// 	rating: number;
// 	date: string; // ISO date string
// 	comment: string;
// 	images?: string[];
// 	helpfulCount: number;
// 	businessReply?: BusinessReply;
// }
interface Review {
  id: number;
  user: {
    name: string;
    avatar: string;
  };
  rating: number;
  date: string;
  comment: string;
  images?: string[]; // ✅ make optional
  helpfulCount: number;
  businessReply?: {
    // ✅ make optional instead of forcing null
    date: string;
    message: string;
  };
}

interface BusinessRating {
  average: number;
  total?: number; // ✅ optional so you can still add later
}

interface ReviewsSectionProps {
  reviews: Review[];
  businessRating: BusinessRating;
  onWriteReview: () => void;
}

type SortByType = "newest" | "oldest" | "highest" | "lowest";
type FilterRatingType = "all" | "5" | "4" | "3" | "2" | "1";

// --- END OF TYPESCRIPT CONVERSION ---

const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  reviews,
  businessRating,
  onWriteReview,
}) => {
  const [sortBy, setSortBy] = useState<SortByType>("newest");
  const [filterRating, setFilterRating] = useState<FilterRatingType>("all");

  const sortOptions: { value: SortByType; label: string }[] = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "highest", label: "Highest Rating" },
    { value: "lowest", label: "Lowest Rating" },
  ];

  const ratingFilters: { value: FilterRatingType; label: string }[] = [
    { value: "all", label: "All Ratings" },
    { value: "5", label: "5 Stars" },
    { value: "4", label: "4 Stars" },
    { value: "3", label: "3 Stars" },
    { value: "2", label: "2 Stars" },
    { value: "1", label: "1 Star" },
  ];

  const handleHelpfulClick = (reviewId: number | string): void => {
    console.log("Mark review as helpful:", reviewId);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getRatingDistribution = (): Record<number, number> => {
    const distribution: Record<number, number> = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };
    reviews.forEach((review) => {
      distribution[review.rating]++;
    });
    return distribution;
  };

  const ratingDistribution = getRatingDistribution();
  const totalReviews = reviews.length;

  return (
    <div className="space-y-6">
      {/* Rating Overview */}
      <div className="bg-surface rounded-lg p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Overall Rating */}
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start space-x-2 mb-2">
              <span className="text-4xl font-bold text-text-primary">
                {businessRating.average}
              </span>
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Icon
                    key={i}
                    name={"Star" as LucideIconName}
                    size={20}
                    className={`${
                      i < Math.floor(businessRating.average)
                        ? "text-warning fill-current"
                        : "text-border"
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-text-secondary">
              Based on {totalReviews} reviews
            </p>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center space-x-3">
                <span className="text-sm font-medium text-text-primary w-8">
                  {rating}★
                </span>
                <div className="flex-1 bg-border rounded-full h-2">
                  <div
                    className="bg-warning h-2 rounded-full transition-all duration-300"
                    style={{
                      width:
                        totalReviews > 0
                          ? `${
                              (ratingDistribution[rating] / totalReviews) * 100
                            }%`
                          : "0%",
                    }}
                  />
                </div>
                <span className="text-sm text-text-secondary w-8">
                  {ratingDistribution[rating]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Write Review Button */}
        <div className="mt-6 pt-6 border-t border-border">
          <Button
            variant="outline"
            onClick={onWriteReview}
            iconName={"Edit3" as LucideIconName}
            iconPosition="left"
          >
            Write a Review
          </Button>
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Icon
              name={"Filter" as LucideIconName}
              size={16}
              className="text-text-secondary"
            />
            <select
              value={filterRating}
              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                setFilterRating(e.target.value as FilterRatingType)
              }
              className="text-sm border border-border rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {ratingFilters.map((filter) => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Icon
            name={"ArrowUpDown" as LucideIconName}
            size={16}
            className="text-text-secondary"
          />
          <select
            value={sortBy}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              setSortBy(e.target.value as SortByType)
            }
            className="text-sm border border-border rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <Icon
              name={"MessageSquare" as LucideIconName}
              size={48}
              className="text-text-secondary mx-auto mb-4"
            />
            <h3 className="text-lg font-medium text-text-primary mb-2">
              No Reviews Yet
            </h3>
            <p className="text-text-secondary mb-4">
              Be the first to share your experience!
            </p>
            <Button variant="outline" onClick={onWriteReview}>
              Write First Review
            </Button>
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white border border-border rounded-lg p-6"
            >
              {/* Review Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    <Image
                      src={review.user.avatar}
                      alt={review.user.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium text-text-primary">
                      {review.user.name}
                    </h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Icon
                            key={i}
                            name={"Star" as LucideIconName}
                            size={14}
                            className={`${
                              i < review.rating
                                ? "text-warning fill-current"
                                : "text-border"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-text-secondary">
                        {formatDate(review.date)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Review Actions */}
                <Button variant="ghost" size="icon">
                  <Icon name={"MoreHorizontal" as LucideIconName} size={16} />
                </Button>
              </div>

              {/* Review Content */}
              <div className="mb-4">
                <p className="text-text-secondary leading-relaxed">
                  {review.comment}
                </p>
              </div>

              {/* Review Images */}
              {review.images && review.images.length > 0 && (
                <div className="flex space-x-2 mb-4 overflow-x-auto">
                  {review.images.map((image, index) => (
                    <div
                      key={index}
                      className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0"
                    >
                      <Image
                        src={image}
                        alt={`Review image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Review Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleHelpfulClick(review.id)}
                  iconName={"ThumbsUp" as LucideIconName}
                  iconPosition="left"
                  iconSize={14}
                >
                  Helpful ({review.helpfulCount})
                </Button>

                {review.businessReply && (
                  <span className="text-xs text-primary font-medium">
                    Business replied
                  </span>
                )}
              </div>

              {/* Business Reply */}
              {review.businessReply && (
                <div className="mt-4 ml-6 p-4 bg-surface rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Icon
                      name={"Store" as LucideIconName}
                      size={16}
                      className="text-primary"
                    />
                    <span className="text-sm font-medium text-text-primary">
                      Business Owner
                    </span>
                    <span className="text-xs text-text-secondary">
                      {formatDate(review.businessReply.date)}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary">
                    {review.businessReply.message}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewsSection;
