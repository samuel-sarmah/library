import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWatchlist } from './useWatchlist';

describe('useWatchlist', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('starts empty when localStorage has no data', () => {
        const { result } = renderHook(() => useWatchlist());
        expect(result.current.watchedIds).toEqual([]);
    });

    it('reads an existing watchlist from localStorage on init', () => {
        localStorage.setItem('lt_watchlist', JSON.stringify(['launch-1', 'launch-2']));
        const { result } = renderHook(() => useWatchlist());
        expect(result.current.isWatched('launch-1')).toBe(true);
        expect(result.current.isWatched('launch-2')).toBe(true);
    });

    it('toggle adds a new id', () => {
        const { result } = renderHook(() => useWatchlist());
        act(() => result.current.toggle('launch-1'));
        expect(result.current.isWatched('launch-1')).toBe(true);
        expect(result.current.watchedIds).toContain('launch-1');
    });

    it('toggle removes an already-watched id', () => {
        const { result } = renderHook(() => useWatchlist());
        act(() => result.current.toggle('launch-1'));
        act(() => result.current.toggle('launch-1'));
        expect(result.current.isWatched('launch-1')).toBe(false);
        expect(result.current.watchedIds).not.toContain('launch-1');
    });

    it('isWatched returns false for an unknown id', () => {
        const { result } = renderHook(() => useWatchlist());
        expect(result.current.isWatched('not-here')).toBe(false);
    });

    it('persists the watchlist to localStorage after toggle', () => {
        const { result } = renderHook(() => useWatchlist());
        act(() => result.current.toggle('launch-42'));
        const stored = JSON.parse(localStorage.getItem('lt_watchlist'));
        expect(stored).toContain('launch-42');
    });

    it('persists removal to localStorage', () => {
        localStorage.setItem('lt_watchlist', JSON.stringify(['launch-1']));
        const { result } = renderHook(() => useWatchlist());
        act(() => result.current.toggle('launch-1'));
        const stored = JSON.parse(localStorage.getItem('lt_watchlist'));
        expect(stored).not.toContain('launch-1');
    });

    it('handles corrupted localStorage gracefully', () => {
        localStorage.setItem('lt_watchlist', 'not-valid-json');
        const { result } = renderHook(() => useWatchlist());
        expect(result.current.watchedIds).toEqual([]);
    });

    it('tracks multiple independent ids', () => {
        const { result } = renderHook(() => useWatchlist());
        act(() => result.current.toggle('a'));
        act(() => result.current.toggle('b'));
        act(() => result.current.toggle('c'));
        expect(result.current.watchedIds).toHaveLength(3);
        expect(result.current.isWatched('b')).toBe(true);
    });

    it('watchedIds reflects the current set correctly', () => {
        const { result } = renderHook(() => useWatchlist());
        act(() => result.current.toggle('x'));
        act(() => result.current.toggle('y'));
        act(() => result.current.toggle('x')); // remove x
        expect(result.current.watchedIds).toEqual(['y']);
    });
});
