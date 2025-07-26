import React from 'react';
import { Button } from '@/components/ui/button';
import { AnimatedGroup } from '@/components/ui/animated-group';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CTASection({ t }: { t: any }) {
  const navigate = useNavigate();

  return (
    <section className="relative py-24 overflow-hidden bg-gradient-to-br from-indigo-50 via-blue-50 to-white dark:from-slate-900 dark:via-gray-900 dark:to-black transition-colors duration-500">
      {/* Animated background elements */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="container relative z-10 mx-auto px-4 text-center">
        <AnimatedGroup 
          variants={{
            item: {
              hidden: { opacity: 0, y: 20 },
              visible: { 
                opacity: 1, 
                y: 0,
                transition: { 
                  type: 'spring',
                  bounce: 0.4,
                  duration: 1 
                }
              }
            }
          }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white leading-tight">
            {t('cta_ready_to_join')}
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
                  bounce: 0.4,
                  duration: 1,
                  delay: 0.2
                }
              }
            }
          }}
        >
          <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-12 max-w-3xl mx-auto">
            {t('cta_platform_supports_journey')}
          </p>
        </AnimatedGroup>
        
        <AnimatedGroup
          variants={{
            container: {
              visible: {
                transition: {
                  staggerChildren: 0.1,
                  delayChildren: 0.4,
                }
              }
            },
            item: {
              hidden: { opacity: 0, y: 20 },
              visible: { 
                opacity: 1, 
                y: 0,
                transition: { 
                  type: 'spring',
                  bounce: 0.4,
                  duration: 1
                }
              }
            }
          }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-xl blur opacity-70 group-hover:opacity-100 transition duration-300"></div>
            <Button 
              size="lg" 
              className="relative px-8 py-6 bg-gray-900 rounded-xl text-white font-semibold text-lg"
              onClick={() => navigate('/signup')}
            >
              {t('cta_sign_up_now')} <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
          
          <Button 
            variant="ghost" 
            size="lg" 
            className="px-8 py-6 rounded-xl text-gray-800 dark:text-gray-100 border border-gray-400 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-lg"
            onClick={() => navigate('/learn-more')}
          >
            {t('cta_learn_more')}
          </Button>
        </AnimatedGroup>
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
    </section>
  );
}
  
