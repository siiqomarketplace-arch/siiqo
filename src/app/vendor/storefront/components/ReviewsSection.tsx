"use client";

import React, { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Icon from "@/components/AppIcon";

interface Review {
  id: number;
  author: string;
  rating: number;
  text: string;
  date: string;
  reply?: string;
}

const mockReviews: Review[] = [
  {
    id: 1,
    author: "Jane Doe",
    rating: 5,
    text: "Great product! I love it.",
    date: "2023-10-27",
  },
  {
    id: 2,
    author: "John Smith",
    rating: 4,
    text: "Good product, but the shipping was a bit slow.",
    date: "2023-10-26",
  },
  {
    id: 3,
    author: "Peter Jones",
    rating: 3,
    text: "The product is okay, but it's not what I expected.",
    date: "2023-10-25",
  },
];

const ReviewsSection: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [filter, setFilter] = useState<string>("all");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState<string>("");

  const averageRating =
    reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;

  const filteredReviews =
    filter === "all"
      ? reviews
      : reviews.filter((review) => review.rating === parseInt(filter));

  const handleReply = (reviewId: number) => {
    const newReviews = reviews.map((review) => {
      if (review.id === reviewId) {
        return { ...review, reply: replyText };
      }
      return review;
    });
    setReviews(newReviews);
    setReplyingTo(null);
    setReplyText("");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold">Reviews</h2>
          <p className="text-muted-foreground">
            Manage your customer reviews and feedback.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Star className="w-5 h-5 text-yellow-400" />
            <span className="font-bold">{averageRating.toFixed(1)}</span>
            <span className="text-muted-foreground">
              ({reviews.length} reviews)
            </span>
          </div>
          <Select onValueChange={setFilter} defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ratings</SelectItem>
              <SelectItem value="5">5 Stars</SelectItem>
              <SelectItem value="4">4 Stars</SelectItem>
              <SelectItem value="3">3 Stars</SelectItem>
              <SelectItem value="2">2 Stars</SelectItem>
              <SelectItem value="1">1 Star</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-8">
        {filteredReviews.map((review) => (
          <div key={review.id} className="p-6 border rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold">{review.author}</h3>
                <div className="flex items-center space-x-1">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400" />
                  ))}
                  {[...Array(5 - review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-gray-300" />
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{review.date}</p>
            </div>
            <p className="mt-4">{review.text}</p>
            {review.reply && (
              <div className="p-4 mt-4 border-l-4 rounded-r-lg bg-muted">
                <p className="font-bold">Your reply:</p>
                <p>{review.reply}</p>
              </div>
            )}
            {replyingTo === review.id ? (
              <div className="mt-4">
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write your reply..."
                />
                <div className="flex justify-end mt-2 space-x-2">
                  <Button
                    variant="ghost"
                    onClick={() => setReplyingTo(null)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={() => handleReply(review.id)}>
                    Reply
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setReplyingTo(review.id)}
              >
                <Icon name="Reply" size={16} className="mr-2" />
                Reply
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewsSection;
