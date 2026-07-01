"use client";

import { LoadingProvider } from "@/providers/LoadingProvider";
import Providers from "@/providers/Providers";
import QueryProvider from "@/providers/QueryProvider";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <QueryProvider>
        <LoadingProvider>{children}</LoadingProvider>
      </QueryProvider>
    </Providers>
  );
}
