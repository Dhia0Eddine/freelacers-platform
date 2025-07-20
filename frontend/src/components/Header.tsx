import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Sun, Moon, User, ChevronDown, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuthContext } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

// Temporary Logo component with modern styling
const Logo = () => (
    <div className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 font-bold text-2xl md:text-3xl">Freelance Hub</div>
);

const menuItems = [
    { name: 'Home', href: '/' },
    { name: 'Listings', href: '/listings' },
    { name: 'Services', href: '/services' },
    { name: 'About', href: '/about' },
];

export const HeroHeader = () => {
    const [menuState, setMenuState] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const { isAuthenticated, logout } = useAuthContext();
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            setProfileDropdownOpen(false);
        };
        
        if (profileDropdownOpen) {
            document.addEventListener('click', handleClickOutside);
        }
        
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [profileDropdownOpen]);

    return (
        <header className="relative">
            <nav
                data-state={menuState ? 'active' : undefined}
                className="fixed z-50 w-full px-2">
                <div className={cn(
                    'mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12',
                    isScrolled 
                        ? 'bg-white/70 dark:bg-gray-900/70 max-w-7xl rounded-2xl border backdrop-blur-lg shadow-sm' 
                        : 'bg-transparent'
                )}>
                    <div className="relative flex items-center justify-between py-3 lg:py-4">
                        {/* Logo */}
                        <div className="flex items-center">
                            <Link
                                to="/"
                                aria-label="home"
                                className="flex items-center transition-transform duration-300 hover:scale-105">
                                <Logo />
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden lg:block">
                            <ul className="flex items-center gap-8 text-base font-medium">
                                {menuItems.map((item, index) => (
                                    <li key={index}>
                                        <Link
                                            to={item.href}
                                            className={`text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200 ${
                                                item.href === '/' && isScrolled ? 'font-semibold' : ''
                                            }`}>
                                            {item.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        
                        {/* Desktop Actions Menu */}
                        <div className="hidden lg:flex items-center gap-3">
                            {/* Theme Toggle */}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={toggleTheme}
                                className="rounded-full w-10 h-10 flex items-center justify-center transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                            >
                                {theme === 'dark' ? 
                                    <Sun className="size-5 text-gray-200" /> : 
                                    <Moon className="size-5 text-gray-700" />
                                }
                            </Button>
                            
                            {isAuthenticated ? (
                                /* Profile Menu */
                                <div className="relative">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setProfileDropdownOpen(!profileDropdownOpen);
                                        }}
                                        className="flex items-center gap-2 rounded-full px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
                                    >
                                        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full p-1">
                                            <User className="text-white size-5" />
                                        </div>
                                        <span className="text-gray-700 dark:text-gray-200">Profile</span>
                                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                                    </Button>
                                    
                                    {/* Dropdown Menu */}
                                    {profileDropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-48 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg py-2 z-50 animate-fadeIn">
                                            <Link 
                                                to="/profile/me" 
                                                className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                onClick={() => setProfileDropdownOpen(false)}
                                            >
                                                <User className="w-4 h-4" />
                                                <span>My Profile</span>
                                            </Link>
                                            <Link 
                                                to="/settings" 
                                                className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                onClick={() => setProfileDropdownOpen(false)}
                                            >
                                                <Settings className="w-4 h-4" />
                                                <span>Settings</span>
                                            </Link>
                                            <hr className="my-2 border-gray-200 dark:border-gray-700" />
                                            <button 
                                                onClick={() => {
                                                    logout();
                                                    setProfileDropdownOpen(false);
                                                }}
                                                className="flex w-full items-center gap-3 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                <span>Logout</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* Login/Signup Buttons */
                                <div className="flex items-center gap-3">
                                    <Link to="/login">
                                        <Button 
                                            variant="ghost" 
                                            size="sm"
                                            className="text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400"
                                        >
                                            Login
                                        </Button>
                                    </Link>
                                    <Link to="/signup">
                                        <Button 
                                            size="sm"
                                            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-full px-5 transition-transform duration-300 hover:scale-105 hover:shadow-md"
                                        >
                                            Sign Up
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Toggle */}
                        <div className="flex items-center lg:hidden">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={toggleTheme}
                                className="mr-2 rounded-full w-10 h-10 flex items-center justify-center"
                                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                            >
                                {theme === 'dark' ? 
                                    <Sun className="size-5 text-gray-200" /> : 
                                    <Moon className="size-5 text-gray-700" />
                                }
                            </Button>
                            
                            <button
                                onClick={() => setMenuState(!menuState)}
                                aria-label={menuState ? 'Close Menu' : 'Open Menu'}
                                className="relative z-20 -m-2 cursor-pointer p-2"
                            >
                                <Menu className={`m-auto size-6 transition-all duration-300 ${menuState ? 'opacity-0 scale-0 rotate-90' : 'text-gray-700 dark:text-gray-200'}`} />
                                <X className={`absolute inset-0 m-auto size-6 text-white transition-all duration-300 ${menuState ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-0 -rotate-90'}`} />
                            </button>
                        </div>
                    </div>
                </div>
                
                {/* Mobile Menu */}
                <div 
                    className={`fixed inset-0 z-40 bg-gray-900/90 backdrop-blur-sm transition-all duration-300 ${
                        menuState ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                >
                    <div className={`absolute top-20 left-0 right-0 mx-auto w-11/12 max-w-sm rounded-xl bg-white dark:bg-gray-800 p-6 shadow-xl transition-all duration-300 ${
                        menuState ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'
                    }`}>
                        <div className="flex flex-col">
                            <ul className="space-y-4 mb-6">
                                {menuItems.map((item, index) => (
                                    <li key={index}>
                                        <Link
                                            to={item.href}
                                            onClick={() => setMenuState(false)}
                                            className="text-gray-700 dark:text-gray-200 text-lg font-medium hover:text-indigo-600 dark:hover:text-indigo-400 block"
                                        >
                                            {item.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                            
                            <hr className="border-gray-200 dark:border-gray-700 my-4" />
                            
                            {isAuthenticated ? (
                                <div className="space-y-3">
                                    <Link 
                                        to="/profile" 
                                        onClick={() => setMenuState(false)}
                                        className="flex items-center gap-3 text-gray-700 dark:text-gray-200"
                                    >
                                        <User className="w-5 h-5" />
                                        <span>My Profile</span>
                                    </Link>
                                    <Link 
                                        to="/settings" 
                                        onClick={() => setMenuState(false)}
                                        className="flex items-center gap-3 text-gray-700 dark:text-gray-200"
                                    >
                                        <Settings className="w-5 h-5" />
                                        <span>Settings</span>
                                    </Link>
                                    <button 
                                        onClick={() => {
                                            logout();
                                            setMenuState(false);
                                        }}
                                        className="flex w-full items-center gap-3 text-red-600 dark:text-red-400"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <Link 
                                        to="/login" 
                                        onClick={() => setMenuState(false)}
                                        className="block w-full"
                                    >
                                        <Button 
                                            variant="outline" 
                                            className="w-full justify-center"
                                        >
                                            Login
                                        </Button>
                                    </Link>
                                    <Link 
                                        to="/signup" 
                                        onClick={() => setMenuState(false)}
                                        className="block w-full"
                                    >
                                        <Button 
                                            className="w-full justify-center bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                                        >
                                            Sign Up
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <style >{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out forwards;
                }
            `}</style>
        </header>
    );
};
