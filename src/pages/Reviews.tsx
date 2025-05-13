
import { useState, useEffect } from 'react';
import { Star, StarHalf, Calendar, MessageSquare, User } from 'lucide-react';
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { getAllReviews, calculateAverageRating } from '@/services/reviewService';
import { Review } from '@/services/reviewService';
import { format } from 'date-fns';

const Reviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  
  useEffect(() => {
    loadReviews();
  }, []);
  
  const loadReviews = async () => {
    setIsLoading(true);
    try {
      // Load all reviews
      const fetchedReviews = await getAllReviews();
      setReviews(fetchedReviews);
      
      // Calculate average rating
      const avgRating = await calculateAverageRating();
      setAverageRating(avgRating);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="h-5 w-5 fill-yellow-400 text-yellow-400" />);
    }
    
    // Half star if needed
    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="h-5 w-5 fill-yellow-400 text-yellow-400" />);
    }
    
    // Empty stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-5 w-5 text-gray-300" />);
    }
    
    return stars;
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Customer Reviews</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              See what our customers are saying about our laundry services. We take pride in delivering high-quality service that makes our customers happy.
            </p>
          </div>
          
          {/* Average Rating Section */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-12 text-center">
            <h2 className="text-2xl font-bold mb-4">Overall Customer Rating</h2>
            
            <div className="flex items-center justify-center mb-4">
              <div className="flex">
                {renderStars(averageRating)}
              </div>
              <span className="ml-2 text-xl font-semibold">{averageRating.toFixed(1)} out of 5</span>
            </div>
            
            <p className="text-gray-600">
              Based on {reviews.length} customer reviews
            </p>
          </div>
          
          {/* Reviews List */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : reviews.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Reviews Yet</h3>
              <p className="text-gray-600">
                Be the first to review our services!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.02]">
                  <div className="p-6">
                    <div className="flex items-center space-x-1 mb-3">
                      {renderStars(review.rating)}
                    </div>
                    
                    <div className="text-gray-700 mb-4">
                      "{review.comment}"
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm font-medium">{review.userName}</span>
                      </div>
                      <div className="flex items-center text-gray-500 text-sm">
                        <Calendar className="h-4 w-4 mr-1" />
                        {format(review.createdAt, 'MMM d, yyyy')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Reviews;
