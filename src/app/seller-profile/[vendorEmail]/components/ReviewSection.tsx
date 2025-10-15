import React, { useEffect, useState } from "react";
import Icon, { type LucideIconName } from "@/components/AppIcon";
import Button from "@/components/Button";

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
  onWriteReview: (data: {
    name: string;
    email: string;
    rating: number;
    message: string;
  }) => Promise<void> | void; // async-ready for future backend
}

// Star display component
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

// Interactive Star Rating for Modal
const InteractiveStarRating = ({
  rating,
  onRatingChange,
}: {
  rating: number;
  onRatingChange: (rating: number) => void;
}) => (
  <div className="flex items-center space-x-1">
    {[1, 2, 3, 4, 5].map(star => (
      <button
        key={star}
        type="button"
        onClick={() => onRatingChange(star)}
        className="transition-transform hover:scale-110 focus:outline-none"
      >
        <Icon
          name={"Star" as LucideIconName}
          size={32}
          className={`${
            star <= rating ? "text-orange-500 fill-current" : "text-border"
          } transition-colors`}
        />
      </button>
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

// Review Modal Component
const ReviewModal = ({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    email: string;
    rating: number;
    message: string;
  }) => Promise<void> | void;
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && rating > 0 && message) {
      try {
        setIsSubmitting(true);

        // Simulate submission delay (remove later when backend connects)
        await new Promise(resolve => setTimeout(resolve, 1500));

        await onSubmit({ name, email, rating, message });

        setName("");
        setEmail("");
        setRating(0);
        setMessage("");
        onClose();
      } catch (err) {
        console.error("Error submitting review:", err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-r from-orange-500 to-orange-600">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="absolute p-2 transition-all rounded-full top-4 right-4 text-white/80 hover:text-white hover:bg-white/20 disabled:opacity-50"
          >
            <Icon name="X" size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Icon name="Edit3" size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                Share Your Experience
              </h2>
              <p className="mt-1 text-sm text-orange-100">
                Your feedback helps others make better decisions
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-5 overflow-y-auto custom-scrollbar max-h-[calc(85vh-140px)]"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">
                Full Name <span className="text-orange-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                disabled={isSubmitting}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl bg-white focus:outline-none focus:border-orange-500 transition-colors disabled:opacity-60"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">
                Email <span className="text-orange-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl bg-white focus:outline-none focus:border-orange-500 transition-colors disabled:opacity-60"
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div className="p-5 border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl">
            <label className="block mb-3 text-sm font-semibold text-gray-700">
              How would you rate your experience?{" "}
              <span className="text-orange-500">*</span>
            </label>
            <div className="flex justify-center">
              <InteractiveStarRating
                rating={rating}
                onRatingChange={setRating}
              />
            </div>
            {rating > 0 && (
              <p className="mt-3 text-sm font-medium text-center text-orange-600">
                {rating === 5 && "⭐ Excellent!"}
                {rating === 4 && "👍 Great!"}
                {rating === 3 && "😊 Good"}
                {rating === 2 && "😐 Fair"}
                {rating === 1 && "😞 Poor"}
              </p>
            )}
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">
              Your Review <span className="text-orange-500">*</span>
            </label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              required
              rows={4}
              disabled={isSubmitting}
              className="w-full px-4 py-3 transition-colors bg-white border-2 border-gray-200 resize-none rounded-xl focus:outline-none focus:border-orange-500 disabled:opacity-60"
              placeholder="Tell us about your experience..."
            />
            <p className="mt-2 text-xs text-gray-500">
              {message.length} characters
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-2 disabled:opacity-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="orange"
              disabled={
                isSubmitting || !name || !email || rating === 0 || !message
              }
              className="flex items-center justify-center flex-1 px-6 py-2"
            >
              {isSubmitting ? (
                <>
                  <Icon
                    name="Loader2"
                    size={18}
                    className="mr-2 animate-spin"
                  />
                  Submitting...
                </>
              ) : (
                "Submit Review"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  reviews,
  businessRating,
  onWriteReview,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleSubmitReview = async (data: {
    name: string;
    email: string;
    rating: number;
    message: string;
  }) => {
    // Simulated submission
    await onWriteReview(data);
  };

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
    <>
      <div className="space-y-6">
        {/* Rating Overview */}
        <div className="p-6 border rounded-lg bg-surface border-border">
          <div className="grid items-center gap-8 lg:grid-cols-3">
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

            <div className="flex flex-col justify-between w-full space-y-4 lg:col-span-2">
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1 space-y-2">
                  {[5, 4, 3, 2, 1].map(rating => {
                    const count =
                      ratingDistribution[rating as 1 | 2 | 3 | 4 | 5];
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

                <Button
                  className="flex-shrink-0 mt-1"
                  variant="outline"
                  onClick={handleOpenModal}
                >
                  Write a Review
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Review List */}
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
              <Button variant="outline" onClick={handleOpenModal}>
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

      <ReviewModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitReview}
      />
    </>
  );
};

export default ReviewsSection;
