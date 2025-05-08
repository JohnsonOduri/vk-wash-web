
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Control as ControlType } from 'react-hook-form';

interface ItemsSelectionProps {
  control: ControlType;
}

const ItemsSelection = ({ control }: ItemsSelectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Clothing Items</CardTitle>
        <CardDescription>Enter the number of units for each clothing type</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormField
            control={control}
            name="items.shirts"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Shirts (units)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="items.pants"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pants (units)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="items.suits"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Suits (units)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="items.dresses"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dresses (units)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="items.other"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Other Items (units)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ItemsSelection;
