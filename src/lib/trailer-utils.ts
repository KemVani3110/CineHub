export interface TrailerVideo {
  id?: string;
  key: string;
  name?: string;
  official?: boolean;
  published_at?: string;
  site: string;
  size?: number;
  type: string;
}

export interface TrailerSource {
  name: string;
  url: string;
  quality: string;
  type: "iframe" | "video";
  embed: boolean;
}

const VIDEO_TYPE_PRIORITY: Record<string, number> = {
  Trailer: 0,
  Teaser: 1,
  Clip: 2,
  Featurette: 3,
};

function dateScore(value?: string) {
  const timestamp = Date.parse(value || "");
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

export function isFutureDate(dateString?: string | null) {
  if (!dateString) return false;

  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return date.getTime() > today.getTime();
}

export function selectBestTrailer(
  videos?: { results?: TrailerVideo[] } | TrailerVideo[] | null
) {
  const results = Array.isArray(videos) ? videos : videos?.results || [];

  return results
    .filter((video) => video.site === "YouTube" && video.key)
    .sort((a, b) => {
      const typeA = VIDEO_TYPE_PRIORITY[a.type] ?? 9;
      const typeB = VIDEO_TYPE_PRIORITY[b.type] ?? 9;
      if (typeA !== typeB) return typeA - typeB;
      if (Boolean(a.official) !== Boolean(b.official)) {
        return a.official ? -1 : 1;
      }
      return dateScore(b.published_at) - dateScore(a.published_at);
    })[0];
}

export function createTrailerSource(
  videos?: { results?: TrailerVideo[] } | TrailerVideo[] | null,
  fallbackName = "Official Trailer"
): TrailerSource | null {
  const trailer = selectBestTrailer(videos);
  if (!trailer) return null;

  return {
    name: trailer.name || fallbackName,
    url: `https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0&modestbranding=1`,
    quality: trailer.size ? `${trailer.size}p` : "HD",
    type: "iframe",
    embed: true,
  };
}
