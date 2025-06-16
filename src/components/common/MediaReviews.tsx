import { TMDBReviews } from "@/types/tmdb";
import { Star, Calendar, User, ChevronLeft, ChevronRight } from "lucide-react";
import { getImageUrl } from "@/services/tmdb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Review } from "@/types/review";
import { Badge } from "@/components/ui/badge";

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
  const reviewsPerPage = 3;
  const totalPages = Math.ceil((reviews.results.length + userReviews.length) / reviewsPerPage);
  const startIndex = (page - 1) * reviewsPerPage;
  const endIndex = startIndex + reviewsPerPage;

  useEffect(() => {
    const fetchUserReviews = async () => {
      try {
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
    };
    fetchUserReviews();
  }, [mediaId, mediaType]);

  const allReviews = [
    ...((Array.isArray(userReviews) ? userReviews : []).map((review: any) => ({
      id: `user-${review.id}`,
      author: review.name || review.user?.name || 'Anonymous',
      author_details: {
        avatar_path: review.image || review.user?.image || null,
        rating: review.rating
      },
      content: review.content,
      created_at: review.created_at || review.createdAt ? new Date(review.created_at || review.createdAt).toISOString() : new Date().toISOString(),
      updated_at: review.updated_at || review.updatedAt ? new Date(review.updated_at || review.updatedAt).toISOString() : new Date().toISOString(),
      is_user_review: String(review.user_id || review.userId) === String(currentUserId)
    })) as any[]),
    ...reviews.results.map(review => ({
      ...review,
      is_user_review: false
    }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());


  const currentReviews = allReviews.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="h-8 bg-slate-800 rounded-lg w-48 animate-pulse"></div>
            <div className="hidden sm:flex gap-2">
              <div className="h-9 bg-slate-800 rounded-md w-20 animate-pulse"></div>
              <div className="h-9 bg-slate-800 rounded-md w-16 animate-pulse"></div>
            </div>
          </div>
          
          <div className="grid gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-slate-800 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-slate-800 rounded w-32" />
                      <div className="h-4 bg-slate-800 rounded w-24" />
                    </div>
                    <div className="h-4 bg-slate-800 rounded w-20" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="h-4 bg-slate-800 rounded w-full" />
                  <div className="h-4 bg-slate-800 rounded w-5/6" />
                  <div className="h-4 bg-slate-800 rounded w-4/6" />
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
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="text-center py-12">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-slate-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-white">No Reviews Yet</h3>
                <p className="text-text-sub text-sm">Be the first to share your thoughts about this {mediaType === 'movie' ? 'movie' : 'TV show'}.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h3 className="text-2xl sm:text-3xl font-bold text-white">
              Reviews
            </h3>
            <Badge variant="secondary" className="text-sm font-medium">
              {allReviews.length}
            </Badge>
          </div>
          
          {/* Desktop Pagination Controls */}
          {allReviews.length > reviewsPerPage && (
            <div className="hidden sm:flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="cursor-pointer hover:bg-slate-800 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <div className="flex items-center gap-1 px-3 py-1 text-sm text-slate-400">
                {page} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="cursor-pointer hover:bg-slate-800 transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </div>

        {/* Reviews Grid */}
        <div className="grid gap-6">
          {currentReviews.map((review) => (
            <Card 
              key={review.id} 
              className={`group transition-all duration-300 hover:shadow-lg hover:shadow-slate-900/20 ${
                review.is_user_review 
                  ? 'ring-2 ring-[#4fd1c5]/20 bg-gradient-to-br from-[#4fd1c5]/5 to-transparent' 
                  : 'hover:bg-slate-900/30'
              }`}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start gap-4">
                  <Avatar className="w-12 h-12 border-2 border-slate-700 group-hover:border-slate-600 transition-colors">
                    <AvatarImage
                      src={
                        review.author_details.avatar_path
                          ? getImageUrl(review.author_details.avatar_path.slice(1))
                          : "/images/no-profile.jpg"
                      }
                      alt={review.author}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-slate-800 text-slate-300">
                      {review.author.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-white truncate">
                          {review.author}
                        </h4>
                        {review.is_user_review && (
                          <Badge 
                            variant="outline" 
                            className="border-[#4fd1c5]/50 text-[#4fd1c5] bg-[#4fd1c5]/10 text-xs"
                          >
                            Your Review
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <Calendar className="w-4 h-4" />
                        <span className="whitespace-nowrap">
                          {formatDate(review.created_at)}
                        </span>
                      </div>
                    </div>
                    
                    {review.author_details.rating && (
                      <div className="flex items-center gap-1 mt-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.author_details.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-slate-600'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-slate-300 text-sm ml-1">
                          {review.author_details.rating.toFixed(1)}/5
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="prose prose-slate max-w-none">
                  <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {review.content}
                  </p>
                </div>
                
                {review.updated_at !== review.created_at && (
                  <>
                    <Separator className="bg-slate-700" />
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Calendar className="w-3 h-3" />
                      <span>Updated {formatDate(review.updated_at)}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mobile Pagination Controls */}
        {allReviews.length > reviewsPerPage && (
          <div className="sm:hidden flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="cursor-pointer hover:bg-slate-800 transition-colors flex-1 mr-2"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="cursor-pointer hover:bg-slate-800 transition-colors flex-1 ml-2"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="text-center text-sm text-slate-400">
              Page {page} of {totalPages}
            </div>
          </div>
        )}

        {/* Desktop Page Numbers */}
        {totalPages > 1 && (
          <div className="hidden sm:flex justify-center gap-1 mt-8">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <Button
                key={pageNum}
                variant={pageNum === page ? "default" : "outline"}
                size="sm"
                onClick={() => setPage(pageNum)}
                className={`cursor-pointer transition-all duration-200 w-10 h-10 ${
                  pageNum === page 
                    ? 'bg-[#4fd1c5] hover:bg-[#4fd1c5]/90 text-black' 
                    : 'hover:bg-slate-800'
                }`}
              >
                {pageNum}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 