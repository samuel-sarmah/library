import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NewsHighlight from './NewsHighlight';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return { ...actual, useNavigate: () => mockNavigate };
});

const articles = [
    { id: 1, title: 'Mars Mission Announced', news_site: 'NASA', published_at: '2026-05-01T00:00:00Z', image_url: null, url: 'https://nasa.gov/1', summary: 'Summary 1' },
    { id: 2, title: 'SpaceX Launches Starship', news_site: 'SpaceNews', published_at: '2026-05-02T00:00:00Z', image_url: null, url: 'https://spacenews.com/2', summary: 'Summary 2' },
    { id: 3, title: 'Artemis Update', news_site: 'NASASpaceflight', published_at: '2026-05-03T00:00:00Z', image_url: 'https://img.example.com/art.jpg', url: 'https://nasaspaceflight.com/3', summary: 'Summary 3' },
];

const okFetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ results: articles }),
});

describe('NewsHighlight', () => {
    beforeEach(() => {
        mockNavigate.mockClear();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('shows skeleton cards while loading', () => {
        vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {}))); // never resolves
        const { container } = render(<MemoryRouter><NewsHighlight /></MemoryRouter>);
        expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    it('renders the SPACE NEWS label after loading', async () => {
        vi.stubGlobal('fetch', okFetch);
        render(<MemoryRouter><NewsHighlight /></MemoryRouter>);
        await waitFor(() => expect(screen.getByText('Space News')).toBeInTheDocument());
    });

    it('renders article titles', async () => {
        vi.stubGlobal('fetch', okFetch);
        render(<MemoryRouter><NewsHighlight /></MemoryRouter>);
        await waitFor(() => {
            expect(screen.getByText('Mars Mission Announced')).toBeInTheDocument();
            expect(screen.getByText('SpaceX Launches Starship')).toBeInTheDocument();
        });
    });

    it('renders news site names', async () => {
        vi.stubGlobal('fetch', okFetch);
        render(<MemoryRouter><NewsHighlight /></MemoryRouter>);
        await waitFor(() => {
            expect(screen.getByText('NASA')).toBeInTheDocument();
            expect(screen.getByText('SpaceNews')).toBeInTheDocument();
        });
    });

    it('renders article links that open in a new tab', async () => {
        vi.stubGlobal('fetch', okFetch);
        render(<MemoryRouter><NewsHighlight /></MemoryRouter>);
        await waitFor(() => screen.getByText('Mars Mission Announced'));
        const links = screen.getAllByRole('link');
        links.forEach(link => expect(link).toHaveAttribute('target', '_blank'));
    });

    it('renders correct href on article cards', async () => {
        vi.stubGlobal('fetch', okFetch);
        render(<MemoryRouter><NewsHighlight /></MemoryRouter>);
        await waitFor(() => screen.getByText('Mars Mission Announced'));
        const firstLink = screen.getAllByRole('link')[0];
        expect(firstLink).toHaveAttribute('href', 'https://nasa.gov/1');
    });

    it('navigates to /news when "See More" is clicked', async () => {
        vi.stubGlobal('fetch', okFetch);
        render(<MemoryRouter><NewsHighlight /></MemoryRouter>);
        await waitFor(() => screen.getByText('See More'));
        fireEvent.click(screen.getByText('See More'));
        expect(mockNavigate).toHaveBeenCalledWith('/news');
    });

    it('renders nothing (null) when the fetch fails', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network down')));
        const { container } = render(<MemoryRouter><NewsHighlight /></MemoryRouter>);
        await waitFor(() => {
            expect(container.firstChild).toBeNull();
        });
    });

    it('falls back to the direct SNAPI URL when the proxy call fails', async () => {
        const fetchMock = vi.fn()
            .mockRejectedValueOnce(new Error('Proxy error'))
            .mockResolvedValueOnce({ ok: true, json: async () => ({ results: articles }) });
        vi.stubGlobal('fetch', fetchMock);
        render(<MemoryRouter><NewsHighlight /></MemoryRouter>);
        await waitFor(() => screen.getByText('Mars Mission Announced'));
        expect(fetchMock).toHaveBeenCalledTimes(2);
        // Second call should be the direct SNAPI URL
        expect(fetchMock.mock.calls[1][0]).toContain('spaceflightnewsapi.net');
    });

    it('hides skeleton after articles load', async () => {
        vi.stubGlobal('fetch', okFetch);
        const { container } = render(<MemoryRouter><NewsHighlight /></MemoryRouter>);
        await waitFor(() => screen.getByText('Mars Mission Announced'));
        expect(container.querySelector('.animate-pulse')).not.toBeInTheDocument();
    });
});
