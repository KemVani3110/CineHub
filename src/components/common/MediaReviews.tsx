import { TMDBReviews } from "@/types/tmdb";
import { Star, Calendar, User, ChevronLeft, ChevronRight, MessageSquare, ThumbsUp } from "lucide-react";
import { getImageUrl } from "@/services/tmdb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Review } from "@/types/review";
import { Badge } from "@/components/ui/badge";
import useRatingStore from '@/store/ratingStore';

interface MediaReviewsProps {
  reviews: TMDBReviews;
  mediaId: number;
  mediaType: 'movie' | 'tv';
}

export default function MediaReviews({ reviews, mediaId, mediaType }: MediaReviewsProps) {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;
  const [page, setPage] = useState(1);
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const { userReview } = useRatingStore();
  
  const reviewsPerPage = 3;
  const totalPages = Math.ceil((reviews.results.length + userReviews.length) / reviewsPerPage);
  const startIndex = (page - 1) * reviewsPerPage;
  const endIndex = startIndex + reviewsPerPage;

  const fetchUserReviews = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/reviews?${mediaType}Id=${mediaId}&mediaType=${mediaType}`);
      if (response.ok) {
        const data = await response.json();
        setUserReviews(Array.isArray(data.reviews) ? data.reviews : []);
      } else {
        setUserReviews([]);
      }
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      setUserReviews([]);
    } finally {
      setLoading(false);
    }
  }, [mediaId, mediaType]);

  // Fetch reviews when component mounts or when mediaId/mediaType changes
  useEffect(() => {
    fetchUserReviews();
  }, [fetchUserReviews]);

  // Refresh reviews when userReview changes (new review submitted)
  useEffect(() => {
    if (userReview && userReview.movieId === mediaId && userReview.mediaType === mediaType) {
      // Add a small delay to ensure the API has been updated
      const timer = setTimeout(() => {
        fetchUserReviews();
      }, 1000); // Increased delay to ensure API update
      return () => clearTimeout(timer);
    }
  }, [userReview, mediaId, mediaType, fetchUserReviews]);

  // Combine TMDB reviews with user reviews
  const allReviews = [
    ...userReviews.map(review => {
      // API now returns proper Date objects, so we can use them directly
      const createdAt = review.createdAt instanceof Date 
        ? review.createdAt 
        : new Date(review.createdAt || Date.now());
      const updatedAt = review.updatedAt instanceof Date 
        ? review.updatedAt 
        : new Date(review.updatedAt || review.createdAt || Date.now());
      
      return {
        ...review,
        author: review.user?.name || 'Anonymous',
        author_details: {
          name: review.user?.name || 'Anonymous',
          username: review.user?.name || 'Anonymous',
          avatar_path: review.user?.image || null,
          rating: review.rating
        },
        content: review.content,
        created_at: createdAt.toISOString(),
        updated_at: updatedAt.toISOString(),
        is_user_review: review.userId === currentUserId
      };
    }),
    ...reviews.results.map(review => ({
      ...review,
      is_user_review: false
    }))
  ];

  // Sort by creation date (newest first)
  allReviews.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const currentReviews = allReviews.slice(startIndex, endIndex);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-card border-border shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-14 w-14 rounded-full" />
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-3 w-[150px]" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!allReviews.length) {
    return (
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="text-center py-16 bg-card border-border shadow-lg">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-6">
              <div className="w-20 h-20 bg-gradient-to-br from-accent/20 to-accent/10 rounded-full flex items-center justify-center">
                <MessageSquare className="w-10 h-10 text-accent" />
              </div>
              <div className="space-y-3 max-w-md">
                <h3 className="text-xl font-semibold text-foreground">No Reviews Yet</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Be the first to share your thoughts about this {mediaType === 'movie' ? 'movie' : 'TV show'}. 
                  Your review will help other viewers discover great content!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Unknown date';
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Unknown date';
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-accent/20 to-accent/10 rounded-lg">
                <MessageSquare className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-2xl lg:text-3xl font-bold text-foreground">
                Reviews
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20 font-medium px-3 py-1">
                {allReviews.length} {allReviews.length === 1 ? 'Review' : 'Reviews'}
              </Badge>
              {userReviews.length > 0 && (
                <Badge variant="outline" className="border-accent/30 text-accent font-medium px-3 py-1">
                  {userReviews.length} Community
                </Badge>
              )}
            </div>
          </div>
          
          {/* Desktop Pagination Controls */}
          {allReviews.length > reviewsPerPage && (
            <div className="hidden lg:flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="border-border bg-card hover:bg-accent/10 hover:border-accent/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg">
                <span className="text-sm text-muted-foreground">Page</span>
                <span className="text-sm font-semibold text-accent">{page}</span>
                <span className="text-sm text-muted-foreground">of {totalPages}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="border-border bg-card hover:bg-accent/10 hover:border-accent/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>

        {/* Reviews Grid */}
        <div className="space-y-6">
          {currentReviews.map((review, index) => (
            <Card 
              key={`${review.id}-${index}`} 
              className={`bg-card border-border shadow-lg hover:shadow-xl transition-all duration-300 group ${
                review.is_user_review ? 'ring-1 ring-accent/30 bg-gradient-to-br from-accent/5 to-transparent' : ''
              }`}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-14 w-14 ring-2 ring-border group-hover:ring-accent/30 transition-all duration-300">
                      <AvatarImage 
                        src={review.author_details?.avatar_path ? getImageUrl(review.author_details.avatar_path) : undefined} 
                        alt={review.author_details?.name || 'User'} 
                      />
                      <AvatarFallback className="bg-gradient-to-br from-accent/20 to-accent/10 text-accent font-semibold">
                        {review.author_details?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h4 className="font-semibold text-foreground text-lg">
                          {review.author_details?.name || 'Anonymous'}
                        </h4>
                        {review.is_user_review && (
                          <Badge className="bg-accent/15 text-accent border-accent/30 text-xs font-medium">
                            <User className="w-3 h-3 mr-1" />
                            Your Review
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(review.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {review.author_details?.rating && (
                    <div className="flex items-center gap-2 bg-gradient-to-r from-accent/10 to-accent/5 px-3 py-2 rounded-lg border border-accent/20">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 transition-all duration-200 ${
                              i < (review.author_details?.rating || 0)
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-slate-600 fill-transparent'
                            }`}
                          />
                        ))}
                      </div>
                      <Separator orientation="vertical" className="h-4 bg-accent/20" />
                      <span className="text-accent font-semibold text-sm">
                        {(review.author_details?.rating || 0).toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4 pt-0">
                <div className="prose prose-slate max-w-none">
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-base">
                    {review.content}
                  </p>
                </div>
                
                {review.updated_at !== review.created_at && (
                  <>
                    <Separator className="bg-border" />
                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 px-3 py-2 rounded-md">
                      <Calendar className="w-3 h-3" />
                      <span>Edited on {formatDate(review.updated_at)}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mobile Pagination Controls */}
        {allReviews.length > reviewsPerPage && (
          <div className="lg:hidden space-y-4">
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="flex-1 border-border bg-card hover:bg-accent/10 hover:border-accent/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="flex-1 border-border bg-card hover:bg-accent/10 hover:border-accent/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            <div className="text-center text-sm text-muted-foreground bg-card border border-border rounded-lg py-3">
              Page <span className="font-semibold text-accent">{page}</span> of <span className="font-semibold text-accent">{totalPages}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Skeleton component for loading state
const Skeleton = ({ className }: { className: string }) => (
  <div className={`animate-pulse bg-muted rounded-lg ${className}`} />
); 