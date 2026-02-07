import React from 'react';
import { useState, useEffect, useRef } from 'react';

function Countdown({ launchDate, prominent = false, showTPrefix = false, rocket = null }) {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        launched: false
    });
    const intervalRef = useRef(null);

    useEffect(() => {
        const updateCountdown = () => {
            const now = new Date();
            const launch = new Date(launchDate);
            const diff = launch - now;

            if (diff < 0) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, launched: true });
            } else {
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);

                setTimeLeft({ days, hours, minutes, seconds, launched: false });
            }
        };

        updateCountdown();
        intervalRef.current = setInterval(updateCountdown, 1000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [launchDate]);

    // Prominent display variant
    if (prominent) {
        if (timeLeft.launched) {
            return (
                <div className="flex flex-col items-center gap-2">
                    <div className="flex justify-center items-center gap-1 text-3xl font-mono">
                        <span className="text-green-400 font-bold">Launched</span>
                    </div>
                    {rocket?.configuration && (
                        <div className="text-center text-xs">
                            <div className="text-white/80 font-medium">{rocket.configuration.name}</div>
                            <div className="text-white/60">
                                {rocket.configuration.length && <span>{rocket.configuration.length}m</span>}
                                {rocket.configuration.launch_mass && <span> • {rocket.configuration.launch_mass}t</span>}
                                {rocket.configuration.reusable && <span> • Reusable</span>}
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        

        return (
            <div className="flex justify-center items-center gap-1 text-xl font-mono">
                {showTPrefix && <span className="text-white-700 font-bold self-start">T-</span>}
                {timeLeft.days > 0 && (
                    <div className="flex flex-col items-center">
                        <span className="text-white/900 font-bold">{String(timeLeft.days).padStart(2, '0')}</span>
                        <span className="text-[10px] text-white/600 font-bold uppercase tracking-wider mt-1">Days</span>
                    </div>
                )}
                {timeLeft.days > 0 && <span className="text-white self-start">:</span>}
                <div className="flex flex-col items-center">
                    <span className="text-white/900 font-bold">{String(timeLeft.hours).padStart(2, '0')}</span>
                    <span className="text-[10px] text-white/600 font-bold uppercase tracking-wider mt-1">Hrs</span>
                </div>
                <span className="text-white self-start">:</span>
                <div className="flex flex-col items-center">
                    <span className="text-white/900 font-bold">{String(timeLeft.minutes).padStart(2, '0')}</span>
                    <span className="text-[10px] text-white/600 font-bold uppercase tracking-wider mt-1">Mins</span>
                </div>
                <span className="text-white self-start">:</span>
                <div className="flex flex-col items-center">
                    <span className="text-white/900 font-bold">{String(timeLeft.seconds).padStart(2, '0')}</span>
                    <span className="text-[10px] text-white/600 font-bold uppercase tracking-wider mt-1">Secs</span>
                </div>
            </div>
        );
    }

    if (timeLeft.launched) {
        return (
            <div className="text-sm font-bold text-green-400 px-4 py-1">
                Launched
            </div>
        );
    }

    const segments = [];
    
    if (timeLeft.days > 0) {
        segments.push(
            <div key="days" className="flex flex-col items-center px-2">
                <span className="text-2xl font-extrabold text-white leading-none font-mono">{String(timeLeft.days).padStart(2, '0')}</span>
                <span className="text-[10px] text-white/60 uppercase tracking-wider mt-0.5">Days</span>
            </div>
        );
    }
    
    segments.push(
        <div key="hours" className="flex flex-col items-center px-2">
            <span className="text-2xl font-extrabold text-white leading-none font-mono">{String(timeLeft.hours).padStart(2, '0')}</span>
            <span className="text-[10px] text-white/60 uppercase tracking-wider mt-0.5">Hrs</span>
        </div>
    );
    
    segments.push(
        <div key="minutes" className="flex flex-col items-center px-2">
            <span className="text-2xl font-extrabold text-white leading-none font-mono">{String(timeLeft.minutes).padStart(2, '0')}</span>
            <span className="text-[10px] text-white/60 uppercase tracking-wider mt-0.5">Mins</span>
        </div>
    );
    
    segments.push(
        <div key="seconds" className="flex flex-col items-center px-2">
            <span className="text-2xl font-extrabold text-white leading-none font-mono">{String(timeLeft.seconds).padStart(2, '0')}</span>
            <span className="text-[10px] text-white/60 uppercase tracking-wider mt-0.5">Secs</span>
        </div>
    );

    return (
        <div className="flex items-center justify-center gap-1">
            {segments.map((segment, index) => (
                <React.Fragment key={index}>
                    {index > 0 && <span className="text-xl font-bold text-white/50 self-start mt-1">:</span>}
                    {segment}
                </React.Fragment>
            ))}
        </div>
    );
}

export default Countdown;