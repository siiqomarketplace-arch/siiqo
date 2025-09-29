import React, { useState } from 'react';
import Icon from '@/components/AppIcon';
import Button from '@/components/ui/new/Button';
import Select from '@/components/ui/new/NewSelect';

type OrderStatus = 'processing' | 'shipped' | 'delivered' | 'cancelled';
type ExportFormat = 'csv' | 'pdf';

interface Props {
	selectedCount: number;
	onBulkStatusUpdate: (status: OrderStatus) => void;
	onBulkExport: (format: ExportFormat) => void;
	onClearSelection: () => void;
}

const statusOptions = [
	{ value: '', label: 'Select status...' },
	{ value: 'processing', label: 'Mark as Processing' },
	{ value: 'shipped', label: 'Mark as Shipped' },
	{ value: 'delivered', label: 'Mark as Delivered' },
	{ value: 'cancelled', label: 'Mark as Cancelled' }
];

const BulkActionsToolbar: React.FC<Props> = ({
	selectedCount, onBulkStatusUpdate, onBulkExport, onClearSelection
}) => {
	const [bulkStatus, setBulkStatus] = useState < string > ('');

	const handleUpdate = () => {
		if (bulkStatus) {
			onBulkStatusUpdate(bulkStatus as OrderStatus);
			setBulkStatus('');
		}
	};

	if (!selectedCount) return null;

	return (
		<div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-4">
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
				<div className="flex items-center space-x-3">
					<div className="flex items-center space-x-2">
						<Icon name="CheckSquare" size={20} className="text-primary" />
						<span className="font-medium text-foreground">
							{selectedCount} order{selectedCount !== 1 ? 's' : ''} selected
						</span>
					</div>
					<Button variant="ghost" size="sm" onClick={onClearSelection} iconName="X">
						Clear
					</Button>
				</div>

				<div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
					<div className="flex items-center space-x-2">
						<Select
							placeholder="Update status..."
							options={statusOptions}
							value={bulkStatus}
							onChange={setBulkStatus}
							className="min-w-48"
						/>
						<Button
							variant="default"
							size="sm"
							onClick={handleUpdate}
							disabled={!bulkStatus}
							iconName="RefreshCw"
						>
							Update
						</Button>
					</div>

					<div className="flex items-center space-x-2">
						{(['csv', 'pdf'] as const).map(format => (
							<Button
								key={format}
								variant="outline"
								size="sm"
								onClick={() => onBulkExport(format)}
								iconName={format === 'csv' ? 'Download' : 'FileText'}
							>
								Export {format.toUpperCase()}
							</Button>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};

export default BulkActionsToolbar;