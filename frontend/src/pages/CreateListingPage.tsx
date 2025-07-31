import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listingService, serviceService } from '@/services/api';
import { useAuthContext } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ArrowLeft, DollarSign, MapPin, Tag, FileText, Check, Loader2, AlertCircle, XCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useTranslation } from 'react-i18next';

interface Service {
  id: number;
  name: string;
  description?: string;
}

export default function CreateListingPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [location, setLocation] = useState('');
  const [available, setAvailable] = useState(true);
  const [serviceId, setServiceId] = useState<number | ''>('');
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { isAuthenticated, isCustomer, isProvider, userRole } = useAuthContext();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Check if user is authenticated and is a provider
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Debug the actual role and auth state
    console.log("Auth state:", { isAuthenticated, isCustomer, isProvider, userRole });
    
    // Use isProvider directly from context instead of computing it
    if (!isProvider) {
      setErrorMessage(t('Only service providers can create listings'));
      // Navigate after showing the error message
      setTimeout(() => {
        navigate('/profile/me');
      }, 3000);
    }
  }, [isAuthenticated, isCustomer, isProvider, userRole, navigate, t]);

  // Fetch services for dropdown
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const servicesData = await serviceService.getAllServices();
        setServices(servicesData);
        
        if (servicesData.length === 0) {
          setErrorMessage(t('No service categories available. Please contact the administrator.'));
        }
      } catch (error) {
        console.error('Error fetching services:', error);
        setErrorMessage(t('Failed to load service categories'));
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [t]);

  // Clear error message after 5 seconds
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || minPrice === '' || maxPrice === '' || !location || serviceId === '') {
      setErrorMessage(t('Please fill in all required fields'));
      return;
    }

    if (minPrice > maxPrice) {
      setErrorMessage(t('Minimum price cannot be greater than maximum price'));
      return;
    }

    setSubmitting(true);

    try {
      const listingData = {
        title,
        description,
        min_price: Number(minPrice),
        max_price: Number(maxPrice),
        location,
        available,
        service_id: Number(serviceId)
      };

      await listingService.createListing(listingData);
      setSuccessMessage(t('listing_updated_successfully'));
      
      // Navigate after showing success message
      setTimeout(() => {
        navigate('/profile/me');
      }, 2000);
    } catch (error) {
      console.error('Error creating listing:', error);
      setErrorMessage(t('Failed to create listing. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Error Alert */}
        {errorMessage && (
          <Alert variant="destructive" className="mb-6 animate-fade-in">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t('error')}</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-2 top-2" 
              onClick={() => setErrorMessage(null)}
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </Alert>
        )}

        {/* Success Alert */}
        {successMessage && (
          <Alert className="mb-6 bg-green-50 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800 animate-fade-in">
            <Check className="h-4 w-4" />
            <AlertTitle>{t('success')}</AlertTitle>
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        <div className="mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/profile/me')}
            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('back_to_profile')}
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-4">{t('add_new_listing')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {t('add_new_listing')}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Title */}
              <div>
                <Label htmlFor="title" className="text-base font-medium flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  {t('title')}
                </Label>
                <Input
                  id="title"
                  placeholder={t('title')}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-2"
                  required
                />
              </div>
              
              {/* Description */}
              <div>
                <Label htmlFor="description" className="text-base font-medium flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  {t('description')}
                </Label>
                <Textarea
                  id="description"
                  placeholder={t('description')}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-2 min-h-32"
                  required
                />
              </div>
              
              {/* Service Category */}
              <div>
                <Label htmlFor="service" className="text-base font-medium flex items-center gap-2">
                  <Tag className="h-5 w-5 text-blue-500" />
                  {t('category')}
                </Label>
                {loading ? (
                  <div className="mt-2 flex items-center text-gray-500">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t('loading')}
                  </div>
                ) : services.length > 0 ? (
                  <Select 
                    onValueChange={(value) => setServiceId(Number(value))}
                    value={serviceId ? String(serviceId) : undefined}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder={t('choose_service')} />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={String(service.id)}>
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-md">
                    {t('no_services_listed_yet')}
                  </div>
                )}
              </div>
              
              {/* Price Range */}
              <div>
                <Label className="text-base font-medium flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-blue-500" />
                  {t('min_price')} - {t('max_price')}
                </Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <Label htmlFor="min-price" className="text-sm">{t('min_price')}</Label>
                    <Input
                      id="min-price"
                      type="number"
                      placeholder={t('min_price')}
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : '')}
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="max-price" className="text-sm">{t('max_price')}</Label>
                    <Input
                      id="max-price"
                      type="number"
                      placeholder={t('max_price')}
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : '')}
                      min="0"
                      required
                    />
                  </div>
                </div>
              </div>
              
              {/* Location */}
              <div>
                <Label htmlFor="location" className="text-base font-medium flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-500" />
                  {t('location')}
                </Label>
                <Input
                  id="location"
                  placeholder={t('location')}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="mt-2"
                  required
                />
              </div>
              
              {/* Availability */}
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="available" className="text-base font-medium flex items-center gap-2">
                    <Check className="h-5 w-5 text-blue-500" />
                    {t('available')}
                  </Label>
                  <Switch
                    id="available"
                    checked={available}
                    onCheckedChange={setAvailable}
                  />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {t('Toggle this if your service is currently available to be hired')}
                </p>
              </div>
              
              <div className="flex justify-end pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/profile/me')}
                  className="mr-4"
                  disabled={submitting || loading}
                >
                  {t('cancel')}
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-blue-500 to-blue-700 text-white"
                  disabled={submitting || loading || services.length === 0}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t('creating_account')}
                    </>
                  ) : t('add_new_listing')}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
