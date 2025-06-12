import { Suspense } from 'react';
import Loading from '@/components/common/Loading';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--bg-main)]">
      <Suspense fallback={<Loading message="Loading authentication..." />}>
        {children}
      </Suspense>
    </div>
  );
} 