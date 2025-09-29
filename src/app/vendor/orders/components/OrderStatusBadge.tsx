import React from 'react';
import Icon from '@/components/AppIcon';

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded' | any;

interface OrderStatusBadgeProps {
  status: OrderStatus;
  size?: 'default' | 'sm';
}

interface StatusConfig {
  label: string;
  icon: string;
  className: string;
}

const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status, size = 'default' }) => {
  const getStatusConfig = (status: OrderStatus): StatusConfig => {
    const configs: Record<OrderStatus, StatusConfig> = {
      pending: {
        label: 'Pending',
        icon: 'Clock',
        className: 'bg-warning/10 text-warning border-warning/20'
      },
      processing: {
        label: 'Processing',
        icon: 'Package',
        className: 'bg-blue-100 text-blue-700 border-blue-200'
      },
      shipped: {
        label: 'Shipped',
        icon: 'Truck',
        className: 'bg-success/10 text-success border-success/20'
      },
      delivered: {
        label: 'Delivered',
        icon: 'CheckCircle',
        className: 'bg-purple-100 text-purple-700 border-purple-200'
      },
      cancelled: {
        label: 'Cancelled',
        icon: 'XCircle',
        className: 'bg-error/10 text-error border-error/20'
      },
      refunded: {
        label: 'Refunded',
        icon: 'RotateCcw',
        className: 'bg-gray-100 text-gray-700 border-gray-200'
      }
    };
    return configs[status];
  };

  const config = getStatusConfig(status);
  const sizeClasses = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span className={`inline-flex items-center space-x-1 rounded-full border font-medium ${sizeClasses} ${config.className}`}>
      <Icon name={config.icon} size={size === 'sm' ? 12 : 14} />
      <span>{config.label}</span>
    </span>
  );
};

export default OrderStatusBadge;