import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CineHub - Your Ultimate Movie & TV Show Companion",
  description:
    "Discover, track, and discuss your favorite movies and TV shows with CineHub.",
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
