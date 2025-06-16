import { TMDBReviews } from '@/types/tmdb';
import MediaReviews from '@/components/common/MediaReviews';

interface TVShowReviewsProps {
  reviews: TMDBReviews;
  tvShowId: number;
}

export default function TVShowReviews({ reviews, tvShowId }: TVShowReviewsProps) {
  return <MediaReviews reviews={reviews} mediaId={tvShowId} mediaType="tv" />;
} 