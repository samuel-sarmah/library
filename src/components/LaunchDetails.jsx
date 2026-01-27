import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from './Header';
import Countdown from './Countdown';
import '../styles/LaunchDetails.css';

function LaunchDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [launch, setLaunch] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`https://ll.thespacedevs.com/2.2.0/launch/${id}/?mode=detailed`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // Check if data has expected properties (not a rate limit error)
                if (data.detail || !data.id) {
                    throw new Error(data.detail || 'Invalid response from API');
                }
                setLaunch(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('API Error:', err);
                alert(`Sorry, ${err.message}. You may have hit the API rate limit - please wait and try again.`);
                setLoading(false);
            });
    }, [id]);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p className="loading-text">Loading mission details....</p>
            </div>
        );
    }

    if (!launch) {
        return (
            <div className="details-container">
                <Header />
                <div className="details-error">
                    <p>Mission not found</p>
                    <button className="back-button" onClick={() => navigate('/')}>
                         Back to Launches
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <Header />
            <div className="details-container">
                <button className="back-button" onClick={() => navigate('/')}>
                    Back to Launches
                </button>

                <div className="details-hero">
                    <img
                        src={launch.image || 'https://via.placeholder.com/800x400?text=No+Image'}
                        alt={launch.name}
                        className="details-hero-image"
                    />
                </div>

                <div className="details-content">
                    <h1 className="details-title">{launch.name}</h1>

                    <div className="details-countdown-wrapper">
                        <Countdown launchDate={launch.net} />
                    </div>

                    <div className="details-info-list">
                        <div className="details-info-row">
                            <span className="details-info-label">Rocket</span>
                            <span className="details-info-value">
                                {launch.rocket?.configuration?.name || 'TBD'}
                            </span>
                        </div>

                        <div className="details-info-row">
                            <span className="details-info-label">Launch Site</span>
                            <span className="details-info-value">
                                {launch.pad?.name || 'TBD'}
                            </span>
                        </div>

                        <div className="details-info-row">
                            <span className="details-info-label">Location</span>
                            <span className="details-info-value">
                                {launch.pad?.location?.name || 'TBD'}
                            </span>
                        </div>

                        <div className="details-info-row">
                            <span className="details-info-label">Launch Date</span>
                            <span className="details-info-value">
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

                        <div className="details-info-row">
                            <span className="details-info-label">Status</span>
                            <span className="details-info-value details-status">
                                {launch.status?.name || 'TBD'}
                            </span>
                        </div>

                        {launch.mission?.orbit && (
                            <div className="details-info-row">
                                <span className="details-info-label">Orbit</span>
                                <span className="details-info-value">
                                    {launch.mission.orbit.name}
                                </span>
                            </div>
                        )}
                    </div>

                    {launch.mission?.description && (
                        <div className="details-mission-text">
                            <h2 className="details-section-title">Mission Details</h2>
                            <p className="details-mission-description">
                                {launch.mission.description}
                            </p>
                        </div>
                    )}

                    {launch.launch_service_provider && typeof launch.launch_service_provider === 'object' && (
                        <div className="details-company-section">
                            <h2 className="details-section-title">Launch Provider</h2>
                            <div className="details-company-info">
                                {launch.launch_service_provider.description && (
                                    <p className="details-company-description">
                                        {launch.launch_service_provider.description}
                                    </p>
                                )}
                                <div className="details-company-stats">
                                    <div className="details-stat-row">
                                        <span className="details-stat-label">Founded</span>
                                        <span className="details-stat-value">{launch.launch_service_provider?.founding_year || 'N/A'}</span>
                                    </div>
                                    <div className="details-stat-row">
                                        <span className="details-stat-label">Admin</span>
                                        <span className="details-stat-value">{launch.launch_service_provider?.administrator || 'N/A'}</span>
                                    </div>
                                    <div className="details-stat-row">
                                        <span className="details-stat-label">Total Launches</span>
                                        <span className="details-stat-value">{launch.launch_service_provider?.total_launch_count || 'N/A'}</span>
                                    </div>
                                    <div className="details-stat-row">
                                        <span className="details-stat-label">Successful Launches</span>
                                        <span className="details-stat-value">{launch.launch_service_provider?.successful_launches || 'N/A'}</span>
                                    </div>
                                    <div className="details-stat-row">
                                        <span className="details-stat-label">Launch Vehicles</span>
                                        <span className="details-stat-value">{launch.launch_service_provider?.launchers || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {launch.rocket && launch.rocket.configuration && typeof launch.rocket.configuration === 'object' && (
                        <div className="details-rocket-section">
                            <h2 className="details-section-title">Rocket Details</h2>
                            <div className="details-rocket-info">
                                {launch.rocket.configuration.description && (
                                    <p className="details-rocket-description">
                                        {launch.rocket.configuration.description}
                                    </p>
                                )}
                                <div className="details-rocket-specs">
                                    <div className="details-stat-row">
                                        <span className="details-stat-label">Height</span>
                                        <span className="details-stat-value">{launch.rocket?.configuration?.length ? `${launch.rocket.configuration.length} m` : 'N/A'}</span>
                                    </div>
                                    <div className="details-stat-row">
                                        <span className="details-stat-label">Diameter</span>
                                        <span className="details-stat-value">{launch.rocket?.configuration?.diameter ? `${launch.rocket.configuration.diameter} m` : 'N/A'}</span>
                                    </div>
                                    <div className="details-stat-row">
                                        <span className="details-stat-label">Launch Mass</span>
                                        <span className="details-stat-value">{launch.rocket?.configuration?.launch_mass ? `${launch.rocket.configuration.launch_mass} t` : 'N/A'}</span>
                                    </div>
                                    <div className="details-stat-row">
                                        <span className="details-stat-label">LEO Capacity</span>
                                        <span className="details-stat-value">{launch.rocket?.configuration?.leo_capacity ? `${launch.rocket.configuration.leo_capacity} kg` : 'N/A'}</span>
                                    </div>
                                    <div className="details-stat-row">
                                        <span className="details-stat-label">GTO Capacity</span>
                                        <span className="details-stat-value">{launch.rocket?.configuration?.gto_capacity ? `${launch.rocket.configuration.gto_capacity} kg` : 'N/A'}</span>
                                    </div>
                                    <div className="details-stat-row">
                                        <span className="details-stat-label">Thrust</span>
                                        <span className="details-stat-value">{launch.rocket?.configuration?.to_thrust ? `${launch.rocket.configuration.to_thrust} kN` : 'N/A'}</span>
                                    </div>
                                    <div className="details-stat-row">
                                        <span className="details-stat-label">Reusable</span>
                                        <span className="details-stat-value">{launch.rocket?.configuration?.reusable ? 'Yes' : 'No'}</span>
                                    </div>
                                    <div className="details-stat-row">
                                        <span className="details-stat-label">Maiden Flight</span>
                                        <span className="details-stat-value">{launch.rocket?.configuration?.maiden_flight || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {launch.rocket?.launcher_stage && Array.isArray(launch.rocket.launcher_stage) && launch.rocket.launcher_stage.length > 0 && (
                        <div className="details-booster-section">
                            <h2 className="details-section-title">Booster Information</h2>
                            <div className="details-booster-info">
                                {launch.rocket.launcher_stage.map((stage, index) => (
                                    <div key={index} className="details-booster-card">
                                        <div className="details-booster-header">
                                            <h3>Stage {stage.type || 'Unknown'}</h3>
                                        </div>
                                        <div className="details-booster-details">
                                            <div className="details-stat-row">
                                                <span className="details-stat-label">Serial Number</span>
                                                <span className="details-stat-value">{stage.launcher?.serial_number || 'N/A'}</span>
                                            </div>
                                            <div className="details-stat-row">
                                                <span className="details-stat-label">Flight Number</span>
                                                <span className="details-stat-value">{stage.launcher_flight_number || 'N/A'}</span>
                                            </div>
                                            <div className="details-stat-row">
                                                <span className="details-stat-label">Reused</span>
                                                <span className="details-stat-value">{stage.reused ? 'Yes' : 'No'}</span>
                                            </div>
                                            <div className="details-stat-row">
                                                <span className="details-stat-label">Status</span>
                                                <span className="details-stat-value">{stage.launcher?.status || 'N/A'}</span>
                                            </div>
                                            {stage.landing && (
                                                <>
                                                    <div className="details-stat-row">
                                                        <span className="details-stat-label">Landing Success</span>
                                                        <span className="details-stat-value">{stage.landing.success ? 'Yes' : 'No'}</span>
                                                    </div>
                                                    <div className="details-stat-row">
                                                        <span className="details-stat-label">Landing Location</span>
                                                        <span className="details-stat-value">{stage.landing.location?.name || 'N/A'}</span>
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
                        <div className="details-video-wrapper">
                            <h2 className="details-section-title">Watch Live</h2>
                            <div className="details-video-links">
                                {(launch.vid_urls || launch.vidURLs).map((vid, index) => (
                                    <a
                                        key={index}
                                        href={vid.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="details-video-button"
                                    >
                                        ▶ Watch Live
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
