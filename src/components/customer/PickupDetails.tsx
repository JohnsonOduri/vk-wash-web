
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Control as ControlType, FieldErrors as FieldErrorsType, UseFormSetValue as UseFormSetValueType } from 'react-hook-form';

interface PickupDetailsProps {
  control: ControlType;
  setValue: UseFormSetValueType<any>;
  errors: FieldErrorsType;
}

const PickupDetails = ({ control, setValue, errors }: PickupDetailsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pickup Details</CardTitle>
        <CardDescription>
          Tell us where and when to pick up your items. 
          The final bill will be generated after pickup based on the number and type of items.
        </CardDescription>
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
                <Textarea 
                  placeholder="Any special instructions for pickup or handling of your items" 
                  {...field} 
                />
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
