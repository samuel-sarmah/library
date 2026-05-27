import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchBar from './SearchBar';

const defaultProps = {
    searchQuery: '',
    onSearchChange: vi.fn(),
    filters: { provider: '', rocket: '', location: '' },
    onFilterChange: vi.fn(),
    sortOrder: 'date',
    onSortChange: vi.fn(),
    filterOptions: {
        providers: ['SpaceX', 'NASA'],
        rockets: ['Falcon 9', 'SLS'],
        locations: ['Cape Canaveral', 'Vandenberg'],
    },
    resultsPerPage: 15,
    onResultsPerPageChange: vi.fn(),
    launchType: 'upcoming',
    onLaunchTypeChange: vi.fn(),
};

describe('SearchBar', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders Upcoming and Previous type buttons', () => {
        render(<SearchBar {...defaultProps} />);
        expect(screen.getByRole('button', { name: 'Upcoming' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Previous' })).toBeInTheDocument();
    });

    it('calls onLaunchTypeChange("previous") when Previous is clicked', () => {
        const onLaunchTypeChange = vi.fn();
        render(<SearchBar {...defaultProps} onLaunchTypeChange={onLaunchTypeChange} />);
        fireEvent.click(screen.getByRole('button', { name: 'Previous' }));
        expect(onLaunchTypeChange).toHaveBeenCalledWith('previous');
    });

    it('calls onLaunchTypeChange("upcoming") when Upcoming is clicked', () => {
        const onLaunchTypeChange = vi.fn();
        render(<SearchBar {...defaultProps} launchType="previous" onLaunchTypeChange={onLaunchTypeChange} />);
        fireEvent.click(screen.getByRole('button', { name: 'Upcoming' }));
        expect(onLaunchTypeChange).toHaveBeenCalledWith('upcoming');
    });

    it('renders the search input', () => {
        render(<SearchBar {...defaultProps} />);
        expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    });

    it('reflects the current searchQuery value in the input', () => {
        render(<SearchBar {...defaultProps} searchQuery="falcon" />);
        expect(screen.getByPlaceholderText('Search...')).toHaveValue('falcon');
    });

    it('calls onSearchChange when the user types in the search box', () => {
        const onSearchChange = vi.fn();
        render(<SearchBar {...defaultProps} onSearchChange={onSearchChange} />);
        fireEvent.change(screen.getByPlaceholderText('Search...'), { target: { value: 'spacex' } });
        expect(onSearchChange).toHaveBeenCalledWith('spacex');
    });

    it('hides filter dropdowns by default', () => {
        render(<SearchBar {...defaultProps} />);
        expect(screen.queryAllByRole('combobox')).toHaveLength(0);
    });

    it('shows filter dropdowns after the Filters button is clicked', () => {
        render(<SearchBar {...defaultProps} />);
        fireEvent.click(screen.getAllByRole('button', { name: /filters/i })[0]);
        expect(screen.getAllByRole('combobox').length).toBeGreaterThan(0);
    });

    it('populates provider options from filterOptions', () => {
        render(<SearchBar {...defaultProps} />);
        fireEvent.click(screen.getAllByRole('button', { name: /filters/i })[0]);
        expect(screen.getByRole('option', { name: 'SpaceX' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'NASA' })).toBeInTheDocument();
    });

    it('populates rocket options from filterOptions', () => {
        render(<SearchBar {...defaultProps} />);
        fireEvent.click(screen.getAllByRole('button', { name: /filters/i })[0]);
        expect(screen.getByRole('option', { name: 'Falcon 9' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'SLS' })).toBeInTheDocument();
    });

    it('calls onFilterChange when a provider is selected', () => {
        const onFilterChange = vi.fn();
        render(<SearchBar {...defaultProps} onFilterChange={onFilterChange} />);
        fireEvent.click(screen.getAllByRole('button', { name: /filters/i })[0]);
        const [providerSelect] = screen.getAllByRole('combobox');
        fireEvent.change(providerSelect, { target: { value: 'SpaceX' } });
        expect(onFilterChange).toHaveBeenCalledWith('provider', 'SpaceX');
    });

    it('calls onSortChange when sort order is changed', () => {
        const onSortChange = vi.fn();
        render(<SearchBar {...defaultProps} onSortChange={onSortChange} />);
        fireEvent.click(screen.getAllByRole('button', { name: /filters/i })[0]);
        const sortSelect = screen.getByRole('option', { name: 'Sort by Name' }).closest('select');
        fireEvent.change(sortSelect, { target: { value: 'name' } });
        expect(onSortChange).toHaveBeenCalledWith('name');
    });

    it('collapses filters when Filters button is clicked a second time', () => {
        render(<SearchBar {...defaultProps} />);
        const btn = screen.getAllByRole('button', { name: /filters/i })[0];
        fireEvent.click(btn);
        expect(screen.getAllByRole('combobox').length).toBeGreaterThan(0);
        fireEvent.click(btn);
        expect(screen.queryAllByRole('combobox')).toHaveLength(0);
    });
});
