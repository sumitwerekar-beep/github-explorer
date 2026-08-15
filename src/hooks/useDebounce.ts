import { useEffect, useState } from 'react';

/**
 * Custom hook to debounce any rapidly changing value
 * @param value The value to debounce (e.g. search input text)
 * @param delay Milliseconds to wait before updating (default: 400ms)
 */
export function useDebounce<T>(value: T, delay = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
