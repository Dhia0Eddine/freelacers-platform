import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { serviceService } from '@/services/api';
import { Button } from '@/components/ui/button';
import { 
  SearchIcon, ArrowRightIcon
} from 'lucide-react';

interface Category {
  id: number;
  name: string;
  description?: string;
}

interface Service {
  id: number;
  name: string;
  description: string | null;
  category_id: number;
  photo?: string; // Add this line to match backend schema
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    // Fetch categories
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/categories/`);
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        // ignore error for categories
      }
    };
    fetchCategories();
  }, []);

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

  // Filter services based on search term and selected category
  const filteredServices = services.filter(service => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory ? service.category_id === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  // Helper to get category name by id
  const getCategoryName = (categoryId: number) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat ? cat.name : '';
  };

  // Helper to get category description by id
  const getCategoryDescription = (categoryId: number) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat ? cat.description : '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 transition-all duration-300">
      <div className="container mx-auto max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fadeIn">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Browse Services</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Find the perfect service for your needs from our wide range of professional offerings
          </p>
          {/* Category Filter Dropdown */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3 items-center justify-center">
            <div className="flex items-center gap-2">
              <span className="text-gray-700 dark:text-gray-300 text-sm">Filter by Category:</span>
              <select
                value={selectedCategory ?? ''}
                onChange={e => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
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
          <div className="flex justify-center">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mx-auto place-items-center">
              {filteredServices.length > 0 ? (
                filteredServices.map((service, index) => (
                  <div
                    key={service.id}
                    onClick={() => handleServiceClick(service.id)}
                    className="group relative bg-white dark:bg-gray-800 rounded-[10px] shadow transition-all duration-200 border border-gray-100 dark:border-gray-700 hover:shadow-lg hover:scale-[1.015] cursor-pointer flex flex-col"
                    style={{
                      animation: 'fadeInUp 0.25s ease-in both',
                      animationDelay: `${index * 0.05}s`
                    }}
                  >
                    {/* Top Zone: Image & Status */}
                    <div className="relative w-full h-36 flex items-center justify-center overflow-hidden rounded-t-[10px] bg-gray-100 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-700">
                      {service.photo ? (
                        <img
                          src={service.photo.startsWith('http') ? service.photo : `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${service.photo}`}
                          alt={service.name}
                          className="object-cover w-full h-full transition-transform duration-200 group-hover:scale-105"
                          style={{ borderTopLeftRadius: 10, borderTopRightRadius: 10 }}
                        />
                      ) : (
                        <span className="text-4xl select-none">{serviceIcons[index % serviceIcons.length]}</span>
                      )}
                      {/* Example status badge */}
                      <span className="absolute top-3 left-3 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-medium px-3 py-1 rounded-full shadow-sm">
                        Available
                      </span>
                    </div>
                    {/* Main Zone */}
                    <div className="flex-1 flex flex-col px-6 pt-4 pb-2">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-[18px] text-gray-900 dark:text-white truncate">
                          {service.name}
                        </h3>
                      </div>
                      <p className="text-[15px] text-gray-600 dark:text-gray-300 mb-2 truncate">
                        {service.description || "No description available."}
                      </p>
                      {/* Category Name */}
                      <div className="text-xs text-blue-600 dark:text-blue-300 font-medium mb-1">
                        {getCategoryName(service.category_id)}
                      </div>
                      {/* Category Description (optional, show as tooltip or below) */}
                      {getCategoryDescription(service.category_id) && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          {getCategoryDescription(service.category_id)}
                        </div>
                      )}
                    </div>
                    {/* Bottom Zone */}
                    <div className="flex items-center justify-between px-6 pb-4 pt-2">
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        Category ID: {service.category_id}
                      </span>
                      <Button
                        variant="outline"
                        className="rounded-md px-4 py-2 text-sm font-medium border-blue-600 text-blue-700 dark:text-blue-300 border hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
                        tabIndex={-1}
                        onClick={e => {
                          e.stopPropagation();
                          handleServiceClick(service.id);
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                  <p className="text-gray-600 dark:text-gray-300">No services found matching your search.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {/* CSS Animations */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px);}
          to { opacity: 1; transform: translateY(0);}
        }
        .animate-fadeIn {
          animation: fadeInUp 0.4s cubic-bezier(.4,0,.2,1) both;
        }
      `}</style>
    </div>
  );
}