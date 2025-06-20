"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Star, StarHalf, Trash2, Edit3, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
              } text-2xl transition-all duration-200 transform`}
              onMouseEnter={() => isInteractive && setHoverRating(star)}
              onMouseLeave={() => isInteractive && setHoverRating(0)}
              onClick={() => isInteractive && handleRatingClick(star)}
              disabled={!isInteractive || isSubmitting}
            >
              {filled ? (
                <Star className="w-6 h-6 sm:w-7 sm:h-7 fill-primary text-primary hover:text-primary/80" />
              ) : halfFilled ? (
                <StarHalf className="w-6 h-6 sm:w-7 sm:h-7 fill-primary text-primary hover:text-primary/80" />
              ) : (
                <Star className="w-6 h-6 sm:w-7 sm:h-7 text-muted-foreground hover:text-primary" />
              )}
            </button>
          );
        })}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="gradient-card">
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-muted rounded w-32" />
              <div className="h-8 bg-muted rounded w-48" />
              <div className="h-24 bg-muted rounded" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Card */}
      <Card className="gradient-card border-border/50 shadow-xl backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-3">
            <div className="w-2 h-2 bg-primary rounded-full shadow-sm"></div>
            Your Rating
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {renderStars(currentRating?.rating || 0, true)}
              {currentRating && (
                <Badge
                  variant="outline"
                  className="border-primary text-primary bg-primary/10 shadow-sm"
                >
                  {currentRating.rating.toFixed(1)}/5.0
                </Badge>
              )}
            </div>
            {currentRating && (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 cursor-pointer"
                onClick={handleDeleteRating}
                disabled={isSubmitting}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Remove
              </Button>
            )}
          </div>
          {!session?.user && (
            <p className="text-sm text-muted-foreground mt-3 italic">
              Sign in to rate this {mediaType}
            </p>
          )}
        </CardContent>
      </Card>

      {/* User Review Card */}
      {session?.user &&
        (currentRating ||
          (currentReview && currentReview.userId === session.user.id)) && (
          <Card className="gradient-card border-border/50 shadow-xl backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  Your Review
                </CardTitle>
                {!isReviewing && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-primary border-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200 cursor-pointer"
                    onClick={() => setIsReviewing(true)}
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    {currentReview ? "Edit Review" : "Write Review"}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {isReviewing ? (
                <div className="space-y-4">
                  <Textarea
                    value={reviewContent}
                    onChange={(e) => setReviewContent(e.target.value)}
                    placeholder={`Share your thoughts about this ${mediaType}...`}
                    className="min-h-[120px] bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 resize-none"
                  />
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="default"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 flex-1 sm:flex-none cursor-pointer"
                      onClick={handleReviewSubmit}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Submitting..." : "Submit Review"}
                    </Button>
                    <Button
                      variant="outline"
                      className="border-border text-foreground hover:bg-muted hover:border-primary hover:text-primary transition-all duration-200 flex-1 sm:flex-none cursor-pointer"
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
                <>
                  {currentReview ? (
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-muted border border-border relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-50 group-hover:opacity-70 transition-opacity"></div>
                        <p className="text-foreground whitespace-pre-wrap leading-relaxed relative z-10">
                          {currentReview.content}
                        </p>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <span>
                          Last updated:{" "}
                          {new Date(
                            currentReview.updatedAt
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                      <p className="text-muted-foreground mb-4">
                        No review yet
                      </p>
                      <Button
                        variant="outline"
                        className="text-primary border-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200 cursor-pointer"
                        onClick={() => setIsReviewing(true)}
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Write your first review
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}

      {error && (
        <Card className="bg-destructive/10 border-destructive/30 shadow-lg">
          <CardContent className="p-4">
            <p className="text-destructive text-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-destructive rounded-full shadow-sm"></div>
              {error}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
