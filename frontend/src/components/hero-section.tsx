import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { Home, Laptop, GraduationCap, Clock, FileText, Users } from 'lucide-react';

export default function HeroSection() {
  return (
    <div className="relative isolate overflow-hidden bg-white dark:bg-gray-900 pt-14">
      {/* Background gradients */}
      <div 
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" 
        aria-hidden="true"
      >
        <div 
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-blue-400 to-indigo-600 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" 
          style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}
        />
      </div>
      
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
            <div className="flex flex-wrap justify-center items-center gap-2 mb-4">
              <span className="flex items-center bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-full">
                <Home className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-2" />
                <span className="text-gray-900 dark:text-white">Home fixes</span>
              </span>
              <span className="flex items-center bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-full">
                <Laptop className="h-8 w-8 text-indigo-600 dark:text-indigo-400 mr-2" />
                <span className="text-gray-900 dark:text-white">tech help</span>
              </span>
              <span className="flex items-center bg-green-50 dark:bg-green-900/30 px-4 py-2 rounded-full">
                <GraduationCap className="h-8 w-8 text-green-600 dark:text-green-400 mr-2" />
                <span className="text-gray-900 dark:text-white">tutoring</span>
              </span>
            </div>
            <span className="text-blue-600 dark:text-blue-400">— all in one place.</span>
          </h1>
          
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm py-4 px-6 rounded-xl">
            <span className="flex flex-wrap justify-center items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500 dark:text-blue-400" />
              Post your request,
              
              <Users className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
              get multiple quotes,
              
              <Clock className="h-5 w-5 text-green-500 dark:text-green-400" />
              and hire trusted local experts — in minutes.
            </span>
          </p>
          
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link to="/services">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300">
                Find Services
              </Button>
            </Link>
            <Link to="/about" className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Learn more <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
      
      <div 
        className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]" 
        aria-hidden="true"
      >
        <div 
          className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-blue-500 to-indigo-600 opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" 
          style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}
        />
      </div>
    </div>
  );
}