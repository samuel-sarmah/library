import { memo, useMemo } from 'react';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function CalendarView({ launches, currentMonth, onMonthChange, onNavigate }) {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const monthLabel = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    // Build a map of date-string → launches for quick lookup
    const launchMap = useMemo(() => {
        const map = {};
        launches.forEach((launch) => {
            const d = new Date(launch.net);
            if (d.getFullYear() === year && d.getMonth() === month) {
                const key = d.getDate();
                if (!map[key]) map[key] = [];
                map[key].push(launch);
            }
        });
        return map;
    }, [launches, year, month]);

    // Number of days in month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // Monday-based offset of the 1st (0=Mon … 6=Sun)
    const firstDayOffset = (new Date(year, month, 1).getDay() + 6) % 7;

    // Build grid cells: nulls for leading empty cells, then day numbers
    const cells = [
        ...Array(firstDayOffset).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];

    // Pad to complete the last row
    while (cells.length % 7 !== 0) cells.push(null);

    const today = new Date();
    const isToday = (day) =>
        day &&
        today.getDate() === day &&
        today.getMonth() === month &&
        today.getFullYear() === year;

    return (
        <div className="max-w-7xl mx-auto">
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-4">
                <button
                    className="px-3 py-1.5 bg-[#1a1a1a] border border-[#333] rounded text-white hover:bg-[#222] transition-colors text-sm"
                    onClick={() => onMonthChange(-1)}
                >
                    &#8249; Prev
                </button>
                <span className="text-white font-semibold">{monthLabel}</span>
                <button
                    className="px-3 py-1.5 bg-[#1a1a1a] border border-[#333] rounded text-white hover:bg-[#222] transition-colors text-sm"
                    onClick={() => onMonthChange(1)}
                >
                    Next &#8250;
                </button>
            </div>

            {/* Day-of-week headers */}
            <div className="grid grid-cols-7 mb-1">
                {DAY_LABELS.map((d) => (
                    <div key={d} className="text-center text-xs text-gray-500 font-medium py-1">
                        {d}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-px bg-[#1a1a1a] border border-[#1a1a1a] rounded overflow-hidden">
                {cells.map((day, idx) => {
                    const dayLaunches = day ? (launchMap[day] || []) : [];
                    return (
                        <div
                            key={idx}
                            className={`min-h-[80px] p-1.5 bg-black ${day ? '' : 'opacity-0 pointer-events-none'}`}
                        >
                            {day && (
                                <>
                                    <span className={`text-xs font-medium mb-1 block ${isToday(day) ? 'text-[#4da6ff]' : 'text-gray-500'}`}>
                                        {day}
                                    </span>
                                    <div className="flex flex-col gap-0.5 overflow-hidden">
                                        {dayLaunches.slice(0, 3).map((launch) => (
                                            <button
                                                key={launch.id}
                                                className="text-left text-[10px] leading-tight px-1 py-0.5 bg-[#7f1212] hover:bg-[#9a1515] text-white rounded truncate transition-colors w-full"
                                                title={launch.name}
                                                onClick={() => onNavigate(launch.id)}
                                            >
                                                {launch.mission?.name || launch.name}
                                            </button>
                                        ))}
                                        {dayLaunches.length > 3 && (
                                            <span className="text-[10px] text-gray-500 px-1">
                                                +{dayLaunches.length - 3} more
                                            </span>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>

            {Object.keys(launchMap).length === 0 && (
                <p className="text-center text-gray-500 mt-6 text-sm">No launches scheduled this month.</p>
            )}
        </div>
    );
}

export default memo(CalendarView);
