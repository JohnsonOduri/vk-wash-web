
import { useState } from 'react';
import { MapPin, Phone } from 'lucide-react';
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const ServiceLocations = () => {
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
  
  const locations = [
    {
      name: "Central Delhi",
      address: "123 Connaught Place, New Delhi - 110001",
      phone: "+91 98765 43210",
      areas: ["Connaught Place", "Karol Bagh", "Paharganj", "Rajiv Chowk"]
    },
    {
      name: "South Delhi",
      address: "456 Defence Colony, New Delhi - 110024",
      phone: "+91 98765 43211",
      areas: ["Defence Colony", "Lajpat Nagar", "Greater Kailash", "Saket", "Malviya Nagar"]
    },
    {
      name: "East Delhi",
      address: "789 Laxmi Nagar, Delhi - 110092",
      phone: "+91 98765 43212",
      areas: ["Laxmi Nagar", "Preet Vihar", "Shahdara", "Mayur Vihar"]
    },
    {
      name: "North Delhi",
      address: "101 Model Town, Delhi - 110009",
      phone: "+91 98765 43213",
      areas: ["Model Town", "Civil Lines", "Kashmere Gate", "Shakti Nagar"]
    },
    {
      name: "West Delhi",
      address: "202 Rajouri Garden, New Delhi - 110027",
      phone: "+91 98765 43214",
      areas: ["Rajouri Garden", "Janakpuri", "Punjabi Bagh", "Paschim Vihar"]
    }
  ];
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container-custom">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-center">Our Service Locations</h1>
          <p className="text-gray-600 text-center mb-10">VK Wash offers premium laundry services across Delhi NCR</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Locations List */}
            <div className="md:col-span-1">
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <h2 className="text-lg font-semibold p-4 bg-blue-50 border-b">Service Areas</h2>
                <ul className="divide-y">
                  {locations.map((location, index) => (
                    <li key={index}>
                      <button
                        className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${selectedLocation === index ? 'bg-blue-50' : ''}`}
                        onClick={() => setSelectedLocation(index)}
                      >
                        <div className="font-medium">{location.name}</div>
                        <div className="text-sm text-gray-500 mt-1">
                          {location.areas.slice(0, 2).join(", ")}{location.areas.length > 2 ? "..." : ""}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Location Details */}
            <div className="md:col-span-2">
              {selectedLocation !== null ? (
                <div className="bg-white shadow-md rounded-lg p-6">
                  <h2 className="text-2xl font-bold mb-4">{locations[selectedLocation].name}</h2>
                  
                  <div className="mb-6">
                    <div className="flex items-start mb-3">
                      <MapPin className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                      <div>
                        <h3 className="font-medium">Address</h3>
                        <p className="text-gray-600">{locations[selectedLocation].address}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Phone className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                      <div>
                        <h3 className="font-medium">Contact</h3>
                        <p className="text-gray-600">{locations[selectedLocation].phone}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Areas Covered</h3>
                    <div className="flex flex-wrap gap-2">
                      {locations[selectedLocation].areas.map((area, i) => (
                        <span key={i} className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white shadow-md rounded-lg p-8 flex flex-col items-center justify-center text-center h-full">
                  <MapPin className="h-12 w-12 text-blue-600 mb-4" />
                  <h2 className="text-xl font-semibold mb-2">Select a location</h2>
                  <p className="text-gray-600">
                    Choose a service area from the list to view detailed information.
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-12 bg-blue-50 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-center">Can't find your area?</h2>
            <p className="text-center mb-6">We're constantly expanding our service locations. Contact us to know if we can service your area.</p>
            <div className="flex justify-center">
              <a href="tel:+919876543210" className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors">
                Call Us at +91 98765 43210
              </a>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ServiceLocations;
