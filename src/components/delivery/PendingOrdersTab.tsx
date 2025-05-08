
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Package } from 'lucide-react';
import { Order } from '@/services/orderService';
import OrderCard from './OrderCard';
import EmptyOrdersMessage from './EmptyOrdersMessage';

interface PendingOrdersTabProps {
  orders: Order[];
  onAcceptOrder: (orderId: string) => void;
  onRejectOrder: (orderId: string) => void;
}

const PendingOrdersTab = ({ orders, onAcceptOrder, onRejectOrder }: PendingOrdersTabProps) => {
  const [filter, setFilter] = useState('');

  const filteredOrders = orders.filter(order => 
    filter === '' || 
    (order.id && order.id.includes(filter)) ||
    (order.serviceType && order.serviceType.toLowerCase().includes(filter.toLowerCase()))
  );

  return (
    <>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Active Orders</h2>
        
        <div className="relative w-64">
          <Input
            type="text"
            placeholder="Filter by ID or service..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-10"
          />
          <Package className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
        </div>
      </div>

      {filteredOrders.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
          {filteredOrders.map(order => (
            <OrderCard 
              key={order.id} 
              order={order}
              onAccept={onAcceptOrder}
              onReject={onRejectOrder}
            />
          ))}
        </div>
      ) : (
        <EmptyOrdersMessage 
          message="There are no pending orders at the moment" 
          filterActive={filter !== ''}
        />
      )}
    </>
  );
};

export default PendingOrdersTab;
