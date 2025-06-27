"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Star, StarHalf, Trash2, Edit3, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import useRatingStore from "@/store/ratingStore";
import { useRating } from "@/hooks/useRating";

interface TVShowRatingProps {
  tvShowId: number;
  tmdbRating: number;
  mediaType?: "movie" | "tv";
}

export default function TVShowRating({
  tvShowId,
  tmdbRating,
  mediaType = "tv",
}: TVShowRatingProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const {
    userRating,
    userReview,
    isLoading,
    error,
    updateRatingAndReview,
    clearRatingAndReview,
    setLoadingAndError,
    setUserRating,
    setUserReview,
  } = useRatingStore();
  const {
    fetchRating,
    submitRating,
    deleteRating,
    isLoading: isSubmitting,
  } = useRating(undefined, tvShowId, mediaType);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewContent, setReviewContent] = useState("");
  const [isReviewing, setIsReviewing] = useState(false);
  const [showReviewSection, setShowReviewSection] = useState(false);

  // Use the rating and review from the store (which is updated by the hook)
  const currentRating = userRating;
  const currentReview = userReview;

  useEffect(() => {
    if (session?.user) {
      fetchRating();
    }
  }, [session?.user, fetchRating]);

  useEffect(() => {
    if (currentReview) {
      setReviewContent(currentReview.content);
      setShowReviewSection(true);
    } else {
      setReviewContent("");
    }
  }, [currentReview]);

  const handleRatingClick = async (rating: number) => {
    if (!session?.user) {
      toast({
        title: "Authentication required",
        description: `Please sign in to rate ${mediaType}s`,
        variant: "destructive",
      });
      return;
    }

    try {
      setLoadingAndError(true, null);
      // Only submit rating, not review content unless there's an existing review
      const reviewToSubmit = currentReview ? reviewContent : undefined;
      const ratingData = await submitRating(rating, reviewToSubmit);

      toast({
        title: "Rating submitted",
        description: "Your rating has been saved successfully",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to submit rating. Please try again.";
      setLoadingAndError(false, errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoadingAndError(false, null);
    }
  };

  const handleReviewSubmit = async () => {
    if (!session?.user) {
      toast({
        title: "Authentication required",
        description: `Please sign in to review ${mediaType}s`,
        variant: "destructive",
      });
      return;
    }

    if (!currentRating) {
      toast({
        title: "Rating required",
        description: `Please rate the ${mediaType} before submitting a review`,
        variant: "destructive",
      });
      return;
    }

    try {
      setLoadingAndError(true, null);

      // Immediately update the review in the store for instant feedback
      const tempReview = {
        id: currentRating.id,
        userId: currentRating.userId,
        movieId: currentRating.movieId,
        tvId: currentRating.tvId,
        mediaType: currentRating.mediaType,
        content: reviewContent,
        rating: currentRating.rating,
        isEdited: false,
        createdAt: currentRating.createdAt,
        updatedAt: new Date(),
      };
      setUserReview(tempReview);

      await submitRating(currentRating.rating, reviewContent);
      setIsReviewing(false);

      toast({
        title: "Review submitted",
        description: "Your review has been saved successfully",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to submit review. Please try again.";
      setLoadingAndError(false, errorMessage);
      // Revert the review if submission failed
      if (currentReview) {
        setUserReview(currentReview);
      } else {
        setUserReview(null);
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoadingAndError(false, null);
    }
  };

  const handleDeleteRating = async () => {
    try {
      setLoadingAndError(true, null);
      await deleteRating();
      setReviewContent("");
      setShowReviewSection(false);
      toast({
        title: "Rating deleted",
        description: "Your rating and review have been removed",
      });
    } catch (error) {
      setLoadingAndError(false, "Failed to delete rating. Please try again.");
      toast({
        title: "Error",
        description: "Failed to delete rating. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingAndError(false, null);
    }
  };

  const handleDeleteReview = async () => {
    if (!currentRating) return;

    try {
      setLoadingAndError(true, null);
      // Submit rating without review content to delete only the review
      await submitRating(currentRating.rating, "");
      setReviewContent("");
      setUserReview(null);
      setShowReviewSection(false);

      toast({
        title: "Review deleted",
        description: "Your review has been removed while keeping your rating",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to delete review. Please try again.";
      setLoadingAndError(false, errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoadingAndError(false, null);
    }
  };

  const renderStars = (rating: number, isInteractive = false) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const ratingValue = isInteractive
            ? hoverRating || currentRating?.rating || 0
            : rating;
          const filled = star <= ratingValue;
          const halfFilled = star - 0.5 <= ratingValue && star > ratingValue;

          return (
            <button
              key={star}
              type={isInteractive ? "button" : undefined}
              className={`${
                isInteractive ? "hover:scale-110 active:scale-95" : ""
              } text-xl transition-all duration-200 transform`}
              onMouseEnter={() => isInteractive && setHoverRating(star)}
              onMouseLeave={() => isInteractive && setHoverRating(0)}
              onClick={() => isInteractive && handleRatingClick(star)}
              disabled={!isInteractive || isSubmitting}
            >
              {filled ? (
                <Star className="w-5 h-5 fill-[#4fd1c5] text-[#4fd1c5] hover:text-[#4fd1c5]/80" />
              ) : halfFilled ? (
                <StarHalf className="w-5 h-5 fill-[#4fd1c5] text-[#4fd1c5] hover:text-[#4fd1c5]/80" />
              ) : (
                <Star className="w-5 h-5 text-slate-400 hover:text-[#4fd1c5]" />
              )}
            </button>
          );
        })}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-4 bg-slate-600 rounded w-20 animate-pulse"></div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-5 h-5 bg-slate-600 rounded-full animate-pulse"
                ></div>
              ))}
            </div>
            <div className="h-5 bg-slate-600 rounded-full w-12 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Compact Rating Section */}
      <div className="space-y-3">
        {/* Your Rating Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-[#4fd1c5] flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-[#4fd1c5] rounded-full"></div>
              Your Rating
            </span>
            {renderStars(currentRating?.rating || 0, true)}
            {currentRating && (
              <Badge
                variant="outline"
                className="border-[#4fd1c5] text-[#4fd1c5] bg-[#4fd1c5]/10 text-xs"
              >
                {currentRating.rating.toFixed(1)}/5.0
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            {currentRating && (
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all duration-200 h-8 px-3 text-xs cursor-pointer"
                onClick={handleDeleteRating}
                disabled={isSubmitting}
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Remove
              </Button>
            )}
            {session?.user && currentRating && (
              <Button
                variant="ghost"
                size="sm"
                className="text-[#4fd1c5] hover:text-[#4fd1c5]/80 hover:bg-[#4fd1c5]/10 transition-all duration-200 h-8 px-3 text-xs cursor-pointer"
                onClick={() => setShowReviewSection(!showReviewSection)}
              >
                <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                {currentReview ? "View Review" : "Add Review"}
              </Button>
            )}
          </div>
        </div>

        {!session?.user && (
          <p className="text-xs text-slate-400 italic">
            Sign in to rate this {mediaType}
          </p>
        )}
      </div>

      {/* Expandable Review Section */}
      {session?.user && showReviewSection && currentRating && (
        <Card className="border-slate-700/50 bg-slate-800/30">
          <CardContent className="p-4">
            {isReviewing ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-4 h-4 text-[#4fd1c5]" />
                  <span className="text-sm font-medium text-[#4fd1c5]">
                    Your Review
                  </span>
                </div>
                <Textarea
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  placeholder={`Share your thoughts about this ${mediaType}...`}
                  className="min-h-[80px] bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-[#4fd1c5] focus:ring-[#4fd1c5]/20 resize-none text-sm"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-[#4fd1c5] hover:bg-[#4fd1c5]/90 text-slate-900 h-8 px-3 text-xs cursor-pointer"
                    onClick={handleReviewSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-[#4fd1c5] hover:text-[#4fd1c5] h-8 px-3 text-xs cursor-pointer"
                    onClick={() => {
                      setIsReviewing(false);
                      setReviewContent(currentReview?.content || "");
                    }}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#4fd1c5]" />
                    <span className="text-sm font-medium text-[#4fd1c5]">
                      Your Review
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[#4fd1c5] hover:text-[#4fd1c5]/80 hover:bg-[#4fd1c5]/10 h-8 px-3 text-xs cursor-pointer"
                      onClick={() => setIsReviewing(true)}
                    >
                      <Edit3 className="w-3.5 h-3.5 mr-1.5" />
                      {currentReview ? "Edit" : "Write"}
                    </Button>
                    {currentReview && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 hover:text-red-400 hover:bg-red-400/10 h-8 px-2 text-xs cursor-pointer"
                        onClick={handleDeleteReview}
                        disabled={isSubmitting}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>

                {currentReview ? (
                  <div className="space-y-2">
                    <div className="p-3 rounded-lg bg-slate-700/30 border border-slate-600/50">
                      <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
                        {currentReview.content}
                      </p>
                    </div>
                    <p className="text-xs text-slate-400">
                      Updated:{" "}
                      {new Date(currentReview.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-slate-400 text-sm mb-2">No review yet</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-[#4fd1c5] border-[#4fd1c5] hover:bg-[#4fd1c5] hover:text-slate-900 h-8 px-3 text-xs cursor-pointer"
                      onClick={() => setIsReviewing(true)}
                    >
                      <Edit3 className="w-3.5 h-3.5 mr-1.5" />
                      Write your first review
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-sm flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
            {error}
          </p>
        </div>
      )}
    </div>
  );
}
