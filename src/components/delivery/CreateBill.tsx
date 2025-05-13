import { useState, useEffect } from 'react';
import { CheckCircle, Plus, Minus, Trash, UserPlus, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LaundryItem, OrderItem } from '@/models/LaundryItem';
import { getAllLaundryItems, createBill } from '@/services/laundryItemService';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { getOrderById, updateOrderStatus } from '@/services/orderService';
import { createCustomer, checkCustomerExists } from '@/services/customerService';

const CreateBill = ({ orderId, customerInfo }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useFirebaseAuth();
  const [items, setItems] = useState<LaundryItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<OrderItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [isNewCustomer, setIsNewCustomer] = useState(!customerInfo);
  const [customerName, setCustomerName] = useState(customerInfo?.customerName || '');
  const [customerPhone, setCustomerPhone] = useState(customerInfo?.customerPhone || '');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerId, setCustomerId] = useState(customerInfo?.customerId || '');
  const [newCustomerDialogOpen, setNewCustomerDialogOpen] = useState(false);
  const [customerExistsError, setCustomerExistsError] = useState(false);
  const [itemCategory, setItemCategory] = useState('regular');
  
  // Use location state if available (from navigation)
  const orderIdFromState = location?.state?.orderId;
  const currentOrderId = orderId || orderIdFromState;

  useEffect(() => {
    loadLaundryItems();
    
    // If we have an order ID but no customer info, fetch the order details
    if (currentOrderId && !customerInfo) {
      fetchOrderDetails(currentOrderId);
    }
  }, [currentOrderId]);

  const fetchOrderDetails = async (id: string) => {
    setLoadingOrder(true);
    try {
      const order = await getOrderById(id);
      if (order) {
        // Populate customer details from the order
        setCustomerId(order.userId || '');
        setCustomerName(order.customerName || '');
        setCustomerPhone(order.customerPhone || '');
        setCustomerAddress(order.pickupAddress || '');
        setIsNewCustomer(false); // Mark as an existing customer
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load order details',
        variant: 'destructive'
      });
    } finally {
      setLoadingOrder(false);
    }
  };

  const loadLaundryItems = async () => {
    setIsLoading(true);
    try {
      const fetchedItems = await getAllLaundryItems();
      setItems(fetchedItems);
    } catch (error) {
      console.error('Error loading laundry items:', error);
      toast({
        title: 'Error',
        description: 'Failed to load laundry items',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addItemToOrder = (item: LaundryItem) => {
    // Check if item is already in the order
    const existingItemIndex = selectedItems.findIndex(i => i.id === item.id);
    
    if (existingItemIndex >= 0) {
      // Increment quantity if already in the order
      const updatedItems = [...selectedItems];
      updatedItems[existingItemIndex].quantity += 1;
      updatedItems[existingItemIndex].total = updatedItems[existingItemIndex].price * updatedItems[existingItemIndex].quantity;
      setSelectedItems(updatedItems);
    } else {
      // Add new item to the order with quantity 1
      const newOrderItem: OrderItem = {
        ...item,
        quantity: 1,
        total: item.price
      };
      setSelectedItems([...selectedItems, newOrderItem]);
    }
  };

  const removeItemFromOrder = (itemId: string) => {
    setSelectedItems(selectedItems.filter(item => item.id !== itemId));
  };

  const updateItemQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItemFromOrder(itemId);
      return;
    }

    const updatedItems = selectedItems.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          quantity: newQuantity,
          total: item.price * newQuantity
        };
      }
      return item;
    });
    setSelectedItems(updatedItems);
  };

  const calculateSubtotal = () => {
    return selectedItems.reduce((sum, item) => sum + item.total, 0);
  };

  const handleOpenNewCustomerDialog = () => {
    setCustomerExistsError(false);
    setNewCustomerDialogOpen(true);
  };

  const handleCheckCustomer = async () => {
    if (!customerPhone) {
      toast({
        title: 'Missing Information',
        description: 'Please provide customer phone number',
        variant: 'destructive'
      });
      return;
    }

    try {
      const exists = await checkCustomerExists(customerPhone);
      if (exists) {
        setCustomerExistsError(true);
      } else {
        // Customer doesn't exist, proceed with creation
        handleCreateNewCustomer();
      }
    } catch (error) {
      console.error('Error checking customer:', error);
      toast({
        title: 'Error',
        description: 'Failed to verify customer information',
        variant: 'destructive'
      });
    }
  };

  const handleCreateNewCustomer = async () => {
    if (!customerName || !customerPhone) {
      toast({
        title: 'Missing Information',
        description: 'Please provide customer name and phone number',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Create a new customer using the service
      const newCustomerId = await createCustomer({
        name: customerName,
        phone: customerPhone,
        email: customerEmail,
        address: customerAddress,
        // Use phone as customer ID as requested
        id: customerPhone
      });
      
      setCustomerId(customerPhone);
      setIsNewCustomer(false);
      setNewCustomerDialogOpen(false);
      
      toast({
        title: 'Customer Added',
        description: 'New customer has been created successfully'
      });
    } catch (error) {
      console.error('Error creating customer:', error);
      toast({
        title: 'Error',
        description: 'Failed to create new customer',
        variant: 'destructive'
      });
    }
  };

  const handleUseExistingCustomer = () => {
    setIsNewCustomer(false);
    setNewCustomerDialogOpen(false);
    
    // Reset the error state
    setCustomerExistsError(false);
  };

  const handleGenerateBill = async () => {
    if (!customerName || !customerPhone) {
      toast({
        title: 'Missing Information',
        description: 'Please provide customer name and phone number',
        variant: 'destructive'
      });
      return;
    }

    if (selectedItems.length === 0) {
      toast({
        title: 'Empty Bill',
        description: 'Please add at least one item to the bill',
        variant: 'destructive'
      });
      return;
    }

    try {
      const subtotal = calculateSubtotal();
      const billData = {
        customerId: customerId || customerPhone || 'guest',
        customerName,
        customerPhone,
        items: selectedItems,
        subtotal: subtotal,
        tax: 0, // Adding tax property with value 0 since no tax is applied
        total: subtotal, // Total is same as subtotal since no tax
        orderId: currentOrderId || undefined  // Include order ID if available
      };

      await createBill(billData);
      
      // If we have an order ID, update its status to 'processing'
      if (currentOrderId) {
        await updateOrderStatus(currentOrderId, 'processing');
      }
      
      toast({
        title: 'Success',
        description: 'Bill has been generated and sent to the customer'
      });
      // Reset form
      setSelectedItems([]);
      
      // If we came here with an order, go back to delivery dashboard
      if (currentOrderId) {
        navigate('/delivery-dashboard');
      }
    } catch (error) {
      console.error('Error creating bill:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate bill',
        variant: 'destructive'
      });
    }
  };

  // Filter items based on search query and selected category
  const filteredItems = items
    .filter(item => 
      (item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       item.category.toLowerCase().includes(searchQuery.toLowerCase()))
      &&
      item.category.toLowerCase() === itemCategory.toLowerCase()
    );

  if (loadingOrder) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Create Bill</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Customer Information</CardTitle>
              {!customerInfo && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleOpenNewCustomerDialog}
                  className="text-blue-600"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  New Customer
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="customerName" className="text-right">
                  Name
                </Label>
                <Input
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="col-span-3"
                  placeholder="Customer Name"
                  disabled={!!customerInfo}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="customerPhone" className="text-right">
                  Phone
                </Label>
                <Input
                  id="customerPhone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="col-span-3"
                  placeholder="Customer Phone"
                  disabled={!!customerInfo}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="customerAddress" className="text-right">
                  Address
                </Label>
                <Input
                  id="customerAddress"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="col-span-3"
                  placeholder="Customer Address"
                  disabled={!!customerInfo}
                />
              </div>
              {currentOrderId && (
                <div className="p-3 bg-blue-50 rounded text-sm text-blue-700 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-blue-600" />
                  Creating bill for Order #{currentOrderId.substring(0, 8)}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Select Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              
              <Tabs value={itemCategory} onValueChange={setItemCategory}>
                <TabsList className="w-full">
                  <TabsTrigger value="regular" className="flex-1">Regular Items</TabsTrigger>
                  <TabsTrigger value="premium" className="flex-1">Premium Items</TabsTrigger>
                  <TabsTrigger value="express" className="flex-1">Express Items</TabsTrigger>
                </TabsList>
                
                <TabsContent value={itemCategory} className="mt-4">
                  {isLoading ? (
                    <div className="flex justify-center my-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : (
                    <div className="max-h-80 overflow-y-auto space-y-2">
                      {filteredItems.length > 0 ? (
                        filteredItems.map(item => (
                          <div 
                            key={item.id} 
                            className="flex justify-between items-center p-3 rounded-md border hover:bg-gray-50 cursor-pointer"
                            onClick={() => addItemToOrder(item)}
                          >
                            <div>
                              <div className="font-medium">{item.name}</div>
                              <div className="text-sm text-gray-500">{item.category}</div>
                            </div>
                            <div className="font-semibold">₹{item.price.toFixed(2)} per unit</div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">
                          {searchQuery ? 'No items match your search' : `No ${itemCategory} items available`}
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Bill Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedItems.length > 0 ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    {selectedItems.map(item => (
                      <div key={item.id} className="flex items-center justify-between py-2 border-b">
                        <div className="flex-1">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-gray-500">₹{item.price.toFixed(2)} per unit</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity} units</span>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-500"
                            onClick={() => removeItemFromOrder(item.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="w-24 text-right font-medium">
                          ₹{item.total.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-4 space-y-2">
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>Total</span>
                      <span>₹{calculateSubtotal().toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full mt-4" 
                    onClick={handleGenerateBill}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Generate Bill
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No items added to bill yet</p>
                  <p className="text-sm mt-2">Click on items from the left panel to add them</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* New Customer Dialog */}
      <Dialog open={newCustomerDialogOpen} onOpenChange={setNewCustomerDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {customerExistsError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Customer Already Exists</AlertTitle>
                <AlertDescription>
                  A customer with this phone number already exists. Use existing customer or try another phone number.
                </AlertDescription>
                <Button 
                  variant="outline"
                  onClick={handleUseExistingCustomer}
                  className="mt-2 w-full"
                >
                  Use Existing Customer
                </Button>
              </Alert>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="newCustomerName" className="text-right">
                Name*
              </Label>
              <Input
                id="newCustomerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="col-span-3"
                placeholder="Customer Name"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="newCustomerPhone" className="text-right">
                Phone*
              </Label>
              <Input
                id="newCustomerPhone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="col-span-3"
                placeholder="Customer Phone"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="newCustomerEmail" className="text-right">
                Email
              </Label>
              <Input
                id="newCustomerEmail"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="col-span-3"
                placeholder="Customer Email"
                type="email"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="newCustomerAddress" className="text-right">
                Address
              </Label>
              <Input
                id="newCustomerAddress"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                className="col-span-3"
                placeholder="Customer Address"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewCustomerDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCheckCustomer}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateBill;
