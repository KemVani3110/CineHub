'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Star, StarHalf, Trash2, Edit3, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import useRatingStore from '@/store/ratingStore';
import { useRating } from '@/hooks/useRating';

interface TVShowRatingProps {
  tvShowId: number;
  tmdbRating: number;
  mediaType?: 'movie' | 'tv';
}

export default function TVShowRating({ tvShowId, tmdbRating, mediaType = 'tv' }: TVShowRatingProps) {
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
    setUserReview
  } = useRatingStore();
  const { fetchRating, submitRating, deleteRating, isLoading: isSubmitting, userRating: hookUserRating, userReview: hookUserReview } = useRating(undefined, tvShowId, mediaType);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewContent, setReviewContent] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);

  // Use the rating and review from the hook
  const currentRating = hookUserRating || userRating;
  const currentReview = hookUserReview || userReview;

  useEffect(() => {
    if (session?.user) {
      fetchRating();
    }
  }, [session?.user, fetchRating]);

  useEffect(() => {
    if (currentReview) {
      setReviewContent(currentReview.content);
    } else {
      setReviewContent('');
    }
  }, [currentReview]);

  const handleRatingClick = async (rating: number) => {
    if (!session?.user) {
      toast({
        title: 'Authentication required',
        description: `Please sign in to rate ${mediaType}s`,
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoadingAndError(true, null);
      const ratingData = await submitRating(rating, reviewContent);
      setIsReviewing(true);
      
      // Create a new review object if there's review content
      const newReview = reviewContent ? {
        id: ratingData.id,
        userId: ratingData.userId,
        movieId: ratingData.movieId,
        tvId: ratingData.tvId,
        mediaType: ratingData.mediaType,
        content: reviewContent,
        rating: ratingData.rating,
        isEdited: false,
        createdAt: ratingData.createdAt,
        updatedAt: ratingData.updatedAt,
      } : null;
      
      // Update both rating and review state separately
      setUserRating(ratingData);
      setUserReview(newReview);
      
      toast({
        title: 'Rating submitted',
        description: 'Your rating has been saved successfully',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit rating. Please try again.';
      setLoadingAndError(false, errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoadingAndError(false, null);
    }
  };

  const handleReviewSubmit = async () => {
    if (!session?.user) {
      toast({
        title: 'Authentication required',
        description: `Please sign in to review ${mediaType}s`,
        variant: 'destructive',
      });
      return;
    }

    if (!currentRating) {
      toast({
        title: 'Rating required',
        description: `Please rate the ${mediaType} before submitting a review`,
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoadingAndError(true, null);
      const ratingData = await submitRating(currentRating.rating, reviewContent);
      setIsReviewing(false);
      
      // Create a new review object
      const newReview = {
        id: ratingData.id,
        userId: ratingData.userId,
        movieId: ratingData.movieId,
        tvId: ratingData.tvId,
        mediaType: ratingData.mediaType,
        content: reviewContent,
        rating: ratingData.rating,
        isEdited: false,
        createdAt: ratingData.createdAt,
        updatedAt: ratingData.updatedAt,
      };
      
      // Update both rating and review state
      setUserRating(ratingData);
      setUserReview(newReview);
      
      toast({
        title: 'Review submitted',
        description: 'Your review has been saved successfully',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit review. Please try again.';
      setLoadingAndError(false, errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoadingAndError(false, null);
    }
  };

  const handleDeleteRating = async () => {
    try {
      setLoadingAndError(true, null);
      await deleteRating();
      clearRatingAndReview();
      setReviewContent('');
      toast({
        title: 'Rating deleted',
        description: 'Your rating and review have been removed',
      });
    } catch (error) {
      setLoadingAndError(false, 'Failed to delete rating. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to delete rating. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoadingAndError(false, null);
    }
  };

  const renderStars = (rating: number, isInteractive = false) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const ratingValue = isInteractive ? hoverRating || (currentRating?.rating || 0) : rating;
          const filled = star <= ratingValue;
          const halfFilled = star - 0.5 <= ratingValue && star > ratingValue;

          return (
            <button
              key={star}
              type={isInteractive ? 'button' : undefined}
              className={`${
                isInteractive ? 'cursor-pointer hover:scale-110 active:scale-95' : ''
              } text-2xl transition-all duration-200 transform`}
              onMouseEnter={() => isInteractive && setHoverRating(star)}
              onMouseLeave={() => isInteractive && setHoverRating(0)}
              onClick={() => isInteractive && handleRatingClick(star)}
              disabled={!isInteractive || isSubmitting}
            >
              {filled ? (
                <Star className="w-6 h-6 sm:w-7 sm:h-7 fill-[#4fd1c5] text-[#4fd1c5] hover:text-[#38b2ac] drop-shadow-sm" />
              ) : halfFilled ? (
                <StarHalf className="w-6 h-6 sm:w-7 sm:h-7 fill-[#4fd1c5] text-[#4fd1c5] hover:text-[#38b2ac] drop-shadow-sm" />
              ) : (
                <Star className="w-6 h-6 sm:w-7 sm:h-7 text-[#2e3c51] hover:text-[#4fd1c5] hover:drop-shadow-sm" />
              )}
            </button>
          );
        })}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card className="bg-[#0d1b2a] border-[#1b263b]">
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-[#1b263b] rounded w-32" />
              <div className="h-8 bg-[#1b263b] rounded w-48" />
              <div className="h-24 bg-[#1b263b] rounded" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Card */}
      <Card className="bg-[#0d1b2a] border-[#1b263b] shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-[#e0e6ed] flex items-center gap-2">
            <div className="w-2 h-2 bg-[#38b2ac] rounded-full"></div>
            Your Rating
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {renderStars(currentRating?.rating || 0, true)}
              {currentRating && (
                <Badge variant="outline" className="border-[#38b2ac] text-[#38b2ac] bg-[#38b2ac]/10">
                  {currentRating.rating.toFixed(1)}/5.0
                </Badge>
              )}
            </div>
            {currentRating && (
              <Button
                variant="ghost"
                size="sm"
                className="text-[#9aafc3] hover:text-red-500 hover:bg-red-500/10 cursor-pointer transition-all duration-200"
                onClick={handleDeleteRating}
                disabled={isSubmitting}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Remove
              </Button>
            )}
          </div>
          {!session?.user && (
            <p className="text-sm text-[#9aafc3] mt-3 italic">Sign in to rate this {mediaType}</p>
          )}
        </CardContent>
      </Card>

      {/* User Review Card */}
      {currentRating && (
        <Card className="bg-[#0d1b2a] border-[#1b263b] shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-[#e0e6ed] flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#4fd1c5]" />
                Your Review
              </CardTitle>
              {!isReviewing && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-[#4fd1c5] border-[#4fd1c5] hover:bg-[#4fd1c5] hover:text-[#0d1b2a] cursor-pointer transition-all duration-200"
                  onClick={() => setIsReviewing(true)}
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  {currentReview ? 'Edit Review' : 'Write Review'}
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
                  className="min-h-[120px] bg-[#1b263b] border-[#2e3c51] text-[#e0e6ed] placeholder:text-[#9aafc3] focus:border-[#4fd1c5] focus:ring-[#4fd1c5]/20 resize-none"
                />
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="default"
                    className="bg-[#4fd1c5] hover:bg-[#38b2ac] text-[#0d1b2a] cursor-pointer transition-all duration-200 flex-1 sm:flex-none"
                    onClick={handleReviewSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Review'}
                  </Button>
                  <Button
                    variant="outline"
                    className="border-[#2e3c51] text-[#e0e6ed] hover:bg-[#1b263b] hover:border-[#4fd1c5] hover:text-[#4fd1c5] cursor-pointer transition-all duration-200 flex-1 sm:flex-none"
                    onClick={() => {
                      setIsReviewing(false);
                      setReviewContent(currentReview?.content || '');
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
                  <div className="space-y-3">
                    <div className="p-4 rounded-lg bg-[#1b263b] border border-[#2e3c51] relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#4fd1c5]/5 to-transparent"></div>
                      <p className="text-[#e0e6ed] whitespace-pre-wrap leading-relaxed relative z-10">
                        {currentReview.content}
                      </p>
                    </div>
                    <div className="flex items-center text-xs text-[#9aafc3]">
                      <span>Last updated: {new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-[#2e3c51] mx-auto mb-3" />
                    <p className="text-[#9aafc3] mb-4">No review yet</p>
                    <Button
                      variant="outline"
                      className="text-[#4fd1c5] border-[#4fd1c5] hover:bg-[#4fd1c5] hover:text-[#0d1b2a] cursor-pointer transition-all duration-200"
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
        <Card className="bg-red-900/20 border-red-500/30">
          <CardContent className="p-4">
            <p className="text-red-400 text-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              {error}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 