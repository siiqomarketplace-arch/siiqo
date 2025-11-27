"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'
import Icon from '@/components/AppIcon';
import Button from '@/components/ui/alt/ButtonAlt';
import { Notification } from "@/types/dashboard";

type NotificationType = 'order' | 'review' | 'inventory' | 'payment' | 'system';
type FilterType = 'all' | 'unread' | NotificationType;

interface NotificationPanelProps {
  notifications: Notification[];
}

interface FilterOption {
  value: FilterType;
  label: string;
  count: number;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ notifications }) => {
  const router = useRouter();
  const [filter, setFilter] = useState < FilterType > ('all');

  const getNotificationIcon = (type: NotificationType): string => {
    switch (type) {
      case 'order':
        return 'ShoppingCart';
      case 'review':
        return 'Star';
      case 'inventory':
        return 'Package';
      case 'payment':
        return 'DollarSign';
      case 'system':
        return 'Bell';
      default:
        return 'Info';
    }
  };

  const getNotificationColor = (type: NotificationType): string => {
    switch (type) {
      case 'order':
        return 'text-primary bg-primary-50';
      case 'review':
        return 'text-warning bg-warning-50';
      case 'inventory':
        return 'text-success bg-accent-50';
      case 'payment':
        return 'text-success bg-success-50';
      case 'system':
        return 'text-secondary-600 bg-secondary-50';
      default:
        return 'text-text-muted bg-surface';
    }
  };

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  };

  const filteredNotifications = notifications?.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  }) || [];

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  const filterOptions: FilterOption[] = [
    { value: 'all', label: 'All', count: notifications?.length || 0 },
    { value: 'unread', label: 'Unread', count: unreadCount },
    { value: 'order', label: 'Orders', count: notifications?.filter(n => n.type === 'order').length || 0 },
    { value: 'review', label: 'Reviews', count: notifications?.filter(n => n.type === 'review').length || 0 },
    { value: 'inventory', label: 'Inventory', count: notifications?.filter(n => n.type === 'inventory').length || 0 }
  ];

  const handleNotificationClick = (notification: Notification): void => {
    // Mark as read
    if (!notification.read) {
      // In a real app, this would call an API
      notification.read = true;
    }

    // Navigate based on notification type
    switch (notification.type) {
      case 'order':
        router.push('../orders');
        break;
      case 'review':
        router.push('../reviews');
        break;
      case 'inventory':
        router.push('../products');
        break;
      default:
        break;
    }
  };

  const handleMarkAllAsRead = (): void => {
    // Mark all as read
    notifications?.forEach(n => n.read = true);
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <h2 className="font-heading font-semibold text-lg text-text-primary">
            Notifications
          </h2>
          {unreadCount > 0 && (
            <span className="bg-error text-error-foreground text-xs font-medium rounded-full min-w-5 h-5 flex items-center justify-center px-1">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('../notifications')}
        >
          View All
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-1 mb-4 overflow-x-auto">
        {filterOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value)}
            className={`px-3 py-1 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === option.value
                ? 'bg-primary text-primary-foreground'
                : 'text-text-muted hover:text-text-secondary hover:bg-surface'
              }`}
          >
            {option.label}
            {option.count > 0 && (
              <span className="ml-1 text-xs">({option.count})</span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="Bell" size={48} className="text-text-muted mx-auto mb-4" />
            <p className="text-text-muted">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
            </p>
            <p className="text-sm text-text-muted mt-1">
              You're all caught up!
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors cursor-pointer hover:border-primary ${notification.read
                  ? 'border-border bg-card' : 'border-primary-200 bg-primary-50'
                }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getNotificationColor(notification.type)}`}>
                <Icon
                  name={getNotificationIcon(notification.type)}
                  size={16}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className={`font-medium ${notification.read ? 'text-text-secondary' : 'text-text-primary'}`}>
                    {notification.title}
                  </p>
                  <span className="text-xs text-text-muted">
                    {formatTime(notification.timestamp)}
                  </span>
                </div>
                <p className={`text-sm mt-1 ${notification.read ? 'text-text-muted' : 'text-text-secondary'}`}>
                  {notification.message}
                </p>
              </div>

              {!notification.read && (
                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2"></div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Mark All as Read */}
      {unreadCount > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleMarkAllAsRead}
          >
            Mark All as Read
          </Button>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;