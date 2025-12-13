import React, { useState, useEffect } from 'react';

export const LiveClock: React.FC = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);

    const formatDate = (date: Date) => {
        const month = date.toLocaleDateString(undefined, { month: 'short' });
        const weekday = date.toLocaleDateString(undefined, { weekday: 'short' });
        const day = date.getDate();

        return `${weekday}, ${month} ${day}`;
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    return (
        <div className="text-white text-right">
            <p className="font-bold text-sm leading-tight">{formatTime(time)}</p>
            <p className="text-xs opacity-80 leading-tight">{formatDate(time)}</p>
        </div>
    );
};