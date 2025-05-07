
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package } from 'lucide-react';

interface OrderSummaryProps {
  total: number;
  submitting: boolean;
  formErrors: boolean;
}

const OrderSummary = ({ total, submitting, formErrors }: OrderSummaryProps) => {
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
          Final price may vary based on the number of items and specific requirements.
        </p>
        {formErrors && (
          <p className="text-sm text-red-500 mt-2">
            Please complete all required fields before placing your order.
          </p>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          type="submit" 
          className="w-full" 
          disabled={submitting || formErrors}
        >
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
