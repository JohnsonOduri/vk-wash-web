
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Control } from 'react-hook-form';

interface ItemsSelectionProps {
  control: Control<any>;
}

const ItemsSelection = ({ control }: ItemsSelectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Items</CardTitle>
        <CardDescription>Enter the number of items to be serviced</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormField
            control={control}
            name="items.shirts"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Shirts</FormLabel>
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
                <FormLabel>Pants</FormLabel>
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
                <FormLabel>Suits</FormLabel>
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
                <FormLabel>Dresses</FormLabel>
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
                <FormLabel>Other Items</FormLabel>
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
