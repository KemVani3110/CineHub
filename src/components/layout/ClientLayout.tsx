"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { LoadingProvider } from "@/providers/LoadingProvider";

// Dynamically import heavy providers
const Providers = dynamic(() => import("@/providers/Providers"), {
  ssr: false,
});

const QueryProvider = dynamic(() => import("@/providers/QueryProvider"), {
  ssr: false,
});

const Toaster = dynamic(
  () =>
    import("@/components/ui/toaster").then((mod) => ({ default: mod.Toaster })),
  {
    ssr: false,
  }
);

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <QueryProvider>
        <LoadingProvider>
          {children}
          <Toaster />
        </LoadingProvider>
      </QueryProvider>
    </Providers>
  );
}
