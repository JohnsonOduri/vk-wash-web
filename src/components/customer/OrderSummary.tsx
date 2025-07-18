
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package } from 'lucide-react';

interface OrderSummaryProps {
  submitting: boolean;
  formErrors?: boolean;
}

const OrderSummary = ({ submitting, formErrors }: OrderSummaryProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500 mt-2">
          Final price will be calculated after item assessment and processing.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Services are priced based on the specific laundry items and quantity.
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
          disabled={submitting || (formErrors ?? false)}
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
