import React, { useState } from 'react';
import Icon, { type LucideIconName } from '@/components/AppIcon';
import Image from '@/components/ui/alt/AppImageAlt';
import Button from '@/components/ui/new/Button';

// --- START OF TYPESCRIPT CONVERSION ---

interface Business {
    coverImage: string;
    logo: string;
    name: string;
    rating: number;
    reviewCount: number;
    category: string;
    isOpen: boolean;
    nextOpenTime?: string;
    address: string;
    todayHours: string;
    phone: string;
}

interface BusinessHeroProps {
    business: Business | any;
    onContactClick: () => void;
    onDirectionsClick: () => void;
    onShareClick: () => void;
}

// --- END OF TYPESCRIPT CONVERSION ---

const BusinessHero: React.FC<BusinessHeroProps> = ({ business, onContactClick, onDirectionsClick, onShareClick }) => {
    const [isFavorite, setIsFavorite] = useState<boolean>(false);

    const handleFavoriteToggle = (): void => {
        setIsFavorite(!isFavorite);
    };

    const getStatusColor = (isOpen: boolean): string => {
        return isOpen ? 'text-success' : 'text-error';
    };

    const getStatusText = (isOpen: boolean, nextOpenTime?: string): string => {
        if (isOpen) return 'Open now';
        return nextOpenTime ? `Closed • Opens ${nextOpenTime}` : 'Closed';
    };

    return (
        <div className="relative">
            {/* Cover Image */}
            <div className="relative h-48 sm:h-64 lg:h-80 overflow-hidden">
                <Image
                    src={business.coverImage}
                    alt={`${business.name} cover`}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-20" />

                {/* Floating Action Buttons */}
                <div className="absolute top-4 right-4 flex space-x-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleFavoriteToggle}
                        className="bg-white bg-opacity-90 hover:bg-white"
                    >
                        <Icon
                            name={'Heart' as LucideIconName}
                            size={20}
                            className={isFavorite ? 'text-error fill-current' : 'text-text-secondary'}
                        />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onShareClick}
                        className="bg-white bg-opacity-90 hover:bg-white"
                    >
                        <Icon name={'Share2' as LucideIconName} size={20} className="text-text-secondary" />
                    </Button>
                </div>
            </div>

            {/* Business Info */}
            <div className="bg-white border-b border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-6">
                        {/* Logo and Basic Info */}
                        <div className="flex items-start space-x-4 mb-4 lg:mb-0">
                            <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-lg overflow-hidden border border-border flex-shrink-0">
                                <Image
                                    src={business.logo}
                                    alt={`${business.name} logo`}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <div className="flex-1 min-w-0">
                                <h1 className="text-2xl lg:text-3xl font-bold text-text-primary mb-2">
                                    {business.name}
                                </h1>

                                {/* Rating */}
                                <div className="flex items-center space-x-2 mb-2">
                                    <div className="flex items-center space-x-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Icon
                                                key={i}
                                                name={'Star' as LucideIconName}
                                                size={16}
                                                className={`${i < Math.floor(business.rating)
                                                        ? 'text-warning fill-current' : 'text-border'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-sm font-medium text-text-primary">
                                        {business.rating}
                                    </span>
                                    <span className="text-sm text-text-secondary">
                                        ({business.reviewCount} reviews)
                                    </span>
                                </div>

                                {/* Category */}
                                <div className="flex items-center space-x-2 mb-3">
                                    <Icon name={'Tag' as LucideIconName} size={16} className="text-text-secondary" />
                                    <span className="text-sm text-text-secondary">
                                        {business.category}
                                    </span>
                                </div>

                                {/* Status */}
                                <div className="flex items-center space-x-2">
                                    <div className={`w-2 h-2 rounded-full ${business.isOpen ? 'bg-success' : 'bg-error'}`} />
                                    <span className={`text-sm font-medium ${getStatusColor(business.isOpen)}`}>
                                        {getStatusText(business.isOpen, business.nextOpenTime)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row lg:flex-col space-y-2 sm:space-y-0 sm:space-x-3 lg:space-x-0 lg:space-y-2 lg:w-48">
                            <Button
                                variant="default"
                                onClick={onContactClick}
                                iconName={'Phone' as LucideIconName}
                                iconPosition="left"
                                className="flex-1 lg:flex-none"
                            >
                                Call Now
                            </Button>
                            <Button
                                variant="outline"
                                onClick={onDirectionsClick}
                                iconName={'Navigation' as LucideIconName}
                                iconPosition="left"
                                className="flex-1 lg:flex-none"
                            >
                                Directions
                            </Button>
                        </div>
                    </div>

                    {/* Quick Info Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                        <div className="flex items-center space-x-3 p-3 bg-surface rounded-lg">
                            <Icon name={'MapPin' as LucideIconName} size={20} className="text-primary" />
                            <div>
                                <p className="text-sm font-medium text-text-primary">Location</p>
                                <p className="text-xs text-text-secondary">{business.address}</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3 p-3 bg-surface rounded-lg">
                            <Icon name={'Clock' as LucideIconName} size={20} className="text-primary" />
                            <div>
                                <p className="text-sm font-medium text-text-primary">Hours</p>
                                <p className="text-xs text-text-secondary">{business.todayHours}</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3 p-3 bg-surface rounded-lg">
                            <Icon name={'Phone' as LucideIconName} size={20} className="text-primary" />
                            <div>
                                <p className="text-sm font-medium text-text-primary">Contact</p>
                                <p className="text-xs text-text-secondary">{business.phone}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BusinessHero;