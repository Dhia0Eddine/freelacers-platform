import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock, Loader2, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { requestService } from '@/services/api';

interface Quote {
  id: number;
  price: number;
  provider_name: string;
}

interface BookingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: Quote;
  requestId: number;
  preferredDate?: Date;
}

export function BookingFormModal({ 
  isOpen, 
  onClose, 
  quote, 
  requestId,
  preferredDate 
}: BookingFormModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(preferredDate);
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();

  const times = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00'
  ];

  const handleSubmit = async () => {
    if (!selectedDate) {
      setError('Please select a date');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Combine date and time
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const scheduledDateTime = new Date(selectedDate);
      scheduledDateTime.setHours(hours, minutes);
      
      // Call API to create booking
      await requestService.createBooking({
        quote_id: quote.id,
        scheduled_time: scheduledDateTime.toISOString()
      });
      
      setSuccess(true);
      
      // Redirect after a brief delay
      setTimeout(() => {
        onClose();
        navigate('/dashboard/bookings');
      }, 2000);
    } catch (err) {
      console.error('Error creating booking:', err);
      setError('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Schedule Service Booking</DialogTitle>
          <DialogDescription>
            Book your service with {quote.provider_name} for ${quote.price}
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success ? (
          <div className="py-6 text-center">
            <div className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 p-4 rounded-md mb-4">
              <h3 className="font-medium mb-1">Booking Confirmed!</h3>
              <p>Your service has been scheduled successfully.</p>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
              You'll be redirected to your bookings dashboard in a moment...
            </p>
            <Button 
              onClick={() => {
                onClose();
                navigate('/dashboard/bookings');
              }}
            >
              View My Bookings
            </Button>
          </div>
        ) : (
          <div className="py-4 space-y-6">
            <div className="space-y-2">
              <Label>Select Date</Label>
              <div className="border rounded-md p-4">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date() || date < new Date(new Date().setDate(new Date().getDate() - 1))}
                  className="mx-auto"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Select Time</Label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {times.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md text-blue-800 dark:text-blue-300 text-sm">
              <p className="font-medium mb-1">Booking Details</p>
              <ul className="space-y-1">
                <li>• Service Provider: {quote.provider_name}</li>
                <li>• Price: ${quote.price}</li>
                {selectedDate && (
                  <li>• Date: {format(selectedDate, 'PPP')}</li>
                )}
                <li>• Time: {selectedTime}</li>
              </ul>
            </div>
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading || success}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Confirm Booking'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
