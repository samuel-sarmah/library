import { useState, useEffect, useMemo } from "react";
import Header from './Header';
import SearchBar from './SearchBar';
import LaunchCard from './LaunchCard';

// In-memory cache to avoid refetching on every navigation
const launchCache = {
    upcoming: { data: null, timestamp: 0 },
    previous: { data: null, timestamp: 0 },
};
const CACHE_TTL = 60_000; // 1 minute

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
        const controller = new AbortController();
        const cached = launchCache[launchType];
        const cacheAge = Date.now() - cached.timestamp;
        const isCacheFresh = cached.data && cacheAge < CACHE_TTL;

        // If we have cached data, show it immediately
        if (cached.data) {
            setLaunches(cached.data);
            setLoading(false);

            // If cache is still fresh, skip the fetch entirely
            if (isCacheFresh) return;
        }
        
        const fetchData = async () => {
            try {
                if (!cached.data) setLoading(true);
                const endpoint = `/api/launches?type=${launchType}&limit=50`;
                
                const response = await fetch(endpoint, { signal: controller.signal });
                
                if (!response.ok) {
                    const errorData = await response.json().catch(() => null);
                    throw new Error(errorData?.error || errorData?.detail || `API error: ${response.status}`);
                }
                
                const data = await response.json();
                
                if (data.detail || !data.results) {
                    throw new Error(data.detail || 'Invalid response from API');
                }
                
                const now = new Date();
                const processedLaunches = data.results.filter(launch => {
                    if (launchType === 'upcoming') {
                        const windowEnd = launch.window_close || launch.window_end ? new Date(launch.window_close || launch.window_end) : null;
                        const launchTime = new Date(launch.liftoff_exact || launch.net);
                        const cutoff = windowEnd && windowEnd > launchTime ? windowEnd : launchTime;
                        return cutoff > now;
                    } else {
                        const windowEnd = launch.window_close || launch.window_end ? new Date(launch.window_close || launch.window_end) : null;
                        const launchTime = new Date(launch.liftoff_exact || launch.net);
                        const cutoff = windowEnd && windowEnd > launchTime ? windowEnd : launchTime;
                        return cutoff <= now;
                    }
                });

                launchCache[launchType] = { data: processedLaunches, timestamp: Date.now() };
                setLaunches(processedLaunches);
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('API Error:', err);
                    if (!cached.data) {
                        alert(`Sorry, ${err.message}. You may have hit the API rate limit - please wait and try again.`);
                    }
                }
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
        
        return () => {
            controller.abort();
        };
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
                const dateA = new Date(a.net);
                const dateB = new Date(b.net);
                return launchType === 'previous' ? dateB - dateA : dateA - dateB;
            } else if (sortOrder === 'name') {
                return a.name?.localeCompare(b.name) || 0;
            }
            return 0;
        });

        return sorted;
    }, [launches, filters, sortOrder, launchType]);

    const totalPages = Math.ceil(filteredAndSortedLaunches.length / resultsPerPage);
    const paginatedLaunches = filteredAndSortedLaunches.slice(
        (currentPage - 1) * resultsPerPage,
        currentPage * resultsPerPage
    );

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
        if (type !== launchType) {
            setLaunchType(type);
            setCurrentPage(1);
            setFilters({ provider: '', rocket: '', location: '' });
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-black">
                <div className="w-12 h-12 border-4 border-[#333] border-t-[#7f1212] rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-400">Loading launches....</p>
            </div>
        );
    }

    return (
        <>
            <Header />
            <div className="min-h-screen bg-black px-6 py-8">
                <h1 className="text-2xl md:text-3xl font-bold text-white text-center mb-6 px-6">
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

                {!loading && paginatedLaunches.length === 0 && launches.length > 0 && (
                    <div className="text-center py-12 text-gray-400">
                        <p>No launches found matching your filters.</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto px-0">
                    {paginatedLaunches.map(launch => (
                        <LaunchCard key={launch.id} launch={launch} launchType={launchType} />
                    ))}
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-4 mt-8">
                        <button
                            className="px-4 py-2 bg-[#1a1a1a] border border-[#333] rounded text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#222] transition-colors"
                            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        <span className="text-gray-400">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            className="px-4 py-2 bg-[#1a1a1a] border border-[#333] rounded text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#222] transition-colors"
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