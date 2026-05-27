import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import Countdown from './Countdown';
import { useWatchlist } from '../hooks/useWatchlist';
import { useNotifications } from '../hooks/useNotifications';

const toImageSrc = (url) => {
    if (!url) return null;
    if (import.meta.env.DEV) return url;
    return `/api/image?url=${encodeURIComponent(url)}`;
};

function HeroBanner({ launch }) {
    const navigate = useNavigate();
    const { isWatched, toggle: toggleWatch } = useWatchlist();
    const { isSubscribed, toggle: toggleNotif } = useNotifications();

    const heroImage = toImageSrc(launch.image?.image_url || launch.image?.thumbnail_url);
    const missionName = launch.mission?.name || launch.name?.split('|')[1]?.trim() || launch.name || 'Upcoming Mission';
    const providerName = launch.launch_service_provider?.name || '';
    const rocketName = launch.rocket?.configuration?.name || '';
    const padName = launch.pad?.location?.name || '';

    const watched = isWatched(launch.id);
    const subscribed = isSubscribed(launch.id);

    const launchDate = new Date(launch.net).toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    });

    return (
        <div
            className="relative w-full rounded-xl overflow-hidden cursor-pointer mb-8 group"
            style={{ minHeight: 320 }}
            onClick={() => navigate(`/launch/${launch.id}`, { state: { launch } })}
        >
            {/* Background image */}
            {heroImage ? (
                <img
                    src={heroImage}
                    alt={launch.name}
                    className="absolute inset-0 w-full h-full object-cover object-center scale-105 group-hover:scale-100 transition-transform duration-700"
                />
            ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#1a0505] to-[#0a0a0a]" />
            )}

            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

            {/* Content */}
            <div className="relative z-10 p-6 md:p-10 flex flex-col justify-end min-h-[320px] max-w-7xl mx-auto w-full">
                {/* Label */}
                <div className="flex items-center gap-2 mb-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7f1212] animate-pulse" />
                    <span className="text-[11px] font-bold text-[#7f1212] uppercase tracking-widest">Next Launch</span>
                </div>

                {/* Mission name */}
                <h2 className="text-2xl md:text-4xl font-bold text-white mb-1 leading-tight max-w-xl">
                    {missionName}
                </h2>

                {/* Provider + rocket + pad */}
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 mb-4 text-sm text-gray-400">
                    {providerName && <span>{providerName}</span>}
                    {rocketName && <><span className="text-gray-600">·</span><span>{rocketName}</span></>}
                    {padName && <><span className="text-gray-600">·</span><span>{padName}</span></>}
                </div>

                {/* Countdown + date */}
                <div className="mb-5">
                    <Countdown launchDate={launch.net} prominent={false} showTPrefix={true} />
                    <p className="text-gray-500 text-xs mt-1">{launchDate}</p>
                </div>

                {/* CTAs */}
                <div className="flex flex-wrap gap-3" onClick={e => e.stopPropagation()}>
                    <button
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg border font-semibold text-sm transition-all ${
                            subscribed
                                ? 'bg-yellow-500/15 border-yellow-500/50 text-yellow-400'
                                : 'bg-white text-black border-white hover:bg-gray-100'
                        }`}
                        onClick={() => toggleNotif(launch.id, launch)}
                    >
                        {subscribed ? (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                                    <path d="M3.25 2.75a.75.75 0 0 0-1.154-.76 7.978 7.978 0 0 0-1.601 3.4.75.75 0 1 0 1.46.348 6.478 6.478 0 0 1 1.296-2.988ZM13.904 1.99a.75.75 0 0 0-1.154.76 6.478 6.478 0 0 1 1.296 2.988.75.75 0 1 0 1.46-.348 7.978 7.978 0 0 0-1.602-3.4ZM8 1a5 5 0 0 0-5 5v.931a3.75 3.75 0 0 1-.525 1.909l-.646 1.077a1.25 1.25 0 0 0 1.072 1.898h10.198a1.25 1.25 0 0 0 1.072-1.898l-.646-1.077A3.75 3.75 0 0 1 13 6.931V6a5 5 0 0 0-5-5ZM8 16a2 2 0 0 1-1.886-1.337.75.75 0 1 1 1.412-.5.5.5 0 0 0 .948 0 .75.75 0 1 1 1.412.5A2 2 0 0 1 8 16Z" />
                                </svg>
                                Alert Active
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                                </svg>
                                Get Notified
                            </>
                        )}
                    </button>

                    <button
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg border font-semibold text-sm transition-all ${
                            watched
                                ? 'bg-[#4da6ff]/15 border-[#4da6ff]/50 text-[#4da6ff]'
                                : 'bg-transparent border-white/30 text-white hover:border-white/60'
                        }`}
                        onClick={() => toggleWatch(launch.id)}
                    >
                        {watched ? (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                                <path d="M8 .75a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.874a.75.75 0 0 1 .416-1.28l4.21-.611L7.327 1.168A.75.75 0 0 1 8 .75Z" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                            </svg>
                        )}
                        {watched ? 'Saved' : 'Save Mission'}
                    </button>

                    <button
                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-white/20 text-white/70 text-sm font-medium hover:border-white/40 hover:text-white transition-colors"
                        onClick={() => navigate(`/launch/${launch.id}`, { state: { launch } })}
                    >
                        Mission Details →
                    </button>
                </div>
            </div>
        </div>
    );
}

export default memo(HeroBanner);
