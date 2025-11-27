'use client';

import React from 'react';
import { useRouter } from 'next/navigation'
import Icon from '@/components/AppIcon';
import Button from '@/components/ui/alt/ButtonAlt'
import { Order } from "@/types/dashboard";

type OrderStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
type DeliveryType = 'delivery' | 'pickup' | 'in-store';

interface RecentOrdersProps {
  orders: Order[];
}

const RecentOrders: React.FC<RecentOrdersProps> = ({ orders }) => {
  const router = useRouter();

  const getStatusColor = (status: OrderStatus): string => {
    switch (status) {
      case 'pending':
        return 'bg-warning-50 text-warning-700 border-warning-200';
      case 'confirmed':
        return 'bg-primary-50 text-primary-700 border-primary-200';
      case 'completed':
        return 'bg-success-50 text-success-700 border-success-200';
      case 'cancelled':
        return 'bg-error-50 text-error-700 border-error-200';
      default:
        return 'bg-secondary-50 text-secondary-700 border-secondary-200';
    }
  };

  const getDeliveryIcon = (type: DeliveryType): string => {
    switch (type) {
      case 'delivery':
        return 'Truck';
      case 'pickup':
        return 'MapPin';
      case 'in-store':
        return 'Store';
      default:
        return 'Package';
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!orders || orders.length === 0) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="font-heading font-semibold text-lg text-text-primary mb-6">
          Recent Orders
        </h2>
        <div className="text-center py-8">
          <Icon name="ShoppingCart" size={48} className="text-text-muted mx-auto mb-4" />
          <p className="text-text-muted">No orders yet</p>
          <p className="text-sm text-text-muted mt-1">
            Orders will appear here once customers start buying
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading font-semibold text-lg text-text-primary">
          Recent Orders
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('../orders')}
        >
          View All
        </Button>
      </div>
      
      <div className="space-y-4">
        {orders.map((order) => (
          <div 
            key={order.id}
            className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary transition-colors cursor-pointer"
            onClick={() => router.push(`../orders/`)}
          >
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                <Icon 
                  name={getDeliveryIcon(order.deliveryType)} 
                  size={20} 
                  className="text-primary" 
                />
              </div>
              
              <div>
                <p className="font-medium text-text-primary">
                  {order.customerName}
                </p>
                <p className="text-sm text-text-muted">
                  {order.items.join(', ')}
                </p>
                <p className="text-xs text-text-muted mt-1">
                  {formatDate(order.orderDate)}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="font-semibold text-text-primary mb-2">
                ${order.total.toFixed(2)}
              </p>
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-lg font-semibold text-warning">
              {orders.filter(o => o.status === 'pending').length}
            </p>
            <p className="text-sm text-text-muted">Pending</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-primary">
              {orders.filter(o => o.status === 'confirmed').length}
            </p>
            <p className="text-sm text-text-muted">Confirmed</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-success">
              {orders.filter(o => o.status === 'completed').length}
            </p>
            <p className="text-sm text-text-muted">Completed</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentOrders;