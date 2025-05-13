
import { useState, useEffect } from 'react';
import { Plus, Trash } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createLaundryItem, getAllLaundryItems, deleteLaundryItem } from '@/services/laundryItemService';
import { LaundryItem } from '@/models/LaundryItem';

const ManageItems = () => {
  const [items, setItems] = useState<LaundryItem[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState<{
    name: string;
    price: number;
    category: 'regular' | 'premium' | 'express';
  }>({
    name: '',
    price: 0,
    category: 'regular'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'regular' | 'premium' | 'express'>('regular');
  const [deletingItem, setDeletingItem] = useState<string | null>(null);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setIsLoading(true);
    try {
      const fetchedItems = await getAllLaundryItems();
      setItems(fetchedItems);
    } catch (error) {
      console.error('Error loading items:', error);
      toast({
        title: 'Error',
        description: 'Failed to load laundry items',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateItem = async () => {
    if (!newItem.name || newItem.price <= 0) {
      toast({
        title: 'Invalid Input',
        description: 'Please provide a name and valid price',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Only pass what we have, the service will handle the rest
      await createLaundryItem(newItem);
      setIsAddDialogOpen(false);
      toast({
        title: 'Success',
        description: 'Item created successfully'
      });
      loadItems();
      resetForm();
    } catch (error) {
      console.error('Error creating item:', error);
      toast({
        title: 'Error',
        description: 'Failed to create item',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    setDeletingItem(itemId);
    try {
      await deleteLaundryItem(itemId);
      setItems(items.filter(item => item.id !== itemId));
      toast({
        title: 'Item Deleted',
        description: 'Item has been successfully removed'
      });
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete item',
        variant: 'destructive'
      });
    } finally {
      setDeletingItem(null);
    }
  };

  const resetForm = () => {
    setNewItem({
      name: '',
      price: 0,
      category: 'regular'
    });
  };

  const filteredItems = items.filter(item => 
    (item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchQuery.toLowerCase())) &&
    item.category === activeTab
  );

  const categoryOptions = [
    { value: 'regular', label: 'Regular' },
    { value: 'premium', label: 'Premium' },
    { value: 'express', label: 'Express' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage Laundry Items</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Item
        </Button>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Search items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'regular' | 'premium' | 'express')}>
        <TabsList className="mb-4">
          <TabsTrigger value="regular">Regular Items</TabsTrigger>
          <TabsTrigger value="premium">Premium Items</TabsTrigger>
          <TabsTrigger value="express">Express Items</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {isLoading ? (
            <div className="flex justify-center my-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.length > 0 ? (
                filteredItems.map(item => (
                  <Card key={item.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-gray-500 mb-2">Category: {item.category}</div>
                      <div className="text-lg font-semibold">₹{item.price.toFixed(2)}</div>
                    </CardContent>
                    <CardFooter className="pt-0 flex justify-end">
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleDeleteItem(item.id)}
                        disabled={deletingItem === item.id}
                      >
                        <Trash className="h-4 w-4 mr-1" />
                        {deletingItem === item.id ? 'Deleting...' : 'Delete'}
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <Card className="col-span-full">
                  <CardContent className="py-8 text-center text-muted-foreground">
                    {searchQuery ? 'No items match your search' : `No ${activeTab} items available. Add your first item!`}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Laundry Item</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Price (₹)
              </Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={newItem.price}
                onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Select 
                value={newItem.category} 
                onValueChange={(value: 'regular' | 'premium' | 'express') => setNewItem({ ...newItem, category: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddDialogOpen(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleCreateItem}>Create Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageItems;
