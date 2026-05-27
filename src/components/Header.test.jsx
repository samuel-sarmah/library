import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from './Header';

const renderHeader = (path = '/') =>
    render(
        <MemoryRouter initialEntries={[path]}>
            <Header />
        </MemoryRouter>
    );

describe('Header', () => {
    it('renders the LaunchTracker brand name', () => {
        renderHeader();
        expect(screen.getByText('LaunchTracker')).toBeInTheDocument();
    });

    it('renders the "Mission Status" subtitle', () => {
        renderHeader();
        expect(screen.getByText(/mission status/i)).toBeInTheDocument();
    });

    it('renders a News navigation link', () => {
        renderHeader();
        const link = screen.getByRole('link', { name: /^news$/i });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', '/news');
    });

    it('brand name links to the home route', () => {
        renderHeader();
        const homeLink = screen.getByRole('link', { name: /launchtracker/i });
        expect(homeLink).toHaveAttribute('href', '/');
    });

    it('highlights the News link when the current path is /news', () => {
        renderHeader('/news');
        const newsLink = screen.getByRole('link', { name: /^news$/i });
        expect(newsLink.className).toMatch(/text-\[#4da6ff\]/);
    });

    it('does not apply the active style on the News link when on the home page', () => {
        renderHeader('/');
        const newsLink = screen.getByRole('link', { name: /^news$/i });
        // Active class should not be present
        expect(newsLink.className).not.toMatch(/bg-\[#4da6ff\]\/10/);
    });

    it('header is sticky (has sticky class)', () => {
        renderHeader();
        const header = screen.getByRole('banner');
        expect(header.className).toContain('sticky');
    });
});
