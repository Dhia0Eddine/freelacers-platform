// src/pages/RegisterPage.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/context/AuthContext';
import { ArrowLeft } from 'lucide-react';
import { authService } from '@/services/api';
import { useTranslation } from "react-i18next";
import axios from "axios";

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('customer'); // Changed default to match backend
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuthContext();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  // Replace with your API URL or import from config
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      // Adjust endpoint as needed for your backend
      const res = await axios.post(`${API_URL}/profiles/upload-picture`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProfilePicture(file);
      setProfilePictureUrl(res.data.url);
    } catch (err) {
      setError("Failed to upload profile picture.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!email || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    try {
      // Register the user with the backend
      await authService.register(email, password, role);

      // Login automatically after successful registration
      const loginResponse = await authService.login(email, password);
      login(loginResponse.access_token);

      // Store registration data for profile setup
      sessionStorage.setItem('registration', JSON.stringify({
        email,
        role,
        profile_picture: profilePictureUrl || undefined
      }));

      // Optionally, send profile picture to backend here if not handled above

      // Redirect to profile setup page
      navigate('/profile-setup');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-black px-4 py-12 ${isRTL ? 'font-arabic' : ''}`} dir={isRTL ? "rtl" : "ltr"}>
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden p-8 space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t("create_account")}</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              {t("step_1_basic_info")}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 p-4 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture Upload */}
            <div className="flex flex-col items-center gap-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("profile_picture") || (isRTL ? "صورة الملف الشخصي" : "Profile Picture")}
              </label>
              <div className="relative flex flex-col items-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  disabled={uploading}
                  className="block"
                />
                {uploading && <span className="text-xs text-gray-500 mt-1">{t("loading")}</span>}
                {profilePictureUrl && (
                  <img
                    src={profilePictureUrl.startsWith("http") ? profilePictureUrl : `${API_URL}${profilePictureUrl}`}
                    alt="Profile Preview"
                    className="mt-2 h-20 w-20 rounded-full object-cover border"
                  />
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("email")}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder={t("email")}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("password")}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("confirm_password")}
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("i_am_joining_as") || (isRTL ? "أسجل كـ:" : "I am joining as:")}
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div 
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    role === 'customer' 
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' 
                      : 'border-gray-300 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-700'
                  }`}
                  onClick={() => setRole('customer')}
                >
                  <div className="flex items-center mb-2">
                    <input
                      type="radio"
                      checked={role === 'customer'}
                      onChange={() => setRole('customer')}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className={`ml-2 font-medium text-gray-900 dark:text-white ${isRTL ? "ml-0 mr-2" : ""}`}>{t("customer")}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{t("register_customer_desc") || (isRTL ? "أحتاج إلى توظيف مستقلين لمشاريعي" : "I need to hire talent for projects")}</p>
                </div>
                
                <div 
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    role === 'provider' 
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' 
                      : 'border-gray-300 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-700'
                  }`}
                  onClick={() => setRole('provider')}
                >
                  <div className="flex items-center mb-2">
                    <input
                      type="radio"
                      checked={role === 'provider'}
                      onChange={() => setRole('provider')}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className={`ml-2 font-medium text-gray-900 dark:text-white ${isRTL ? "ml-0 mr-2" : ""}`}>{t("provider")}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{t("register_provider_desc") || (isRTL ? "أرغب في تقديم خدماتي" : "I want to offer my services")}</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg"
                disabled={loading}
              >
                {loading ? t("creating_account") || 'Creating Account...' : t("continue")}
              </Button>
            </div>
          </form>

          <div className="text-center text-sm">
            <p className="text-gray-600 dark:text-gray-400">
              {t("already_have_account")}{' '}
              <Link to="/login" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                {t("log_in")}
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6">
          <Link to="/" className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t("back_to_home")}
          </Link>
        </div>
      </div>
    </div>
  );
}
