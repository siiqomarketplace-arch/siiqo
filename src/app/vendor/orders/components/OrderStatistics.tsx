import React from 'react';
import Icon from '@/components/AppIcon';

interface OrderStatistics {
  totalOrders: number;
  ordersChange: number;
  pendingOrders: number;
  pendingChange: number;
  revenueToday: number;
  revenueChange: number;
  avgOrderValue: number;
  avgOrderChange: number;
}

interface OrderStatisticsProps {
  statistics: OrderStatistics;
}

interface StatCard {
  title: string;
  value: string;
  change: number;
  icon: string;
  color: string;
  bgColor: string;
}

const OrderStatistics: React.FC<OrderStatisticsProps> = ({ statistics }) => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const statCards: StatCard[] = [
    {
      title: 'Total Orders',
      value: statistics.totalOrders.toLocaleString(),
      change: statistics.ordersChange,
      icon: 'Package',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Pending Orders',
      value: statistics.pendingOrders.toLocaleString(),
      change: statistics.pendingChange,
      icon: 'Clock',
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    },
    {
      title: 'Revenue Today',
      value: formatCurrency(statistics.revenueToday),
      change: statistics.revenueChange,
      icon: 'DollarSign',
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      title: 'Avg Order Value',
      value: formatCurrency(statistics.avgOrderValue),
      change: statistics.avgOrderChange,
      icon: 'TrendingUp',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statCards.map((stat) => (
        <div key={stat.title} className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
              <Icon name={stat.icon} size={20} className={stat.color} />
            </div>
            <div className={`text-sm font-medium ${stat.change >= 0 ? 'text-success' : 'text-error'}`}>
              <Icon name={stat.change >= 0 ? "TrendingUp" : "TrendingDown"} size={14} className="inline mr-1" />
              {Math.abs(stat.change)}%
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderStatistics;