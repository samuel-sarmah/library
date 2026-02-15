import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Countdown from './Countdown';

function LaunchCard({ launch, launchType }) {
    const navigate = useNavigate();
    const [showStreamDropdown, setShowStreamDropdown] = useState(false);

    const handleCardClick = () => {
        navigate(`/launch/${launch.id}`);
    };



    const providerLogo = launch.launch_service_provider?.logo?.image_url || launch.launch_service_provider?.logo?.thumbnail_url;
    const providerName = launch.launch_service_provider?.abbrev || launch.launch_service_provider?.name;

    const payloads = launch.mission?.launches?.[0]?.payloads || [];
    const primaryPayload = launch.mission?.name || payloads[0]?.name || launch.name?.split('|')[1]?.trim() || 'Payload TBD';
    const hasMultiplePayloads = payloads.length > 1;
    const payloadDisplay = hasMultiplePayloads ? `${primaryPayload} (+${payloads.length - 1})` : primaryPayload;

    const isGoStatus = [
        'Go for Launch',
        'Launch Commit',
        'In Flight'
    ].some(status => launch.status?.name?.includes(status));
    const statusText = isGoStatus ? 'GO' : 'TBD';

    const launchDateTime = new Date(launch.net);

    // Use user's local timezone
    const localTimeParts = launchDateTime.toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    }).match(/(\d{1,2}:\d{2})\s*(AM|PM)?/i);

    const localTimeMain = localTimeParts ? localTimeParts[1] : '';
    const localTimePeriod = localTimeParts ? localTimeParts[2] : '';

    // Get user's timezone abbreviation
    const tzAbbr = new Intl.DateTimeFormat('en-US', { timeZoneName: 'short' })
        .formatToParts(launchDateTime)
        .find(part => part.type === 'timeZoneName')?.value || '';

    const localDate = launchDateTime.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });



    // Calculate launch window slider position
    const getSliderPosition = () => {
        const now = new Date();
        const windowStart = launch.window_start ? new Date(launch.window_start) : null;
        const windowEnd = launch.window_end ? new Date(launch.window_end) : null;
        const liftoff = new Date(launch.net);

        if (!windowStart || !windowEnd) return null;

        const totalWindow = windowEnd - windowStart;
        if (totalWindow <= 0) return null;

        const elapsed = now - windowStart;
        const position = Math.max(0, Math.min(100, (elapsed / totalWindow) * 100));
        const liftoffPosition = Math.max(0, Math.min(100, ((liftoff - windowStart) / totalWindow) * 100));

        // Format times with more detail
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

    // Get video URLs from the API (vidURLs or vid_urls)
    const videoUrls = Array.isArray(launch.vidURLs) ? launch.vidURLs :
        Array.isArray(launch.vid_urls) ? launch.vid_urls : [];
    const hasVideoUrls = videoUrls.length > 0;
    const primaryVideoUrl = hasVideoUrls ? videoUrls[0].url : null;


    return (
        <div
            className="relative h-[380px] rounded-md overflow-hidden cursor-pointer bg-[#0d0d0d] border border-[#1a1a1a] hover:border-[#444] transition-colors flex flex-col"
            onClick={handleCardClick}
        >
            {/* Top Header - Provider, Payload & Status */}
            <div className="absolute h-10 top-0 left-0 right-0 z-10 " style={{ paddingBottom: '2rem' }}>
                <div className="flex flex-col  gap-0.5 bg-gradient-to-b from-black/70 via-black/40 to-tansparent">
                    {providerLogo ? (
                        <img 
                            src={providerLogo} 
                            alt={providerName}
                            className="h-5 w-auto object-contain self-start"
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                        />
                    ) : (
                        <div className="text-[10px] text-white/200 font-medium uppercase tracking-wide">{providerName}</div>
                    )}
                    <div className="flex items-center justify-between gap-2">
                        <div className="text-lg font-bold text-white truncate flex-1" title={hasMultiplePayloads ? `${payloads.length} payloads` : payloadDisplay}>
                            {payloadDisplay}
                        </div>
                        {launchType === 'upcoming' && (
                            <div className={`px-2 py-0.5 rounded-sm text-xs font-bold shrink-0 ${isGoStatus ? 'bg-green-600 text-white' : 'bg-yellow-600 text-black'}`}>
                                {statusText}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Image Section - full card background */}
            <div className="absolute inset-0">
                <img
                    src={launch.image?.image_url || launch.image?.thumbnail_url || 'https://via.placeholder.com/400x300?text=No+Image'}
                    alt={launch.name}
                    className="w-full h-full object-cover object-top"
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
                            <span>Open: {sliderData.windowStartTime}</span>
                            <span className="text-green-400 font-medium">Liftoff: {sliderData.liftoffTime}</span>
                            <span>Close: {sliderData.windowEndTime}</span>
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
                                    ▶ Watch Launch ({videoUrls.length})
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
                                                ▶ {vid.title || `Stream ${index + 1}`}
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

export default LaunchCard;