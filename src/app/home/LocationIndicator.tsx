import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface LocationIndicatorProps {
    location: string;
    onLocationChange: () => void;
}

const LocationIndicator: React.FC<LocationIndicatorProps> = ({ location, onLocationChange }) => {
    return (
        <div className="mb-6">
            <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-border">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center">
                        <Icon name="MapPin" size={20} className="text-primary" />
                    </div>
                    <div>
                        <p className="text-sm text-text-secondary">Your location</p>
                        <p className="text-base font-medium text-text-primary">{location}</p>
                    </div>
                </div>
                <button
                    onClick={onLocationChange}
                    className="flex items-center space-x-2 px-3 py-2 text-primary text-sm font-medium rounded-lg hover:bg-primary-50 transition-colors duration-200"
                >
                    <Icon name="Edit2" size={16} />
                    <span>Change</span>
                </button>
            </div>
        </div>
    );
};

export default LocationIndicator;