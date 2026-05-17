import { memo, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Countdown from './Countdown';

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

    const handleCardClick = () => {
        navigate(`/launch/${launch.id}`, { state: { launch } });
    };
    const providerName = launch.launch_service_provider?.name;

    const missionName = launch.mission?.name || launch.name?.split('|')[1]?.trim() || 'Payload TBD';

    const isGoStatus = [
        'Go for Launch',
        'Launch Commit',
        'In Flight'
    ].some(status => launch.status?.name?.includes(status));
    const statusText = isGoStatus ? 'GO' : 'TBD';

    const launchDateTime = useMemo(() => new Date(launch.net), [launch.net]);
    const { localTimeMain, localTimePeriod, tzAbbr, localDate } = useMemo(() => {
        const localTimeParts = launchDateTime.toLocaleString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }).match(/(\d{1,2}:\d{2})\s*(AM|PM)?/i);

        const timezone = new Intl.DateTimeFormat('en-US', { timeZoneName: 'short' })
            .formatToParts(launchDateTime)
            .find(part => part.type === 'timeZoneName')?.value || '';

        const dateLabel = launchDateTime.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });

        return {
            localTimeMain: localTimeParts ? localTimeParts[1] : '',
            localTimePeriod: localTimeParts ? localTimeParts[2] : '',
            tzAbbr: timezone,
            localDate: dateLabel
        };
    }, [launchDateTime]);



    // Calculate launch window slider position
    const getSliderPosition = () => {
        const now = new Date();
        const windowStartRaw = launch.window_open || launch.window_start;
        const windowEndRaw = launch.window_close || launch.window_end;
        const liftoffRaw = launch.liftoff_exact || launch.net;

        const windowStart = windowStartRaw ? new Date(windowStartRaw) : null;
        const windowEnd = windowEndRaw ? new Date(windowEndRaw) : null;
        const liftoff = liftoffRaw ? new Date(liftoffRaw) : null;

        if (!windowStart || !windowEnd || !liftoff) return null;

        const totalWindow = windowEnd - windowStart;
        if (totalWindow <= 0) return null;

        const elapsed = now - windowStart;
        const position = Math.max(0, Math.min(100, (elapsed / totalWindow) * 100));
        const liftoffPosition = Math.max(0, Math.min(100, ((liftoff - windowStart) / totalWindow) * 100));

        // Format window boundaries
        const formatTime = (date) => date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });

        const formatLiftoffTime = (date) => date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });

        return {
            position,
            liftoffPosition,
            windowStartTime: formatTime(windowStart),
            windowEndTime: formatTime(windowEnd),
            liftoffTime: formatLiftoffTime(liftoff)
        };
    };

    const sliderData = getSliderPosition();

    const primaryImage = toImageSrc(launch.image?.thumbnail_url);
    const fallbackImage = toImageSrc(launch.image?.image_url);

    useEffect(() => {
        setImageStage(0);
    }, [launch.id, primaryImage, fallbackImage]);

    const imageSrc = useMemo(() => {
        if (imageStage === 0) return primaryImage || fallbackImage || PLACEHOLDER_IMAGE;
        if (imageStage === 1) return fallbackImage || PLACEHOLDER_IMAGE;
        return PLACEHOLDER_IMAGE;
    }, [imageStage, primaryImage, fallbackImage]);

    const imageSrcSet = useMemo(() => {
        if (primaryImage && fallbackImage && primaryImage !== fallbackImage) {
            return `${primaryImage} 480w, ${fallbackImage} 1200w`;
        }
        return undefined;
    }, [primaryImage, fallbackImage]);

    // Get video URLs from the API (normalized video_urls with legacy fallbacks)
    const rawVideoUrls = Array.isArray(launch.video_urls) ? launch.video_urls :
        Array.isArray(launch.vidURLs) ? launch.vidURLs :
            Array.isArray(launch.vid_urls) ? launch.vid_urls : [];
    const videoUrls = rawVideoUrls
        .map((item) => {
            if (!item) return null;
            if (typeof item === 'string') {
                return { url: item, title: 'Launch Stream' };
            }
            if (typeof item === 'object' && typeof item.url === 'string') {
                return item;
            }
            return null;
        })
        .filter((item) => item?.url && /^https?:\/\//i.test(item.url));
    const hasVideoUrls = videoUrls.length > 0;
    const primaryVideoUrl = hasVideoUrls ? videoUrls[0].url : null;


    return (
        <div
            className="relative h-[380px] rounded-md overflow-hidden cursor-pointer bg-[#0d0d0d] border border-[#1a1a1a] hover:border-[#444] transition-colors flex flex-col"
            onClick={handleCardClick}
        >
            {/* Top Header - Provider, Payload & Status */}
            <div className="absolute top-0 left-0 right-0 z-10 px-3 pt-1">
                <div className="flex flex-col gap-1">
                    <div className="inline-flex self-start px-2 rounded-sm bg-gradient-to-b from-black/30 to-black/30">
                        <div className="text-[10px] text-white font-bold uppercase">{providerName}</div>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                            <div className="inline-flex max-w-[72%] px-1 py-1 rounded-sm bg-gradient-to-b from-black/30 to-black/30">
                            <div className="text-white font-bold" title={missionName}>
                                {missionName}
                            </div>
                        </div>
                        {launchType === 'upcoming' && (
                            <div className={`px-2 py-1 rounded-sm text-xs font-bold shrink-0 ${isGoStatus ? 'bg-green-600 text-white' : 'bg-yellow-600 text-black'}`}>
                                {statusText}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Image Section - full card background */}
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

            {/* Content Section */}
            <div className="absolute bottom-0 left-0 right-0 z-10 p-2 flex flex-col bg-gradient-to-t from-black via-black/80 to-transparent">
                <div className="flex items-center justify-center gap-1 mb-1 ">
                    <Countdown launchDate={launch.net} prominent={true} showTPrefix={true} rocket={launch.rocket} />
                </div>
                <div className="text-xs text-white/80 font-medium">
                    {localTimeMain}
                    <span className="text-white/70"> {localTimePeriod}</span>
                    <span className="text-white/50 text-xs"> ({tzAbbr})</span>
                </div>
                <div className="text-xs text-white/70">
                    📅 {localDate}
                </div>

                {sliderData && launchType === 'upcoming' && (
                    <div className="mt-2 px-1">
                        <div className="relative h-[2px] bg-[#333] rounded">
                            {/* Progress bar */}
                            <div
                                className="absolute h-full bg-white/30 rounded"
                                style={{ width: `${Math.min(sliderData.position, 100)}%` }}
                            />

                            <div
                                className="absolute w-4 h-4 bg-green-500 rounded-full border-2 border-[#111]"
                                style={{ left: `${sliderData.liftoffPosition}%`, top: '50%', transform: 'translate(-50%, -50%)' }}
                            />
                        </div>
                        <div className="flex justify-between mt-1 text-[9px] text-white/70">
                            <span>Window open</span>
                            <span className="text-green-400 font-medium">Liftoff: {sliderData.liftoffTime}</span>
                            <span>Close</span>
                        </div>
                    </div>
                )}
                
                {/* Video button - shown for any launch that has video URLs from the API */}
                {hasVideoUrls && (
                    <div className="relative mt-2">
                        {videoUrls.length === 1 ? (
                            <button
                                className="w-full px-3 py-2 bg-[#7f1212] text-white text-xs font-medium rounded-sm hover:bg-[#9a1515] transition-colors flex items-center justify-center gap-1"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(primaryVideoUrl, '_blank');
                                }}
                            >
                                Watch Launch
                            </button>
                        ) : (
                            <>
                                <button
                                    className="w-full px-3 py-2 bg-[#7f1212] text-white text-xs font-medium rounded-sm hover:bg-[#9a1515] transition-colors flex items-center justify-center gap-1"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowStreamDropdown(!showStreamDropdown);
                                    }}
                                >
                                    Watch Launch
                                </button>
                                {showStreamDropdown && (
                                    <div className="absolute bottom-full left-0 right-0 mb-1 bg-[#1a1a1a] border border-[#333] rounded-sm shadow-lg z-20 max-h-40 overflow-y-auto">
                                        {videoUrls.map((vid, index) => (
                                            <button
                                                key={index}
                                                className="w-full px-3 py-2 text-left text-xs text-white hover:bg-[#333] transition-colors truncate"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    window.open(vid.url, '_blank');
                                                    setShowStreamDropdown(false);
                                                }}
                                                title={vid.title || vid.url}
                                            >
                                                {vid.title || `Stream ${index + 1}`}
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