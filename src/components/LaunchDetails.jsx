import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Header from './Header';
import Countdown from './Countdown';
import { useWatchlist } from '../hooks/useWatchlist';
import { useNotifications } from '../hooks/useNotifications';

const PLACEHOLDER_IMAGE = '/launch-placeholder.svg';

const toImageSrc = (url) => {
    if (!url) return null;
    if (import.meta.env.DEV) return url;
    return `/api/image?url=${encodeURIComponent(url)}`;
};

function LaunchDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const initialLaunch = location.state?.launch;
    const [launch, setLaunch] = useState(initialLaunch);
    const [loading, setLoading] = useState(!initialLaunch);
    const [detailsLoading, setDetailsLoading] = useState(true);
    const [relatedArticles, setRelatedArticles] = useState([]);
    const launchRef = useRef(initialLaunch);
    launchRef.current = launch;

    const { isWatched, toggle: toggleWatch } = useWatchlist();
    const { isSubscribed, toggle: toggleNotif } = useNotifications();

    const detailImage = toImageSrc(launch?.image?.image_url || launch?.image?.thumbnail_url);

    useEffect(() => {
        const controller = new AbortController();

        const fetchDetails = async () => {
            try {
                const response = await fetch(`/api/launch/${id}`, { signal: controller.signal });

                if (!response.ok) {
                    if (launchRef.current) {
                        setDetailsLoading(false);
                        return;
                    }
                    const errorData = await response.json().catch(() => null);
                    throw new Error(errorData?.error || errorData?.detail || `API error: ${response.status}`);
                }

                const data = await response.json();

                if (data.id) {
                    setLaunch(data);
                }
            } catch (err) {
                if (err.name === 'AbortError') return;
                console.error('Detail fetch error:', err);
                if (!launchRef.current) {
                    console.error('No launch data available');
                }
            } finally {
                setLoading(false);
                setDetailsLoading(false);
            }
        };

        fetchDetails();
        return () => controller.abort();
    }, [id]);

    useEffect(() => {
        const controller = new AbortController();
        const fetchRelated = async () => {
            try {
                let r = await fetch(`/api/news?launch=${id}&limit=5`, { signal: controller.signal });
                if (!r.ok) {
                    r = await fetch(`https://api.spaceflightnewsapi.net/v4/articles/?launch=${id}&limit=5`, { signal: controller.signal });
                }
                if (r.ok) {
                    const data = await r.json();
                    if (data?.results) setRelatedArticles(data.results);
                }
            } catch { /* best-effort */ }
        };
        fetchRelated();
        return () => controller.abort();
    }, [id]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <div className="w-12 h-12 border-4 border-[#333] border-t-[#7f1212] rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-400">Loading mission details....</p>
            </div>
        );
    }

    if (!launch) {
        return (
            <div className="min-h-screen">
                <Header />
                <div className="flex flex-col items-center justify-center py-20">
                    <p className="text-gray-400 mb-4">Mission not found</p>
                    <button 
                        className="px-6 py-3 bg-[#1a1a1a] border border-[#333] text-white rounded hover:bg-[#222] transition-colors"
                        onClick={() => navigate('/')}
                    >
                        Back to Launches
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <Header />
            <div className="min-h-screen px-4 py-8 max-w-4xl mx-auto">
                <div className="mb-6 flex flex-wrap items-center gap-3">
                    <button
                        className="px-4 py-2 bg-[#1a1a1a] border border-[#333] rounded text-white hover:bg-[#222] transition-colors"
                        onClick={() => navigate('/')}
                    >
                        Back to Launches
                    </button>
                    <button
                        className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border border-[#333] rounded text-white hover:bg-[#222] transition-colors"
                        onClick={() => toggleWatch(launch.id)}
                    >
                        {isWatched(launch.id) ? (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-[#4da6ff]">
                                    <path d="M10 .75a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L10 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L2.818 6.874a.75.75 0 0 1 .416-1.28l4.21-.611L9.327 1.168A.75.75 0 0 1 10 .75Z" />
                                </svg>
                                <span className="text-[#4da6ff] text-sm">Watchlisted</span>
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                                </svg>
                                <span className="text-sm">Add to Watchlist</span>
                            </>
                        )}
                    </button>
                    {new Date(launch.net) > new Date() && (
                        <button
                            className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border border-[#333] rounded text-white hover:bg-[#222] transition-colors"
                            onClick={() => toggleNotif(launch.id, launch)}
                        >
                            {isSubscribed(launch.id) ? (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-yellow-400">
                                        <path d="M4.214 3.227a.75.75 0 0 0-1.156-.956 8.97 8.97 0 0 0-1.856 3.826.75.75 0 0 0 1.466.316 7.47 7.47 0 0 1 1.546-3.186ZM16.942 2.271a.75.75 0 0 0-1.157.956 7.47 7.47 0 0 1 1.547 3.186.75.75 0 0 0 1.466-.316 8.971 8.971 0 0 0-1.856-3.826ZM10 2a6 6 0 0 0-6 6v1.077a4.5 4.5 0 0 1-.333 1.686l-.823 2.056a1.5 1.5 0 0 0 1.388 2.062h11.536a1.5 1.5 0 0 0 1.388-2.062l-.823-2.056A4.5 4.5 0 0 1 16 9.077V8a6 6 0 0 0-6-6Zm0 18a2.5 2.5 0 0 1-2.278-1.463.75.75 0 0 1 1.362-.635A1 1 0 0 0 10 18.5a1 1 0 0 0 .916-.598.75.75 0 0 1 1.362.635A2.5 2.5 0 0 1 10 20Z" />
                                    </svg>
                                    <span className="text-yellow-400 text-sm">Alerts On</span>
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                                    </svg>
                                    <span className="text-sm">Notify Me</span>
                                </>
                            )}
                        </button>
                    )}
                </div>

                {detailsLoading && (
                    <div className="flex items-center gap-2 mb-4 text-gray-500 text-sm">
                        <div className="w-3 h-3 border-2 border-[#333] border-t-[#7f1212] rounded-full animate-spin"></div>
                        Loading full details...
                    </div>
                )}

                <div className="rounded-md overflow-hidden mb-8">
                    <img
                        src={detailImage || PLACEHOLDER_IMAGE}
                        alt={launch.name}
                        className="w-full h-64 md:h-96 object-cover"
                        onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = PLACEHOLDER_IMAGE;
                        }}
                    />
                </div>

                <div className="space-y-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-white">{launch.name}</h1>

                    <div className="p-4 bg-[#0d0d0d] rounded-md border border-[#1a1a1a]">
                        <Countdown launchDate={launch.net} />
                    </div>

                    <div className="bg-[#0d0d0d] rounded-md border border-[#1a1a1a] overflow-hidden">
                        <div className="flex justify-between items-center px-4 py-3 border-b border-[#1a1a1a]">
                            <span className="text-gray-400 text-sm">Rocket</span>
                            <span className="text-white">{launch.rocket?.configuration?.name || 'TBD'}</span>
                        </div>
                        <div className="flex justify-between items-center px-4 py-3 border-b border-[#1a1a1a]">
                            <span className="text-gray-400 text-sm">Launch Site</span>
                            <span className="text-white">{launch.pad?.name || 'TBD'}</span>
                        </div>
                        <div className="flex justify-between items-center px-4 py-3 border-b border-[#1a1a1a]">
                            <span className="text-gray-400 text-sm">Location</span>
                            <span className="text-white">{launch.pad?.location?.name || 'TBD'}</span>
                        </div>
                        <div className="flex justify-between items-center px-4 py-3 border-b border-[#1a1a1a]">
                            <span className="text-gray-400 text-sm">Launch Date</span>
                            <span className="text-white">
                                {new Date(launch.net).toLocaleDateString('en-us', {
                                    weekday: 'long',
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </span>
                        </div>
                        <div className="flex justify-between items-center px-4 py-3 border-b border-[#1a1a1a]">
                            <span className="text-gray-400 text-sm">Status</span>
                            <span className="text-[#4da6ff] font-medium">{launch.status?.name || 'TBD'}</span>
                        </div>
                        {launch.mission?.orbit && (
                            <div className="flex justify-between items-center px-4 py-3">
                                <span className="text-gray-400 text-sm">Orbit</span>
                                <span className="text-white">{launch.mission.orbit.name}</span>
                            </div>
                        )}
                    </div>

                    {launch.mission?.description && (
                        <div className="bg-[#0d0d0d] rounded-md border border-[#1a1a1a] p-6">
                            <h2 className="text-xl font-semibold text-white mb-4">Mission Details</h2>
                            <p className="text-gray-300 leading-relaxed">{launch.mission.description}</p>
                        </div>
                    )}

                    {launch.launch_service_provider && typeof launch.launch_service_provider === 'object' && (
                        <div className="bg-[#0d0d0d] rounded-md border border-[#1a1a1a] p-6">
                            <h2 className="text-xl font-semibold text-white mb-4">Launch Provider</h2>
                            {launch.launch_service_provider.description && (
                                <p className="text-gray-300 leading-relaxed mb-4">{launch.launch_service_provider.description}</p>
                            )}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="bg-[#1a1a1a] p-3 rounded">
                                    <span className="text-gray-400 text-xs block">Founded</span>
                                    <span className="text-white font-medium">{launch.launch_service_provider?.founding_year || 'N/A'}</span>
                                </div>
                                <div className="bg-[#1a1a1a] p-3 rounded">
                                    <span className="text-gray-400 text-xs block">Admin</span>
                                    <span className="text-white font-medium text-sm">{launch.launch_service_provider?.administrator || 'N/A'}</span>
                                </div>
                                <div className="bg-[#1a1a1a] p-3 rounded">
                                    <span className="text-gray-400 text-xs block">Total Launches</span>
                                    <span className="text-white font-medium">{launch.launch_service_provider?.total_launch_count || 'N/A'}</span>
                                </div>
                                <div className="bg-[#1a1a1a] p-3 rounded">
                                    <span className="text-gray-400 text-xs block">Successful</span>
                                    <span className="text-white font-medium">{launch.launch_service_provider?.successful_launches || 'N/A'}</span>
                                </div>
                                <div className="bg-[#1a1a1a] p-3 rounded">
                                    <span className="text-gray-400 text-xs block">Vehicles</span>
                                    <span className="text-white font-medium">{launch.launch_service_provider?.launchers || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {launch.rocket && launch.rocket.configuration && typeof launch.rocket.configuration === 'object' && (
                        <div className="bg-[#0d0d0d] rounded-md border border-[#1a1a1a] p-6">
                            <h2 className="text-xl font-semibold text-white mb-4">Rocket Details</h2>
                            {launch.rocket.configuration.description && (
                                <p className="text-gray-300 leading-relaxed mb-4">{launch.rocket.configuration.description}</p>
                            )}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-[#1a1a1a] p-3 rounded">
                                    <span className="text-gray-400 text-xs block">Height</span>
                                    <span className="text-white font-medium">{launch.rocket?.configuration?.length ? `${launch.rocket.configuration.length} m` : 'N/A'}</span>
                                </div>
                                <div className="bg-[#1a1a1a] p-3 rounded">
                                    <span className="text-gray-400 text-xs block">Diameter</span>
                                    <span className="text-white font-medium">{launch.rocket?.configuration?.diameter ? `${launch.rocket.configuration.diameter} m` : 'N/A'}</span>
                                </div>
                                <div className="bg-[#1a1a1a] p-3 rounded">
                                    <span className="text-gray-400 text-xs block">Launch Mass</span>
                                    <span className="text-white font-medium">{launch.rocket?.configuration?.launch_mass ? `${launch.rocket.configuration.launch_mass} t` : 'N/A'}</span>
                                </div>
                                <div className="bg-[#1a1a1a] p-3 rounded">
                                    <span className="text-gray-400 text-xs block">LEO Capacity</span>
                                    <span className="text-white font-medium">{launch.rocket?.configuration?.leo_capacity ? `${launch.rocket.configuration.leo_capacity} kg` : 'N/A'}</span>
                                </div>
                                <div className="bg-[#1a1a1a] p-3 rounded">
                                    <span className="text-gray-400 text-xs block">GTO Capacity</span>
                                    <span className="text-white font-medium">{launch.rocket?.configuration?.gto_capacity ? `${launch.rocket.configuration.gto_capacity} kg` : 'N/A'}</span>
                                </div>
                                <div className="bg-[#1a1a1a] p-3 rounded">
                                    <span className="text-gray-400 text-xs block">Thrust</span>
                                    <span className="text-white font-medium">{launch.rocket?.configuration?.to_thrust ? `${launch.rocket.configuration.to_thrust} kN` : 'N/A'}</span>
                                </div>
                                <div className="bg-[#1a1a1a] p-3 rounded">
                                    <span className="text-gray-400 text-xs block">Reusable</span>
                                    <span className="text-white font-medium">{launch.rocket?.configuration?.reusable ? 'Yes' : 'No'}</span>
                                </div>
                                <div className="bg-[#1a1a1a] p-3 rounded">
                                    <span className="text-gray-400 text-xs block">Maiden Flight</span>
                                    <span className="text-white font-medium text-sm">{launch.rocket?.configuration?.maiden_flight || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {launch.rocket?.launcher_stage && Array.isArray(launch.rocket.launcher_stage) && launch.rocket.launcher_stage.length > 0 && (
                        <div className="bg-[#0d0d0d] rounded-md border border-[#1a1a1a] p-6">
                            <h2 className="text-xl font-semibold text-white mb-4">Booster Information</h2>
                            <div className="space-y-4">
                                {launch.rocket.launcher_stage.map((stage, index) => (
                                    <div key={index} className="bg-[#1a1a1a] rounded p-4">
                                        <h3 className="text-white font-medium mb-3">Stage {stage.type || 'Unknown'}</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                                            <div>
                                                <span className="text-gray-400 block">Serial Number</span>
                                                <span className="text-white">{stage.launcher?.serial_number || 'N/A'}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-400 block">Flight Number</span>
                                                <span className="text-white">{stage.launcher_flight_number || 'N/A'}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-400 block">Reused</span>
                                                <span className="text-white">{stage.reused ? 'Yes' : 'No'}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-400 block">Status</span>
                                                <span className="text-white">{typeof stage.launcher?.status === 'object' ? stage.launcher.status.name : stage.launcher?.status || 'N/A'}</span>
                                            </div>
                                            {stage.landing && (
                                                <>
                                                    <div>
                                                        <span className="text-gray-400 block">Landing Success</span>
                                                        <span className="text-white">{stage.landing.success ? 'Yes' : 'No'}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-400 block">Landing Location</span>
                                                        <span className="text-white">{stage.landing.location?.name || 'N/A'}</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {(launch.vid_urls || launch.vidURLs) && Array.isArray(launch.vid_urls || launch.vidURLs) && (launch.vid_urls?.length > 0 || launch.vidURLs?.length > 0) && (
                        <div className="bg-[#0d0d0d] rounded-md border border-[#1a1a1a] p-6">
                            <h2 className="text-xl font-semibold text-white mb-4">Watch Live</h2>
                            <div className="flex flex-wrap gap-3">
                                {(launch.vid_urls || launch.vidURLs).map((vid, index) => (
                                    <a
                                        key={index}
                                        href={vid.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-6 py-3 bg-[#7f1212] text-white rounded hover:bg-[#9a1515] transition-colors font-medium"
                                    >
                                        ▶ Watch Live
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {relatedArticles.length > 0 && (
                        <div className="bg-[#0d0d0d] rounded-md border border-[#1a1a1a] p-6">
                            <h2 className="text-xl font-semibold text-white mb-4">Related Articles</h2>
                            <div className="space-y-3">
                                {relatedArticles.map((article) => (
                                    <a
                                        key={article.id}
                                        href={article.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex gap-3 p-3 bg-[#1a1a1a] rounded border border-[#222] hover:border-[#444] transition-colors group"
                                    >
                                        {article.image_url && (
                                            <img
                                                src={article.image_url}
                                                alt=""
                                                className="w-16 h-16 object-cover rounded shrink-0"
                                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                            />
                                        )}
                                        <div className="min-w-0">
                                            <p className="text-white text-sm font-medium group-hover:text-[#4da6ff] transition-colors line-clamp-2">{article.title}</p>
                                            <p className="text-gray-500 text-xs mt-1">
                                                {article.news_site} · {new Date(article.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default LaunchDetails;
