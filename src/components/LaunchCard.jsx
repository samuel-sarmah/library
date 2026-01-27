import { useNavigate } from 'react-router-dom';
import Countdown from './Countdown';

function LaunchCard({ launch }) {
    const navigate = useNavigate();

    const handleCardClick = () => {
        navigate(`/launch/${launch.id}`);
    };

    return (
        <div className="launch-card" onClick={handleCardClick}>
            <div className="launch-card-image">
                <img
                    src={launch.image || 'https://via.placeholder.com/400x250?text=No+Image'}
                    alt={launch.name}
                />
                <div className="countdown-overlay">
                    <Countdown launchDate={launch.net} />
                </div>
            </div>
            <div className="launch-card-content">
                <h2 className="launch-card-name">{launch.name}</h2>
                <div className="launch-card-details">
                    <div className="launch-card-row">
                        <span className="launch-card-value">
                            {launch.launch_service_provider?.name || 'TBD'}
                        </span>
                    </div>
                    <div className="launch-card-row">
                        <span className="launch-card-value">
                            {launch.pad?.location?.name || 'TBD'}
                        </span>
                    </div>
                    <div className="launch-card-row">
                        <span className="launch-card-value">
                            {new Date(launch.net).toLocaleDateString('en-us', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </span>
                    </div>
                </div>
                {(() => {
                    const videoUrls = launch.vid_urls || launch.vidURLs || launch.mission?.vid_urls || [];
                    return videoUrls.length > 0 ? (
                        <a
                            href={videoUrls[0].url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="launch-card-button"
                            onClick={(e) => e.stopPropagation()}
                        >
                            Watch Live
                        </a>
                    ) : null;
                })()}
            </div>
        </div>
    );
}

export default LaunchCard;