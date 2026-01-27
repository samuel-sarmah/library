import { useState, useEffect, useMemo } from "react";
import Header from './Header';
import SearchBar from './SearchBar';
import LaunchCard from './LaunchCard';
import '../styles/LaunchList.css';

function LaunchList() {
    const [launches, setLaunches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        provider: '',
        rocket: '',
        location: ''
    });
    const [sortOrder, setSortOrder] = useState('date');
    const [currentPage, setCurrentPage] = useState(1);
    const [resultsPerPage, setResultsPerPage] = useState(15);
    const [launchType, setLaunchType] = useState('upcoming');

    useEffect(() => {
        setLoading(true);
        const endpoint = launchType === 'upcoming' 
            ? 'https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=100'
            : 'https://ll.thespacedevs.com/2.2.0/launch/previous/?limit=100';
        
        fetch(endpoint)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // Check if data has expected properties (not a rate limit error)
                if (data.detail || !data.results) {
                    throw new Error(data.detail || 'Invalid response from API');
                }
                setLaunches(data.results);
                setLoading(false);
            })
            .catch(err => {
                console.error('API Error:', err);
                alert(`Sorry, ${err.message}. You may have hit the API rate limit - please wait and try again.`);
                setLoading(false);
            });
    }, [launchType]);

    const filterOptions = useMemo(() => {
        const providers = [...new Set(launches.map(l => l.launch_service_provider?.name).filter(Boolean))].sort();
        const rockets = [...new Set(launches.map(l => l.rocket?.configuration?.name).filter(Boolean))].sort();
        const locations = [...new Set(launches.map(l => l.pad?.location?.name).filter(Boolean))].sort();
        return { providers, rockets, locations };
    }, [launches]);

    const filteredAndSortedLaunches = useMemo(() => {
        let filtered = launches;

        if (filters.provider) {
            filtered = filtered.filter(launch => 
                launch.launch_service_provider?.name === filters.provider
            );
        }
        if (filters.rocket) {
            filtered = filtered.filter(launch => 
                launch.rocket?.configuration?.name === filters.rocket
            );
        }
        if (filters.location) {
            filtered = filtered.filter(launch => 
                launch.pad?.location?.name === filters.location
            );
        }

        const sorted = [...filtered].sort((a, b) => {
            if (sortOrder === 'date') {
                return new Date(a.net) - new Date(b.net);
            } else if (sortOrder === 'name') {
                return a.name?.localeCompare(b.name) || 0;
            }
            return 0;
        });

        return sorted;
    }, [launches, filters, sortOrder]);

    const totalPages = Math.ceil(filteredAndSortedLaunches.length / resultsPerPage);
    const paginatedLaunches = filteredAndSortedLaunches.slice(
        (currentPage - 1) * resultsPerPage,
        currentPage * resultsPerPage
    );

    const featuredMission = useMemo(() => {
        return launches.find(launch => 
            launch.name?.toLowerCase().includes('artemis ii') || 
            launch.name?.toLowerCase().includes('artemis 2')
        );
    }, [launches]);

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({ ...prev, [filterType]: value }));
        setCurrentPage(1);
    };

    const handleResultsPerPageChange = (value) => {
        setResultsPerPage(value);
        setCurrentPage(1);
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleLaunchTypeChange = (type) => {
        setLaunchType(type);
        setCurrentPage(1);
        setFilters({ provider: '', rocket: '', location: '' });
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p className="loading-text">Loading launches....</p>
            </div>
        );
    }

    return (
        <>
            <Header />
            <div className="launch-list-container">
                <h1 className="launch-title">
                    {launchType === 'upcoming' ? 'Upcoming Space Launches' : 'Previous Space Launches'}
                </h1>

                <SearchBar
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    sortOrder={sortOrder}
                    onSortChange={setSortOrder}
                    filterOptions={filterOptions}
                    resultsPerPage={resultsPerPage}
                    onResultsPerPageChange={handleResultsPerPageChange}
                    launchType={launchType}
                    onLaunchTypeChange={handleLaunchTypeChange}
                />

                {paginatedLaunches.length === 0 && !loading && (
                    <div className="no-results">
                        <p>No launches found matching your filters.</p>
                    </div>
                )}

                <div className="launch-list">
                    {paginatedLaunches.map(launch => (
                        <LaunchCard key={launch.id} launch={launch} />
                    ))}
                </div>

                {totalPages > 1 && (
                    <div className="pagination">
                        <button
                            className="pagination-btn"
                            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        <span className="pagination-info">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            className="pagination-btn"
                            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}

export default LaunchList;