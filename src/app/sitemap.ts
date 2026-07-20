import type { MetadataRoute } from "next";

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL?.trim() ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://no1-cinehub.vercel.app");

const publicRoutes = [
  "",
  "/home",
  "/explore",
  "/search",
  "/about",
  "/contact",
  "/login",
  "/register",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return publicRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: route === "" || route === "/home" ? "daily" : "weekly",
    priority: route === "" ? 1 : route === "/home" ? 0.9 : 0.7,
  }));
}
