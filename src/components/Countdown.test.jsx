import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import Countdown from './Countdown';

const future = (ms) => new Date(Date.now() + ms).toISOString();
const past = () => new Date(Date.now() - 1000).toISOString();

afterEach(() => {
    vi.useRealTimers();
});

describe('Countdown — compact variant', () => {
    it('shows "Launched" for a past date', () => {
        render(<Countdown launchDate={past()} />);
        expect(screen.getByText('Launched')).toBeInTheDocument();
    });

    it('shows Hrs / Mins / Secs for a future date', () => {
        render(<Countdown launchDate={future(2 * 3600_000)} />);
        expect(screen.getByText('Hrs')).toBeInTheDocument();
        expect(screen.getByText('Mins')).toBeInTheDocument();
        expect(screen.getByText('Secs')).toBeInTheDocument();
    });

    it('shows Days when more than 24 h remain', () => {
        render(<Countdown launchDate={future(3 * 86400_000)} />);
        expect(screen.getByText('Days')).toBeInTheDocument();
    });

    it('hides Days when less than 24 h remain', () => {
        render(<Countdown launchDate={future(2 * 3600_000)} />);
        expect(screen.queryByText('Days')).not.toBeInTheDocument();
    });

    it('pads single-digit hours with a leading zero', () => {
        // 1 hour + 5 minutes = 1 h 5 min
        render(<Countdown launchDate={future(65 * 60_000)} />);
        expect(screen.getByText('01')).toBeInTheDocument();
    });

    it('transitions to Launched after the countdown reaches zero', async () => {
        vi.useFakeTimers();
        render(<Countdown launchDate={future(500)} />);
        await act(async () => { vi.advanceTimersByTime(3000); });
        expect(screen.getByText('Launched')).toBeInTheDocument();
    });
});

describe('Countdown — prominent variant', () => {
    it('shows "Launched" for a past date', () => {
        render(<Countdown launchDate={past()} prominent />);
        expect(screen.getByText('Launched')).toBeInTheDocument();
    });

    it('shows T- prefix when showTPrefix is true', () => {
        render(<Countdown launchDate={future(3600_000)} prominent showTPrefix />);
        expect(screen.getByText('T-')).toBeInTheDocument();
    });

    it('does not show T- prefix when showTPrefix is false', () => {
        render(<Countdown launchDate={future(3600_000)} prominent />);
        expect(screen.queryByText('T-')).not.toBeInTheDocument();
    });

    it('shows Hrs / Mins / Secs segments', () => {
        render(<Countdown launchDate={future(2 * 3600_000)} prominent />);
        expect(screen.getByText('Hrs')).toBeInTheDocument();
        expect(screen.getByText('Mins')).toBeInTheDocument();
        expect(screen.getByText('Secs')).toBeInTheDocument();
    });

    it('shows rocket config info alongside Launched status', () => {
        const rocket = { configuration: { name: 'Falcon 9', length: 70, launch_mass: 549, reusable: true } };
        render(<Countdown launchDate={past()} prominent rocket={rocket} />);
        expect(screen.getByText('Falcon 9')).toBeInTheDocument();
        expect(screen.getByText(/70m/)).toBeInTheDocument();
        expect(screen.getByText(/549t/)).toBeInTheDocument();
        expect(screen.getByText(/Reusable/)).toBeInTheDocument();
    });
});
