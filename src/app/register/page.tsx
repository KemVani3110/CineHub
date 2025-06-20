"use client"

import { RegisterForm, withLazyLoading } from '@/components/lazy';

const LazyRegisterForm = withLazyLoading(RegisterForm);

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-x-32 -translate-y-32" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl translate-x-32 translate-y-32" />
      
      <div className="relative z-10">
        <LazyRegisterForm />
      </div>
    </div>
  );
} 