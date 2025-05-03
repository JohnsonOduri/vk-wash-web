
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package } from 'lucide-react';

interface OrderSummaryProps {
  total: number;
  submitting: boolean;
}

const OrderSummary = ({ total, submitting }: OrderSummaryProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-lg font-semibold flex justify-between">
          <span>Estimated Total:</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Final price may vary based on weight and specific requirements.
        </p>
      </CardContent>
      <CardFooter>
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? (
            <>Processing...</>
          ) : (
            <>
              <Package className="h-5 w-5 mr-2" />
              Place Order
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default OrderSummary;
