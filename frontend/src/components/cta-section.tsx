import React from 'react';
import { Button } from '@/components/ui/button';
import { AnimatedGroup } from '@/components/ui/animated-group';
import { ArrowRight } from 'lucide-react';
export default function CTASection({ t }: { t: any }) {
  const navigate = (path: string) => {
    console.log(`Navigate to: ${path}`);
    // Navigation logic would be handled by parent component
  };

  return (
    <section className="relative py-32 overflow-hidden bg-gradient-to-br from-indigo-50/80 via-blue-50/60 to-white dark:from-slate-900/95 dark:via-gray-900/90 dark:to-black transition-all duration-700">
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 right-1/3 w-72 h-72 bg-gradient-to-r from-purple-400 to-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-blob animation-delay-4000"></div>
      </div>

      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 z-0 opacity-5 dark:opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(99, 102, 241, 0.3) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>
      
      <div className="container relative z-0 mx-auto px-6 text-center">
        <AnimatedGroup 
          variants={{
            item: {
              hidden: { opacity: 0, y: 30, scale: 0.95 },
              visible: { 
                opacity: 1, 
                y: 0,
                scale: 1,
                transition: { 
                  type: 'spring',
                  bounce: 0.3,
                  duration: 1.2
                }
              }
            }
          }}
        >
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 bg-gradient-to-r from-gray-900 via-indigo-900 to-gray-900 dark:from-white dark:via-blue-100 dark:to-white bg-clip-text text-transparent leading-tight tracking-tight">
            {t('cta_ready_to_join') || 'Ready to Transform Your Journey?'}
          </h2>
        </AnimatedGroup>
        
        <AnimatedGroup
          variants={{
            item: {
              hidden: { opacity: 0, y: 20 },
              visible: { 
                opacity: 1, 
                y: 0,
                transition: { 
                  type: 'spring',
                  bounce: 0.3,
                  duration: 1,
                  delay: 0.3
                }
              }
            }
          }}
        >
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-16 max-w-4xl mx-auto leading-relaxed font-light">
            {t('cta_platform_supports_journey') || 'Join thousands who have already started their transformation. Our platform supports every step of your journey.'}
          </p>
        </AnimatedGroup>
        
        <AnimatedGroup
          variants={{
            container: {
              visible: {
                transition: {
                  staggerChildren: 0.15,
                  delayChildren: 0.6,
                }
              }
            },
            item: {
              hidden: { opacity: 0, y: 30, scale: 0.9 },
              visible: { 
                opacity: 1, 
                y: 0,
                scale: 1,
                transition: { 
                  type: 'spring',
                  bounce: 0.3,
                  duration: 1
                }
              }
            }
          }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
        >
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-blue-500 to-purple-500 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 group-hover:blur-xl transition-all duration-500 animate-pulse"></div>
            <Button 
              size="lg" 
              className="relative px-10 py-7 bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 rounded-2xl text-white font-semibold text-xl shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-3xl"
              onClick={() => navigate && navigate('/signup')}
            >
              {t('cta_sign_up_now') || 'Start Your Journey'} 
              <ArrowRight className="ml-3 h-6 w-6 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
          
          <Button 
            variant="ghost" 
            size="lg" 
            className="px-10 py-7 rounded-2xl text-gray-700 dark:text-gray-200 border-2 border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 text-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg backdrop-blur-sm"
            onClick={() => navigate && navigate('/learn-more')}
          >
            {t('cta_learn_more') || 'Learn More'}
          </Button>
        </AnimatedGroup>

        {/* Trust indicators */}
        <AnimatedGroup
          variants={{
            item: {
              hidden: { opacity: 0, y: 20 },
              visible: { 
                opacity: 1, 
                y: 0,
                transition: { 
                  type: 'spring',
                  bounce: 0.3,
                  duration: 1,
                  delay: 0.9
                }
              }
            }
          }}
          className="mt-16"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Trusted by 50K+ users</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse animation-delay-1000"></div>
              <span>99.9% uptime guaranteed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse animation-delay-2000"></div>
              <span>Free to get started</span>
            </div>
          </div>
        </AnimatedGroup>
      </div>
      
      {/* Enhanced custom animation styles */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1) rotate(0deg); }
          25% { transform: translate(40px, -60px) scale(1.1) rotate(90deg); }
          50% { transform: translate(-30px, 40px) scale(0.9) rotate(180deg); }
          75% { transform: translate(60px, 30px) scale(1.05) rotate(270deg); }
          100% { transform: translate(0px, 0px) scale(1) rotate(360deg); }
        }
        .animate-blob {
          animation: blob 12s infinite ease-in-out;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .shadow-3xl {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
        }
      `}</style>
    </section>
  );
}