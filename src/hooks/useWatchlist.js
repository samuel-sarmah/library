import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'lt_watchlist';

function readStorage() {
    try {
        return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
    } catch {
        return new Set();
    }
}

export function useWatchlist() {
    const [watched, setWatched] = useState(readStorage);

    // Cross-tab sync (native storage events only fire in other tabs)
    useEffect(() => {
        const handler = (e) => {
            if (e.key === STORAGE_KEY) setWatched(readStorage());
        };
        window.addEventListener('storage', handler);
        return () => window.removeEventListener('storage', handler);
    }, []);

    // Persist to localStorage after every state change
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...watched]));
    }, [watched]);

    const toggle = useCallback((id) => {
        setWatched((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }, []);

    return {
        isWatched: (id) => watched.has(id),
        toggle,
        watchedIds: [...watched],
    };
}
