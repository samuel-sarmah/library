import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNotifications } from './useNotifications';

const mockLaunch = { name: 'Starlink 1', net: '2027-06-01T12:00:00Z' };

describe('useNotifications', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.stubGlobal('Notification', {
            permission: 'granted',
            requestPermission: vi.fn().mockResolvedValue('granted'),
        });
        vi.stubGlobal('alert', vi.fn());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('starts with no subscriptions', () => {
        const { result } = renderHook(() => useNotifications());
        expect(result.current.isSubscribed('any-id')).toBe(false);
    });

    it('reads existing subscriptions from localStorage on init', () => {
        localStorage.setItem('lt_notifications', JSON.stringify({
            'launch-1': { name: 'Test', net: '2027-06-01T00:00:00Z' },
        }));
        const { result } = renderHook(() => useNotifications());
        expect(result.current.isSubscribed('launch-1')).toBe(true);
    });

    it('subscribes when Notification permission is already granted', async () => {
        const { result } = renderHook(() => useNotifications());
        await act(() => result.current.toggle('launch-1', mockLaunch));
        expect(result.current.isSubscribed('launch-1')).toBe(true);
    });

    it('requests permission when it is "default" and subscribes on grant', async () => {
        vi.stubGlobal('Notification', {
            permission: 'default',
            requestPermission: vi.fn().mockResolvedValue('granted'),
        });
        const { result } = renderHook(() => useNotifications());
        await act(() => result.current.toggle('launch-1', mockLaunch));
        expect(result.current.isSubscribed('launch-1')).toBe(true);
    });

    it('does not subscribe when permission is denied', async () => {
        vi.stubGlobal('Notification', {
            permission: 'default',
            requestPermission: vi.fn().mockResolvedValue('denied'),
        });
        const { result } = renderHook(() => useNotifications());
        await act(() => result.current.toggle('launch-1', mockLaunch));
        expect(result.current.isSubscribed('launch-1')).toBe(false);
        expect(alert).toHaveBeenCalled();
    });

    it('alerts and does not subscribe when Notification API is unavailable', async () => {
        vi.stubGlobal('Notification', undefined);
        const { result } = renderHook(() => useNotifications());
        await act(() => result.current.toggle('launch-1', mockLaunch));
        expect(result.current.isSubscribed('launch-1')).toBe(false);
        expect(alert).toHaveBeenCalled();
    });

    it('unsubscribes on a second toggle', async () => {
        const { result } = renderHook(() => useNotifications());
        await act(() => result.current.toggle('launch-1', mockLaunch));
        await act(() => result.current.toggle('launch-1', mockLaunch));
        expect(result.current.isSubscribed('launch-1')).toBe(false);
    });

    it('stores name and net in localStorage after subscribing', async () => {
        const { result } = renderHook(() => useNotifications());
        await act(() => result.current.toggle('launch-1', mockLaunch));
        const stored = JSON.parse(localStorage.getItem('lt_notifications'));
        expect(stored['launch-1'].name).toBe('Starlink 1');
        expect(stored['launch-1'].net).toBe('2027-06-01T12:00:00Z');
    });

    it('removes entry from localStorage on unsubscribe', async () => {
        const { result } = renderHook(() => useNotifications());
        await act(() => result.current.toggle('launch-1', mockLaunch));
        await act(() => result.current.toggle('launch-1', mockLaunch));
        const stored = JSON.parse(localStorage.getItem('lt_notifications'));
        expect(stored['launch-1']).toBeUndefined();
    });

    it('handles corrupted localStorage gracefully', () => {
        localStorage.setItem('lt_notifications', '{bad json}');
        const { result } = renderHook(() => useNotifications());
        expect(result.current.isSubscribed('any')).toBe(false);
    });
});
