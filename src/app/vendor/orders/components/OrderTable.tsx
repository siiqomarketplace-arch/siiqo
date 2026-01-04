import React, { useState } from 'react';
import Icon from '@/components/AppIcon';
import Button from '@/components/ui/new/Button';
import { Checkbox } from '@/components/ui/new/Checkbox';
import OrderStatusBadge from './OrderStatusBadge';
import OrderRowExpanded from './OrderRowExpanded';
import { ProductOrder } from '@/types/orders';

// --- Types ---
export type OrderState = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

interface OrderItem {
    id: string;
    name: string;
    image: string;
    quantity: number;
    price: number;
}

interface ShippingAddress {
    name: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone?: string;
}

interface Customer {
    name: string;
    email: string;
}

export interface Order {
    id: string;
    orderNumber: string;
    items: OrderItem[];
    customer: Customer;
    shippingAddress: ShippingAddress;
    customerNotes?: string;
    status: OrderState;
    createdAt: string; // Changed to string for easier API handling
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
    trackingNumber?: string | null;
}

interface OrderTableProps {
    orders: any[]; // Accept raw API data
    selectedOrders: string[];
    onOrderSelect: (orderId: string, selected: boolean) => void;
    onSelectAll: (selected: boolean) => void;
    onStatusUpdate: (orderId: string, status: OrderState) => void;
    onViewOrder: (order: ProductOrder) => void;
}

const OrderTable: React.FC<OrderTableProps> = ({
    orders,
    selectedOrders,
    onOrderSelect,
    onSelectAll,
    onStatusUpdate,
    onViewOrder
}) => {
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    // --- Data Normalization Logic ---
    // This helper ensures that even if the API returns snake_case, the component works
   // Change the return type from Order to ProductOrder
const normalizeOrder = (raw: any): ProductOrder => {
    return {
        id: raw.id || raw._id,
        orderNumber: raw.orderNumber || raw.order_number || `ORD-${raw.id?.slice(-5)}`,
        items: raw.items || [],
        customer: {
            name: raw.customer?.name || raw.customer_name || 'Guest',
            email: raw.customer?.email || raw.customer_email || 'N/A'
        },
        shippingAddress: raw.shippingAddress || raw.shipping_address || {},
        status: raw.status as any, // Cast to match Status type
        // CONVERT TO DATE HERE:
        createdAt: new Date(raw.createdAt || raw.created_at || Date.now()), 
        subtotal: raw.subtotal || 0,
        shipping: raw.shipping_fee || raw.shipping || 0,
        tax: raw.tax || 0,
        total: raw.total || raw.total_price || 0,
        customerNotes: raw.customerNotes || raw.customer_notes,
        trackingNumber: raw.trackingNumber || raw.tracking_number
    };
};
    const toggleRowExpansion = (orderId: string): void => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(orderId)) {
            newExpanded.delete(orderId);
        } else {
            newExpanded.add(orderId);
        }
        setExpandedRows(newExpanded);
    };

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const formatDate = (date: Date): string => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-muted/50 border-b border-border">
                        <tr>
                            <th className="w-12 px-4 py-3">
                                <Checkbox
                                    checked={selectedOrders.length === orders.length && orders.length > 0}
                                    onChange={(e) => onSelectAll(e.target.checked)}
                                />
                            </th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Order</th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Customer</th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Date</th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Total</th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Status</th>
                            <th className="text-right px-4 py-3 text-sm font-medium text-foreground">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {orders.map((rawOrder) => {
                            const order = normalizeOrder(rawOrder);
                            return (
                                <React.Fragment key={order.id}>
                                    <tr className="hover:bg-muted/30 transition-smooth">
                                        <td className="px-4 py-4">
                                            <Checkbox
                                                checked={selectedOrders.includes(order.id)}
                                                onChange={(e) => onOrderSelect(order.id, e.target.checked)}
                                            />
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => toggleRowExpansion(order.id)}
                                                    className="p-1 hover:bg-muted rounded transition-smooth"
                                                >
                                                    <Icon
                                                        name={expandedRows.has(order.id) ? "ChevronDown" : "ChevronRight"}
                                                        size={16}
                                                    />
                                                </button>
                                                <div>
                                                    <p className="font-medium text-foreground">#{order.orderNumber}</p>
                                                    <p className="text-sm text-muted-foreground">{order.items.length} items</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div>
                                                <p className="font-medium text-foreground">{order.customer.name}</p>
                                                <p className="text-sm text-muted-foreground">{order.customer.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <p className="text-sm text-foreground">{formatDate(order.createdAt)}</p>
                                        </td>
                                        <td className="px-4 py-4">
                                            <p className="font-medium text-foreground">{formatCurrency(order.total)}</p>
                                        </td>
                                        <td className="px-4 py-4">
                                            <OrderStatusBadge status={order.status} />
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center justify-end space-x-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => onViewOrder(order)}
                                                    iconName="Eye"
                                                />
                                                {order.status === 'pending' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => onStatusUpdate(order.id, 'processing')}
                                                        iconName="Package"
                                                    />
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                    {expandedRows.has(order.id) && (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-0">
                                                <OrderRowExpanded order={order} />
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4 p-4">
                {orders.map((rawOrder) => {
                    const order = normalizeOrder(rawOrder);
                    return (
                        <div key={order.id} className="border border-border rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                    <Checkbox
                                        checked={selectedOrders.includes(order.id)}
                                        onChange={(e) => onOrderSelect(order.id, e.target.checked)}
                                    />
                                    <div>
                                        <p className="font-medium text-foreground">#{order.orderNumber}</p>
                                        <p className="text-sm text-muted-foreground">{order.customer.name}</p>
                                    </div>
                                </div>
                                <OrderStatusBadge status={order.status} size="sm" />
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Date</p>
                                    <p className="text-foreground">{formatDate(order.createdAt)}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Total</p>
                                    <p className="font-medium text-foreground">{formatCurrency(order.total)}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleRowExpansion(order.id)}
                                    iconName={expandedRows.has(order.id) ? "ChevronUp" : "ChevronDown"}
                                    iconPosition="right"
                                >
                                    {expandedRows.has(order.id) ? 'Less Details' : 'More Details'}
                                </Button>
                                <div className="flex space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onViewOrder(order)}
                                        iconName="Eye"
                                    />
                                    {order.status === 'pending' && (
                                        <Button
                                            variant="default"
                                            size="sm"
                                            onClick={() => onStatusUpdate(order.id, 'processing')}
                                            iconName="Package"
                                        />
                                    )}
                                </div>
                            </div>

                            {expandedRows.has(order.id) && (
                                <div className="mt-4 pt-4 border-t border-border">
                                    <OrderRowExpanded order={order} />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {orders.length === 0 && (
                <div className="text-center py-12">
                    <Icon name="Package" size={48} className="text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No orders found</h3>
                    <p className="text-muted-foreground">Try adjusting your filters to see more results.</p>
                </div>
            )}
        </div>
    );
};

export default OrderTable;