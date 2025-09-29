import React, { useState, ChangeEvent } from 'react';
import Button from '@/components/ui/new/Button';
import { LucideIconName } from '@/components/AppIcon';

// --- START OF TYPESCRIPT CONVERSION ---

type PredefinedRange = '7d' | '30d' | '90d' | '1y';
type SelectedRange = PredefinedRange | 'custom';

interface DateRangePayload {
    startDate: Date;
    endDate: Date;
    range: SelectedRange;
}

interface DateRangeSelectorProps {
    onDateRangeChange: (payload: DateRangePayload) => void;
}

// --- END OF TYPESCRIPT CONVERSION ---

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({ onDateRangeChange }) => {
    const [selectedRange, setSelectedRange] = useState<SelectedRange>('7d');
    const [isCustomOpen, setIsCustomOpen] = useState<boolean>(false);
    const [customStartDate, setCustomStartDate] = useState<string>('');
    const [customEndDate, setCustomEndDate] = useState<string>('');

    const predefinedRanges: { value: PredefinedRange, label: string }[] = [
        { value: '7d', label: 'Last 7 days' },
        { value: '30d', label: 'Last 30 days' },
        { value: '90d', label: 'Last 3 months' },
        { value: '1y', label: 'Last year' }
    ];

    const handleRangeSelect = (range: PredefinedRange): void => {
        setSelectedRange(range);
        setIsCustomOpen(false);

        const endDate = new Date();
        let startDate = new Date();

        switch (range) {
            case '7d':
                startDate.setDate(endDate.getDate() - 7);
                break;
            case '30d':
                startDate.setDate(endDate.getDate() - 30);
                break;
            case '90d':
                startDate.setDate(endDate.getDate() - 90);
                break;
            case '1y':
                startDate.setFullYear(endDate.getFullYear() - 1);
                break;
        }

        onDateRangeChange({ startDate, endDate, range });
    };

    const handleCustomDateApply = (): void => {
        if (customStartDate && customEndDate) {
            setSelectedRange('custom');
            setIsCustomOpen(false);
            onDateRangeChange({
                startDate: new Date(customStartDate),
                endDate: new Date(customEndDate),
                range: 'custom'
            });
        }
    };

    return (
        <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
                {predefinedRanges.map((range) => (
                    <Button
                        key={range.value}
                        variant={selectedRange === range.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleRangeSelect(range.value)}
                    >
                        {range.label}
                    </Button>
                ))}

                <Button
                    variant={selectedRange === 'custom' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setIsCustomOpen(!isCustomOpen)}
                    iconName={'Calendar' as LucideIconName}
                    iconPosition="left"
                >
                    Custom Range
                </Button>
            </div>

            {isCustomOpen && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-border rounded-lg shadow-modal p-4 z-10">
                    <div className="flex items-center space-x-4">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={customStartDate}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setCustomStartDate(e.target.value)}
                                className="px-3 py-2 border border-border rounded-md text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">
                                End Date
                            </label>
                            <input
                                type="date"
                                value={customEndDate}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setCustomEndDate(e.target.value)}
                                className="px-3 py-2 border border-border rounded-md text-sm"
                            />
                        </div>
                        <div className="flex items-end space-x-2">
                            <Button
                                size="sm"
                                onClick={handleCustomDateApply}
                                disabled={!customStartDate || !customEndDate}
                            >
                                Apply
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsCustomOpen(false)}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DateRangeSelector;