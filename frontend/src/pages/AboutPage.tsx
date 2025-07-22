import React from "react";
import { Link } from "react-router-dom";
import { Users, Briefcase, Globe, TrendingUp, Star, ClipboardList, Search, Newspaper, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="flex justify-center mb-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 dark:bg-blue-900/30 px-4 py-2 text-blue-700 dark:text-blue-300 font-semibold text-lg">
              🧾 About Us
            </span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            We're <span className="bg-gradient-to-r from-blue-500 to-indigo-600 text-transparent bg-clip-text">Freelance Hub</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            A platform built to connect people with the skilled help they need — fast, easy, and trusted.
          </p>
        </div>

        {/* Mission */}
        <div className="mb-12">
          <p className="text-xl text-gray-800 dark:text-gray-200 mb-4">
            From home repairs and tech support to academic tutoring and beyond, we make it simple for customers to post requests and for professionals to find meaningful work. With thousands of completed jobs and counting, we’re helping everyday people get things done — while supporting local talent and small businesses.
          </p>
        </div>

        {/* Who We Serve */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-500 dark:text-blue-400" />
            Who We Serve
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Customers */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
              <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-2">
                <UserCheck className="h-5 w-5" /> Customers
              </h3>
              <p className="text-gray-700 dark:text-gray-200 mb-4 text-sm">
                Need something done? Post a request, get multiple quotes, compare, and hire the right expert — all in one place.
              </p>
              <blockquote className="italic text-gray-600 dark:text-gray-400 border-l-4 border-blue-400 pl-3 text-sm">
                “I was overwhelmed trying to fix everything myself. This platform gave me access to real help within hours.”
                <br />
                <span className="not-italic font-medium text-gray-800 dark:text-gray-200">— Lina, customer</span>
              </blockquote>
            </div>
            {/* Freelancers & Pros */}
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6">
              <h3 className="font-semibold text-purple-700 dark:text-purple-300 mb-2 flex items-center gap-2">
                <Briefcase className="h-5 w-5" /> Freelancers & Pros
              </h3>
              <p className="text-gray-700 dark:text-gray-200 mb-4 text-sm">
                Grow your business doing what you do best. Get discovered by customers who need your skills — locally or remotely.
              </p>
              <blockquote className="italic text-gray-600 dark:text-gray-400 border-l-4 border-purple-400 pl-3 text-sm">
                “I've doubled my client base in just three months. This platform has changed how I find work.”
                <br />
                <span className="not-italic font-medium text-gray-800 dark:text-gray-200">— Andre, web developer</span>
              </blockquote>
            </div>
            {/* Communities */}
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6">
              <h3 className="font-semibold text-green-700 dark:text-green-300 mb-2 flex items-center gap-2">
                <Globe className="h-5 w-5" /> Communities
              </h3>
              <p className="text-gray-700 dark:text-gray-200 mb-4 text-sm">
                We're more than a marketplace — we're a movement. With every job posted, every connection made, and every skill shared, we’re building stronger communities powered by collaboration.
              </p>
              <blockquote className="italic text-gray-600 dark:text-gray-400 border-l-4 border-green-400 pl-3 text-sm">
                “Helping people in my city while building my business — it’s the best of both worlds.”
                <br />
                <span className="not-italic font-medium text-gray-800 dark:text-gray-200">— Fatima, home cleaner</span>
              </blockquote>
            </div>
          </div>
        </div>

        {/* By the Numbers */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-indigo-500 dark:text-indigo-400" />
            By the Numbers
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">$X million+</span>
              <span className="text-gray-700 dark:text-gray-300 text-sm mt-1">in projects facilitated</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">500+</span>
              <span className="text-gray-700 dark:text-gray-300 text-sm mt-1">service categories</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold text-purple-600 dark:text-purple-400">Thousands</span>
              <span className="text-gray-700 dark:text-gray-300 text-sm mt-1">of freelancers and pros</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold text-green-600 dark:text-green-400">Millions</span>
              <span className="text-gray-700 dark:text-gray-300 text-sm mt-1">of requests posted</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">Nationwide</span>
              <span className="text-gray-700 dark:text-gray-300 text-sm mt-1">service availability</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold text-yellow-500 dark:text-yellow-300">95%+</span>
              <span className="text-gray-700 dark:text-gray-300 text-sm mt-1">customer satisfaction</span>
            </div>
          </div>
        </div>

        {/* Learn More */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-blue-500 dark:text-blue-400" />
            Learn More
          </h2>
          <div className="flex flex-col md:flex-row gap-4">
            <Link to="/how-it-works" className="flex-1">
              <Button className="w-full flex items-center gap-2 justify-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-lg py-4">
                <Search className="h-5 w-5" />
                How it works
              </Button>
            </Link>
            <Link to="/careers" className="flex-1">
              <Button className="w-full flex items-center gap-2 justify-center bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-lg py-4">
                <Briefcase className="h-5 w-5" />
                Careers
              </Button>
            </Link>
            <Link to="/press" className="flex-1">
              <Button className="w-full flex items-center gap-2 justify-center bg-gradient-to-r from-gray-700 to-gray-900 text-white text-lg py-4">
                <Newspaper className="h-5 w-5" />
                Press
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
