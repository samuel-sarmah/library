import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'lt_notifications';

function readStorage() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch {
        return {};
    }
}

export function useNotifications() {
    const [subs, setSubs] = useState(readStorage);

    // Cross-tab sync
    useEffect(() => {
        const handler = (e) => {
            if (e.key === STORAGE_KEY) setSubs(readStorage());
        };
        window.addEventListener('storage', handler);
        return () => window.removeEventListener('storage', handler);
    }, []);

    // Persist to localStorage after every state change
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(subs));
    }, [subs]);

    const isSubscribed = useCallback((id) => Boolean(subs[id]), [subs]);

    const toggle = useCallback(async (id, launch) => {
        if (subs[id]) {
            setSubs((prev) => {
                const next = { ...prev };
                delete next[id];
                return next;
            });
            return;
        }

        if (typeof Notification === 'undefined') {
            alert('Browser notifications are not supported in this browser.');
            return;
        }

        let permission = Notification.permission;
        if (permission === 'default') {
            permission = await Notification.requestPermission();
        }

        if (permission === 'denied') {
            alert('Notifications are blocked. Enable them in your browser settings to receive launch alerts.');
            return;
        }

        setSubs((prev) => ({
            ...prev,
            [id]: { name: launch.name, net: launch.net },
        }));
    }, [subs]);

    return { isSubscribed, toggle };
}
