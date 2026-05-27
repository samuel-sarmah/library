import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LaunchCard from './LaunchCard';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return { ...actual, useNavigate: () => mockNavigate };
});

// Two days out — not "launching soon", has window data
const NET = new Date(Date.now() + 2 * 86400_000).toISOString();

const baseLaunch = {
    id: 'launch-abc',
    name: 'SpaceX | Starlink Group 10-1',
    net: NET,
    status: { name: 'Go for Launch' },
    launch_service_provider: { name: 'SpaceX' },
    mission: { name: 'Starlink Group 10-1' },
    rocket: { configuration: { name: 'Falcon 9' } },
    pad: { location: { name: 'Cape Canaveral' } },
    image: { thumbnail_url: null, image_url: null },
    video_urls: [],
};

const renderCard = (overrides = {}, launchType = 'upcoming') =>
    render(
        <MemoryRouter>
            <LaunchCard launch={{ ...baseLaunch, ...overrides }} launchType={launchType} />
        </MemoryRouter>
    );

describe('LaunchCard', () => {
    beforeEach(() => {
        mockNavigate.mockClear();
        localStorage.clear();
    });

    it('renders the mission name from mission.name', () => {
        renderCard();
        expect(screen.getByText('Starlink Group 10-1')).toBeInTheDocument();
    });

    it('derives mission name from the launch name pipe when mission is absent', () => {
        renderCard({ mission: null, name: 'Provider | My Custom Mission' });
        expect(screen.getByText('My Custom Mission')).toBeInTheDocument();
    });

    it('shows "Payload TBD" when there is no mission and no pipe in the name', () => {
        renderCard({ mission: null, name: 'NoPipeHere' });
        expect(screen.getByText('Payload TBD')).toBeInTheDocument();
    });

    it('renders the provider name', () => {
        renderCard();
        expect(screen.getByText('SpaceX')).toBeInTheDocument();
    });

    it('shows a GO badge for a Go-status launch', () => {
        renderCard({ status: { name: 'Go for Launch' } });
        expect(screen.getByText('GO')).toBeInTheDocument();
    });

    it('shows a GO badge for "In Flight" status', () => {
        renderCard({ status: { name: 'In Flight' } });
        expect(screen.getByText('GO')).toBeInTheDocument();
    });

    it('shows a TBD badge for a non-Go status', () => {
        renderCard({ status: { name: 'To Be Confirmed' } });
        expect(screen.getByText('TBD')).toBeInTheDocument();
    });

    it('does not render a status badge for previous launches', () => {
        renderCard({}, 'previous');
        expect(screen.queryByText('GO')).not.toBeInTheDocument();
        expect(screen.queryByText('TBD')).not.toBeInTheDocument();
    });

    it('navigates to the detail page when the card is clicked', () => {
        renderCard();
        fireEvent.click(screen.getByText('Starlink Group 10-1'));
        expect(mockNavigate).toHaveBeenCalledWith('/launch/launch-abc', expect.any(Object));
    });

    it('passes the launch object in navigation state', () => {
        renderCard();
        fireEvent.click(screen.getByText('Starlink Group 10-1'));
        expect(mockNavigate).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({ state: expect.objectContaining({ launch: expect.any(Object) }) })
        );
    });

    it('renders the Save button', () => {
        renderCard();
        expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });

    it('renders the Notify button for upcoming launches', () => {
        renderCard();
        expect(screen.getByRole('button', { name: /notify/i })).toBeInTheDocument();
    });

    it('does not render the Notify button for previous launches', () => {
        renderCard({}, 'previous');
        expect(screen.queryByRole('button', { name: /notify/i })).not.toBeInTheDocument();
    });

    it('shows Watch Live when exactly one video URL is provided', () => {
        renderCard({ video_urls: [{ url: 'https://youtube.com/watch?v=x', title: 'SpaceX Stream' }] });
        expect(screen.getByText(/watch launch live/i)).toBeInTheDocument();
    });

    it('does not show Watch Live when there are no video URLs', () => {
        renderCard({ video_urls: [] });
        expect(screen.queryByText(/watch launch live/i)).not.toBeInTheDocument();
    });

    it('clicking Save does not trigger card navigation', () => {
        renderCard();
        fireEvent.click(screen.getByRole('button', { name: /save/i }));
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('shows the "Saved" label after toggling watchlist', () => {
        renderCard();
        fireEvent.click(screen.getByRole('button', { name: /save/i }));
        expect(screen.getByRole('button', { name: /saved/i })).toBeInTheDocument();
    });

    it('shows the launch countdown (Hrs / Mins)', () => {
        renderCard();
        expect(screen.getByText('Hrs')).toBeInTheDocument();
        expect(screen.getByText('Mins')).toBeInTheDocument();
    });
});
