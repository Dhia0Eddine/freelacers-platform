import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuthContext } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

// Temporary Logo component if the real one isn't working
const Logo = () => (
    <div className="text-dark font-bold text-2xl md:text-3xl dark:text-white">Logo</div> // Increased font size
);

const menuItems = [
    { name: 'Features', href: '/features' },
    { name: 'Solution', href: '/solution' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'About', href: '/about' },
    { name: 'Test', href: '/test' }, // Added test page link
];

export const HeroHeader = () => {
    const [menuState, setMenuState] = React.useState(false);
    const [isScrolled, setIsScrolled] = React.useState(false);
    const { isAuthenticated, logout } = useAuthContext();
    const { theme, toggleTheme } = useTheme();

    React.useEffect(() => {
        console.log("HeroHeader mounted");
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header>
            <nav
                data-state={menuState ? 'active' : undefined}
                className="fixed z-20 w-full px-2">
                <div className={cn('mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12', 
                    isScrolled && 'bg-white/50 dark:bg-background/50 max-w-4xl rounded-2xl border backdrop-blur-lg lg:px-5')}>
                    <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
                        <div className="flex w-full justify-between lg:w-auto">
                            <Link
                                to="/"
                                aria-label="home"
                                className="flex items-center space-x-2">
                                <Logo />
                            </Link>

                            <button
                                onClick={() => setMenuState(!menuState)}
                                aria-label={menuState ? 'Close Menu' : 'Open Menu'}
                                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden">
                                <Menu className={`m-auto size-6 duration-200 ${menuState ? 'opacity-0 scale-0 rotate-180' : ''}`} />
                                <X className={`absolute inset-0 m-auto size-6 duration-200 ${menuState ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-0 -rotate-180'}`} />
                            </button>
                        </div>

                        {/* Navigation links */}
                        <div className="absolute inset-0 m-auto hidden size-fit lg:block">
                            <ul className="flex gap-8 text-base font-medium"> {/* Increased font size from text-sm to text-base */}
                                {menuItems.map((item, index) => (
                                    <li key={index}>
                                        <Link
                                            to={item.href}
                                            className="text-gray-800 dark:text-white hover:text-gray-600 dark:hover:text-gray-300 block duration-150">
                                            <span>{item.name}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        
                        {/* Mobile menu */}
                        <div className={`bg-black/80 dark:bg-white/5 backdrop-blur-sm mb-6 w-full rounded-3xl border border-gray-200 dark:border-white/10 p-6 shadow-2xl ${menuState ? 'block' : 'hidden'} lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none`}>
                            <div className="lg:hidden">
                                <ul className="space-y-6 text-lg"> {/* Increased font size from text-base to text-lg */}
                                    {menuItems.map((item, index) => (
                                        <li key={index}>
                                            <Link
                                                to={item.href}
                                                className="text-white hover:text-gray-300 block duration-150">
                                                <span>{item.name}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            
                            {/* Theme toggle and auth buttons */}
                            <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit md:items-center">
                                {/* Theme toggle button */}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={toggleTheme}
                                    className="text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-white/10 rounded-full p-2 w-10 h-10"
                                    aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                                >
                                    {theme === 'dark' ? <Sun className="size-5" /> : <Moon className="size-5" />}
                                </Button>
                                
                                {isAuthenticated ? (
                                    // Show these buttons when user is authenticated
                                    !isScrolled && (
                                        <>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={logout}
                                                className="hover:bg-red-600">
                                                Profile
                                            </Button>
                                        </>
                                    )
                                ) : (
                                    // Show these buttons when user is not authenticated
                                    <>
                                        {!isScrolled ? (
                                            <>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-white hover:bg-white/10 border-white/20 rounded-full">
                                                    <Link to="login">Login</Link>
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="bg-white/20 hover:bg-white/30 text-white rounded-full">
                                                    <Link to="signup">Sign Up</Link>
                                                </Button>
                                            </>
                                        ) : (
                                            <Button
                                                size="sm"
                                                className={cn("lg:inline-flex bg-white/20 hover:bg-white/30 text-white rounded-full")}>
                                                <Link to="signup">Get Started</Link>
                                            </Button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
};
