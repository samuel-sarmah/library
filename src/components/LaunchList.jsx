import { useState, useEffect, useMemo, useRef, startTransition } from "react";
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import SearchBar from './SearchBar';
import LaunchCard from './LaunchCard';
import CalendarView from './CalendarView';
import NewsHighlight from './NewsHighlight';
import { useWatchlist } from '../hooks/useWatchlist';

// In-memory cache to avoid refetching on every navigation
const launchCache = {
    upcoming: { data: null, timestamp: 0 },
    previous: { data: null, timestamp: 0 },
};
const CACHE_TTL = 60_000; // 1 minute
const LIST_LIMIT = 30;

function LaunchList() {
    const navigate = useNavigate();
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
    const [searchInput, setSearchInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const debounceRef = useRef(null);
    const [view, setView] = useState(() => localStorage.getItem('lt_view') || 'grid');
    const [calendarMonth, setCalendarMonth] = useState(() => new Date());
    const [showWatchlistOnly, setShowWatchlistOnly] = useState(false);
    const { isWatched, watchedIds } = useWatchlist();

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
                const endpoint = `/api/launches?type=${launchType}&limit=${LIST_LIMIT}`;
                
                const response = await fetch(endpoint, { signal: controller.signal, cache: 'force-cache' });
                
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

    useEffect(() => {
        const oppositeType = launchType === 'upcoming' ? 'previous' : 'upcoming';
        const cached = launchCache[oppositeType];
        if (cached.data && Date.now() - cached.timestamp < CACHE_TTL) {
            return;
        }

        const controller = new AbortController();
        const idlePrefetch = () => {
            fetch(`/api/launches?type=${oppositeType}&limit=${LIST_LIMIT}`, {
                signal: controller.signal,
                cache: 'force-cache'
            })
                .then((response) => (response.ok ? response.json() : null))
                .then((data) => {
                    if (!data?.results) return;
                    const now = new Date();
                    const processedLaunches = data.results.filter(launch => {
                        const windowEnd = launch.window_close || launch.window_end ? new Date(launch.window_close || launch.window_end) : null;
                        const launchTime = new Date(launch.liftoff_exact || launch.net);
                        const cutoff = windowEnd && windowEnd > launchTime ? windowEnd : launchTime;
                        return oppositeType === 'upcoming' ? cutoff > now : cutoff <= now;
                    });

                    launchCache[oppositeType] = { data: processedLaunches, timestamp: Date.now() };
                })
                .catch(() => {
                    // Best-effort prefetch only.
                });
        };

        if ('requestIdleCallback' in window) {
            const id = window.requestIdleCallback(idlePrefetch, { timeout: 1200 });
            return () => {
                window.cancelIdleCallback(id);
                controller.abort();
            };
        }

        const timeoutId = setTimeout(idlePrefetch, 500);
        return () => {
            clearTimeout(timeoutId);
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

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(launch =>
                launch.name?.toLowerCase().includes(query) ||
                launch.launch_service_provider?.name?.toLowerCase().includes(query) ||
                launch.rocket?.configuration?.name?.toLowerCase().includes(query) ||
                launch.pad?.location?.name?.toLowerCase().includes(query) ||
                launch.mission?.name?.toLowerCase().includes(query)
            );
        }

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
    }, [launches, filters, sortOrder, launchType, searchQuery]);

    const displayLaunches = showWatchlistOnly
        ? filteredAndSortedLaunches.filter(l => isWatched(l.id))
        : filteredAndSortedLaunches;

    const totalPages = Math.ceil(displayLaunches.length / resultsPerPage);
    const paginatedLaunches = displayLaunches.slice(
        (currentPage - 1) * resultsPerPage,
        currentPage * resultsPerPage
    );

    const handleSearchChange = (query) => {
        setSearchInput(query);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            startTransition(() => {
                setSearchQuery(query);
                setCurrentPage(1);
            });
        }, 200);
    };

    const handleFilterChange = (filterType, value) => {
        startTransition(() => {
            setFilters(prev => ({ ...prev, [filterType]: value }));
            setCurrentPage(1);
        });
    };

    const handleResultsPerPageChange = (value) => {
        startTransition(() => {
            setResultsPerPage(value);
            setCurrentPage(1);
        });
    };

    const handleSortChange = (value) => {
        startTransition(() => setSortOrder(value));
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleLaunchTypeChange = (type) => {
        if (type !== launchType) {
            setLaunchType(type);
            setCurrentPage(1);
            setView('grid');
            setFilters({ provider: '', rocket: '', location: '' });
        }
    };

    const handleViewChange = (nextView) => {
        setView(nextView);
        localStorage.setItem('lt_view', nextView);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <div className="w-12 h-12 border-4 border-[#333] border-t-[#7f1212] rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-400">Loading launches....</p>
            </div>
        );
    }

    return (
        <>
            <Header />
            <div className="min-h-screen px-6 py-8">
                <NewsHighlight />

                <h1 className="text-xl md:text-2xl font-bold text-white text-center mb-5 px-6">
                    {launchType === 'upcoming' ? 'Upcoming Launches' : 'Previous Space Launches'}
                </h1>

                <SearchBar
                    searchQuery={searchInput}
                    onSearchChange={handleSearchChange}
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    sortOrder={sortOrder}
                    onSortChange={handleSortChange}
                    filterOptions={filterOptions}
                    resultsPerPage={resultsPerPage}
                    onResultsPerPageChange={handleResultsPerPageChange}
                    launchType={launchType}
                    onLaunchTypeChange={handleLaunchTypeChange}
                />

                {/* Toolbar: watchlist filter + view toggle */}
                <div className="flex items-center justify-between max-w-7xl mx-auto mb-4 px-0">
                    <button
                        className={`flex items-center gap-2 px-3 py-1.5 rounded border text-sm transition-colors ${showWatchlistOnly ? 'bg-[#4da6ff]/10 border-[#4da6ff] text-[#4da6ff]' : 'bg-[#1a1a1a] border-[#333] text-gray-400 hover:text-white hover:border-[#555]'}`}
                        onClick={() => { setShowWatchlistOnly(p => !p); setCurrentPage(1); }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path d="M10 .75a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L10 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L2.818 6.874a.75.75 0 0 1 .416-1.28l4.21-.611L9.327 1.168A.75.75 0 0 1 10 .75Z" />
                        </svg>
                        Watchlist {watchedIds.length > 0 && <span className="bg-[#4da6ff] text-black text-xs font-bold px-1.5 py-0.5 rounded-full">{watchedIds.length}</span>}
                    </button>

                    {launchType === 'upcoming' && (
                        <div className="flex items-center gap-1 bg-[#1a1a1a] border border-[#333] rounded p-1">
                            <button
                                className={`p-1.5 rounded transition-colors ${view === 'grid' ? 'bg-[#333] text-white' : 'text-gray-500 hover:text-white'}`}
                                title="Grid view"
                                onClick={() => handleViewChange('grid')}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                    <path fillRule="evenodd" d="M4.25 2A2.25 2.25 0 0 0 2 4.25v2.5A2.25 2.25 0 0 0 4.25 9h2.5A2.25 2.25 0 0 0 9 6.75v-2.5A2.25 2.25 0 0 0 6.75 2h-2.5Zm0 9A2.25 2.25 0 0 0 2 13.25v2.5A2.25 2.25 0 0 0 4.25 18h2.5A2.25 2.25 0 0 0 9 15.75v-2.5A2.25 2.25 0 0 0 6.75 11h-2.5Zm9-9A2.25 2.25 0 0 0 11 4.25v2.5A2.25 2.25 0 0 0 13.25 9h2.5A2.25 2.25 0 0 0 18 6.75v-2.5A2.25 2.25 0 0 0 15.75 2h-2.5Zm0 9A2.25 2.25 0 0 0 11 13.25v2.5A2.25 2.25 0 0 0 13.25 18h2.5A2.25 2.25 0 0 0 18 15.75v-2.5A2.25 2.25 0 0 0 15.75 11h-2.5Z" clipRule="evenodd" />
                                </svg>
                            </button>
                            <button
                                className={`p-1.5 rounded transition-colors ${view === 'calendar' ? 'bg-[#333] text-white' : 'text-gray-500 hover:text-white'}`}
                                title="Calendar view"
                                onClick={() => handleViewChange('calendar')}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                    <path fillRule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>

                {!loading && displayLaunches.length === 0 && launches.length > 0 && (
                    <div className="text-center py-12 text-gray-400">
                        <p>{showWatchlistOnly ? 'No watchlisted launches match your filters.' : 'No launches found matching your filters.'}</p>
                    </div>
                )}

                {view === 'calendar' && launchType === 'upcoming' ? (
                    <CalendarView
                        launches={filteredAndSortedLaunches}
                        currentMonth={calendarMonth}
                        onMonthChange={(dir) => setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + dir, 1))}
                        onNavigate={(id) => navigate(`/launch/${id}`)}
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto px-0">
                        {paginatedLaunches.map(launch => (
                            <LaunchCard key={launch.id} launch={launch} launchType={launchType} />
                        ))}
                    </div>
                )}

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