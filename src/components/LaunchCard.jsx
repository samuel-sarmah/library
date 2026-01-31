import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Countdown from './Countdown';

function LaunchCard({ launch }) {
    const navigate = useNavigate();
    const [showStreamDropdown, setShowStreamDropdown] = useState(false);

    const handleCardClick = () => {
        navigate(`/launch/${launch.id}`);
    };



    const providerLogo = launch.launch_service_provider?.logo_url;
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

    // Use user's local timezone
    const launchDateTime = new Date(launch.net);
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
        const liftoffPosition = ((liftoff - windowStart) / totalWindow) * 100;

        // Format times
        const formatTime = (date) => date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });

        return {
            position,
            liftoffPosition,
            windowStartTime: formatTime(windowStart),
            windowEndTime: formatTime(windowEnd)
        };
    };

    const sliderData = getSliderPosition();

    // Get video URLs - API returns vidURLs array
    const videoUrls = Array.isArray(launch.vidURLs) ? launch.vidURLs :
        Array.isArray(launch.vid_urls) ? launch.vid_urls : [];
    


    return (
        <div
            className="relative h-[380px] rounded-md overflow-hidden cursor-pointer bg-[#0d0d0d] border border-[#1a1a1a] hover:border-[#444] transition-colors"
            onClick={handleCardClick}
        >
            {/* Top Header - Provider, Payload & Status */}
            <div className="absolute top-0 left-0 right-0 z-10 p-3 ">
                <div className="flex flex-col gap-1">
                    {providerLogo && (
                        <img
                            src={providerLogo}
                            alt={providerName}
                            className="max-w-[80px] max-h-8 object-contain"
                        />
                    )}
                    <div className="flex items-center justify-between gap-2">
                        <div className="text-base font-bold text-white truncate flex-1" title={hasMultiplePayloads ? `${payloads.length} payloads` : payloadDisplay}>
                            {payloadDisplay}
                        </div>
                        <div className={`px-2 py-0.5 rounded-sm text-xs font-bold shrink-0 ${isGoStatus ? 'bg-green-600 text-white' : 'bg-yellow-600 text-black'}`}>
                            {statusText}
                        </div>
                    </div>
                </div>
            </div>

            {/* Image Section - 50% height */}
            <div className="h-[50%] relative">
                <img
                    src={launch.image || 'https://via.placeholder.com/400x300?text=No+Image'}
                    alt={launch.name}
                    className="w-full h-full object-cover"
                />
            </div>

            <div className="bg-[#111] py-2 px-3 border-t border-[#1a1a1a]">
                <div className="flex justify-center items-start gap-1">
                    <span className="text-2xl font-extrabold text-white font-mono leading-none">T-</span>
                    <Countdown launchDate={launch.net} />
                </div>
            </div>

            {/* Content Section */}
            <div className="flex-1 p-3 bg-[#0d0d0d] flex flex-col">
                <div className="text-sm text-white font-medium">
                    {localTimeMain}
                    <span className="text-white/70"> {localTimePeriod}</span>
                    <span className="text-white/50 text-xs"> ({tzAbbr})</span>
                </div>
                <div className="text-xs text-white/70">
                    📅 {localDate}
                </div>

                {sliderData && (
                    <div className="mt-2 px-1">
                        <div className="relative h-1.5 bg-[#333] rounded">
                            {/* Progress bar */}
                            <div
                                className="absolute h-full bg-white/30 rounded"
                                style={{ width: `${Math.min(sliderData.position, 100)}%` }}
                            />

                            <div
                                className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full border-2 border-[#111]"
                                style={{ left: `${sliderData.liftoffPosition}%`, transform: 'translate(-50%, -50%)' }}
                            />
                        </div>
                        <div className="flex justify-between mt-1 text-[9px] text-white/70">
                            <span>{sliderData.windowStartTime}</span>
                            <span className="text-white">Liftoff</span>
                            <span>{sliderData.windowEndTime}</span>
                        </div>
                    </div>
                )}
                
                {/* Debug: Always show video button - aligned below progress bar */}
                <div className="relative mt-auto pt-3 hidden lg:block">
                    <button
                        className="w-full px-3 py-2 bg-[#7f1212] text-white text-xs font-medium rounded-sm hover:bg-[#9a1515] transition-colors flex items-center justify-center gap-1"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (videoUrls.length === 1 && videoUrls[0]) {
                                window.open(videoUrls[0].url, '_blank');
                            } else if (videoUrls.length > 0) {
                                setShowStreamDropdown(!showStreamDropdown);
                            } else {
                                alert('No video URLs available for this launch');
                            }
                        }}
                    >
                        Watch Livestream
                        {videoUrls.length > 1 && <span className="text-[10px]">▼</span>}
                    </button>

                    {showStreamDropdown && videoUrls.length > 1 && (
                        <div
                            className="absolute bottom-full left-0 right-0 mb-1 bg-[#1a1a1a] border border-[#333] rounded overflow-hidden z-50 min-w-[150px]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {videoUrls.map((video, index) => (
                                <a
                                    key={index}
                                    href={video.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block px-3 py-2 text-xs text-white hover:bg-[#333] transition-colors border-b border-[#333] last:border-b-0"
                                >
                                    {video.title || video.type?.name || `Stream ${index + 1}`}
                                </a>
                            ))}
                        </div>
                    )}
                </div>
                
                {/* Mobile/Tablet video button */}
                <div className="relative mt-3 lg:hidden">
                    <button
                        className="w-full px-3 py-2 bg-[#7f1212] text-white text-xs font-medium rounded-sm hover:bg-[#9a1515] transition-colors flex items-center justify-center gap-1"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (videoUrls.length === 1 && videoUrls[0]) {
                                window.open(videoUrls[0].url, '_blank');
                            } else if (videoUrls.length > 0) {
                                setShowStreamDropdown(!showStreamDropdown);
                            }
                        }}
                    >
                        Watch Livestream
                        {videoUrls.length > 1 && <span className="text-[10px]">▼</span>}
                    </button>

                    {showStreamDropdown && videoUrls.length > 1 && (
                        <div
                            className="absolute bottom-full left-0 right-0 mb-1 bg-[#1a1a1a] border border-[#333] rounded overflow-hidden z-50 min-w-[150px]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {videoUrls.map((video, index) => (
                                <a
                                    key={index}
                                    href={video.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block px-3 py-2 text-xs text-white hover:bg-[#333] transition-colors border-b border-[#333] last:border-b-0"
                                >
                                    {video.title || video.type?.name || `Stream ${index + 1}`}
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
 }

export default LaunchCard;