'use client';

import React, { useState, useEffect } from 'react';
import Icon, { type LucideIconName } from '../AppIcon';
import Button from '@/components/ui/new/Button';

// --- START OF TYPESCRIPT CONVERSION ---

type NotificationType = 'order' | 'review' | 'inventory' | 'system' | 'promotion' | 'delivery';
type UserContext = 'business' | 'customer';

interface Notification {
    id: number;
    type: NotificationType;
    title: string;
    message: string;
    timestamp: string;
    isRead: boolean;
    icon: LucideIconName | string;
    action: string;
}

interface NotificationCenterProps {
    userContext?: UserContext;
}

// --- END OF TYPESCRIPT CONVERSION ---

const NotificationCenter: React.FC<NotificationCenterProps> = ({ userContext = 'business' }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(0);

    // Mock notifications based on user context
    useEffect(() => {
        const mockNotifications: Notification[] = userContext === 'business' ? [
            {
                id: 1,
                type: 'order',
                title: 'New Order Received',
                message: 'Order #1234 from John Doe - $45.99',
                timestamp: '2 minutes ago',
                isRead: false,
                icon: 'ShoppingBag',
                action: '/order-management'
            },
            {
                id: 2,
                type: 'review',
                title: 'New Customer Review',
                message: '5-star review from Sarah M. on your coffee shop',
                timestamp: '1 hour ago',
                isRead: false,
                icon: 'Star',
                action: '/business-analytics'
            },
            {
                id: 3,
                type: 'inventory',
                title: 'Low Stock Alert',
                message: 'Espresso Blend is running low (3 items left)',
                timestamp: '3 hours ago',
                isRead: true,
                icon: 'AlertTriangle',
                action: '/product-management'
            },
            {
                id: 4,
                type: 'system',
                title: 'Weekly Report Ready',
                message: 'Your business analytics report is now available',
                timestamp: '1 day ago',
                isRead: true,
                icon: 'FileText',
                action: '/business-analytics'
            }
        ] : [
            {
                id: 1,
                type: 'order',
                title: 'Order Confirmed',
                message: 'Your order from Local Coffee Shop is being prepared',
                timestamp: '5 minutes ago',
                isRead: false,
                icon: 'CheckCircle',
                action: '/orders'
            },
            {
                id: 2,
                type: 'promotion',
                title: 'Special Offer',
                message: '20% off at nearby restaurants this weekend',
                timestamp: '2 hours ago',
                isRead: false,
                icon: 'Tag',
                action: '/customer-marketplace-home'
            },
            {
                id: 3,
                type: 'delivery',
                title: 'Delivery Update',
                message: 'Your order is out for delivery - ETA 15 minutes',
                timestamp: '1 day ago',
                isRead: true,
                icon: 'Truck',
                action: '/orders'
            }
        ];

        setNotifications(mockNotifications);
        setUnreadCount(mockNotifications.filter(n => !n.isRead).length);
    }, [userContext]);

    const handleNotificationClick = (notification: Notification): void => {
        // Mark as read
        setNotifications(prev =>
            prev.map(n =>
                n.id === notification.id ? { ...n, isRead: true } : n
            )
        );

        // Update unread count if it was unread
        if (!notification.isRead) {
            setUnreadCount(prev => prev > 0 ? prev - 1 : 0);
        }

        setIsOpen(false);

        // In a real app, use next/navigation router.push()
        console.log('Navigate to:', notification.action);
    };

    const markAllAsRead = (): void => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
    };

    const getNotificationColor = (type: NotificationType): string => {
        const colorMap: Record<NotificationType, string> = {
            order: 'text-success',
            review: 'text-warning',
            inventory: 'text-error',
            system: 'text-primary',
            promotion: 'text-accent',
            delivery: 'text-primary'
        };
        return colorMap[type] || 'text-text-secondary';
    };

    return (
        <div className="relative">
            {/* Notification Bell */}
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                className="relative"
                aria-label="Notifications"
            >
                <Icon name="Bell" size={20} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-error text-error-foreground text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </Button>

            {/* Notification Dropdown */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown Panel */}
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-modal border border-border z-50 max-h-96 overflow-hidden flex flex-col">
                        {/* Header */}
                        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-border">
                            <h3 className="font-semibold text-text-primary">Notifications</h3>
                            {unreadCount > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={markAllAsRead}
                                    className="text-xs"
                                >
                                    Mark all read
                                </Button>
                            )}
                        </div>

                        {/* Notifications List */}
                        <div className="flex-1 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center">
                                    <Icon name="Bell" size={32} className="text-text-secondary mx-auto mb-2" />
                                    <p className="text-text-secondary">No notifications yet</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-border">
                                    {notifications.map((notification) => (
                                        <button
                                            key={notification.id}
                                            onClick={() => handleNotificationClick(notification)}
                                            className={`
                        w-full p-4 text-left hover:bg-muted transition-colors duration-150
                        ${!notification.isRead ? 'bg-primary/5' : ''}
                      `}
                                        >
                                            <div className="flex items-start space-x-3">
                                                <div className={`
                          p-2 rounded-lg flex-shrink-0
                          ${!notification.isRead ? 'bg-primary/10' : 'bg-muted'}
                        `}>
                                                    <Icon
                                                        name={notification.icon}
                                                        size={16}
                                                        className={getNotificationColor(notification.type)}
                                                    />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <p className={`
                              text-sm font-medium truncate
                              ${!notification.isRead ? 'text-text-primary' : 'text-text-secondary'}
                            `}>
                                                            {notification.title}
                                                        </p>
                                                        {!notification.isRead && (
                                                            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 ml-2" />
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-text-secondary mt-1 line-clamp-2">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-xs text-text-secondary mt-1">
                                                        {notification.timestamp}
                                                    </p>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="flex-shrink-0 p-3 border-t border-border">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    fullWidth
                                    onClick={() => setIsOpen(false)} // In real app, navigate to notifications page
                                >
                                    View All Notifications
                                </Button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationCenter;