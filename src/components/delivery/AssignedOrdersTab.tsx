
import React from 'react';
import { Order } from '@/services/orderService';
import DeliveryOrderCard from './DeliveryOrderCard';
import EmptyOrdersMessage from './EmptyOrdersMessage';

interface AssignedOrdersTabProps {
  orders: Order[];
  onUpdateStatus?: (orderId: string, newStatus: string) => void;
  onUploadImage?: (orderId: string) => void;
  onCreateBill?: (order: Order) => void;
}

const AssignedOrdersTab = ({ 
  orders, 
  onUpdateStatus = () => {}, 
  onUploadImage = () => {},
  onCreateBill = () => {}
}: AssignedOrdersTabProps) => {
  if (!orders || orders.length === 0) {
    return <EmptyOrdersMessage message="You have no assigned orders" description="Accept orders from the Pending Orders tab" />;
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">My Assigned Orders</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {orders.map((order) => (
            <DeliveryOrderCard 
              key={order.id}
              order={{
                id: order.id || '',
                customerId: order.userId || '',
                customerName: order.customerName || 'Customer',
                customerPhone: order.customerPhone || '',
                address: order.pickupAddress || '',
                service: order.serviceType || '',
                status: order.status.charAt(0).toUpperCase() + order.status.slice(1),
                createdAt: order.createdAt instanceof Date ? order.createdAt : order.createdAt.toDate(),
                estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Placeholder
                items: order.items?.map(item => `${item.name} x ${item.quantity}`) || []
              }}
              onUpdateStatus={onUpdateStatus}
              onUploadImage={onUploadImage}
              onCreateBill={() => onCreateBill(order)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AssignedOrdersTab;
