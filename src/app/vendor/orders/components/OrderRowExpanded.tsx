import React from 'react';
import Icon from '@/components/AppIcon';
import Image from '@/components/ui/AppImage';

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

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

interface Order {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  customer: Customer;
  shippingAddress: ShippingAddress;
  customerNotes?: string;
  status: OrderStatus;
  createdAt: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

interface OrderRowExpandedProps {
	order: Order;
}

const OrderRowExpanded: React.FC<OrderRowExpandedProps> = ({ order }) => {
	const formatCurrency = (amount: number): string => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD'
		}).format(amount);
	};

	return (
		<div className="bg-muted/30 rounded-lg p-4 mb-4">
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Order Items */}
				<div className="lg:col-span-2">
					<h4 className="font-medium text-foreground mb-3 flex items-center">
						<Icon name="Package" size={16} className="mr-2" />
						Order Items
					</h4>
					<div className="space-y-3">
						{order.items.map((item) => (
							<div key={item.id} className="flex items-center space-x-3 bg-card p-3 rounded-lg">
								<div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
									<Image
										src={item.image}
										alt={item.name}
										className="w-full h-full object-cover"
									/>
								</div>
								<div className="flex-1 min-w-0">
									<p className="font-medium text-foreground truncate">{item.name}</p>
									<p className="text-sm text-muted-foreground">
										Qty: {item.quantity} × {formatCurrency(item.price)}
									</p>
								</div>
								<div className="text-right">
									<p className="font-medium text-foreground">{formatCurrency(item.quantity * item.price)}</p>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Shipping & Customer Info */}
				<div className="space-y-4">
					{/* Shipping Address */}
					<div>
						<h4 className="font-medium text-foreground mb-2 flex items-center">
							<Icon name="MapPin" size={16} className="mr-2" />
							Shipping Address
						</h4>
						<div className="bg-card p-3 rounded-lg text-sm">
							<p className="font-medium text-foreground">{order.shippingAddress.name}</p>
							<p className="text-muted-foreground">{order.shippingAddress.street}</p>
							<p className="text-muted-foreground">
								{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
							</p>
							<p className="text-muted-foreground">{order.shippingAddress.country}</p>
							{order.shippingAddress.phone && (
								<p className="text-muted-foreground mt-1">
									<Icon name="Phone" size={12} className="inline mr-1" />
									{order.shippingAddress.phone}
								</p>
							)}
						</div>
					</div>

					{/* Customer Notes */}
					{order.customerNotes && (
						<div>
							<h4 className="font-medium text-foreground mb-2 flex items-center">
								<Icon name="MessageSquare" size={16} className="mr-2" />
								Customer Notes
							</h4>
							<div className="bg-card p-3 rounded-lg">
								<p className="text-sm text-muted-foreground">{order.customerNotes}</p>
							</div>
						</div>
					)}

					{/* Order Summary */}
					<div>
						<h4 className="font-medium text-foreground mb-2 flex items-center">
							<Icon name="Receipt" size={16} className="mr-2" />
							Order Summary
						</h4>
						<div className="bg-card p-3 rounded-lg space-y-2 text-sm">
							<div className="flex justify-between">
								<span className="text-muted-foreground">Subtotal:</span>
								<span className="text-foreground">{formatCurrency(order.subtotal)}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Shipping:</span>
								<span className="text-foreground">{formatCurrency(order.shipping)}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Tax:</span>
								<span className="text-foreground">{formatCurrency(order.tax)}</span>
							</div>
							<div className="border-t border-border pt-2">
								<div className="flex justify-between font-medium">
									<span className="text-foreground">Total:</span>
									<span className="text-foreground">{formatCurrency(order.total)}</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default OrderRowExpanded;