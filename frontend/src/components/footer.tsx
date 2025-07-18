import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Github, Mail } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  const footerLinks = [
    {
      title: 'For Clients',
      links: [
        { name: 'Find Freelancers', href: '/find-freelancers' },
        { name: 'Post a Project', href: '/post-project' },
        { name: 'Pricing', href: '/pricing' },
        { name: 'Client Resources', href: '/client-resources' },
      ]
    },
    {
      title: 'For Freelancers',
      links: [
        { name: 'Find Work', href: '/find-work' },
        { name: 'Create Profile', href: '/create-profile' },
        { name: 'Success Stories', href: '/success-stories' },
        { name: 'Freelancer Resources', href: '/freelancer-resources' },
      ]
    },
    {
      title: 'Company',
      links: [
        { name: 'About Us', href: '/about' },
        { name: 'Careers', href: '/careers' },
        { name: 'Blog', href: '/blog' },
        { name: 'Press', href: '/press' },
      ]
    },
    {
      title: 'Support',
      links: [
        { name: 'Help Center', href: '/help' },
        { name: 'Contact Us', href: '/contact' },
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Terms of Service', href: '/terms' },
      ]
    },
  ];
  
  return (
    <footer className="bg-black-100 dark:bg-gray-900 text-black-800 dark:text-gray-300 transition-colors duration-500">
      <div className="container mx-auto px-4 pt-16 pb-8">
        {/* Top section with logo and subscribe */}
        <div className="flex flex-col md:flex-row justify-between mb-12">
          <div className="mb-8 md:mb-0">
            <div className="text-2xl font-bold text-black-900 dark:text-white mb-4">FreelancePlatform</div>
            <p className="max-w-xs text-black-600 dark:text-gray-400">
              Connecting talented freelancers with amazing clients worldwide.
            </p>
          </div>
          
          <div className="max-w-md">
            <h3 className="text-lg font-semibold mb-4">Subscribe to Our Newsletter</h3>
            <div className="flex">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-white dark:bg-gray-800 text-black-900 dark:text-white px-4 py-2 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-grow"
              />
              <button className="bg-indigo-600 hover:bg-indigo-700 text-black-900 px-4 py-2 rounded-r-md transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
        
        {/* Middle section with links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-t border-b border-gray-200 dark:border-gray-800">
          {footerLinks.map((column, i) => (
            <div key={i}>
              <h3 className="text-lg font-semibold mb-4 text-black dark:text-white">{column.title}</h3>
              <ul className="space-y-2">
                {column.links.map((link, j) => (
                  <li key={j}>
                    <Link 
                      to={link.href}
                      className="text-black-400 hover:text-indigo-400 transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        {/* Bottom section with social links and copyright */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex space-x-4 mb-4 md:mb-0">
            <a href="#" className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
              <Facebook size={20} />
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
              <Twitter size={20} />
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
              <Instagram size={20} />
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
              <Linkedin size={20} />
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
              <Github size={20} />
            </a>
          </div>
          
          <div className="text-black-500 text-sm">
            © {currentYear} FreelancePlatform. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
