import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/context/AuthContext';
import { ArrowLeft, Camera, MapPin, Briefcase, Phone } from 'lucide-react';
import { profileService } from '@/services/api';

interface RegistrationData {
  email: string;
  role: string; // Changed to match backend roles
}

export default function ProfileSetupPage() {
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState(''); // Correctly defined but might not be updating
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null);
  
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthContext();

  useEffect(() => {
    // Check if user is authenticated and has registration data
    const storedData = sessionStorage.getItem('registration');
    
    if (!isAuthenticated) {
      navigate('/signup');
      return;
    }
    
    if (storedData) {
      try {
        setRegistrationData(JSON.parse(storedData));
      } catch (err) {
        console.error('Failed to parse registration data:', err);
        navigate('/signup');
      }
    } else {
      navigate('/signup');
    }
  }, [isAuthenticated, navigate]);

  // Add this for debugging
  useEffect(() => {
    console.log("Current phone value:", phone);
  }, [phone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!fullName || !location || !phone) {
      setError('Name, location, and phone number are required');
      return;
    }

    // Phone number validation (simple check)
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    if (!phoneRegex.test(phone)) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      // Only include bio if user is a provider
      const profileData: {
        fullName: string;
        bio?: string;
        location: string;
        phone: string; // Changed to match backend field name
      } = {
        fullName,
        location,
        phone
      };

      // Only add bio for providers
      if (registrationData?.role === 'provider' && bio) {
        profileData.bio = bio;
      }
      
      // Create profile
      await profileService.createProfile(profileData);
      
      // Clear registration data from session storage
      sessionStorage.removeItem('registration');
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Profile setup error:', err);
      setError(err instanceof Error ? err.message : 'Failed to set up profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!registrationData) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const isProvider = registrationData?.role === 'provider';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-black px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden p-8 space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Set Up Your Profile</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Step 2: Tell us about yourself
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 p-4 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <Camera className="h-8 w-8 text-gray-400" />
                </div>
                <button type="button" className="absolute bottom-0 right-0 bg-indigo-600 rounded-full p-2 text-white">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                {/* Fixed phone input field */}
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    console.log("Phone changing to:", e.target.value);
                    setPhone(e.target.value);
                  }}
                  className="w-full pl-10 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="+1 (555) 123-4567"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Location
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-10 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="City, Country"
                  required
                />
              </div>
            </div>

            {/* Only show bio field for providers */}
            {isProvider && (
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Professional Bio
                </label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Tell us about your skills and experience..."
                />
              </div>
            )}

            {isProvider && (
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <Briefcase className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2" />
                  <span className="font-medium text-gray-900 dark:text-white">Provider Profile</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  You'll be able to add your skills, portfolio, and set your rates in the next step.
                </p>
              </div>
            )}

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg"
                disabled={loading}
              >
                {loading ? 'Saving Profile...' : 'Complete Setup'}
              </Button>
            </div>
          </form>
        </div>

        <div className="mt-6">
          <Link to="/signup" className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to registration
          </Link>
        </div>
      </div>
    </div>
  );
}
