import React, { useState, useEffect } from 'react';
import { profileService } from '@/services/api';
import { useAuthContext } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, CheckCircle, Upload, User, MapPin, Phone, FileText, Camera } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface ProfileFormData {
  fullName: string;
  location: string;
  bio: string;
  phone: string;
  profile_picture?: string;
}

export default function EditProfilePage() {
  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: '',
    location: '',
    bio: '',
    phone: '',
    profile_picture: undefined,
  });
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const { isAuthenticated } = useAuthContext();
  const navigate = useNavigate(); // Use React Router's navigate
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  // Fetch current profile data only once on mount
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    let mounted = true;
    const fetchProfileData = async () => {
      setLoading(true);
      setError(null);

      try {
        const profileData = await profileService.getMyProfile();
        if (mounted) {
          setFormData({
            fullName: profileData.full_name || '',
            location: profileData.location || '',
            bio: profileData.bio || '',
            phone: profileData.phone || '',
            profile_picture: profileData.profile_picture || undefined,
          });
        }
      } catch (err) {
        if (mounted) {
          setError('Failed to load your profile. Please try again.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProfileData();

    return () => {
      mounted = false;
    };
  }, [isAuthenticated, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const data = new FormData();
      data.append("file", file);
      // Use the backend API URL for uploads
      const res = await axios.post(`${API_URL}/profiles/upload-picture`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFormData(prev => ({ ...prev, profile_picture: res.data.url }));
      toast.success("Profile picture uploaded!");
    } catch (err) {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    
    try {
      await profileService.updateProfile({
        full_name: formData.fullName,
        location: formData.location,
        bio: formData.bio,
        phone: formData.phone,
        profile_picture: formData.profile_picture,
      });
      setSuccess(true);

      // Show toast and redirect
      toast.success('Profile updated successfully!');
      navigate('/profile/me');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900 pt-16">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-200 dark:border-indigo-800 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-indigo-600 dark:border-indigo-400 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <div className="text-center">
            <p className="text-lg font-medium text-gray-900 dark:text-white">{t("loading") || "Loading"}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Fetching your profile data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900 py-8 px-4 ${isRTL ? 'font-arabic' : ''}`} dir={isRTL ? "rtl" : "ltr"}>
      <div className="container mx-auto max-w-4xl">
        {/* Header with breadcrumb */}
        <div className="mb-8">
          <button 
            onClick={() => navigate('/profile/me')}
            className={`group inline-flex items-center ${isRTL ? 'flex-row-reverse' : ''} text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200 mb-4`}
          >
            <div className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm group-hover:shadow-md transition-shadow duration-200">
              <ArrowLeft className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />
            </div>
            <span className="ml-3 font-medium">{t("back_to_profile") || "Back to Profile"}</span>
          </button>
          
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t("edit_profile") || "Edit Profile"}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {t("update_personal_info") || "Update your personal information and settings"}
            </p>
          </div>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Picture Section */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <Camera className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                Profile Picture
              </h3>
              
              <div className="flex flex-col items-center space-y-4">
                <div className="relative group">
                  <Avatar className="w-32 h-32 ring-4 ring-indigo-100 dark:ring-indigo-900/50">
                    <AvatarImage 
                      src={formData.profile_picture ? `${API_URL}${formData.profile_picture}` : undefined} 
                      alt="Profile" 
                      className="object-cover"
                    />
                    <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-indigo-500 to-blue-600 text-white">
                      {formData.fullName
                        ? formData.fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
                        : "U"}
                    </AvatarFallback>
                  </Avatar>
                  
                  {uploading && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-white" />
                    </div>
                  )}
                </div>
                
                <div className="w-full">
                  <label className="cursor-pointer">
                    <div className="w-full bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 border-2 border-dashed border-indigo-300 dark:border-indigo-700 rounded-lg p-4 text-center transition-colors duration-200">
                      <Upload className="h-6 w-6 mx-auto mb-2 text-indigo-600 dark:text-indigo-400" />
                      <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                        {uploading ? (t("loading") || "Uploading...") : "Choose new photo"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        PNG, JPG up to 5MB
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          {/* Form Section */}
          <div className="lg:col-span-2  relative lg:-mt-40">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                  <User className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                  Personal Information
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Keep your profile information up to date
                </p>
              </div>
              
              <form onSubmit={handleSubmit} className="p-8">
                {/* Status Messages */}
                {error && (
                  <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-4 rounded-xl text-sm flex items-start">
                    <div className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-800 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      <div className="w-2 h-2 bg-red-600 dark:bg-red-400 rounded-full"></div>
                    </div>
                    <div>{error}</div>
                  </div>
                )}
                
                {success && (
                  <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 p-4 rounded-xl text-sm flex items-center">
                    <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                    {t("profile_updated_successfully") || "Profile updated successfully!"}
                  </div>
                )}
                
                <div className="space-y-6">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <label htmlFor="fullName" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                      <User className="h-4 w-4 mr-2 text-gray-400" />
                      {t("full_name") || "Full Name"}
                    </label>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  
                  {/* Location */}
                  <div className="space-y-2">
                    <label htmlFor="location" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      {t("location") || "Location"}
                    </label>
                    <input
                      id="location"
                      name="location"
                      type="text"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your location"
                      required
                    />
                  </div>
                  
                  {/* Phone */}
                  <div className="space-y-2">
                    <label htmlFor="phone" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      {t("phone") || "Phone Number"}
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>
                  
                  {/* Bio */}
                  <div className="space-y-2">
                    <label htmlFor="bio" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                      <FileText className="h-4 w-4 mr-2 text-gray-400" />
                      {t("bio") || "Bio"}
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      rows={4}
                      value={formData.bio}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 resize-none"
                      placeholder={t("bio") || "Tell us about yourself..."}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Brief description for your profile. Maximum 500 characters.
                    </p>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-8 border-t border-gray-200 dark:border-gray-700 mt-8">
                  <Button
                    type="button"
                    variant="outline"
                    className="px-6 py-2.5 rounded-xl border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                    onClick={() => navigate('/profile/me')}
                  >
                    {t("cancel") || "Cancel"}
                  </Button>
                  
                  <Button
                    type="submit"
                    className="px-8 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("saving") || "Saving..."}
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        {t("save_changes") || 'Save Changes'}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}