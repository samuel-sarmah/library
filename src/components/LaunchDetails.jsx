import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from './Header';
import Countdown from './Countdown';

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
            <div className="flex flex-col items-center justify-center min-h-screen bg-black">
                <div className="w-12 h-12 border-4 border-[#333] border-t-[#7f1212] rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-400">Loading mission details....</p>
            </div>
        );
    }

    if (!launch) {
        return (
            <div className="min-h-screen bg-black">
                <Header />
                <div className="flex flex-col items-center justify-center py-20">
                    <p className="text-gray-400 mb-4">Mission not found</p>
                    <button 
                        className="px-6 py-3 bg-[#7f1212] text-white rounded hover:bg-[#9a1515] transition-colors"
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
            <div className="min-h-screen bg-black px-4 py-8 max-w-4xl mx-auto">
                <button 
                    className="mb-6 px-4 py-2 bg-[#1a1a1a] border border-[#333] rounded text-white hover:bg-[#222] transition-colors"
                    onClick={() => navigate('/')}
                >
                    ← Back to Launches
                </button>

                <div className="rounded-md overflow-hidden mb-8">
                    <img
                        src={launch.image || 'https://via.placeholder.com/800x400?text=No+Image'}
                        alt={launch.name}
                        className="w-full h-64 md:h-96 object-cover"
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
                                                <span className="text-white">{stage.launcher?.status || 'N/A'}</span>
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
                </div>
            </div>
        </>
    );
}

export default LaunchDetails;
