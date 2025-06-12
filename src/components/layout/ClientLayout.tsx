"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import Loading from "@/components/common/Loading";
import { CompilingProvider } from "@/components/common/CompilingProvider";
import { LoadingProvider } from "@/providers/LoadingProvider";

// Dynamically import heavy providers
const Providers = dynamic(() => import("@/providers/Providers"), {
  ssr: false,
  loading: () => <Loading message="Loading..." showBackdrop={true} />,
});

const QueryProvider = dynamic(() => import("@/providers/QueryProvider"), {
  ssr: false,
  loading: () => <Loading message="Loading..." showBackdrop={true} />,
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
    <Suspense
      fallback={<Loading message="Loading CineHub..." showBackdrop={true} />}
    >
      <CompilingProvider>
        <Providers>
          <QueryProvider>
            <LoadingProvider>
              {children}
              <Toaster />
            </LoadingProvider>
          </QueryProvider>
        </Providers>
      </CompilingProvider>
    </Suspense>
  );
}
