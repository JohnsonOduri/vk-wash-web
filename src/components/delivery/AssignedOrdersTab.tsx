
import { Order } from '@/services/orderService';
import AssignedOrderCard from './AssignedOrderCard';
import EmptyOrdersMessage from './EmptyOrdersMessage';

interface AssignedOrdersTabProps {
  orders: Order[];
}

const AssignedOrdersTab = ({ orders }: AssignedOrdersTabProps) => {
  return (
    <>
      <h2 className="text-2xl font-bold mb-4">My Assigned Orders</h2>
      {orders.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {orders.map((order) => (
            <AssignedOrderCard key={order.id} order={order} />
          ))}
        </div>
      ) : (
        <EmptyOrdersMessage message="You currently have no assigned orders." />
      )}
    </>
  );
};

export default AssignedOrdersTab;
