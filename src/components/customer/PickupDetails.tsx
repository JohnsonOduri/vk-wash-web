
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Control, FieldErrors } from 'react-hook-form';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { useEffect } from 'react';

interface PickupDetailsProps {
  control: Control<any>;
  setValue: any;
  errors?: FieldErrors;
}

const PickupDetails = ({ control, setValue, errors }: PickupDetailsProps) => {
  const { user } = useFirebaseAuth();

  // Pre-fill the address with the user's saved address
  useEffect(() => {
    if (user?.address) {
      setValue('pickupAddress', user.address);
    }
  }, [user, setValue]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pickup Details</CardTitle>
        <CardDescription>Enter details for laundry pickup</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={control}
          name="pickupAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pickup Address</FormLabel>
              <FormControl>
                <Input placeholder="Enter your full address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="pickupDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pickup Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="specialInstructions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Special Instructions (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Any special instructions for pickup or cleaning" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
};

export default PickupDetails;
