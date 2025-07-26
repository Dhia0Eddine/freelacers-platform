import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Sun, Moon, User, ChevronDown, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuthContext } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useTranslation } from "react-i18next";

// Temporary Logo component with modern styling
const Logo = () => (
    <div className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-700 font-bold text-xl md:text-2xl">Freelance Hub</div>
);

export const HeroHeader = () => {
    const [menuState, setMenuState] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const { isAuthenticated, logout, userRole } = useAuthContext();
    const { theme, toggleTheme } = useTheme();
    const { t, i18n } = useTranslation();

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

    // Replace menuItems with translated labels
    const menuItems = [
        { name: t('home'), href: '/' },
        { name: t('services'), href: '/services' },
        { name: t('about'), href: '/about' },
        { name: t('contact'), href: '/contact' },
        { name: t('faq'), href: '/faq' },
    ];

    // Determine RTL
    const isRTL = i18n.language === "ar";

    return (
        <header className="relative ">
            <nav
                data-state={menuState ? 'active' : undefined}
                className="fixed z-10 w-full px-4 lg:px-6 transition-all duration-300"
                dir={isRTL ? "rtl" : "ltr"}
            >
                <div className={cn(
                    'mx-auto mt-1.5 max-w-6xl px-4 transition-all duration-300 lg:px-8',
                    isScrolled 
                        ? 'bg-white/70 dark:bg-gray-900/70 max-w-7xl rounded-xl border backdrop-blur-lg shadow-sm' 
                        : 'bg-transparent'
                )}> 
                    <div className={`relative flex items-center justify-between ${
                        isScrolled ? "py-3 lg:py-4" : "py-1.5 lg:py-2"
                    }`}>
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
                            <ul className="flex items-center gap-10 text-sm font-medium" style={isRTL ? { direction: "rtl" } : {}}>
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
                        <div className="hidden lg:flex items-center gap-2">
                            {/* Language Toggle Button */}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => i18n.changeLanguage(i18n.language === "ar" ? "en" : "ar")}
                                className="rounded-full px-3 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 h-7"
                            >
                                {i18n.language === "ar" ? "EN" : "عربي"}
                            </Button>
                            
                            {/* Theme Toggle */}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={toggleTheme}
                                className="rounded-full w-8 h-8 flex items-center justify-center transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                            >
                                {theme === 'dark' ? 
                                    <Sun className="size-4 text-gray-200" /> : 
                                    <Moon className="size-4 text-gray-700" />
                                }
                            </Button>
                            
                            {isAuthenticated ? (
                                /* Profile/Dashboard Menu */
                                <div className="relative">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setProfileDropdownOpen(!profileDropdownOpen);
                                        }}
                                        className="flex items-center gap-1.5 rounded-full px-2.5 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 h-8"
                                    >
                                        <div className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-full p-0.5">
                                            <User className="text-white size-3.5" />
                                        </div>
                                        <span className="text-gray-700 dark:text-gray-200 text-sm">
                                            {userRole === 'admin' ? t('dashboard') : t('profile')}
                                        </span>
                                        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                                    </Button>
                                    
                                    {/* Dropdown Menu */}
                                    {profileDropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-48 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg py-2 z-50 animate-fadeIn">
                                            {userRole === 'admin' ? (
                                                <Link 
                                                    to="/admin/dashboard" 
                                                    className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                                                    onClick={() => setProfileDropdownOpen(false)}
                                                >
                                                    <User className="w-4 h-4" />
                                                    <span>{t('dashboard')}</span>
                                                </Link>
                                            ) : (
                                                <Link 
                                                    to="/profile/me" 
                                                    className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                                                    onClick={() => setProfileDropdownOpen(false)}
                                                >
                                                    <User className="w-4 h-4" />
                                                    <span>{t('profile')}</span>
                                                </Link>
                                            )}
                                            <Link 
                                                to="/settings" 
                                                className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                                                onClick={() => setProfileDropdownOpen(false)}
                                            >
                                                <Settings className="w-4 h-4" />
                                                <span>{t('settings')}</span>
                                            </Link>
                                            
                                            {/* Language Switcher inside profile menu */}
                                            <div className="px-4 py-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        i18n.changeLanguage(i18n.language === "ar" ? "en" : "ar");
                                                        setProfileDropdownOpen(false);
                                                    }}
                                                    className="w-full rounded-md text-xs h-7"
                                                >
                                                    {i18n.language === "ar" ? "English" : "عربي"}
                                                </Button>
                                            </div>
                                            
                                            <hr className="my-2 border-gray-200 dark:border-gray-700" />
                                            <button 
                                                onClick={() => {
                                                    logout();
                                                    setProfileDropdownOpen(false);
                                                }}
                                                className="flex w-full items-center gap-3 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                <span>{t('logout')}</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* Login/Signup Buttons */
                                <div className="flex items-center gap-2">
                                    <Link to="/login">
                                        <Button 
                                            variant="ghost" 
                                            size="sm"
                                            className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 text-sm h-8 px-3"
                                        >
                                            {t('login')}
                                        </Button>
                                    </Link>
                                    <Link to="/signup">
                                        <Button 
                                            size="sm"
                                            className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white rounded-full px-4 transition-transform duration-300 hover:scale-105 hover:shadow-md text-sm h-8"
                                        >
                                            {t('sign_up')}
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
                                className="mr-1.5 rounded-full w-8 h-8 flex items-center justify-center"
                                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                            >
                                {theme === 'dark' ? 
                                    <Sun className="size-4 text-gray-200" /> : 
                                    <Moon className="size-4 text-gray-700" />
                                }
                            </Button>
                            
                            <button
                                onClick={() => setMenuState(!menuState)}
                                aria-label={menuState ? 'Close Menu' : 'Open Menu'}
                                className="relative z-20 -m-1.5 cursor-pointer p-1.5"
                            >
                                <Menu className={`m-auto size-5 transition-all duration-300 ${menuState ? 'opacity-0 scale-0 rotate-90' : 'text-gray-700 dark:text-gray-200'}`} />
                                <X className={`absolute inset-0 m-auto size-5 text-white transition-all duration-300 ${menuState ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-0 -rotate-90'}`} />
                            </button>
                        </div>
                    </div>
                </div>
                
                {/* Mobile Menu */}
                {menuState && (
                    <div 
                        className={`fixed inset-0 z-40 bg-gray-900/90 backdrop-blur-sm transition-all duration-300`}
                        dir={isRTL ? "rtl" : "ltr"}
                        onClick={() => setMenuState(false)}
                    >
                        <div
                            className={`absolute top-16 left-0 right-0 mx-auto w-11/12 max-w-sm rounded-xl bg-white dark:bg-gray-800 p-4 shadow-xl transition-all duration-300`}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className={`flex flex-col ${isRTL ? "items-end" : ""}`}>
                                <ul className={`space-y-3 mb-4 ${isRTL ? "text-right" : ""}`}>
                                    {menuItems.map((item, index) => (
                                        <li key={index}>
                                            <Link
                                                to={item.href}
                                                onClick={() => setMenuState(false)}
                                                className="text-gray-700 dark:text-gray-200 text-base font-medium hover:text-indigo-600 dark:hover:text-indigo-400 block"
                                            >
                                                {item.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                                
                                {/* Language Switcher in mobile menu */}
                                <div className="flex items-center justify-center mb-3">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            i18n.changeLanguage(i18n.language === "ar" ? "en" : "ar");
                                            setMenuState(false);
                                        }}
                                        className="rounded-full px-3 py-1 text-xs h-7"
                                    >
                                        {i18n.language === "ar" ? "EN" : "عربي"}
                                    </Button>
                                </div>
                                
                                <hr className="border-gray-200 dark:border-gray-700 my-3" />
                                
                                {isAuthenticated ? (
                                    <div className="space-y-2">
                                        {userRole === 'admin' ? (
                                            <Link 
                                                to="/admin/dashboard" 
                                                onClick={() => setMenuState(false)}
                                                className="flex items-center gap-2.5 text-gray-700 dark:text-gray-200 py-1"
                                            >
                                                <User className="w-4 h-4" />
                                                <span className="text-sm">{t('dashboard')}</span>
                                            </Link>
                                        ) : (
                                            <Link 
                                                to="/profile" 
                                                onClick={() => setMenuState(false)}
                                                className="flex items-center gap-2.5 text-gray-700 dark:text-gray-200 py-1"
                                            >
                                                <User className="w-4 h-4" />
                                                <span className="text-sm">{t('profile')}</span>
                                            </Link>
                                        )}
                                        <Link 
                                            to="/settings" 
                                            onClick={() => setMenuState(false)}
                                            className="flex items-center gap-2.5 text-gray-700 dark:text-gray-200 py-1"
                                        >
                                            <Settings className="w-4 h-4" />
                                            <span className="text-sm">{t('settings')}</span>
                                        </Link>
                                        <button 
                                            onClick={() => {
                                                logout();
                                                setMenuState(false);
                                            }}
                                            className="flex w-full items-center gap-2.5 text-red-600 dark:text-red-400 py-1"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            <span className="text-sm">{t('logout')}</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <Link 
                                            to="/login" 
                                            onClick={() => setMenuState(false)}
                                            className="block w-full"
                                        >
                                            <Button 
                                                variant="outline" 
                                                className="w-full justify-center h-8 text-sm"
                                            >
                                                {t('login')}
                                            </Button>
                                        </Link>
                                        <Link 
                                            to="/signup" 
                                            onClick={() => setMenuState(false)}
                                            className="block w-full"
                                        >
                                            <Button 
                                                className="w-full justify-center bg-gradient-to-r from-blue-500 to-blue-700 text-white h-8 text-sm"
                                            >
                                                {t('sign_up')}
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
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