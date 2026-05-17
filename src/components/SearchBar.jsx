import { useState } from 'react';

function SearchBar({ searchQuery, onSearchChange, filters, onFilterChange, sortOrder, onSortChange, filterOptions, resultsPerPage, onResultsPerPageChange, launchType, onLaunchTypeChange }) {
    const [filtersVisible, setFiltersVisible] = useState(false);

    return (
        <div className="w-full max-w-7xl mx-auto px-6 py-6 ">
            {/* Main row - responsive layout */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-4">
                {/* Left side: Launch type buttons */}
                <div className="flex bg-[#1a1a1a] rounded overflow-hidden">
                    <button
                        className={`px-3 py-2 text-sm font-medium transition-colors ${launchType === 'upcoming' ? 'bg-[#4da6ff] text-black' : 'bg-transparent text-gray-400 hover:text-white'}`}
                        onClick={() => onLaunchTypeChange('upcoming')}
                    >
                        Upcoming
                    </button>
                    <button
                        className={`px-3 py-2 text-sm font-medium transition-colors ${launchType === 'previous' ? 'bg-[#4da6ff] text-black' : 'bg-transparent text-gray-400 hover:text-white'}`}
                        onClick={() => onLaunchTypeChange('previous')}
                    >
                        Previous
                    </button>
                </div>
                
                {/* Right side: Search and filters - responsive */}
                <div className="flex items-center gap-3 flex-1 lg:flex-initial">
                    {/* Mobile/tablet: Search icon only */}
                    <svg className="w-4 h-4 text-gray-500 flex-shrink-0 lg:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    
                    {/* Search input - always visible but responsive */}
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full lg:w-64 px-3 py-2 bg-black text-white border border-[#333] rounded text-sm placeholder-gray-500 focus:outline-none focus:border-[#4da6ff]"
                    />
                    
                    {/* Filters button - desktop only */}
                    <button
                        className="hidden lg:flex items-center gap-2 px-3 py-2 bg-[#1a1a1a] border border-[#333] rounded text-sm text-gray-300 hover:bg-[#222] transition-colors"
                        onClick={() => setFiltersVisible(!filtersVisible)}
                    >
                        <span>Filters</span>
                        <span className={`transition-transform ${filtersVisible ? 'rotate-180' : ''}`}>▼</span>
                    </button>
                    
                    {/* Mobile filters button */}
                    <button
                        className="lg:hidden flex items-center gap-2 px-3 py-2 bg-[#1a1a1a] border border-[#333] rounded text-sm text-gray-300 hover:bg-[#222] transition-colors"
                        onClick={() => setFiltersVisible(!filtersVisible)}
                    >
                        <span>Filters</span>
                        <span className={`transition-transform ${filtersVisible ? 'rotate-180' : ''}`}>▼</span>
                    </button>
                </div>
            </div>
            
            {/* Filters section - shown when toggled */}
            {filtersVisible && (
                <div className="flex flex-wrap gap-2 px-6">
                    <select
                        value={filters.provider}
                        onChange={(e) => onFilterChange('provider', e.target.value)}
                        className="px-2 py-1.5 bg-black text-white border border-[#333] rounded text-sm cursor-pointer focus:outline-none focus:border-[#4da6ff]"
                    >
                        <option value="">All Providers</option>
                        {filterOptions.providers.map(provider => (
                            <option key={provider} value={provider}>{provider}</option>
                        ))}
                    </select>
                    <select
                        value={filters.rocket}
                        onChange={(e) => onFilterChange('rocket', e.target.value)}
                        className="px-2 py-1.5 bg-black text-white border border-[#333] rounded text-sm cursor-pointer focus:outline-none focus:border-[#4da6ff]"
                    >
                        <option value="">All Rockets</option>
                        {filterOptions.rockets.map(rocket => (
                            <option key={rocket} value={rocket}>{rocket}</option>
                        ))}
                    </select>
                    <select
                        value={filters.location}
                        onChange={(e) => onFilterChange('location', e.target.value)}
                        className="px-2 py-1.5 bg-black text-white border border-[#333] rounded text-sm cursor-pointer focus:outline-none focus:border-[#4da6ff]"
                    >
                        <option value="">All Locations</option>
                        {filterOptions.locations.map(location => (
                            <option key={location} value={location}>{location}</option>
                        ))}
                    </select>
                    <select
                        value={sortOrder}
                        onChange={(e) => onSortChange(e.target.value)}
                        className="px-2 py-1.5 bg-black text-white border border-[#333] rounded text-sm cursor-pointer focus:outline-none focus:border-[#4da6ff]"
                    >
                        <option value="date">Sort by Date</option>
                        <option value="name">Sort by Name</option>
                    </select>
                    <select
                        value={resultsPerPage}
                        onChange={(e) => onResultsPerPageChange(Number(e.target.value))}
                        className="px-2 py-1.5 bg-black text-white border border-[#333] rounded text-sm cursor-pointer focus:outline-none focus:border-[#4da6ff]"
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