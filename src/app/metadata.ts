import type { Metadata } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL?.trim() ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://no1-cinehub.vercel.app");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "CineHub",
  title: {
    default: "CineHub - Movie Discovery, Watchlist, and Watch Experience",
    template: "%s | CineHub",
  },
  description:
    "CineHub is a personal movie and TV web app by Huynh Chu Minh Khoi, built with Next.js, Firebase, Firestore, and TMDB for discovery, watchlists, ratings, history, admin analytics, and playback source reports.",
  keywords: [
    "CineHub",
    "movie app",
    "TV show app",
    "Next.js portfolio project",
    "Firebase movie platform",
    "TMDB",
    "Huynh Chu Minh Khoi",
    "watchlist",
    "movie discovery",
  ],
  authors: [{ name: "Huynh Chu Minh Khoi", url: "https://hcmkportfolio.netlify.app/" }],
  creator: "Huynh Chu Minh Khoi",
  publisher: "Huynh Chu Minh Khoi",
  category: "portfolio",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "CineHub",
    title: "CineHub - Movie Discovery, Watchlist, and Watch Experience",
    description:
      "A Next.js and Firebase movie platform portfolio project with TMDB discovery, watchlists, ratings, admin analytics, and playback source reporting.",
    images: [
      {
        url: "/Border-logo.png",
        width: 1200,
        height: 630,
        alt: "CineHub project logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CineHub - Movie Discovery, Watchlist, and Watch Experience",
    description:
      "A production-style movie and TV portfolio project built with Next.js, Firebase, Firestore, and TMDB.",
    images: ["/Border-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "16x16 32x32 48x48", type: "image/x-icon" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
      { url: "/Border-logo.png", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/Border-logo.png",
  },
};
