import React from 'react';
import Icon from '@/components/AppIcon';
import Button from '@/components/ui/alt/ButtonAlt';

interface QuickAction {
	id: string;
	title: string;
	description: string;
	icon: string;
	color: string;
	bgColor: string;
}

interface QuickActionsProps {
	onAction: (id: string) => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onAction }) => {
	const quickActions: QuickAction[] = [
		{
			id: 'print_labels',
			title: 'Print Shipping Labels',
			description: 'Print labels for pending orders',
			icon: 'Printer',
			color: 'text-blue-600',
			bgColor: 'bg-blue-100'
		},
		{
			id: 'export_orders',
			title: 'Export Orders',
			description: 'Download order data as CSV',
			icon: 'Download',
			color: 'text-success',
			bgColor: 'bg-success/10'
		},
		{
			id: 'bulk_update',
			title: 'Bulk Status Update',
			description: 'Update multiple orders at once',
			icon: 'RefreshCw',
			color: 'text-purple-600',
			bgColor: 'bg-purple-100'
		},
		{
			id: 'send_notifications',
			title: 'Send Notifications',
			description: 'Notify customers about updates',
			icon: 'Bell',
			color: 'text-warning',
			bgColor: 'bg-warning/10'
		}
	];

	return (
		<div className="bg-card border border-border rounded-lg p-4">
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
				<Icon name="Zap" size={20} className="text-muted-foreground" />
			</div>

			<div className="space-y-3">
				{quickActions.map((action) => (
					<button
						key={action.id}
						onClick={() => onAction(action.id)}
						className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-smooth text-left"
					>
						<div className={`w-10 h-10 rounded-lg ${action.bgColor} flex items-center justify-center flex-shrink-0`}>
							<Icon name={action.icon} size={18} className={action.color} />
						</div>
						<div className="flex-1 min-w-0">
							<p className="font-medium text-foreground">{action.title}</p>
							<p className="text-sm text-muted-foreground">{action.description}</p>
						</div>
						<Icon name="ChevronRight" size={16} className="text-muted-foreground" />
					</button>
				))}
			</div>

			<div className="mt-4 pt-4 border-t border-border">
				<Button
					variant="outline"
					fullWidth
					iconName="Settings"
					iconPosition="left"
					onClick={() => onAction('settings')}
				>
					Order Settings
				</Button>
			</div>
		</div>
	);
};

export default QuickActions;