import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, Loader2 } from 'lucide-react';

interface ReviewFormProps {
  onSubmit: (data: { rating: number; comment?: string }) => Promise<void>;
  providerName: string;
  serviceName: string;
  disabled?: boolean; // Add this prop to make the form disableable
}

export function ReviewForm({ onSubmit, providerName, serviceName, disabled = false }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await onSubmit({
        rating,
        comment: comment.trim() || undefined
      });
    } catch (err) {
      setError('Failed to submit review. Please try again.');
      console.error('Review submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine if the form should be in a disabled state
  const isFormDisabled = disabled || isSubmitting;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}
      
      <div>
        <label className="block text-sm font-medium mb-2">
          How would you rate your experience with {providerName}?
        </label>
        
        <div className="flex items-center gap-1 mb-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              onMouseEnter={() => setHoverRating(value)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1 focus:outline-none"
              disabled={isFormDisabled}
            >
              <Star 
                className={`h-8 w-8 ${
                  (hoverRating || rating) >= value 
                    ? 'text-yellow-500 fill-current' 
                    : 'text-gray-300'
                } ${isFormDisabled ? 'opacity-70' : ''}`}
              />
            </button>
          ))}
        </div>
        
        <div className="text-sm text-gray-500">
          {rating === 1 && 'Poor - Not satisfied with the service'}
          {rating === 2 && 'Fair - Below expectations'}
          {rating === 3 && 'Good - Met expectations'}
          {rating === 4 && 'Very Good - Above expectations'}
          {rating === 5 && 'Excellent - Exceptional service'}
        </div>
      </div>
      
      <div>
        <label htmlFor="comment" className="block text-sm font-medium mb-2">
          Share your experience (optional)
        </label>
        <Textarea
          id="comment"
          placeholder={`Tell us about your experience with ${serviceName}...`}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="min-h-32"
          disabled={isFormDisabled}
        />
      </div>
      
      <div className="flex justify-end gap-2 pt-4">
        <Button 
          type="submit" 
          disabled={isFormDisabled || rating === 0}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Review'
          )}
        </Button>
      </div>
    </form>
  );
}
