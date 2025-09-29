"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import Image from '@/components/ui/AppImage';

interface Listing {
    id: number;
    title: string;
    price: number;
    originalPrice?: number;
    image: string;
    status: 'active' | 'sold' | 'expired';
    views: number;
    likes: number;
    messages: number;
    datePosted: string;
    category: string;
    condition: string;
    soldDate?: string;
}

const MyListings = () => {
    const [filter, setFilter] = useState('all');
    const router = useRouter();

    const listings: Listing[] = [
        {
            id: 1,
            title: "iPhone 14 Pro - Space Black",
            price: 899,
            originalPrice: 1099,
            image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&h=300&fit=crop",
            status: "active",
            views: 45,
            likes: 12,
            messages: 8,
            datePosted: "2024-01-15",
            category: "Electronics",
            condition: "Like New"
        },
        {
            id: 2,
            title: "Vintage Leather Jacket",
            price: 120,
            image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&h=300&fit=crop",
            status: "sold",
            views: 89,
            likes: 23,
            messages: 15,
            datePosted: "2024-01-10",
            category: "Clothing",
            condition: "Good",
            soldDate: "2024-01-20"
        },
        {
            id: 3,
            title: "MacBook Air M2 - Silver",
            price: 1050,
            image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=300&fit=crop",
            status: "active",
            views: 67,
            likes: 18,
            messages: 12,
            datePosted: "2024-01-12",
            category: "Electronics",
            condition: "Excellent"
        },
        {
            id: 4,
            title: "Yoga Mat Set with Blocks",
            price: 35,
            image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&h=300&fit=crop",
            status: "expired",
            views: 23,
            likes: 5,
            messages: 3,
            datePosted: "2023-12-20",
            category: "Sports",
            condition: "Good"
        },
        {
            id: 5,
            title: "Designer Handbag - Coach",
            price: 180,
            image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=300&fit=crop",
            status: "active",
            views: 34,
            likes: 9,
            messages: 6,
            datePosted: "2024-01-18",
            category: "Fashion",
            condition: "Like New"
        },
        {
            id: 6,
            title: "Gaming Chair - Ergonomic",
            price: 220,
            image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop",
            status: "sold",
            views: 56,
            likes: 14,
            messages: 11,
            datePosted: "2024-01-08",
            category: "Furniture",
            condition: "Excellent",
            soldDate: "2024-01-25"
        }
    ];

    interface FilterOption {
        value: string;
        label: string;
        count: number;
    }

    const filterOptions: FilterOption[] = [
        { value: 'all', label: 'All Items', count: listings.length },
        { value: 'active', label: 'Active', count: listings.filter(item => item.status === 'active').length },
        { value: 'sold', label: 'Sold', count: listings.filter(item => item.status === 'sold').length },
        { value: 'expired', label: 'Expired', count: listings.filter(item => item.status === 'expired').length }
    ];

    const filteredListings = filter === 'all'
        ? listings
        : listings.filter(listing => listing.status === filter);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-success-50 text-success border-success-100';
            case 'sold':
                return 'bg-primary-50 text-primary border-primary-100';
            case 'expired':
                return 'bg-error-50 text-error border-error-100';
            default:
                return 'bg-surface-secondary text-text-secondary border-border';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'active':
                return 'Active';
            case 'sold':
                return 'Sold';
            case 'expired':
                return 'Expired';
            default:
                return status;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="space-y-4">
            {/* Filter Tabs */}
            <div className="flex space-x-1 bg-surface-secondary rounded-lg p-1">
                {filterOptions.map((option) => (
                    <button
                        key={option.value}
                        onClick={() => setFilter(option.value)}
                        className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${filter === option.value
                            ? 'bg-surface text-text-primary shadow-sm'
                            : 'text-text-secondary hover:text-text-primary'
                            }`}
                    >
                        <span>{option.label}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${filter === option.value
                            ? 'bg-primary text-white' : 'bg-border text-text-tertiary'
                            }`}>
                            {option.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Listings Grid */}
            {filteredListings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredListings.map((listing) => (
                        <div
                            key={listing.id}
                            className="bg-surface border border-border rounded-lg overflow-hidden hover:shadow-elevation-2 transition-shadow duration-200"
                        >
                            <div className="relative w-full h-48">
                                <Image
                                    src={listing.image}
                                    fill
                                    alt={listing.title}
                                    // The w-full h-48 are now on the parent
                                    className="object-cover" // Keep styling for the image itself
                                    // Add sizes prop. Assuming 100vw minus some padding/margins
                                    // If it's in a grid, you'll need to be more precise based on grid column widths.
                                    // For a general full-width card, 100vw is a good starting point.
                                    sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                                <div className="absolute top-3 left-3">
                                    <span className={`px-2 py-1 rounded-full bg-gray-50 text-xs font-medium border ${getStatusColor(listing.status)}`}>
                                        {getStatusLabel(listing.status)}
                                    </span>
                                </div>
                                <div className="absolute top-3 right-3 flex space-x-2">
                                    <button className="p-2 bg-surface bg-opacity-90 rounded-full hover:bg-opacity-100 transition-colors duration-200">
                                        <Icon name="Edit" size={14} className="text-text-primary" />
                                    </button>
                                    <button className="p-2 bg-surface bg-opacity-90 rounded-full hover:bg-opacity-100 transition-colors duration-200">
                                        <Icon name="MoreVertical" size={14} className="text-text-primary" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="font-medium text-text-primary line-clamp-2 flex-1">
                                        {listing.title}
                                    </h3>
                                </div>

                                <div className="flex items-center space-x-2 mb-3">
                                    <span className="text-lg font-semibold text-text-primary">
                                        ${listing.price}
                                    </span>
                                    {listing.originalPrice && listing.originalPrice > listing.price && (
                                        <span className="text-sm text-text-tertiary line-through">
                                            ${listing.originalPrice}
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center justify-between text-sm text-text-secondary mb-3">
                                    <span>{listing.category} • {listing.condition}</span>
                                    <span>{formatDate(listing.datePosted)}</span>
                                </div>

                                {listing.status === 'sold' && listing.soldDate && (
                                    <div className="text-sm text-success mb-3">
                                        Sold on {formatDate(listing.soldDate)}
                                    </div>
                                )}

                                {/* Stats */}
                                <div className="flex items-center justify-between pt-3 border-t border-border">
                                    <div className="flex items-center space-x-4 text-sm text-text-secondary">
                                        <div className="flex items-center space-x-1">
                                            <Icon name="Eye" size={14} />
                                            <span>{listing.views}</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <Icon name="Heart" size={14} />
                                            <span>{listing.likes}</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <Icon name="MessageCircle" size={14} />
                                            <span>{listing.messages}</span>
                                        </div>
                                    </div>

                                    <div className="flex space-x-2">
                                        {listing.status === 'active' && (
                                            <>
                                                <button className="text-primary hover:underline text-sm">
                                                    Edit
                                                </button>
                                                <button className="text-text-secondary hover:text-text-primary text-sm">
                                                    Share
                                                </button>
                                            </>
                                        )}
                                        {listing.status === 'expired' && (
                                            <button className="text-primary hover:underline text-sm">
                                                Relist
                                            </button>
                                        )}
                                        {listing.status === 'sold' && (
                                            <button className="text-text-secondary hover:text-text-primary text-sm">
                                                View
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-surface-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon name="Package" size={24} className="text-text-tertiary" />
                    </div>
                    <h3 className="text-lg font-medium text-text-primary mb-2">
                        No {filter === 'all' ? '' : filter} listings found
                    </h3>
                    <p className="text-text-secondary mb-6">
                        {filter === 'all' ? "You haven't listed any items yet. Start selling to connect with buyers in your area!"
                            : `You don't have any ${filter} listings at the moment.`
                        }
                    </p>
                    {filter === 'all' && (
                        <button
                            onClick={() => router.push('/create-listing')}
                            className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors duration-200"
                        >
                            List Your First Item
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default MyListings;