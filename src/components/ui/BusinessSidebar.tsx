'use client';

import React, { useState } from 'react';
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

const BusinessSidebar: React.FC = () => {
	const [isCollapsed, setIsCollapsed] = useState < boolean > (false);
	const [isMobileOpen, setIsMobileOpen] = useState < boolean > (false);
	const pathname = usePathname();

	const navigationItems: NavigationItem[] = [
		{
			label: 'Dashboard',
			path: '/business-dashboard',
			icon: 'LayoutDashboard',
			tooltip: 'Business overview and quick insights'
		},
		{
			label: 'Products',
			path: '/product-management',
			icon: 'Package',
			tooltip: 'Manage your product catalog and inventory'
		},
		{
			label: 'Orders',
			path: '/order-management',
			icon: 'ClipboardList',
			tooltip: 'Process and track customer orders'
		},
		{
			label: 'Analytics',
			path: '/business-analytics',
			icon: 'ChartPie',
			tooltip: 'Performance insights and reports'
		}
	];

	const isActiveRoute = (path: string): boolean => {
		return pathname === path;
	};

	const toggleMobileMenu = (): void => {
		setIsMobileOpen(!isMobileOpen);
	};

	const closeMobileMenu = (): void => {
		setIsMobileOpen(false);
	};

	return (
		<>
			{/* Mobile Menu Button */}
			<button
				onClick={toggleMobileMenu}
				className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-card border border-border"
				aria-label="Toggle navigation menu"
			>
				<Icon name={isMobileOpen ? 'X' : 'Menu'} size={24} />
			</button>

			{/* Mobile Overlay */}
			{isMobileOpen && (
				<div
					className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
					onClick={closeMobileMenu}
				/>
			)}

			{/* Sidebar */}
			<aside
				className={`
          fixed top-0 left-0 h-full bg-white border-r border-border z-40
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-16' : 'w-60'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
			>
				{/* Header */}
				<div className="flex items-center justify-between p-4 border-b border-border">
					{!isCollapsed && (
						<div className="flex items-center space-x-2">
							<div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
								<Icon name="Store" size={20} color="white" />
							</div>
							<span className="font-semibold text-lg text-text-primary">
								HyperLocal
							</span>
						</div>
					)}

					<button
						onClick={() => setIsCollapsed(!isCollapsed)}
						className="hidden lg:flex p-1.5 rounded-md hover:bg-muted transition-colors duration-150"
						aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
					>
						<Icon
							name={isCollapsed ? 'ChevronRight' : 'ChevronLeft'}
							size={16}
							className="text-text-secondary"
						/>
					</button>
				</div>

				{/* Navigation */}
				<nav className="flex-1 p-4">
					<ul className="space-y-2">
						{navigationItems.map((item) => (
							<li key={item.path}>
								<Link
									href={item.path}
									onClick={closeMobileMenu}
									className={`
                    flex items-center space-x-3 px-3 py-2.5 rounded-lg
                    transition-all duration-150 ease-out group relative
                    ${isActiveRoute(item.path)
											? 'bg-primary text-primary-foreground shadow-sm'
											: 'text-text-secondary hover:text-text-primary hover:bg-muted'
										}
                  `}
									title={isCollapsed ? item.tooltip : ''}
								>
									<Icon
										name={item.icon}
										size={20}
										className={`
                      ${isActiveRoute(item.path)
												? 'text-primary-foreground'
												: 'text-text-secondary group-hover:text-text-primary'
											}
                    `}
									/>

									{!isCollapsed && (
										<span className="font-medium">{item.label}</span>
									)}

									{/* Tooltip for collapsed state */}
									{isCollapsed && (
										<div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 whitespace-nowrap z-50">
											{item.label}
										</div>
									)}
								</Link>
							</li>
						))}
					</ul>
				</nav>

				{/* Footer */}
				<div className="p-4 border-t border-border">
					<div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
						<div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
							<Icon name="User" size={16} className="text-text-secondary" />
						</div>
						{!isCollapsed && (
							<div className="flex-1 min-w-0">
								<p className="text-sm font-medium text-text-primary truncate">
									Business Owner
								</p>
								<p className="text-xs text-text-secondary truncate">
									Manage your store
								</p>
							</div>
						)}
					</div>
				</div>
			</aside>
		</>
	);
};

export default BusinessSidebar;