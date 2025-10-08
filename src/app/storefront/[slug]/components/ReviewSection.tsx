import React from "react";
import Icon, { type LucideIconName } from "@/components/AppIcon";
import Button from "@/components/ui/new/Button";

interface Review {
  id: number;
  reviewername: string;
  revieweremail: string;
  rating: number;
  feedback: string;
}

interface BusinessRating {
  average: number;
  total?: number;
}

interface ReviewsSectionProps {
  reviews: Review[];
  businessRating: BusinessRating;
  onWriteReview: () => void;
}

// ⭐ Star display component
const StarRating = ({
  rating,
  size = 16,
}: {
  rating: number;
  size?: number;
}) => (
  <div className="flex items-center space-x-1">
    {[...Array(5)].map((_, i) => (
      <Icon
        key={i}
        name={"Star" as LucideIconName}
        size={size}
        className={`${
          i < rating ? "text-orange-500 fill-current" : "text-border"
        }`}
      />
    ))}
  </div>
);

// Each review card
const ReviewCard = ({ review }: { review: Review }) => (
  <div className="p-4 transition-shadow border rounded-lg bg-surface border-border hover:shadow-sm">
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
          <span className="text-sm font-semibold text-primary">
            {review.reviewername.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <h4 className="font-medium text-text-primary">
            {review.reviewername}
          </h4>
          <p className="text-xs text-text-tertiary">{review.revieweremail}</p>
        </div>
      </div>
      <StarRating rating={review.rating} size={14} />
    </div>

    <p className="text-sm leading-relaxed text-text-secondary">
      {review.feedback || "No feedback provided"}
    </p>
  </div>
);

const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  reviews,
  businessRating,
  onWriteReview,
}) => {
  const ratingDistribution = React.useMemo(() => {
    const dist: Record<1 | 2 | 3 | 4 | 5, number> = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    reviews.forEach(r => {
      if (r.rating >= 1 && r.rating <= 5) {
        dist[r.rating as 1 | 2 | 3 | 4 | 5] += 1;
      }
    });
    return dist;
  }, [reviews]);

  const totalReviews = reviews.length;
  const avgRating =
    businessRating.average ||
    (totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0);

  return (
    <div className="space-y-6">
      {/* --- Rating Overview --- */}
      <div className="p-6 border rounded-lg bg-surface border-border">
        <div className="grid items-center gap-8 lg:grid-cols-3">
          {/* Average rating display */}
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center mb-2 space-x-2 lg:justify-start">
              <span className="text-4xl font-bold text-text-primary">
                {avgRating.toFixed(1)}
              </span>
              <StarRating rating={Math.round(avgRating)} />
            </div>
            <p className="text-text-secondary">
              Based on {totalReviews} review{totalReviews !== 1 && "s"}
            </p>
          </div>

          {/* Rating bars + Write Review button */}
          <div className="flex flex-col justify-between w-full space-y-4 lg:col-span-2">
            <div className="flex items-start justify-between gap-6">
              {/* Rating distribution bars */}
              <div className="flex-1 space-y-2">
                {[5, 4, 3, 2, 1].map(rating => {
                  const count = ratingDistribution[rating as 1 | 2 | 3 | 4 | 5];
                  const percent =
                    totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                  return (
                    <div
                      key={rating}
                      className="flex items-center w-full space-x-3"
                    >
                      <span className="flex items-center w-8 gap-1 text-base font-medium text-orange-500">
                        {rating}{" "}
                        <Icon
                          name="Star"
                          size={16}
                          className="text-orange-500 fill-current"
                        />
                      </span>
                      <div className="relative flex-1 h-2 rounded-full bg-border">
                        <div
                          className="absolute top-0 left-0 h-2 transition-all duration-500 rounded-full bg-warning"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="w-6 text-sm text-right text-text-secondary">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Write Review button aligned beside bars */}
              <Button
                className="flex-shrink-0 mt-1"
                variant="outline"
                onClick={onWriteReview}
                iconName={"Edit3" as LucideIconName}
                iconPosition="left"
              >
                Write a Review
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* --- Review List --- */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="py-12 text-center">
            <Icon
              name={"MessageSquare"}
              size={48}
              className="mx-auto mb-4 text-text-secondary"
            />
            <h3 className="mb-2 text-lg font-medium text-text-primary">
              No Reviews Yet
            </h3>
            <p className="mb-4 text-text-secondary">
              Be the first to share your experience!
            </p>
            <Button variant="outline" onClick={onWriteReview}>
              Write First Review
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {reviews.map(review => (
              <ReviewCard
                key={review.id || review.revieweremail}
                review={review}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsSection;
