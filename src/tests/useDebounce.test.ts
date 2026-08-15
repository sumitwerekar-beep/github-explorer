import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useDebounce } from '../hooks/useDebounce';

describe('useDebounce Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 400));
    expect(result.current).toBe('initial');
  });

  it('updates debounced value only after the specified delay', () => {
    const { result, rerender } = renderHook(({ val }) => useDebounce(val, 400), {
      initialProps: { val: 'first' },
    });

    expect(result.current).toBe('first');

    // Update prop
    rerender({ val: 'second' });
    expect(result.current).toBe('first'); // Still first before delay

    // Fast-forward 200ms
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe('first');

    // Fast-forward remaining 200ms (total 400ms)
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe('second');
  });

  it('resets timer on rapid consecutive changes (debounce behavior)', () => {
    const { result, rerender } = renderHook(({ val }) => useDebounce(val, 400), {
      initialProps: { val: 'a' },
    });

    rerender({ val: 'ab' });
    act(() => {
      vi.advanceTimersByTime(200);
    });

    rerender({ val: 'abc' });
    act(() => {
      vi.advanceTimersByTime(200);
    });

    rerender({ val: 'abcd' });
    expect(result.current).toBe('a');

    // Advance 400ms from last keystroke
    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(result.current).toBe('abcd');
  });
});
