'use client';

import React from 'react';
import { useLoadingState } from './useLoadingState';
import Loading from '@/components/common/Loading';

interface WithLoadingProps {
  loadingKey: string;
  children: React.ReactNode;
  loadingMessage?: string;
  showBackdrop?: boolean;
}

export const WithLoading: React.FC<WithLoadingProps> = ({
  loadingKey,
  children,
  loadingMessage = 'Loading...',
  showBackdrop = true
}) => {
  const { isLoading } = useLoadingState();

  if (isLoading(loadingKey)) {
    return <Loading message={loadingMessage} showBackdrop={showBackdrop} />;
  }

  return <>{children}</>;
};

export const withLoading = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  loadingKey: string,
  loadingMessage?: string,
  showBackdrop?: boolean
) => {
  return (props: P) => (
    <WithLoading loadingKey={loadingKey} loadingMessage={loadingMessage} showBackdrop={showBackdrop}>
      <WrappedComponent {...props} />
    </WithLoading>
  );
}; 