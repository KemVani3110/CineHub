'use client';

import { Header, Footer } from '@/components/lazy';
import BackToTop from '@/components/common/BackToTop';

export default function TVShowLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-background">
        {children}
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
} 