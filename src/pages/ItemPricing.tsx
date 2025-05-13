
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getLaundryItemByCategory } from '@/services/laundryItemService';
import { LaundryItem } from '@/models/LaundryItem';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shirt, DollarSign } from 'lucide-react';

const ItemPricing = () => {
  const { category } = useParams();
  const [items, setItems] = useState<LaundryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (category) {
      loadItems(category);
    }
  }, [category]);
  
  const loadItems = async (cat: string) => {
    setIsLoading(true);
    try {
      const fetchedItems = await getLaundryItemByCategory(cat);
      setItems(fetchedItems);
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const getCategoryTitle = () => {
    switch (category) {
      case 'regular':
        return 'Regular Wash Items';
      case 'premium':
        return 'Premium Wash Items';
      case 'express':
        return 'Express Wash Items';
      default:
        return 'Laundry Items';
    }
  };
  
  const getCategoryDescription = () => {
    switch (category) {
      case 'regular':
        return 'Standard cleaning for everyday garments at affordable rates';
      case 'premium':
        return 'Special care for delicate fabrics and premium clothing';
      case 'express':
        return 'Quick turnaround service for urgent requirements';
      default:
        return 'Our comprehensive laundry price list';
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container-custom">
          <Link to="/#pricing" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to All Services
          </Link>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{getCategoryTitle()}</h1>
          <p className="text-gray-600 mb-8">{getCategoryDescription()}</p>
          
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : items.length === 0 ? (
            <div className="bg-white shadow-md rounded-lg p-8 text-center">
              <h2 className="text-xl font-semibold mb-2">No Items Available</h2>
              <p className="text-gray-600 mb-6">
                We couldn't find any items in this category. Please check back later.
              </p>
              <Link to="/#pricing">
                <Button>
                  View Other Services
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {items.map(item => (
                  <Card key={item.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center">
                        <Shirt className="h-5 w-5 mr-2 text-blue-600" />
                        {item.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-sm text-gray-500 mb-1">Price per item</div>
                          <div className="text-2xl font-bold flex items-center">
                            <DollarSign className="h-5 w-5 text-green-600" />
                            {item.price.toFixed(2)}
                          </div>
                        </div>
                        <Link to="/login">
                          <Button size="sm">
                            Book Now
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="bg-blue-50 rounded-lg p-6 mt-8">
                <h2 className="text-xl font-bold mb-2 text-center">Ready to get started?</h2>
                <p className="text-center mb-6">Experience the best laundry service in town!</p>
                <div className="flex justify-center">
                  <Link to="/login">
                    <Button size="lg">
                      Sign Up Now
                    </Button>
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ItemPricing;
