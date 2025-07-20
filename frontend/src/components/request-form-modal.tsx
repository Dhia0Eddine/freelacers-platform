import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Calendar, MapPin, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

interface RequestFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    description: string;
    location: string;
    preferred_date: string;
  }) => void;
  listingTitle: string;
  isLoading: boolean;
}

export function RequestFormModal({
  isOpen,
  onClose,
  onSubmit,
  listingTitle,
  isLoading
}: RequestFormModalProps) {
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert date to ISO string format if it exists
    const formattedDate = preferredDate 
      ? new Date(preferredDate).toISOString() 
      : new Date().toISOString();
    
    onSubmit({
      description,
      location,
      preferred_date: formattedDate
    });
  };
  
  // Helper to get current date in YYYY-MM-DD format
  const getCurrentDate = () => {
    const now = new Date();
    return format(now, 'yyyy-MM-dd');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Request Service</DialogTitle>
          <DialogDescription>
            Send a request for "{listingTitle}" with your details and requirements.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-indigo-500" />
              Description (optional)
            </label>
            <Textarea
              placeholder="Describe what you need in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
              rows={4}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4 text-indigo-500" />
              Location (optional)
            </label>
            <Input 
              type="text"
              placeholder="Where do you need this service?"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-indigo-500" />
              Preferred Date
            </label>
            <Input 
              type="date"
              min={getCurrentDate()}
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
              required
            />
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                'Send Request'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
