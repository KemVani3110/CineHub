import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function getImageUrl(path: string | null, size: string = 'w500') {
  if (!path) return '/images/no-image.jpg';
  return `https://image.tmdb.org/t/p/${size}${path}`;
}
