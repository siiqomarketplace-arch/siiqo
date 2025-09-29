import React, { useState } from 'react';
import Icon from '@/components/AppIcon';
import Image from '@/components/ui/AppImage';
import Button from '@/components/ui/new/Button';
import Input from '@/components/ui/new/NewInput';
import Select from '@/components/ui/new/NewSelect';
import OrderStatusBadge from './OrderStatusBadge';

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
type TabId = 'details' | 'communication' | 'tracking' | 'refunds';

interface OrderItem {
  id: number;
  name: string;
  image: string;
  quantity: number;
  price: number;
}

interface Customer {
  name: string;
  email: string;
  phone?: string;
}

interface ShippingAddress {
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customer: Customer;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  shippingAddress: ShippingAddress;
  trackingNumber?: string | null;
}

interface Message {
  id: number;
  sender: 'customer' | 'vendor';
  message: string;
  timestamp: Date;
  senderName: string;
}

interface Props {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (orderId: string, status: OrderStatus) => void;
  onSendMessage: (orderId: string, message: string) => void;
}

const formatCurrency = (amount: number) => 
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

const formatDate = (date: Date) => 
  new Date(date).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refunded', label: 'Refunded' }
];

const tabs = [
  { id: 'details' as const, label: 'Order Details', icon: 'Package' },
  { id: 'communication' as const, label: 'Communication', icon: 'MessageSquare' },
  { id: 'tracking' as const, label: 'Tracking', icon: 'Truck' },
  { id: 'refunds' as const, label: 'Refunds', icon: 'RotateCcw' }
];

const OrderDetailModal: React.FC<Props> = ({ 
  order, isOpen, onClose, onStatusUpdate, onSendMessage 
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('details');
  const [trackingNumber, setTrackingNumber] = useState(order?.trackingNumber || '');
  const [newMessage, setNewMessage] = useState('');
  const [refundAmount, setRefundAmount] = useState('');

  if (!isOpen || !order) return null;

  const mockMessages: Message[] = [
    {
      id: 1, sender: 'customer', message: 'When will my order be shipped?',
      timestamp: new Date(Date.now() - 3600000), senderName: order.customer.name
    },
    {
      id: 2, sender: 'vendor', 
      message: 'Your order will be shipped within 24 hours. You will receive tracking information via email.',
      timestamp: new Date(Date.now() - 1800000), senderName: 'VendorHub Support'
    }
  ];

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(order.id, newMessage);
      setNewMessage('');
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'details':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">Order Items</h3>
              <div className="space-y-3">
                {order.items.map(item => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 bg-muted/30 rounded-lg">
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <Image src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity} × {formatCurrency(item.price)}
                      </p>
                    </div>
                    <p className="font-medium text-foreground">{formatCurrency(item.quantity * item.price)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-foreground mb-4">Customer Information</h3>
                <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                  <p className="font-medium text-foreground">{order.customer.name}</p>
                  <p className="text-muted-foreground">{order.customer.email}</p>
                  {order.customer.phone && <p className="text-muted-foreground">{order.customer.phone}</p>}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-4">Shipping Address</h3>
                <div className="bg-muted/30 p-4 rounded-lg space-y-1">
                  <p className="font-medium text-foreground">{order.shippingAddress.name}</p>
                  <p className="text-muted-foreground">{order.shippingAddress.street}</p>
                  <p className="text-muted-foreground">
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                  </p>
                  <p className="text-muted-foreground">{order.shippingAddress.country}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">Update Status</h3>
              <div className="flex items-center space-x-4">
                <Select
                  options={statusOptions}
                  value={order.status}
                  onChange={(status) => onStatusUpdate(order.id, status as OrderStatus)}
                  className="w-48"
                />
                <Button variant="outline" iconName="Printer">Print Label</Button>
              </div>
            </div>
          </div>
        );

      case 'communication':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Customer Communication</h3>
            
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {mockMessages.map(message => (
                <div key={message.id} className={`flex ${message.sender === 'vendor' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender === 'vendor' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                  }`}>
                    <p className="text-sm">{message.message}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender === 'vendor' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    }`}>
                      {message.senderName} • {formatDate(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex space-x-2">
              <Input
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} iconName="Send">Send</Button>
            </div>
          </div>
        );

      case 'tracking':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Shipping & Tracking</h3>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Tracking Number</label>
              <div className="flex space-x-2">
                <Input
                  placeholder="Enter tracking number"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="flex-1"
                />
                <Button variant="outline" iconName="Save">Save</Button>
              </div>
            </div>

            {trackingNumber && (
              <div className="bg-muted/30 p-4 rounded-lg">
                <h4 className="font-medium text-foreground mb-2">Tracking Information</h4>
                <div className="space-y-2 text-sm">
                  {[
                    ['Carrier:', 'FedEx'],
                    ['Tracking Number:', trackingNumber],
                    ['Estimated Delivery:', 'Dec 15, 2024']
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-muted-foreground">{label}</span>
                      <span className={`text-foreground ${label.includes('Number') ? 'font-mono' : ''}`}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'refunds':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Refund Management</h3>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Refund Amount</label>
              <div className="flex space-x-2">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="flex-1"
                />
                <Button variant="destructive" iconName="RotateCcw">Process Refund</Button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Maximum refundable amount: {formatCurrency(order.total)}
              </p>
            </div>

            <div className="bg-muted/30 p-4 rounded-lg">
              <h4 className="font-medium text-foreground mb-2">Refund History</h4>
              <p className="text-sm text-muted-foreground">No refunds processed for this order.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-1300 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-modal w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-foreground">Order #{order.orderNumber}</h2>
            <OrderStatusBadge status={order.status} />
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} iconName="X" />
        </div>

        <div className="border-b border-border">
          <nav className="flex space-x-8 px-6">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-smooth ${
                  activeTab === tab.id
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon name={tab.icon} size={16} />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {renderTabContent()}
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-border">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button variant="default" iconName="Save">Save Changes</Button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;