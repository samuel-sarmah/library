import { memo, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Countdown from './Countdown';
import { useWatchlist } from '../hooks/useWatchlist';
import { useNotifications } from '../hooks/useNotifications';

const PLACEHOLDER_IMAGE = '/launch-placeholder.svg';

const toImageSrc = (url) => {
    if (!url) return null;
    if (import.meta.env.DEV) return url;
    return `/api/image?url=${encodeURIComponent(url)}`;
};

function LaunchCard({ launch, launchType }) {
    const navigate = useNavigate();
    const [showStreamDropdown, setShowStreamDropdown] = useState(false);
    const [imageStage, setImageStage] = useState(0);
    const { isWatched, toggle: toggleWatch } = useWatchlist();
    const { isSubscribed, toggle: toggleNotif } = useNotifications();

    const handleCardClick = () => navigate(`/launch/${launch.id}`, { state: { launch } });

    const providerName = launch.launch_service_provider?.name;
    const missionName = launch.mission?.name || launch.name?.split('|')[1]?.trim() || 'Payload TBD';

    const isGoStatus = ['Go for Launch', 'Launch Commit', 'In Flight']
        .some(s => launch.status?.name?.includes(s));

    const launchDateTime = useMemo(() => new Date(launch.net), [launch.net]);

    const { timeLabel, localDate } = useMemo(() => {
        const parts = launchDateTime.toLocaleString('en-US', {
            hour: '2-digit', minute: '2-digit', hour12: true,
        }).match(/(\d{1,2}:\d{2})\s*(AM|PM)?/i);

        const tz = new Intl.DateTimeFormat('en-US', { timeZoneName: 'short' })
            .formatToParts(launchDateTime)
            .find(p => p.type === 'timeZoneName')?.value || '';

        const date = launchDateTime.toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
        });

        return {
            timeLabel: parts ? `${parts[1]} ${parts[2]} ${tz}`.trim() : '',
            localDate: date,
        };
    }, [launchDateTime]);

    // eslint-disable-next-line react-hooks/purity
    const msTillLaunch = launchDateTime.getTime() - Date.now();
    const isLaunchingSoon = msTillLaunch > 0 && msTillLaunch < 86_400_000;

    const sliderData = useMemo(() => {
        const windowStartRaw = launch.window_open || launch.window_start;
        const windowEndRaw = launch.window_close || launch.window_end;
        const liftoffRaw = launch.liftoff_exact || launch.net;

        const windowStart = windowStartRaw ? new Date(windowStartRaw) : null;
        const windowEnd = windowEndRaw ? new Date(windowEndRaw) : null;
        const liftoff = liftoffRaw ? new Date(liftoffRaw) : null;

        if (!windowStart || !windowEnd || !liftoff) return null;
        const totalWindow = windowEnd - windowStart;
        if (totalWindow <= 0) return null;

        const now = new Date();
        const elapsed = now - windowStart;
        const fmt = (d) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

        return {
            position: Math.max(0, Math.min(100, (elapsed / totalWindow) * 100)),
            liftoffPosition: Math.max(0, Math.min(100, ((liftoff - windowStart) / totalWindow) * 100)),
            windowStartTime: fmt(windowStart),
            windowEndTime: fmt(windowEnd),
            liftoffTime: liftoff.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
        };
    }, [launch]);

    const primaryImage = toImageSrc(launch.image?.thumbnail_url);
    const fallbackImage = toImageSrc(launch.image?.image_url);

    const imageSrc = useMemo(() => {
        if (imageStage === 0) return primaryImage || fallbackImage || PLACEHOLDER_IMAGE;
        if (imageStage === 1) return fallbackImage || PLACEHOLDER_IMAGE;
        return PLACEHOLDER_IMAGE;
    }, [imageStage, primaryImage, fallbackImage]);

    const imageSrcSet = useMemo(() => {
        if (primaryImage && fallbackImage && primaryImage !== fallbackImage)
            return `${primaryImage} 480w, ${fallbackImage} 1200w`;
        return undefined;
    }, [primaryImage, fallbackImage]);

    const rawVideoUrls = Array.isArray(launch.video_urls) ? launch.video_urls
        : Array.isArray(launch.vidURLs) ? launch.vidURLs
        : Array.isArray(launch.vid_urls) ? launch.vid_urls : [];
    const videoUrls = rawVideoUrls
        .map(item => {
            if (!item) return null;
            if (typeof item === 'string') return { url: item, title: 'Launch Stream' };
            if (typeof item === 'object' && typeof item.url === 'string') return item;
            return null;
        })
        .filter(item => item?.url && /^https?:\/\//i.test(item.url));
    const hasVideoUrls = videoUrls.length > 0;
    const primaryVideoUrl = hasVideoUrls ? videoUrls[0].url : null;

    const watched = isWatched(launch.id);
    const subscribed = isSubscribed(launch.id);
    const isUpcoming = launchType === 'upcoming';

    const cardBorder = isLaunchingSoon && isUpcoming
        ? 'border-[#7f1212] shadow-[0_0_12px_rgba(127,18,18,0.3)]'
        : 'border-[#1a1a1a] hover:border-[#444]';

    return (
        <div
            className={`relative h-[400px] rounded-md overflow-hidden cursor-pointer bg-[#0d0d0d] border transition-all flex flex-col ${cardBorder}`}
            onClick={handleCardClick}
        >
            {/* Top: provider + mission name + status badge */}
            <div className="absolute top-0 left-0 right-0 z-10 px-3 pt-2">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="text-[10px] text-white/60 font-semibold uppercase tracking-wider truncate">
                            {providerName}
                        </span>
                        <span className="text-white font-bold text-sm leading-tight line-clamp-2" title={missionName}>
                            {missionName}
                        </span>
                    </div>
                    {isUpcoming && (
                        <div className={`shrink-0 mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide ${isGoStatus ? 'bg-green-600 text-white' : 'bg-yellow-600/90 text-black'}`}>
                            {isGoStatus ? 'GO' : 'TBD'}
                        </div>
                    )}
                </div>
            </div>

            {/* Background image */}
            <div className="absolute inset-0">
                <img
                    src={imageSrc}
                    srcSet={imageSrcSet}
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    alt={launch.name}
                    className="w-full h-full object-cover object-top"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                        if (imageStage === 0 && fallbackImage && fallbackImage !== primaryImage) {
                            setImageStage(1);
                            return;
                        }
                        setImageStage(2);
                        e.currentTarget.onerror = null;
                    }}
                />
            </div>

            {/* Bottom content */}
            <div className="absolute bottom-0 left-0 right-0 z-10 flex flex-col bg-gradient-to-t from-black via-black/90 to-transparent pt-8 px-3 pb-2">

                {/* Urgency chip */}
                {isLaunchingSoon && isUpcoming && (
                    <div className="flex items-center gap-1.5 mb-1">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                        <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Launching Soon</span>
                    </div>
                )}

                {/* Countdown */}
                <div className="flex items-center gap-1 mb-1">
                    <Countdown launchDate={launch.net} prominent={true} showTPrefix={true} rocket={launch.rocket} />
                </div>

                {/* Time + date on one line */}
                <div className="text-[11px] text-white/60 mb-1">
                    {timeLabel} · {localDate}
                </div>

                {/* Launch window slider */}
                {sliderData && isUpcoming && (
                    <div className="mb-2 px-0.5">
                        <div className="relative h-[2px] bg-[#333] rounded">
                            <div className="absolute h-full bg-white/25 rounded" style={{ width: `${Math.min(sliderData.position, 100)}%` }} />
                            <div className="absolute w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-black"
                                style={{ left: `${sliderData.liftoffPosition}%`, top: '50%', transform: 'translate(-50%, -50%)' }}
                            />
                        </div>
                        <div className="flex justify-between mt-0.5 text-[9px] text-white/50">
                            <span>Open</span>
                            <span className="text-green-400">{sliderData.liftoffTime}</span>
                            <span>Close</span>
                        </div>
                    </div>
                )}

                {/* Action row: Save + Notify */}
                <div className="flex gap-1.5 mb-1.5" onClick={e => e.stopPropagation()}>
                    <button
                        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded border text-xs font-medium transition-colors ${
                            watched
                                ? 'bg-[#4da6ff]/10 border-[#4da6ff]/40 text-[#4da6ff]'
                                : 'bg-black/40 border-white/10 text-white/60 hover:border-white/30 hover:text-white'
                        }`}
                        onClick={() => toggleWatch(launch.id)}
                    >
                        {watched ? (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                                <path d="M8 .75a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.874a.75.75 0 0 1 .416-1.28l4.21-.611L7.327 1.168A.75.75 0 0 1 8 .75Z" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                            </svg>
                        )}
                        {watched ? 'Saved' : 'Save'}
                    </button>

                    {isUpcoming && (
                        <button
                            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded border text-xs font-medium transition-colors ${
                                subscribed
                                    ? 'bg-yellow-500/10 border-yellow-500/40 text-yellow-400'
                                    : 'bg-black/40 border-white/10 text-white/60 hover:border-white/30 hover:text-white'
                            }`}
                            onClick={() => toggleNotif(launch.id, launch)}
                        >
                            {subscribed ? (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                                    <path d="M3.25 2.75a.75.75 0 0 0-1.154-.76 7.978 7.978 0 0 0-1.601 3.4.75.75 0 1 0 1.46.348 6.478 6.478 0 0 1 1.296-2.988ZM13.904 1.99a.75.75 0 0 0-1.154.76 6.478 6.478 0 0 1 1.296 2.988.75.75 0 1 0 1.46-.348 7.978 7.978 0 0 0-1.602-3.4ZM8 1a5 5 0 0 0-5 5v.931a3.75 3.75 0 0 1-.525 1.909l-.646 1.077a1.25 1.25 0 0 0 1.072 1.898h10.198a1.25 1.25 0 0 0 1.072-1.898l-.646-1.077A3.75 3.75 0 0 1 13 6.931V6a5 5 0 0 0-5-5ZM8 16a2 2 0 0 1-1.886-1.337.75.75 0 1 1 1.412-.5.5.5 0 0 0 .948 0 .75.75 0 1 1 1.412.5A2 2 0 0 1 8 16Z" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                                </svg>
                            )}
                            {subscribed ? 'Alert On' : 'Notify'}
                        </button>
                    )}
                </div>

                {/* Watch Live button */}
                {hasVideoUrls && (
                    <div className="relative" onClick={e => e.stopPropagation()}>
                        {videoUrls.length === 1 ? (
                            <button
                                className="w-full py-2 bg-[#7f1212] hover:bg-[#9a1515] text-white text-xs font-semibold rounded transition-colors"
                                onClick={() => window.open(primaryVideoUrl, '_blank')}
                            >
                                ▶ Watch Launch Live
                            </button>
                        ) : (
                            <>
                                <button
                                    className="w-full py-2 bg-[#7f1212] hover:bg-[#9a1515] text-white text-xs font-semibold rounded transition-colors"
                                    onClick={() => setShowStreamDropdown(s => !s)}
                                >
                                    ▶ Watch Launch Live
                                </button>
                                {showStreamDropdown && (
                                    <div className="absolute bottom-full left-0 right-0 mb-1 bg-[#1a1a1a] border border-[#333] rounded shadow-lg z-20 max-h-40 overflow-y-auto">
                                        {videoUrls.map((vid, i) => (
                                            <button
                                                key={i}
                                                className="w-full px-3 py-2 text-left text-xs text-white hover:bg-[#333] transition-colors truncate"
                                                onClick={() => { window.open(vid.url, '_blank'); setShowStreamDropdown(false); }}
                                                title={vid.title || vid.url}
                                            >
                                                {vid.title || `Stream ${i + 1}`}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default memo(LaunchCard);
