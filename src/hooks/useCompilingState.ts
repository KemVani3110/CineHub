'use client';

import { useEffect, useState } from 'react';

export const useCompilingState = () => {
  const [isCompiling, setIsCompiling] = useState(false);

  useEffect(() => {
    // Listen for Next.js compilation events
    const handleCompileStart = () => {
      setIsCompiling(true);
    };

    const handleCompileEnd = () => {
      setIsCompiling(false);
    };

    // Add event listeners for Next.js compilation events
    window.addEventListener('nextjs:compiling', handleCompileStart);
    window.addEventListener('nextjs:compiled', handleCompileEnd);

    // Cleanup
    return () => {
      window.removeEventListener('nextjs:compiling', handleCompileStart);
      window.removeEventListener('nextjs:compiled', handleCompileEnd);
    };
  }, []);

  return isCompiling;
}; 