import { TMDBReviews } from "@/types/tmdb";
import {
  Star,
  Calendar,
  User,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  ThumbsUp,
} from "lucide-react";
import { getImageUrl } from "@/services/tmdb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Review } from "@/types/review";
import { Badge } from "@/components/ui/badge";
import useRatingStore from "@/store/ratingStore";

interface MediaReviewsProps {
  reviews: TMDBReviews;
  mediaId: number;
  mediaType: "movie" | "tv";
}

export default function MediaReviews({
  reviews,
  mediaId,
  mediaType,
}: MediaReviewsProps) {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;
  const [page, setPage] = useState(1);
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const { userReview } = useRatingStore();

  const reviewsPerPage = 3;
  const totalPages = Math.ceil(
    (reviews.results.length + userReviews.length) / reviewsPerPage
  );
  const startIndex = (page - 1) * reviewsPerPage;
  const endIndex = startIndex + reviewsPerPage;

  const fetchUserReviews = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/reviews?${mediaType}Id=${mediaId}&mediaType=${mediaType}`
      );
      if (response.ok) {
        const data = await response.json();
        setUserReviews(Array.isArray(data.reviews) ? data.reviews : []);
      } else {
        setUserReviews([]);
      }
    } catch (error) {
      console.error("Error fetching user reviews:", error);
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
    if (
      userReview &&
      userReview.movieId === mediaId &&
      userReview.mediaType === mediaType
    ) {
      // Add a small delay to ensure the API has been updated
      const timer = setTimeout(() => {
        fetchUserReviews();
      }, 1500); // Increased delay to ensure API update
      return () => clearTimeout(timer);
    }
  }, [userReview, mediaId, mediaType, fetchUserReviews]);

  // Also refresh when userReview updatedAt changes (for edits)
  useEffect(() => {
    if (userReview && userReview.updatedAt) {
      const timer = setTimeout(() => {
        fetchUserReviews();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [userReview?.updatedAt, fetchUserReviews]);

  // Combine TMDB reviews with user reviews
  const allReviews = [
    ...userReviews.map((review) => {
      // API now returns proper Date objects, so we can use them directly
      const createdAt =
        review.createdAt instanceof Date
          ? review.createdAt
          : new Date(review.createdAt || Date.now());
      const updatedAt =
        review.updatedAt instanceof Date
          ? review.updatedAt
          : new Date(review.updatedAt || review.createdAt || Date.now());

      return {
        ...review,
        author: review.user?.name || "Anonymous",
        author_details: {
          name: review.user?.name || "Anonymous",
          username: review.user?.name || "Anonymous",
          avatar_path: review.user?.image || null,
          rating: review.rating,
        },
        content: review.content,
        created_at: createdAt.toISOString(),
        updated_at: updatedAt.toISOString(),
        is_user_review: review.userId === currentUserId,
      };
    }),
    ...reviews.results.map((review) => ({
      ...review,
      is_user_review: false,
    })),
  ];

  // Sort by creation date (newest first)
  allReviews.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const currentReviews = allReviews.slice(startIndex, endIndex);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="w-full max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        <div className="space-y-6 sm:space-y-8">
          {/* Header Skeleton */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 lg:gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-700/50 rounded-lg animate-pulse">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-slate-600 rounded"></div>
                </div>
                <div className="h-6 sm:h-8 bg-slate-700 rounded w-20 sm:w-24 animate-pulse"></div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="h-5 sm:h-6 bg-slate-700 rounded-full w-16 sm:w-20 animate-pulse"></div>
                <div className="h-5 sm:h-6 bg-slate-700 rounded-full w-12 sm:w-16 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Reviews Skeleton */}
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <Card
                key={i}
                className="bg-slate-800/40 border-slate-700/50 shadow-lg"
              >
                <CardHeader className="pb-3 sm:pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                    <div className="flex items-start space-x-3 sm:space-x-4 flex-1">
                      {/* Avatar Skeleton */}
                      <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-gradient-to-br from-slate-600/50 to-slate-700/50 animate-pulse border-2 border-slate-600/30 flex-shrink-0"></div>

                      <div className="space-y-2 sm:space-y-3 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                          {/* Name Skeleton */}
                          <div className="h-4 sm:h-5 bg-slate-600 rounded w-24 sm:w-32 animate-pulse"></div>
                          {/* Badge Skeleton */}
                          <div className="h-4 sm:h-5 bg-slate-600/50 rounded-full w-16 sm:w-20 animate-pulse"></div>
                        </div>
                        {/* Date Skeleton */}
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-slate-600 rounded animate-pulse flex-shrink-0"></div>
                          <div className="h-3 sm:h-4 bg-slate-600 rounded w-20 sm:w-24 animate-pulse"></div>
                        </div>
                      </div>
                    </div>

                    {/* Rating Skeleton */}
                    <div className="flex items-center gap-1 sm:gap-2 bg-slate-700/30 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-slate-600/30 flex-shrink-0">
                      <div className="flex items-center gap-0.5 sm:gap-1">
                        {[...Array(5)].map((_, starIndex) => (
                          <div
                            key={starIndex}
                            className="w-3 h-3 sm:w-4 sm:h-4 bg-slate-600 rounded animate-pulse"
                          ></div>
                        ))}
                      </div>
                      <div className="w-px h-3 sm:h-4 bg-slate-600/30"></div>
                      <div className="h-3 sm:h-4 bg-slate-600 rounded w-6 sm:w-8 animate-pulse"></div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 sm:space-y-4 pt-0">
                  {/* Content Skeleton */}
                  <div className="space-y-2">
                    <div className="h-3 sm:h-4 bg-slate-600 rounded w-full animate-pulse"></div>
                    <div className="h-3 sm:h-4 bg-slate-600 rounded w-11/12 animate-pulse"></div>
                    <div className="h-3 sm:h-4 bg-slate-600 rounded w-4/5 animate-pulse"></div>
                    <div className="h-3 sm:h-4 bg-slate-600 rounded w-3/4 animate-pulse"></div>
                    <div className="h-3 sm:h-4 bg-slate-600 rounded w-2/3 animate-pulse"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!allReviews.length) {
    return (
      <div className="w-full max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        <Card className="text-center py-12 sm:py-16 bg-slate-800/40 border-slate-700/50 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-6">
              <div className="w-20 h-20 bg-gradient-to-br from-[#4fd1c5]/20 to-[#4fd1c5]/10 rounded-full flex items-center justify-center">
                <MessageSquare className="w-10 h-10 text-[#4fd1c5]" />
              </div>
              <div className="space-y-3 max-w-md">
                <h3 className="text-xl font-semibold text-white">
                  No Reviews Yet
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  Be the first to share your thoughts about this{" "}
                  {mediaType === "movie" ? "movie" : "TV show"}. Your review
                  will help other viewers discover great content!
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
        return "Unknown date";
      }
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return "Unknown date";
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 lg:gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-[#4fd1c5]/20 to-[#4fd1c5]/10 rounded-lg">
                <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-[#4fd1c5]" />
              </div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
                Reviews
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="secondary"
                className="bg-[#4fd1c5]/10 text-[#4fd1c5] border-[#4fd1c5]/20 font-medium px-2 sm:px-3 py-1 text-xs sm:text-sm"
              >
                {allReviews.length}{" "}
                {allReviews.length === 1 ? "Review" : "Reviews"}
              </Badge>
              {userReviews.length > 0 && (
                <Badge
                  variant="outline"
                  className="border-[#4fd1c5]/30 text-[#4fd1c5] font-medium px-2 sm:px-3 py-1 text-xs sm:text-sm"
                >
                  {userReviews.length} Community
                </Badge>
              )}
            </div>
          </div>

          {/* Desktop Pagination Controls */}
          {allReviews.length > reviewsPerPage && (
            <div className="hidden md:flex items-center gap-2 lg:gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="border-slate-600 bg-slate-800/50 text-slate-300 hover:bg-[#4fd1c5]/10 hover:border-[#4fd1c5]/50 hover:text-[#4fd1c5] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer px-2 lg:px-3"
              >
                <ChevronLeft className="w-4 h-4 lg:mr-2" />
                <span className="hidden lg:inline">Previous</span>
              </Button>
              <div className="flex items-center gap-1 lg:gap-2 px-2 lg:px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg">
                <span className="text-xs lg:text-sm text-slate-400">Page</span>
                <span className="text-xs lg:text-sm font-semibold text-[#4fd1c5]">
                  {page}
                </span>
                <span className="text-xs lg:text-sm text-slate-400">of {totalPages}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="border-slate-600 bg-slate-800/50 text-slate-300 hover:bg-[#4fd1c5]/10 hover:border-[#4fd1c5]/50 hover:text-[#4fd1c5] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer px-2 lg:px-3"
              >
                <span className="hidden lg:inline">Next</span>
                <ChevronRight className="w-4 h-4 lg:ml-2" />
              </Button>
            </div>
          )}
        </div>

        {/* Reviews Grid */}
        <div className="space-y-6">
          {currentReviews.map((review, index) => (
            <Card
              key={`${review.id}-${index}`}
              className={`bg-slate-800/40 border-slate-700/50 shadow-lg hover:shadow-xl hover:bg-slate-800/60 transition-all duration-300 group ${
                review.is_user_review
                  ? "ring-1 ring-[#4fd1c5]/30 bg-gradient-to-br from-[#4fd1c5]/5 to-transparent hover:ring-[#4fd1c5]/50"
                  : "hover:border-slate-600/70"
              }`}
            >
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                  <div className="flex items-start space-x-3 sm:space-x-4 flex-1">
                    <Avatar className="h-12 w-12 sm:h-14 sm:w-14 ring-2 ring-slate-600/50 group-hover:ring-[#4fd1c5]/30 transition-all duration-300 flex-shrink-0">
                      <AvatarImage
                        src={
                          review.author_details?.avatar_path
                            ? getImageUrl(review.author_details.avatar_path)
                            : undefined
                        }
                        alt={review.author_details?.name || "User"}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-[#4fd1c5]/20 to-[#4fd1c5]/10 text-[#4fd1c5] font-semibold text-sm sm:text-base">
                        {review.author_details?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <h4 className="font-semibold text-white text-base sm:text-lg truncate">
                          {review.author_details?.name || "Anonymous"}
                        </h4>
                        {review.is_user_review && (
                          <Badge className="bg-[#4fd1c5]/15 text-[#4fd1c5] border-[#4fd1c5]/30 text-xs font-medium flex-shrink-0">
                            <User className="w-3 h-3 mr-1" />
                            <span className="hidden xs:inline">Your Review</span>
                            <span className="xs:hidden">You</span>
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{formatDate(review.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  {review.author_details?.rating && (
                    <div className="flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-[#4fd1c5]/10 to-[#4fd1c5]/5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-[#4fd1c5]/20 flex-shrink-0">
                      <div className="flex items-center gap-0.5 sm:gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 sm:w-4 sm:h-4 transition-all duration-200 ${
                              i < (review.author_details?.rating || 0)
                                ? "text-[#4fd1c5] fill-[#4fd1c5]"
                                : "text-slate-600 fill-transparent"
                            }`}
                          />
                        ))}
                      </div>
                      <Separator
                        orientation="vertical"
                        className="h-3 sm:h-4 bg-[#4fd1c5]/20"
                      />
                      <span className="text-[#4fd1c5] font-semibold text-xs sm:text-sm">
                        {(review.author_details?.rating || 0).toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-3 sm:space-y-4 pt-0">
                <div className="prose prose-slate max-w-none">
                  <p className="text-slate-300 leading-relaxed whitespace-pre-wrap text-sm sm:text-base break-words">
                    {review.content}
                  </p>
                </div>

                {review.updated_at !== review.created_at && (
                  <>
                    <Separator className="bg-slate-600/30" />
                    <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-700/30 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md">
                      <Calendar className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">Edited on {formatDate(review.updated_at)}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mobile Pagination Controls */}
        {allReviews.length > reviewsPerPage && (
          <div className="md:hidden space-y-3">
            <div className="flex gap-2 sm:gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="flex-1 border-slate-600 bg-slate-800/50 text-slate-300 hover:bg-[#4fd1c5]/10 hover:border-[#4fd1c5]/50 hover:text-[#4fd1c5] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer text-xs sm:text-sm"
              >
                <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Previous</span>
                <span className="xs:hidden">Prev</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="flex-1 border-slate-600 bg-slate-800/50 text-slate-300 hover:bg-[#4fd1c5]/10 hover:border-[#4fd1c5]/50 hover:text-[#4fd1c5] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer text-xs sm:text-sm"
              >
                <span className="hidden xs:inline">Next</span>
                <span className="xs:hidden">Next</span>
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
              </Button>
            </div>
            <div className="text-center text-xs sm:text-sm text-slate-400 bg-slate-800/50 border border-slate-600 rounded-lg py-2 sm:py-3">
              Page <span className="font-semibold text-[#4fd1c5]">{page}</span>{" "}
              of{" "}
              <span className="font-semibold text-[#4fd1c5]">{totalPages}</span>
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
