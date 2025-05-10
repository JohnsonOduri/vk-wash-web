
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { LaundryItem } from '@/models/LaundryItem';
import { getAllLaundryItems } from '@/services/laundryItemService';
import { toast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const ItemPricing = () => {
  const { category } = useParams<{ category: string }>();
  const [items, setItems] = useState<LaundryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryTitle, setCategoryTitle] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');

  useEffect(() => {
    loadItems();
    
    // Set category details
    if (category === 'regular') {
      setCategoryTitle('Basic Wash Items');
      setCategoryDescription('Our standard washing and drying service for everyday items');
    } else if (category === 'premium') {
      setCategoryTitle('Premium Wash & Iron Items');
      setCategoryDescription('Enhanced cleaning and professional ironing for your finest garments');
    } else if (category === 'express') {
      setCategoryTitle('Express Service Items');
      setCategoryDescription('Fast turnaround with premium quality for when you need it quickly');
    }
  }, [category]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const allItems = await getAllLaundryItems();
      const filteredItems = allItems.filter(item => 
        item.category.toLowerCase() === (category || '').toLowerCase()
      );
      setItems(filteredItems);
    } catch (error) {
      console.error('Error loading items:', error);
      toast({
        title: 'Error',
        description: 'Failed to load laundry items',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <div className="flex-grow container-custom py-24">
        <div className="mb-8">
          <Link to="/#pricing">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Pricing
            </Button>
          </Link>
        </div>
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">{categoryTitle}</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{categoryDescription}</p>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading items...</p>
            </div>
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(item => (
              <Card key={item.id} className="hover:shadow-lg transition-all">
                <CardHeader>
                  <CardTitle className="flex justify-between">
                    <span>{item.name}</span>
                    <span className="text-blue-600">₹{item.price.toFixed(2)}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">Category: {item.category}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500">No items found in this category</p>
            <p className="mt-2 text-gray-400">Please check back later or contact us for custom pricing</p>
            <Link to="/#contact" className="inline-block mt-6">
              <Button>Contact Us</Button>
            </Link>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default ItemPricing;
