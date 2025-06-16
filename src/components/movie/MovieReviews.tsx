import { TMDBReviews } from "@/types/tmdb";
import MediaReviews from "@/components/common/MediaReviews";

interface MovieReviewsProps {
  reviews: TMDBReviews;
  movieId: number;
}

export default function MovieReviews({ reviews, movieId }: MovieReviewsProps) {
  return <MediaReviews reviews={reviews} mediaId={movieId} mediaType="movie" />;
}