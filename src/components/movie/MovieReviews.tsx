import { TMDBReviews } from "@/types/tmdb";
import { Star, ThumbsUp, Calendar } from "lucide-react";
import Image from "next/image";
import { getImageUrl } from "@/services/tmdb";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface MovieReviewsProps {
  reviews: TMDBReviews;
}

export default function MovieReviews({ reviews }: MovieReviewsProps) {
  const [page, setPage] = useState(1);
  const reviewsPerPage = 3;
  const totalPages = Math.ceil(reviews.results.length / reviewsPerPage);
  const startIndex = (page - 1) * reviewsPerPage;
  const endIndex = startIndex + reviewsPerPage;
  const currentReviews = reviews.results.slice(startIndex, endIndex);

  if (!reviews.results.length) {
    return (
      <div className="text-center py-8">
        <p className="text-text-sub">No reviews available yet.</p>
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-white">
          Reviews ({reviews.results.length})
        </h3>
        {reviews.results.length > reviewsPerPage && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {currentReviews.map((review) => (
        <div key={review.id} className="bg-slate-900/50 border border-slate-700 rounded-lg p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
              <Image
                src={
                  review.author_details.avatar_path
                    ? getImageUrl(review.author_details.avatar_path.slice(1))
                    : "/images/no-profile.jpg"
                }
                alt={review.author}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-white">{review.author}</h4>
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <Calendar className="w-4 h-4" />
                  {formatDate(review.created_at)}
                </div>
              </div>
              {review.author_details.rating && (
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-slate-300">
                    {review.author_details.rating.toFixed(1)}/10
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-slate-300 leading-relaxed">{review.content}</p>
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <div className="flex items-center gap-1">
                <ThumbsUp className="w-4 h-4" />
                <span>{review.author_details.rating ? 'Helpful' : 'Not rated'}</span>
              </div>
              {review.updated_at !== review.created_at && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Updated {formatDate(review.updated_at)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <Button
              key={pageNum}
              variant={pageNum === page ? "default" : "outline"}
              size="sm"
              onClick={() => setPage(pageNum)}
            >
              {pageNum}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
