"use client"

import { LoginForm, withLazyLoading } from '@/components/lazy';

const LazyLoginForm = withLazyLoading(LoginForm);

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 space-y-8">
        <LazyLoginForm />
      </div>
    </div>
  );
} 