import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';

// Clean up mocks after each test run
afterEach(() => {
  vi.clearAllMocks();
  if (typeof window !== 'undefined') {
    localStorage.clear();
  }
});
