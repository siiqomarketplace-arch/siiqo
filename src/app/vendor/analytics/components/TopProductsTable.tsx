'use client'

import React, { useState, useMemo } from 'react';
import Icon, { LucideIconName } from '@/components/AppIcon';
import Button from '@/components/ui/new/Button';
import Image from '@/components/ui/alt/AppImageAlt';

// --- TYPES ---
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
    data?: ProductData[]; // Made optional
    isLoading?: boolean;
}

type SortableField = 'revenue' | 'unitsSold' | 'rating' | 'stock';
type SortDirection = 'asc' | 'desc';

const TopProductsTable: React.FC<TopProductsTableProps> = ({ data = [], isLoading = false }) => {
    const [sortField, setSortField] = useState<SortableField>('revenue');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    // memoize the sorting so it doesn't run on every re-render unless data/sort changes
    const sortedData = useMemo(() => {
        if (!Array.isArray(data)) return [];
        
        return [...data].sort((a, b) => {
            // Default to 0 if the field is missing/undefined in the API response
            const aValue = a[sortField] ?? 0;
            const bValue = b[sortField] ?? 0;

            if (sortDirection === 'asc') {
                return aValue > bValue ? 1 : -1;
            }
            return aValue < bValue ? 1 : -1;
        });
    }, [data, sortField, sortDirection]);

    const handleSort = (field: SortableField): void => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

    const getSortIcon = (field: SortableField): LucideIconName => {
        if (sortField !== field) return 'ArrowUpDown';
        return sortDirection === 'asc' ? 'ArrowUp' : 'ArrowDown';
    };

    const exportToCSV = (): void => {
        const headers = ['Product', 'Revenue', 'Units Sold', 'Avg Rating', 'Stock'];
        const csvData = [
            headers.join(','),
            ...sortedData.map(item => [
                `"${item.name || 'Unknown'}"`,
                item.revenue ?? 0,
                item.unitsSold ?? 0,
                item.rating ?? 0,
                item.stock ?? 0
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

    if (isLoading) {
        return (
            <div className="bg-white rounded-[2rem] border border-slate-100 p-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-slate-100 rounded w-1/4"></div>
                    <div className="h-10 bg-slate-50 rounded"></div>
                    <div className="h-10 bg-slate-50 rounded"></div>
                    <div className="h-10 bg-slate-50 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 flex items-center justify-between bg-white border-b border-slate-50">
                <div>
                    <h3 className="text-lg font-bold text-slate-900">Top Performing Products</h3>
                    <p className="text-xs font-medium text-slate-500">Sales and inventory data</p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={exportToCSV}
                    iconName="Download"
                    className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                    Export CSV
                </Button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50">
                            <th className="py-4 px-6 font-bold text-slate-500 text-xs uppercase tracking-wider">Product</th>
                            
                            {/* Sortable Headers */}
                            {[
                                { id: 'revenue', label: 'Revenue' },
                                { id: 'unitsSold', label: 'Units Sold' },
                                { id: 'rating', label: 'Rating' },
                                { id: 'stock', label: 'Stock' }
                            ].map((col) => (
                                <th 
                                    key={col.id}
                                    className="py-4 px-6 font-bold text-slate-500 text-xs uppercase tracking-wider cursor-pointer hover:text-blue-600 transition-colors"
                                    onClick={() => handleSort(col.id as SortableField)}
                                >
                                    <div className="flex items-center space-x-1">
                                        <span>{col.label}</span>
                                        <Icon name={getSortIcon(col.id as SortableField)} size={12} />
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {sortedData.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-20 text-center text-slate-400 font-medium italic">
                                    No product data found for this period
                                </td>
                            </tr>
                        ) : (
                            sortedData.map((product) => (
                                <tr key={product.id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="py-4 px-6">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-100 flex-shrink-0">
                                                <Image
                                                    src={product.image || '/placeholder-product.png'}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 leading-none mb-1">{product.name || 'Untitled Product'}</p>
                                                <p className="text-xs font-semibold text-slate-400">{product.category || 'Uncategorized'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className="font-black text-slate-900">
                                            ₦{(product.revenue ?? 0).toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className="font-bold text-slate-600">{product.unitsSold ?? 0}</span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center space-x-1">
                                            <Icon name="Star" size={14} className="text-amber-400 fill-current" />
                                            <span className="font-bold text-slate-700">{product.rating ?? '0.0'}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                            (product.stock ?? 0) > 20
                                                ? 'bg-emerald-50 text-emerald-600'
                                                : (product.stock ?? 0) > 5
                                                    ? 'bg-amber-50 text-amber-600' 
                                                    : 'bg-rose-50 text-rose-600'
                                        }`}>
                                            {(product.stock ?? 0) > 0 ? `${product.stock} In Stock` : 'Out of Stock'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TopProductsTable;