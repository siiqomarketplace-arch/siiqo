import React from 'react';

// --- START OF TYPESCRIPT CONVERSION ---

interface PeakHoursHeatmapProps {
    data: number[][]; // A 2D array representing days and hours
}

// --- END OF TYPESCRIPT CONVERSION ---

const PeakHoursHeatmap: React.FC<PeakHoursHeatmapProps> = ({ data }) => {
    const days: string[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const hours: number[] = Array.from({ length: 24 }, (_, i) => i);

    const maxValue = Math.max(...data.flat(), 1); // Avoid division by zero

    const getIntensityColor = (value: number): string => {
        const intensity = value / maxValue;

        if (intensity === 0) return 'bg-gray-100';
        if (intensity <= 0.2) return 'bg-blue-100';
        if (intensity <= 0.4) return 'bg-blue-200';
        if (intensity <= 0.6) return 'bg-blue-300';
        if (intensity <= 0.8) return 'bg-blue-400';
        return 'bg-blue-500';
    };

    const getTextColor = (value: number): string => {
        const intensity = value / maxValue;
        return intensity > 0.6 ? 'text-white' : 'text-text-primary';
    };

    const formatHour = (hour: number): string => {
        if (hour === 0) return '12 AM';
        if (hour < 12) return `${hour} AM`;
        if (hour === 12) return '12 PM';
        return `${hour - 12} PM`;
    };

    return (
        <div className="bg-white rounded-lg border border-border p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-text-primary">Peak Hours Activity</h3>
                <div className="flex items-center space-x-2 text-sm text-text-secondary">
                    <span>Low</span>
                    <div className="flex space-x-1">
                        <div className="w-3 h-3 bg-gray-100 rounded"></div>
                        <div className="w-3 h-3 bg-blue-200 rounded"></div>
                        <div className="w-3 h-3 bg-blue-400 rounded"></div>
                        <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    </div>
                    <span>High</span>
                </div>
            </div>

            <div className="overflow-x-auto">
                <div className="min-w-full">
                    {/* Hour labels */}
                    <div className="flex mb-2">
                        <div className="w-12"></div>
                        {hours.map((hour) => (
                            <div key={hour} className="w-8 text-xs text-text-secondary text-center">
                                {hour % 4 === 0 ? formatHour(hour).split(' ')[0] : ''}
                            </div>
                        ))}
                    </div>

                    {/* Heatmap grid */}
                    {days.map((day, dayIndex) => (
                        <div key={day} className="flex items-center mb-1">
                            <div className="w-12 text-sm font-medium text-text-secondary text-right pr-2">
                                {day}
                            </div>
                            {hours.map((hour) => {
                                const value = data[dayIndex]?.[hour] || 0;
                                return (
                                    <div
                                        key={`${day}-${hour}`}
                                        className={`w-8 h-6 mr-1 rounded-sm flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110 ${getIntensityColor(value)}`}
                                        title={`${day} ${formatHour(hour)}: ${value} orders`}
                                    >
                                        <span className={`text-xs font-medium ${getTextColor(value)}`}>
                                            {value > 0 ? value : ''}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    ))}

                    {/* Time labels */}
                    <div className="flex mt-2">
                        <div className="w-12"></div>
                        {[0, 6, 12, 18].map((hour) => (
                            <div key={hour} className="flex-1 text-xs text-text-secondary text-center">
                                {formatHour(hour)}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-4 p-4 bg-muted rounded-lg">
                <h4 className="font-medium text-text-primary mb-2">Key Insights</h4>
                <ul className="text-sm text-text-secondary space-y-1">
                    <li>• Peak hours: 12 PM - 2 PM and 6 PM - 8 PM</li>
                    <li>• Weekends show higher evening activity</li>
                    <li>• Monday mornings are typically slower</li>
                </ul>
            </div>
        </div>
    );
};

export default PeakHoursHeatmap;