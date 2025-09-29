'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon, { type LucideIconName } from '../AppIcon';

// --- START OF TYPESCRIPT CONVERSION ---

interface NavigationItem {
    label: string;
    path: string;
    icon: LucideIconName;
    tooltip: string;
}

// --- END OF TYPESCRIPT CONVERSION ---

const CustomerBottomTabs: React.FC = () => {
    const pathname = usePathname();

    const navigationItems: NavigationItem[] = [
        {
            label: 'Home',
            path: '/customer-marketplace-home',
            icon: 'House',
            tooltip: 'Discover local businesses and products'
        },
        {
            label: 'Businesses',
            path: '/business-storefront-view',
            icon: 'Store',
            tooltip: 'Browse business storefronts'
        }
    ];

    const isActiveRoute = (path: string): boolean => {
        return pathname === path;
    };

    return (
        <>
            {/* Mobile Bottom Navigation */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border z-30 safe-area-inset-bottom">
                <div className="flex">
                    {navigationItems.map((item) => (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`
                flex-1 flex flex-col items-center justify-center py-2 px-1
                transition-all duration-150 ease-out
                ${isActiveRoute(item.path)
                                    ? 'text-primary' : 'text-text-secondary'
                                }
              `}
                        >
                            <div className={`
                p-1.5 rounded-lg transition-all duration-150
                ${isActiveRoute(item.path)
                                    ? 'bg-primary/10' : 'hover:bg-muted'
                                }
              `}>
                                <Icon
                                    name={item.icon}
                                    size={20}
                                    className={`
                    ${isActiveRoute(item.path)
                                            ? 'text-primary' : 'text-text-secondary'
                                        }
                  `}
                                />
                            </div>
                            <span className={`
                text-xs font-medium mt-1
                ${isActiveRoute(item.path)
                                    ? 'text-primary' : 'text-text-secondary'
                                }
              `}>
                                {item.label}
                            </span>
                        </Link>
                    ))}
                </div>
            </nav>

            {/* Desktop Top Navigation */}
            <nav className="hidden lg:flex items-center justify-center bg-white border-b border-border px-6 py-4">
                <div className="flex items-center space-x-8">
                    {/* Logo */}
                    <Link href="/customer-marketplace-home" className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <Icon name="Store" size={20} color="white" />
                        </div>
                        <span className="font-semibold text-xl text-text-primary">
                            HyperLocal
                        </span>
                    </Link>

                    {/* Navigation Items */}
                    <div className="flex items-center space-x-6">
                        {navigationItems.map((item) => (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-lg
                  transition-all duration-150 ease-out
                  ${isActiveRoute(item.path)
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-text-secondary hover:text-text-primary hover:bg-muted'
                                    }
                `}
                                title={item.tooltip}
                            >
                                <Icon
                                    name={item.icon}
                                    size={18}
                                    className={`
                    ${isActiveRoute(item.path)
                                            ? 'text-primary-foreground'
                                            : 'text-text-secondary'
                                        }
                  `}
                                />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </nav>
        </>
    );
};

export default CustomerBottomTabs;