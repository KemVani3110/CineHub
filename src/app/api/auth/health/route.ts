import { NextResponse } from "next/server";

const requiredEnvVars = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
  "FIREBASE_ADMIN_PROJECT_ID",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY",
  "NEXT_PUBLIC_TMDB_API_KEY",
  "NEXT_PUBLIC_TMDB_BASE_URL",
  "NEXT_PUBLIC_TMDB_IMAGE_BASE_URL",
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS",
  "CONTACT_FROM_EMAIL",
  "CONTACT_TO_EMAIL",
];

export async function GET() {
  const env = requiredEnvVars.reduce<Record<string, boolean>>((acc, key) => {
    acc[key] = Boolean(process.env[key]);
    return acc;
  }, {});

  const missing = Object.entries(env)
    .filter(([, present]) => !present)
    .map(([key]) => key);

  return NextResponse.json({
    ok: missing.length === 0,
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV || "unknown",
    env,
    missing,
  });
}
