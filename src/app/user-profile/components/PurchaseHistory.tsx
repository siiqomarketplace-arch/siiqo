// src/app/user-profile/components/MyListings.tsx
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import Image from '@/components/ui/AppImage';

interface PurchaseHistoryProps {
    onViewDetails: (productId: string | number) => void;
    onWriteReview: (product: any) => void;
}

interface Purchase {
    id: number;
    title: string;
    price: number;
    image: string;
    seller: string;
    sellerAvatar: string;
    purchaseDate: string;
    status: 'delivered' | 'in_transit' | 'cancelled';
    deliveryDate?: string;
    estimatedDelivery?: string;
    trackingNumber?: string;
    cancelDate?: string;
    cancelReason?: string;
    refundAmount?: number;
    canReorder: boolean;
    canReview: boolean;
    rating: number | null;
}

const PurchaseHistory = ({ onViewDetails, onWriteReview }: PurchaseHistoryProps) => {
    const [filter, setFilter] = useState('all');
    const router = useRouter();

    const purchases: Purchase[] = [
        {
            id: 1,
            title: "Wireless Bluetooth Headphones",
            price: 89,
            image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop",
            seller: "TechStore Pro",
            sellerAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face",
            purchaseDate: "2024-01-25",
            status: "delivered",
            deliveryDate: "2024-01-28",
            trackingNumber: "TRK123456789",
            canReorder: true,
            canReview: true,
            rating: null
        },
        {
            id: 2,
            title: "Organic Coffee Beans - 2lb Bag",
            price: 24,
            image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=300&h=300&fit=crop",
            seller: "Local Roasters",
            sellerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face",
            purchaseDate: "2024-01-22",
            status: "in_transit",
            estimatedDelivery: "2024-01-30",
            trackingNumber: "TRK987654321",
            canReorder: true,
            canReview: false,
            rating: null
        },
        {
            id: 3,
            title: "Vintage Band T-Shirt",
            price: 35,
            image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop",
            seller: "RetroThreads",
            sellerAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50&h=50&fit=crop&crop=face",
            purchaseDate: "2024-01-18",
            status: "delivered",
            deliveryDate: "2024-01-21",
            trackingNumber: "TRK456789123",
            canReorder: false,
            canReview: false,
            rating: 5
        },
        {
            id: 4,
            title: "Kitchen Stand Mixer",
            price: 180,
            image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop",
            seller: "HomeChef Supplies",
            sellerAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face",
            purchaseDate: "2024-01-15",
            status: "cancelled",
            cancelDate: "2024-01-16",
            cancelReason: "Item no longer available",
            refundAmount: 180,
            canReorder: true,
            canReview: false,
            rating: null
        },
        {
            id: 5,
            title: "Smartphone Case - Clear",
            price: 15,
            image: "https://images.unsplash.com/photo-1601593346740-925612772716?w=300&h=300&fit=crop",
            seller: "MobileTech",
            sellerAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop&crop=face",
            purchaseDate: "2024-01-10",
            status: "delivered",
            deliveryDate: "2024-01-13",
            trackingNumber: "TRK789123456",
            canReorder: true,
            canReview: false,
            rating: 4
        }
    ];

    interface FilterOption {
        value: string;
        label: string;
        count: number;
    }

    const filterOptions: FilterOption[] = [
        { value: 'all', label: 'All Orders', count: purchases.length },
        { value: 'delivered', label: 'Delivered', count: purchases.filter(p => p.status === 'delivered').length },
        { value: 'in_transit', label: 'In Transit', count: purchases.filter(p => p.status === 'in_transit').length },
        { value: 'cancelled', label: 'Cancelled', count: purchases.filter(p => p.status === 'cancelled').length }
    ];

    const filteredPurchases = filter === 'all'
        ? purchases
        : purchases.filter(purchase => purchase.status === filter);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'delivered':
                return 'bg-success-50 text-success border-success-100';
            case 'in_transit':
                return 'bg-warning-50 text-warning border-warning-100';
            case 'cancelled':
                return 'bg-error-50 text-error border-error-100';
            default:
                return 'bg-surface-secondary text-text-secondary border-border';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'delivered':
                return 'Delivered';
            case 'in_transit':
                return 'In Transit';
            case 'cancelled':
                return 'Cancelled';
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

    const renderStars = (rating: number | null) => {
        if (!rating) return null; // Ensure rating is not null

        return Array.from({ length: 5 }, (_, index) => (
            <Icon
                key={index}
                name="Star"
                size={14}
                className={`${index < rating
                    ? 'text-warning fill-current' : 'text-border-dark'
                    }`}
            />
        ));
    };

    return (
        <div className="space-y-4">
            {/* Filter Tabs */}
           <div className="flex justify-between overflow-x-scroll md:px-4 md:overflow-x-hidden space-x-2 bg-transparent">
                {filterOptions.map((option) => (
                    <button
                        key={option.value}
                        onClick={() => setFilter(option.value)}
                        className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 whitespace-nowrap ${filter === option.value
                            ? 'bg-surface text-text-primary shadow-sm'
                            : 'bg-surface-secondary text-text-secondary hover:text-text-primary'
                            }`}
                    >
                        {option.label}
                        <span className={`absolute top-1 -right-2 w-4 h-4 rounded-full text-xs font-semibold flex items-center justify-center ${filter === option.value
                            ? 'bg-[#E0921C] text-white' : 'bg-border text-text-tertiary'
                            }`}>
                            {option.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Purchase History List */}
            {filteredPurchases.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4 space-y-3 md:space-y-4">
                    {filteredPurchases.map((purchase) => (
                        <div
                            key={purchase.id}
                            className="bg-surface border border-border rounded-lg p-3 md:p-4 hover:shadow-elevation-1 transition-shadow duration-200"
                        >
                            <div className="flex flex-col md:flex-row md:items-start gap-3 md:gap-4">
                                <div className="relative w-full md:w-20 md:h-20 md:flex-shrink-0 aspect-square md:aspect-auto">
                                    <Image
                                        src={purchase.image}
                                        fill
                                        alt={purchase.title}
                                        className="object-cover rounded-lg"
                                        sizes="(max-width: 768px) 100vw, 80px"
                                    />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 md:gap-0 mb-2">
                                        <div className="flex-1">
                                            <h3 className="font-medium text-text-primary line-clamp-2 mb-1 text-sm md:text-base">
                                                {purchase.title}
                                            </h3>
                                            <div className="flex items-center space-x-2 text-xs md:text-sm text-text-secondary">
                                                <div className="relative w-4 h-4 flex-shrink-0">
                                                    <Image
                                                        src={purchase.sellerAvatar}
                                                        fill
                                                        alt={purchase.seller}
                                                        className="rounded-full object-cover"
                                                        sizes="16px"
                                                    />
                                                </div>
                                                <span className="line-clamp-1">{purchase.seller}</span>
                                            </div>
                                        </div>
                                        <div className="text-right md:ml-4">
                                            <div className="text-base md:text-lg font-semibold text-text-primary">
                                                ${purchase.price}
                                            </div>
                                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(purchase.status)}`}>
                                                {getStatusLabel(purchase.status)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Purchase Details */}
                                    <div className="space-y-1 md:space-y-2 text-xs md:text-sm text-text-secondary">
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1">
                                            <span>Purchased on {formatDate(purchase.purchaseDate)}</span>
                                            {purchase.trackingNumber && (
                                                <span className="font-mono text-xs">#{purchase.trackingNumber}</span>
                                            )}
                                        </div>

                                        {purchase.status === 'delivered' && purchase.deliveryDate && (
                                            <div className="text-success">
                                                Delivered on {formatDate(purchase.deliveryDate)}
                                            </div>
                                        )}

                                        {purchase.status === 'in_transit' && purchase.estimatedDelivery && (
                                            <div className="text-warning">
                                                Expected delivery: {formatDate(purchase.estimatedDelivery)}
                                            </div>
                                        )}

                                        {purchase.status === 'cancelled' && purchase.cancelDate && (
                                            <div className="text-error">
                                                Cancelled on {formatDate(purchase.cancelDate)}
                                                {purchase.cancelReason && (
                                                    <div className="mt-1">Reason: {purchase.cancelReason}</div>
                                                )}
                                                {purchase.refundAmount && (
                                                    <div className="mt-1 text-success">
                                                        Refunded: ${purchase.refundAmount}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Rating Display */}
                                        {purchase.rating !== null && (
                                            <div className="flex items-center space-x-2">
                                                <span>Your rating:</span>
                                                <div className="flex items-center space-x-1">
                                                    {renderStars(purchase.rating)}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0 pt-3 md:pt-3 mt-3 border-t border-border">
                                        <div className="flex flex-wrap gap-2 md:gap-3">
                                            {purchase.status === 'in_transit' && (
                                                <button className="text-primary hover:underline text-xs md:text-sm font-medium">
                                                    Track Package
                                                </button>
                                            )}

                                            {purchase.canReorder && (
                                                <button className="text-primary hover:underline text-xs md:text-sm font-medium">
                                                    Reorder
                                                </button>
                                            )}

                                            {purchase.canReview && (
                                                <button className="text-primary hover:underline text-xs md:text-sm font-medium">
                                                    Write Review
                                                </button>
                                            )}

                                            <button className="text-text-secondary hover:text-text-primary text-xs md:text-sm font-medium">
                                                View Details
                                            </button>
                                        </div>

                                        <div className="flex space-x-2">
                                            <button className="p-2 rounded-lg hover:bg-surface-secondary transition-colors duration-200">
                                                <Icon name="MessageCircle" size={16} className="text-text-secondary" />
                                            </button>
                                            <button className="p-2 rounded-lg hover:bg-surface-secondary transition-colors duration-200">
                                                <Icon name="MoreVertical" size={16} className="text-text-secondary" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-surface-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon name="ShoppingBag" size={24} className="text-text-tertiary" />
                    </div>
                    <h3 className="text-lg font-medium text-text-primary mb-2">
                        No {filter === 'all' ? '' : filter} orders found
                    </h3>
                    <p className="text-text-secondary mb-6">
                        {filter === 'all' ? "You haven't made any purchases yet. Start exploring products in your area!"
                            : `You don't have any ${filter} orders at the moment.`
                        }
                    </p>
                    {filter === 'all' && (
                        <button
                            onClick={() => router.push('/')}
                            className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors duration-200"
                        >
                            Start Shopping
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default PurchaseHistory;