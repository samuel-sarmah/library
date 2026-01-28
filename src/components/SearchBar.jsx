import { useState } from 'react';
import './SearchBar.css';

function SearchBar({ filters, onFilterChange, sortOrder, onSortChange, filterOptions, resultsPerPage, onResultsPerPageChange, launchType, onLaunchTypeChange }) {
    const [filtersVisible, setFiltersVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <div className="filter-wrapper">
            <div className="search-filter-row">
                <div className="launch-type-toggle">
                    <button
                        className={`launch-type-btn ${launchType === 'upcoming' ? 'active' : ''}`}
                        onClick={() => onLaunchTypeChange('upcoming')}
                    >
                        Upcoming
                    </button>
                    <button
                        className={`launch-type-btn ${launchType === 'previous' ? 'active' : ''}`}
                        onClick={() => onLaunchTypeChange('previous')}
                    >
                        Previous
                    </button>
                </div>
                
                <div className="search-input-wrapper">
                    <input
                        type="text"
                        placeholder="Search launches..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                </div>
            </div>

            <button
                className="filter-toggle"
                onClick={() => setFiltersVisible(!filtersVisible)}
            >
                <span>Toggle Filters</span>
                <span className={`filter-toggle-icon ${filtersVisible ? 'open' : ''}`}>▼</span>
            </button>
            {filtersVisible && (
                <div className="filter-controls">
                    <select
                        value={filters.provider}
                        onChange={(e) => onFilterChange('provider', e.target.value)}
                        className="filter-select"
                    >
                        <option value="">All Providers</option>
                        {filterOptions.providers.map(provider => (
                            <option key={provider} value={provider}>{provider}</option>
                        ))}
                    </select>
                    <select
                        value={filters.rocket}
                        onChange={(e) => onFilterChange('rocket', e.target.value)}
                        className="filter-select"
                    >
                        <option value="">All Rockets</option>
                        {filterOptions.rockets.map(rocket => (
                            <option key={rocket} value={rocket}>{rocket}</option>
                        ))}
                    </select>
                    <select
                        value={filters.location}
                        onChange={(e) => onFilterChange('location', e.target.value)}
                        className="filter-select"
                    >
                        <option value="">All Locations</option>
                        {filterOptions.locations.map(location => (
                            <option key={location} value={location}>{location}</option>
                        ))}
                    </select>
                    <select
                        value={sortOrder}
                        onChange={(e) => onSortChange(e.target.value)}
                        className="filter-select"
                    >
                        <option value="date">Sort by Date</option>
                        <option value="name">Sort by Name</option>
                    </select>
                    <select
                        value={resultsPerPage}
                        onChange={(e) => onResultsPerPageChange(Number(e.target.value))}
                        className="filter-select"
                    >
                        <option value={10}>10 per page</option>
                        <option value={20}>20 per page</option>
                        <option value={30}>30 per page</option>
                        <option value={50}>50 per page</option>
                    </select>
                </div>
            )}
        </div>
    );
}

export default SearchBar;