import React from 'react';
import { Outlet } from "react-router-dom";
import { HeroHeader } from "@/components/Header";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import Footer from "@/components/footer";
import ScrollToTop from '@/components/ScrollToTop'; // adjust path if needed

export default function AppLayout() {
    React.useEffect(() => {
        console.log("AppLayout mounted");
    }, []);

    return (
        
        <AuthProvider>
            
             <ScrollToTop />
            <ThemeProvider>
                <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-200">
                    <HeroHeader />
                    {/* Add pt-24 to create space for the fixed header */}
                    <main className="flex-1 pt-18">
                        <Outlet />
                    </main>
                    <Footer />
                </div>
            </ThemeProvider>
        </AuthProvider>
    );
}
