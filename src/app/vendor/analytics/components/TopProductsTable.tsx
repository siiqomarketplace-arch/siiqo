import React, { useState } from 'react';
import Icon, { LucideIconName } from '@/components/AppIcon';
import Button from '@/components/ui/new/Button';
import Image from '@/components/ui/alt/AppImageAlt';

// --- START OF TYPESCRIPT CONVERSION ---

interface ProductData {
    id: number | string;
    image: string;
    name: string;
    category: string;
    revenue: number;
    unitsSold: number;
    rating: number;
    stock: number;
}

interface TopProductsTableProps {
    data: ProductData[];
}

type SortableField = 'revenue' | 'unitsSold' | 'rating' | 'stock';
type SortDirection = 'asc' | 'desc';

// --- END OF TYPESCRIPT CONVERSION ---

const TopProductsTable: React.FC<TopProductsTableProps> = ({ data }) => {
    const [sortField, setSortField] = useState<SortableField>('revenue');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    const handleSort = (field: SortableField): void => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

    const sortedData = [...data].sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];

        if (sortDirection === 'asc') {
            return aValue > bValue ? 1 : -1;
        }
        return aValue < bValue ? 1 : -1;
    });

    const getSortIcon = (field: SortableField): LucideIconName => {
        if (sortField !== field) return 'ArrowUpDown';
        return sortDirection === 'asc' ? 'ArrowUp' : 'ArrowDown';
    };

    const exportToCSV = (): void => {
        const headers = ['Product', 'Revenue', 'Units Sold', 'Avg Rating', 'Stock'];
        const csvData = [
            headers.join(','),
            ...sortedData.map(item => [
                `"${item.name}"`,
                item.revenue,
                item.unitsSold,
                item.rating,
                item.stock
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'top-products.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="bg-white rounded-lg border border-border p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-text-primary">Top Performing Products</h3>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={exportToCSV}
                    iconName={'Download' as LucideIconName}
                    iconPosition="left"
                >
                    Export CSV
                </Button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border">
                            <th className="text-left py-3 px-4 font-medium text-text-secondary">
                                Product
                            </th>
                            <th
                                className="text-left py-3 px-4 font-medium text-text-secondary cursor-pointer hover:text-text-primary transition-colors"
                                onClick={() => handleSort('revenue')}
                            >
                                <div className="flex items-center space-x-1">
                                    <span>Revenue</span>
                                    <Icon name={getSortIcon('revenue')} size={14} />
                                </div>
                            </th>
                            <th
                                className="text-left py-3 px-4 font-medium text-text-secondary cursor-pointer hover:text-text-primary transition-colors"
                                onClick={() => handleSort('unitsSold')}
                            >
                                <div className="flex items-center space-x-1">
                                    <span>Units Sold</span>
                                    <Icon name={getSortIcon('unitsSold')} size={14} />
                                </div>
                            </th>
                            <th
                                className="text-left py-3 px-4 font-medium text-text-secondary cursor-pointer hover:text-text-primary transition-colors"
                                onClick={() => handleSort('rating')}
                            >
                                <div className="flex items-center space-x-1">
                                    <span>Rating</span>
                                    <Icon name={getSortIcon('rating')} size={14} />
                                </div>
                            </th>
                            <th
                                className="text-left py-3 px-4 font-medium text-text-secondary cursor-pointer hover:text-text-primary transition-colors"
                                onClick={() => handleSort('stock')}
                            >
                                <div className="flex items-center space-x-1">
                                    <span>Stock</span>
                                    <Icon name={getSortIcon('stock')} size={14} />
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedData.map((product) => (
                            <tr key={product.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                                <td className="py-4 px-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted">
                                            <Image
                                                src={product.image}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <p className="font-medium text-text-primary">{product.name}</p>
                                            <p className="text-sm text-text-secondary">{product.category}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    <span className="font-semibold text-text-primary">
                                        ${product.revenue.toLocaleString()}
                                    </span>
                                </td>
                                <td className="py-4 px-4">
                                    <span className="text-text-primary">{product.unitsSold}</span>
                                </td>
                                <td className="py-4 px-4">
                                    <div className="flex items-center space-x-1">
                                        <Icon name={'Star' as LucideIconName} size={14} className="text-warning fill-current" />
                                        <span className="text-text-primary">{product.rating}</span>
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.stock > 20
                                            ? 'bg-success/10 text-success'
                                            : product.stock > 5
                                                ? 'bg-warning/10 text-warning' : 'bg-error/10 text-error'
                                        }`}>
                                        {product.stock} units
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TopProductsTable;