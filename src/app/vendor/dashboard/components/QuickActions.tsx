"use client";

import React from 'react';
import { useRouter } from 'next/navigation'
import Icon from '@/components/AppIcon';
import Button from '@/components/ui/alt/ButtonAlt';

interface QuickAction {
  title: string;
  description: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  action: () => void;
}

const QuickActions: React.FC = () => {
  const router = useRouter();

  const actions: QuickAction[] = [
    {
      title: 'Add Product',
      description: 'List a new product or service',
      icon: 'Plus',
      iconColor: 'text-primary',
      iconBg: 'bg-primary-50',
      action: () => router.push('/vendor/products')
    },
    {
      title: 'View Orders',
      description: 'Check pending and recent orders',
      icon: 'ShoppingCart',
      iconColor: 'text-success',
      iconBg: 'bg-success-50',
      action: () => router.push('/vendor/orders')
    },
    {
      title: 'Update Storefront',
      description: 'Customize your store appearance',
      icon: 'Store',
      iconColor: 'text-success',
      iconBg: 'bg-accent-50',
      action: () => router.push('/vendor/storefront')
    },
    {
      title: 'View Analytics',
      description: 'See detailed performance metrics',
      icon: 'BarChart3',
      iconColor: 'text-secondary-600',
      iconBg: 'bg-secondary-50',
      action: () => router.push('/vendor/analytics')
    }
  ];

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <h2 className="font-heading font-semibold text-lg text-text-primary mb-6">
        Quick Actions
      </h2>

      <div className="space-y-4">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.action}
            className="w-full flex items-center space-x-4 p-4 rounded-lg border border-border hover:border-primary hover:bg-primary-50 transition-all duration-200 text-left group"
          >
            <div className={`w-10 h-10 rounded-lg ${action.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <Icon name={action.icon} size={20} className={action.iconColor} />
            </div>

            <div className="flex-1">
              <h3 className="font-medium text-text-primary group-hover:text-primary">
                {action.title}
              </h3>
              <p className="text-sm text-text-muted">
                {action.description}
              </p>
            </div>

            <Icon
              name="ChevronRight"
              size={16}
              className="text-text-muted group-hover:text-primary"
            />
          </button>
        ))}
      </div>

      {/* Additional Actions */}
      <div className="mt-6 pt-6 border-t border-border space-y-3">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => router.push('../profile')}
        >
          <Icon name="User" size={16} className="mr-2" />
          Edit Profile
        </Button>

        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => router.push('../settings')}
        >
          <Icon name="Settings" size={16} className="mr-2" />
          Settings
        </Button>
      </div>
    </div>
  );
};

export default QuickActions;