"use client";

import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface Location {
    address: string;
    lat: number;
    lng: number;
}

interface LocationMapProps {
    location: Location;
    onGetDirections: () => void;
    isMobile?: boolean;
}

const LocationMap = ({ location, onGetDirections, isMobile = false }: LocationMapProps) => {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-heading font-semibold text-text-primary">Location</h3>
                <button
                    onClick={onGetDirections}
                    className="flex items-center space-x-2 text-primary hover:text-primary-700 transition-colors duration-200"
                >
                    <Icon name="Navigation" size={16} />
                    <span className="text-sm font-medium">Get Directions</span>
                </button>
            </div>

            <div className="bg-surface border border-border rounded-lg overflow-hidden">
                {/* Map Container */}
                <div className={`relative ${isMobile ? 'h-48' : 'h-64'}`}>
                    <iframe
                        width="100%"
                        height="100%"
                        loading="lazy"
                        title="Product Location"
                        referrerPolicy="no-referrer-when-downgrade"
                        src={`https://www.google.com/maps?q=${location.lat},${location.lng}&z=15&output=embed`}
                        className="border-0"
                    />

                    {/* Overlay for interaction */}
                    <div className="absolute inset-0 bg-transparent cursor-pointer" onClick={onGetDirections} />
                </div>

                {/* Address Information */}
                <div className="p-4 border-t border-border">
                    <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-primary-50 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <Icon name="MapPin" size={16} className="text-primary" />
                        </div>
                        <div className="flex-1">
                            <p className="text-text-primary font-medium mb-1">Pickup Location</p>
                            <p className="text-text-secondary text-sm leading-relaxed">{location.address}</p>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center space-x-4 mt-4 pt-4 border-t border-border-light">
                        <button
                            onClick={onGetDirections}
                            className="flex items-center space-x-2 text-primary hover:text-primary-700 transition-colors duration-200"
                        >
                            <Icon name="Navigation" size={16} />
                            <span className="text-sm font-medium">Directions</span>
                        </button>

                        <button
                            onClick={() => {
                                const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.address)}`;
                                window.open(url, '_blank');
                            }}
                            className="flex items-center space-x-2 text-text-secondary hover:text-text-primary transition-colors duration-200"
                        >
                            <Icon name="ExternalLink" size={16} />
                            <span className="text-sm font-medium">View in Maps</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LocationMap;