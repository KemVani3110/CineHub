'use client';

import { useCallback } from 'react';
import { useLoadingState } from './useLoadingState';

interface ApiOptions {
  loadingKey: string;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export const useApi = () => {
  const { setLoading } = useLoadingState();

  const callApi = useCallback(async <T>(
    url: string,
    options: RequestInit & ApiOptions
  ): Promise<T> => {
    const { loadingKey, onSuccess, onError, ...fetchOptions } = options;

    try {
      setLoading(loadingKey, true);
      const response = await fetch(url, fetchOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      onSuccess?.(data);
      return data;
    } catch (error) {
      onError?.(error);
      throw error;
    } finally {
      setLoading(loadingKey, false);
    }
  }, [setLoading]);

  return { callApi };
}; 