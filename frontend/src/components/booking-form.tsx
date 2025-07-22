import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Clock, Loader2, AlertCircle, Check } from 'lucide-react';
import { requestService } from '@/services/api';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface BookingFormProps {
  quoteId: number;
  preferredDate?: Date;
  onSuccess: () => void;
}

export function BookingForm({ quoteId, preferredDate, onSuccess }: BookingFormProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(preferredDate);
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const times = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
        quote_id: quoteId,
        scheduled_time: scheduledDateTime.toISOString()
      });
      
      setSuccess(true);
      
      // Call the success callback after a delay
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err) {
      console.error('Error creating booking:', err);
      setError('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success ? (
        <div className="text-center">
          <div className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 p-4 rounded-md mb-4">
            <div className="flex items-center justify-center mb-2">
              <Check className="h-5 w-5 mr-2" />
              <h3 className="font-medium">Booking Confirmed!</h3>
            </div>
            <p>Your service has been scheduled successfully.</p>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
            You'll be redirected to your bookings dashboard in a moment...
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Select Date</label>
              {preferredDate && (
                <span className="text-xs text-blue-600 dark:text-blue-400">
                  Preferred: {format(preferredDate, 'PPP')}
                </span>
              )}
            </div>
            
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
            <label className="text-sm font-medium">Select Time</label>
            <Select value={selectedTime} onValueChange={setSelectedTime}>
              <SelectTrigger className="w-full">
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
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
            <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Booking Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Provider:</span>
                <span className="font-medium text-gray-900 dark:text-white">John Doe</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Price:</span>
                <span className="font-medium text-gray-900 dark:text-white">${quoteId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Date:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {selectedDate ? format(selectedDate, 'PPP') : 'Select a date'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Time:</span>
                <span className="font-medium text-gray-900 dark:text-white">{selectedTime}</span>
              </div>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={!selectedDate || loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Confirm Booking'
            )}
          </Button>
        </>
      )}
    </form>
  );
}
