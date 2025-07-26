import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Home, Laptop, GraduationCap, Clock, FileText, Users, ArrowRight, Star } from 'lucide-react';

export default function HeroSection({ t }: { t: any }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleNavigation = (path: string) => {
    console.log(`Navigating to: ${path}`);
    // Replace with your navigation logic
  };

  return (
    <div className="flex-1  isolate overflow-hidden bg-white dark:bg-gray-900 pt-0">
      {/* Enhanced Background gradients */}
      <div 
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" 
        aria-hidden="true"
      >
        <div 
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-blue-400 via-indigo-500 to-indigo-600 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem] animate-pulse" 
          style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}
        />
      </div>

      {/* Subtle floating elements */}
      <div className="absolute inset-0 -z-5 opacity-20">
        <div className="absolute top-20 left-10 w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-indigo-500 rounded-full animate-pulse"></div>
        <div className="absolute bottom-40 left-1/4 w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce"></div>
      </div>
      
      <div className="mx-auto max-w-7xl px-6 py-8 sm:py-12 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          {/* Service categories with enhanced animations */}
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <div className="flex flex-wrap justify-center items-center gap-3 mb-8">
              <span className="flex items-center bg-blue-50 dark:bg-blue-900/30 px-5 py-3 rounded-full shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105 border border-blue-100 dark:border-blue-800">
                <Home className="h-7 w-7 text-blue-600 dark:text-blue-400 mr-3" />
                <span className="text-gray-900 dark:text-white font-medium">{t ? t("home_fixes") : "Home Fixes"}</span>
              </span>
              <span className="flex items-center bg-indigo-50 dark:bg-indigo-900/30 px-5 py-3 rounded-full shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105 border border-indigo-100 dark:border-indigo-800">
                <Laptop className="h-7 w-7 text-indigo-600 dark:text-indigo-400 mr-3" />
                <span className="text-gray-900 dark:text-white font-medium">{t ? t("tech_help") : "Tech Help"}</span>
              </span>
              <span className="flex items-center bg-green-50 dark:bg-green-900/30 px-5 py-3 rounded-full shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105 border border-green-100 dark:border-green-800">
                <GraduationCap className="h-7 w-7 text-green-600 dark:text-green-400 mr-3" />
                <span className="text-gray-900 dark:text-white font-medium">{t ? t("tutoring") : "Tutoring"}</span>
              </span>
            </div>
          </div>

          {/* Main headline with enhanced typography */}
          <div className={`transition-all duration-1200 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl lg:text-7xl mb-6">
              <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent bg-size-200 animate-gradient leading-tight">
                {t ? t("all_in_one_place") : "All in One Place"}
              </div>
            </h1>
          </div>
          
          {/* Enhanced description with better visual hierarchy */}
          <div className={`transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <div className="mt-8 mb-8">
              <p className="text-xl leading-8 text-gray-600 dark:text-gray-300 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm py-6 px-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 max-w-3xl mx-auto">
                <span className="flex flex-wrap justify-center items-center gap-4 text-lg">
                  <span className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/50 px-4 py-2 rounded-full">
                    <FileText className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                    <span className="font-medium">{t ? t("post_request") : "Post Request"}</span>
                  </span>
                  
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                  
                  <span className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/50 px-4 py-2 rounded-full">
                    <Users className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                    <span className="font-medium">{t ? t("get_multiple_quotes") : "Get Quotes"}</span>
                  </span>
                  
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                  
                  <span className="flex items-center gap-2 bg-green-50 dark:bg-green-900/50 px-4 py-2 rounded-full">
                    <Clock className="h-5 w-5 text-green-500 dark:text-green-400" />
                    <span className="font-medium">{t ? t("and_hire_trusted_local_experts") : "Hire Experts"}</span>
                  </span>
                </span>
              </p>
            </div>
          </div>

          {/* Trust indicators */}
          <div className={`transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex flex-wrap justify-center items-center gap-6 mb-10 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <span className="font-medium">4.9/5 from 10,000+ users</span>
              </div>
              <div className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="font-medium">50,000+ jobs completed</span>
              </div>
            </div>
          </div>
          
          {/* Enhanced CTA buttons */}
          <div className={`transition-all duration-1200 delay-600 ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-70 group-hover:opacity-100 transition duration-300"></div>
                <Button 
                  className="relative bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-10 py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 rounded-xl min-w-[200px]"
                  onClick={() => handleNavigation('/services')}
                >
                  {t ? t("find_services") : "Find Services"}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </div>
              
              <button 
                className="text-lg font-semibold leading-6 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 px-6 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 group"
                onClick={() => handleNavigation('/about')}
              >
                {t ? t("learn_more") : "Learn More"} 
                <ArrowRight className="inline ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Enhanced bottom gradient */}
      <div 
        className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]" 
        aria-hidden="true"
      >
        <div 
          className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-blue-500 via-indigo-500 to-indigo-600 opacity-25 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem] animate-pulse" 
          style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}
        />
      </div>

      {/* Custom animations */}
      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 4s ease-in-out infinite;
        }
        .bg-size-200 {
          background-size: 200% 200%;
        }
      `}</style>
    </div>
  );
}