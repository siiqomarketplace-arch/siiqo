"use client";

import React from 'react';
import Icon from '@/components/ui/AppIcon';
import Image from '@/components/ui/AppImage';

interface Seller {
    name: string;
    avatar: string;
    rating: number;
    reviewCount: number;
    responseTime: string;
    memberSince: string;
    verifiedSeller: boolean;
}

interface SellerCardProps {
    seller: Seller;
    onContact: () => void;
    isMobile?: boolean;
}

const SellerCard = ({ seller, onContact, isMobile = false }: SellerCardProps) => {
    return (
        <div className="bg-surface border border-border rounded-lg p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-heading font-semibold text-text-primary">Seller Information</h3>
                {seller.verifiedSeller && (
                    <div className="flex items-center space-x-1 bg-secondary-50 text-secondary px-2 py-1 rounded-full">
                        <Icon name="CheckCircle" size={14} />
                        <span className="text-xs font-medium">Verified</span>
                    </div>
                )}
            </div>
            <div className="flex items-start space-x-4">
                {/* Seller Avatar */}
                <div className="flex-shrink-0">
                    {/* Add 'relative' to this div */}
                    <div className="relative w-16 h-16 rounded-full overflow-hidden bg-surface-secondary">
                        <Image
                            src={seller.avatar}
                            alt={seller.name}
                            fill // Add the fill prop
                            className="object-cover" // Keep object-cover, remove w-full h-full
                            sizes="64px" // Add sizes prop for a fixed 16x16 (64px) image
                        />
                    </div>
                </div>

                {/* Seller Details */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold text-text-primary truncate">{seller.name}</h4>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center space-x-2 mb-2">
                        <div className="flex items-center space-x-1">
                            <Icon name="Star" size={14} className="text-yellow-500 fill-current" />
                            <span className="text-sm font-medium text-text-primary">{seller.rating}</span>
                        </div>
                        <span className="text-sm text-text-secondary">({seller.reviewCount} reviews)</span>
                    </div>

                    {/* Member Since */}
                    <div className="flex items-center space-x-2 mb-2">
                        <Icon name="Calendar" size={14} className="text-text-secondary" />
                        <span className="text-sm text-text-secondary">Member since {seller.memberSince}</span>
                    </div>

                    {/* Response Time */}
                    <div className="flex items-center space-x-2">
                        <Icon name="Clock" size={14} className="text-text-secondary" />
                        <span className="text-sm text-text-secondary">{seller.responseTime}</span>
                    </div>
                </div>
            </div>

            {/* Contact Button */}
            <button
                onClick={onContact}
                className="w-full mt-4 bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors duration-200 flex items-center justify-center space-x-2"
            >
                <Icon name="MessageCircle" size={18} />
                <span>Contact Seller</span>
            </button>

            {/* Additional Actions */}
            <div className="flex items-center justify-center space-x-6 mt-4 pt-4 border-t border-border-light">
                <button className="flex items-center space-x-2 text-text-secondary hover:text-text-primary transition-colors duration-200">
                    <Icon name="User" size={16} />
                    <span className="text-sm">View Profile</span>
                </button>

                <button className="flex items-center space-x-2 text-text-secondary hover:text-text-primary transition-colors duration-200">
                    <Icon name="Package" size={16} />
                    <span className="text-sm">Other Items</span>
                </button>

                <button className="flex items-center space-x-2 text-text-secondary hover:text-text-primary transition-colors duration-200">
                    <Icon name="Flag" size={16} />
                    <span className="text-sm">Report</span>
                </button>
            </div>
        </div >
    );
};

export default SellerCard;