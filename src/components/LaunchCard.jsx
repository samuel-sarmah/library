import { useNavigate } from 'react-router-dom';
import Countdown from './Countdown';

function LaunchCard({ launch }) {
    const navigate = useNavigate();

    const handleCardClick = () => {
        navigate(`/launch/${launch.id}`);
    };

    const isLaunchWithinCurrentDay = () => {
        const launchDate = new Date(launch.net);
        const now = new Date();
        const timeDiff = launchDate - now;
        const hoursDiff = timeDiff / (1000 * 60 * 60);
        
        // Show overlay for launches within 24 hours
        return hoursDiff <= 24 && hoursDiff > 0;
    };

    const showOverlayTimer = isLaunchWithinCurrentDay();
    
    // Get payload name from mission
    const payloadName = launch.mission?.name || launch.name?.split('|')[1]?.trim() || 'Payload TBD';
    
    // Get rocket configuration name
    const rocketConfig = launch.rocket?.configuration?.name || 'Rocket TBD';
    
    // Get launch provider name (abbreviated if possible)
    const launchProvider = launch.launch_service_provider?.abbrev || 
                          launch.launch_service_provider?.name || 'Provider TBD';
    
    // Get location
    const launchLocation = launch.pad?.location?.name || 'Location TBD';

    // Format launch date
    const launchDate = new Date(launch.net).toLocaleDateString('en-us', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    // Get video URLs
    const videoUrls = launch.vid_urls || launch.vidURLs || launch.mission?.vid_urls || [];
    const hasVideo = videoUrls.length > 0;

    return (
        <div className="launch-card" onClick={handleCardClick}>
            <div className="launch-card-image">
                <img
                    src={launch.image || 'https://via.placeholder.com/400x300?text=No+Image'}
                    alt={launch.name}
                />
                
                <div className="launch-card-image-overlay"></div>
                
                {showOverlayTimer && (
                    <div className="countdown-overlay">
                        <Countdown launchDate={launch.net} />
                    </div>
                )}
                
                <div className="launch-card-image-info">
                    <div className="launch-card-date">{launchDate}</div>
                    <div className="launch-card-payload">{payloadName}</div>
                </div>
            </div>
            
            <div className="launch-card-content">
                <div className="launch-card-meta-row">
                    <span className="launch-card-rocket">{rocketConfig}</span>
                    <span className="launch-card-divider">|</span>
                    <span className="launch-card-provider">{launchProvider}</span>
                </div>
                
                <div className="launch-card-location">
                    <svg className="location-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <span>{launchLocation}</span>
                </div>
                
                {hasVideo && (
                    <a
                        href={videoUrls[0].url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="launch-card-button"
                        onClick={(e) => e.stopPropagation()}
                    >
                        Watch Live
                    </a>
                )}
            </div>
        </div>
    );
}

export default LaunchCard;