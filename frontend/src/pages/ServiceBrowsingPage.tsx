import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { serviceService } from '@/services/api';
import { Button } from '@/components/ui/button';
import { 
  SearchIcon, ArrowRightIcon
} from 'lucide-react';

interface Service {
  id: number;
  name: string;
  description: string | null;
  category_id: number;
}

// Service card background colors based on index
const cardColors = [
  'bg-blue-50 dark:bg-blue-900/20',
  'bg-green-50 dark:bg-green-900/20',
  'bg-purple-50 dark:bg-purple-900/20',
  'bg-amber-50 dark:bg-amber-900/20',
  'bg-teal-50 dark:bg-teal-900/20',
  'bg-rose-50 dark:bg-rose-900/20',
];

// Service card icons (using emoji for simplicity)
const serviceIcons = ['🔧', '🛠️', '📊', '📝', '🎨', '💻', '📱', '🔍', '📢', '🏠', '🚗', '👩‍💼'];

export default function ServiceBrowsingPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const data = await serviceService.getAllServices();
        setServices(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError(err instanceof Error ? err.message : 'Failed to load services');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const handleServiceClick = (serviceId: number) => {
    // Add debug logging to verify the navigation
    console.log(`Navigating to listings with serviceId=${serviceId}`);
    
    // Navigate to the correct route that matches our route definition
    navigate(`/listings/service/${serviceId}`);
  };

  // Filter services based on search term
  const filteredServices = services.filter(service => 
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 transition-all duration-300">
      <div className="container mx-auto max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fadeIn">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Browse Services</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Find the perfect service for your needs from our wide range of professional offerings
          </p>
          
          {/* Search Bar */}
          <div className="mt-8 max-w-md mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search services..."
                className="w-full px-4 py-3 pl-12 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <SearchIcon className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 p-6 rounded-xl text-center">
            <p>{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Try Again
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.length > 0 ? (
              filteredServices.map((service, index) => (
                <div 
                  key={service.id}
                  onClick={() => handleServiceClick(service.id)}
                  className={`${cardColors[index % cardColors.length]} rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:translate-y-[-4px] cursor-pointer animate-fadeIn`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-3xl">
                        {serviceIcons[index % serviceIcons.length]}
                      </div>
                      <div className="text-xs font-medium bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full">
                        Category ID: {service.category_id}
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {service.name}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                      {service.description || "No description available."}
                    </p>
                    
                    <div className="flex justify-end">
                      <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium group">
                        <span>View Listings</span>
                        <ArrowRightIcon className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                <p className="text-gray-600 dark:text-gray-300">No services found matching your search.</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* CSS Animations */}
      <style >{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
