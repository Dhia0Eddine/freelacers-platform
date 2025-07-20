import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatedGroup } from '@/components/ui/animated-group';

const transitionVariants = {
    item: {
        hidden: {
            opacity: 0,
            filter: 'blur(12px)',
            y: 12,
        },
        visible: {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            transition: {
                type: 'spring' as const,
                bounce: 0.3,
                duration: 1.5,
            },
        },
    },
};

export default function HeroSection() {
    React.useEffect(() => {
        console.log("HeroSection mounted with transitions");
    }, []);

    return (
        <main className="min-h-screen relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-white dark:from-slate-900 dark:via-gray-900 dark:to-black transition-colors duration-500 -mt-24">
            {/* Adjusted with -mt-24 to offset the padding added in AppLayout */}
            {/* Animated background elements */}
            <div className="absolute inset-0 z-0 opacity-20">
                <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
                <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
            </div>
            
            {/* Content */}
            <div className="w-full py-8 md:py-0 pt-16 md:pt-0 relative z-10">
                <div className="mx-auto max-w-7xl px-6">
                    <div className="text-center">
                        <AnimatedGroup variants={transitionVariants}>
                            <Link
                                to="#link"
                                className="hover:bg-gray-200/50 dark:hover:bg-white/10 group mx-auto flex w-fit items-center gap-4 rounded-full border border-gray-300 dark:border-white/20 p-1 pl-4 shadow-md transition-colors duration-300">
                                <span className="text-gray-800 dark:text-white text-sm">Introducing Support for AI Models</span>
                                <span className="block h-4 w-0.5 border-l bg-gray-300 dark:bg-white/30"></span>

                                <div className="bg-gray-100 dark:bg-white/10 group-hover:bg-gray-200 dark:group-hover:bg-white/20 size-6 overflow-hidden rounded-full duration-500">
                                    <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                                        <span className="flex size-6">
                                            <ArrowRight className="m-auto size-3 text-white" />
                                        </span>
                                        <span className="flex size-6">
                                            <ArrowRight className="m-auto size-3 text-white" />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        </AnimatedGroup>

                        <AnimatedGroup variants={transitionVariants}>
                            <h1 className="mt-8 text-balance text-6xl font-bold md:text-7xl lg:mt-16 xl:text-[5.25rem] text-gray-900 dark:text-white">
                                Modern Solutions for <span className="text-indigo-600 dark:text-indigo-400">Customer</span> Engagement
                            </h1>
                        </AnimatedGroup>

                        <AnimatedGroup variants={transitionVariants}>
                            <p className="mx-auto mt-8 max-w-2xl text-balance text-lg text-gray-700 dark:text-gray-300">
                                Highly customizable components for building modern websites and applications that look and feel the way you mean it.
                            </p>
                        </AnimatedGroup>

                        <AnimatedGroup
                            variants={{
                                container: {
                                    visible: {
                                        transition: {
                                            staggerChildren: 0.05,
                                            delayChildren: 0.75,
                                        },
                                    },
                                },
                                ...transitionVariants,
                            }}
                            className="mt-12 flex flex-col items-center justify-center gap-2 md:flex-row">
                            <div key={1} className="relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-xl blur opacity-70 group-hover:opacity-100 transition duration-300"></div>
                                <Button 
                                    size="lg" 
                                    className="relative px-5 py-6 bg-indigo-600 dark:bg-gray-900 rounded-xl text-white font-semibold text-base"
                                    asChild
                                >
                                    <Link to="#link">
                                        <span className="text-nowrap">Start Building</span>
                                    </Link>
                                </Button>
                            </div>
                            
                            <Button
                                key={2}
                                variant="ghost"
                                size="lg"
                                className="px-5 py-6 rounded-xl text-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-base"
                                asChild
                            >
                                <Link to="#link">
                                    <span className="text-nowrap">Request a demo</span>
                                </Link>
                            </Button>
                        </AnimatedGroup>
                    </div>
                </div>
            </div>
            
            {/* Add custom animation styles */}
            <style>{`
                @keyframes blob {
                  0% { transform: translate(0px, 0px) scale(1); }
                  33% { transform: translate(30px, -50px) scale(1.1); }
                  66% { transform: translate(-20px, 20px) scale(0.9); }
                  100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-blob {
                  animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                  animation-delay: 2s;
                }
                .animation-delay-4000 {
                  animation-delay: 4s;
                }
            `}</style>
        </main>
    );
}