'use client';

import Image from 'next/image';

interface CompilingOverlayProps {
  message?: string;
}

const CompilingOverlay = ({ message = "Please wait while we update your application..." }: CompilingOverlayProps) => {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
      <div className="flex flex-col items-center justify-center gap-6">
        {/* Logo with animation */}
        <div className="relative w-16 h-16">
          <Image
            src="/logo.png"
            alt="CineHub Logo"
            width={64}
            height={64}
            className="animate-spin rounded-full"
          />
        </div>

        {/* Loading Text */}
        <div className="text-center space-y-2 animate-fade-in-up">
          <h3 className="text-xl font-semibold text-primary">
            Loading Changes
          </h3>
          <p className="text-muted-foreground">
            {message}
          </p>
        </div>

        {/* Loading Dots */}
        <div className="flex space-x-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-primary animate-pulse"
              style={{
                animationDelay: `${i * 0.2}s`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompilingOverlay; 