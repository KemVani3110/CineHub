"use client"

import { RegisterForm, withLazyLoading } from '@/components/lazy';

const LazyRegisterForm = withLazyLoading(RegisterForm);

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 space-y-8">
        <LazyRegisterForm />
      </div>
    </div>
  );
} 