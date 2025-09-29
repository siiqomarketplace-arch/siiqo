import React from 'react';
import Icon from '@/components/AppIcon';
import OrderStatusBadge from './OrderStatusBadge';

interface RecentActivity {
	id: number;
	title: string;
	description: string;
	timestamp: string;
	orderNumber?: string;
	status?: string;
	type: string;
}

interface RecentActivityFeedProps {
	activities: RecentActivity[];
}

const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({ activities }) => {
	const formatDate = (date: string): string => {
		return new Date(date).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	const getActivityIcon = (type: string): string => {
		const icons: Record<string, string> = {
			order_placed: 'Plus',
			status_updated: 'RefreshCw',
			payment_received: 'DollarSign',
			message_received: 'MessageSquare',
			refund_processed: 'RotateCcw'
		};
		return icons[type] || 'Bell';
	};

	const getActivityColor = (type: string): string => {
		const colors: Record<string, string> = {
			order_placed: 'text-success',
			status_updated: 'text-blue-600',
			payment_received: 'text-success',
			message_received: 'text-purple-600',
			refund_processed: 'text-warning'
		};
		return colors[type] || 'text-muted-foreground';
	};

	return (
		<div className="bg-card border border-border rounded-lg p-4">
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
				<Icon name="Activity" size={20} className="text-muted-foreground" />
			</div>

			<div className="space-y-4 max-h-96 overflow-y-auto">
				{activities.map((activity) => (
					<div key={activity.id} className="flex items-start space-x-3">
						<div className={`w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 ${getActivityColor(activity.type)}`}>
							<Icon name={getActivityIcon(activity.type)} size={14} />
						</div>
						<div className="flex-1 min-w-0">
							<div className="flex items-center justify-between">
								<p className="text-sm font-medium text-foreground truncate">
									{activity.title}
								</p>
								<span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
									{formatDate(activity.timestamp)}
								</span>
							</div>
							<p className="text-sm text-muted-foreground mt-1">
								{activity.description}
							</p>
							{activity.orderNumber && (
								<div className="flex items-center space-x-2 mt-2">
									<span className="text-xs font-mono bg-muted px-2 py-1 rounded">
										#{activity.orderNumber}
									</span>
									{activity.status && (
										<OrderStatusBadge status={activity.status} size="sm" />
									)}
								</div>
							)}
						</div>
					</div>
				))}
			</div>

			{activities.length === 0 && (
				<div className="text-center py-8">
					<Icon name="Activity" size={32} className="text-muted-foreground mx-auto mb-2" />
					<p className="text-sm text-muted-foreground">No recent activity</p>
				</div>
			)}
		</div>
	);
};

export default RecentActivityFeed;