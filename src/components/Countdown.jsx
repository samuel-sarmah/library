import React from 'react';
import { useState, useEffect, useRef } from 'react';
import '../styles/Countdown.css';

function Countdown({ launchDate }) {
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

    if (timeLeft.launched) {
        return <div className="countdown-launched">Launched</div>;
    }

    const segments = [];
    
    // Only include days if more than 0
    if (timeLeft.days > 0) {
        segments.push(
            <div key="days" className="countdown-segment">
                <span className="countdown-value">{String(timeLeft.days).padStart(2, '0')}</span>
                <span className="countdown-label">Days</span>
            </div>
        );
    }
    
    // Always include hours, minutes, seconds
    segments.push(
        <div key="hours" className="countdown-segment">
            <span className="countdown-value">{String(timeLeft.hours).padStart(2, '0')}</span>
            <span className="countdown-label">Hrs</span>
        </div>
    );
    
    segments.push(
        <div key="minutes" className="countdown-segment">
            <span className="countdown-value">{String(timeLeft.minutes).padStart(2, '0')}</span>
            <span className="countdown-label">Mins</span>
        </div>
    );
    
    segments.push(
        <div key="seconds" className="countdown-segment">
            <span className="countdown-value">{String(timeLeft.seconds).padStart(2, '0')}</span>
            <span className="countdown-label">Secs</span>
        </div>
    );

    return (
        <div className="countdown">
            <div className="countdown-segments">
                {segments.map((segment, index) => (
                    <React.Fragment key={index}>
                        {segment}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
}

export default Countdown;