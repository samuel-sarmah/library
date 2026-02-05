import React from 'react';
import { useState, useEffect, useRef } from 'react';

function Countdown({ launchDate, prominent = false, showTPrefix = false }) {
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
        const prefix = timeLeft.launched ? 'Launched' : 'T-';
        const timeString = timeLeft.launched ? '' : [
            timeLeft.days > 0 ? String(timeLeft.days).padStart(2, '0') : null,
            String(timeLeft.hours).padStart(2, '0'),
            String(timeLeft.minutes).padStart(2, '0'),
            String(timeLeft.seconds).padStart(2, '0')
        ].filter(Boolean).join(':');

        return (
            <div className="flex justify-center items-center gap-1 text-xl font-mono">
                {showTPrefix && <span className={`${timeLeft.launched ? 'text-green-400' : 'text-cyan-400'} font-bold`}>{prefix}</span>}
                {!timeLeft.launched && <span className="text-white">{timeString}</span>}
            </div>
        );
    }

    if (timeLeft.launched) {
        return (
            <div className="text-sm font-bold text-green-400 px-4 py-1">
                ✓ Launched
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