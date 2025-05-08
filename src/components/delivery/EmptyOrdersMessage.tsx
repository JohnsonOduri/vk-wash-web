
import { Card, CardContent } from '@/components/ui/card';
import { Truck } from 'lucide-react';

interface EmptyOrdersMessageProps {
  message: string;
  filterActive?: boolean;
}

const EmptyOrdersMessage = ({ message, filterActive = false }: EmptyOrdersMessageProps) => {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Truck className="h-12 w-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-700 mb-1">No Active Orders</h3>
        <p className="text-gray-500 text-center">
          {filterActive 
            ? "No orders match your search criteria" 
            : message}
        </p>
      </CardContent>
    </Card>
  );
};

export default EmptyOrdersMessage;
