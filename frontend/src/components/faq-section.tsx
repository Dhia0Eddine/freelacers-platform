import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { AnimatedGroup } from '@/components/ui/animated-group';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQ {
  question: string;
  answer: string;
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  
  const faqs: FAQ[] = [
    {
      question: "How do I find freelancers for my project?",
      answer: "You can post a project request detailing your requirements, budget, and timeline. Our matching system will help connect you with qualified freelancers, or you can browse through profiles and invite specific freelancers to bid on your project."
    },
    {
      question: "How does payment processing work?",
      answer: "We use a secure escrow system. Funds are held safely until you approve the completed work. You can set up milestones for larger projects, releasing payment as each phase is completed to your satisfaction."
    },
    {
      question: "What fees do freelancers pay?",
      answer: "Freelancers pay a 5-10% service fee based on their lifetime earnings on the platform. The fee decreases as you earn more, rewarding long-term platform users with lower rates."
    },
    {
      question: "Can I work with the same client long-term?",
      answer: "Absolutely! Many freelancers build long-term relationships with clients. After the initial project, you can set up ongoing contracts or retainer agreements through our platform to maintain the relationship."
    },
    {
      question: "How do I handle disputes with clients or freelancers?",
      answer: "We offer a mediation service for disputes. If an issue arises, both parties can request mediation through our support team, who will review communications, deliverables, and the original contract to help reach a fair resolution."
    },
    {
      question: "Are there any guarantees for clients?",
      answer: "We offer a satisfaction guarantee for clients. If work doesn't meet the agreed-upon requirements, you can request revisions. If issues persist, our dispute resolution team will help mediate a solution, which may include partial or full refunds when appropriate."
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-500">
      <div className="container mx-auto px-4">
        <AnimatedGroup>
          <h2 className="text-4xl font-bold text-center mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 text-center max-w-3xl mx-auto mb-16">
            Find answers to common questions about our freelancing platform
          </p>
        </AnimatedGroup>

        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <AnimatedGroup 
              key={index}
              variants={{
                item: {
                  hidden: { opacity: 0, y: 20 },
                  visible: { 
                    opacity: 1, 
                    y: 0,
                    transition: { delay: index * 0.1, duration: 0.5 }
                  }
                }
              }}
            >
              <div className="mb-4">
                <button
                  onClick={() => toggleFAQ(index)}
                  className={`w-full text-left p-6 rounded-xl flex justify-between items-center transition-all duration-300 ${
                    openIndex === index 
                      ? 'bg-indigo-50/40 dark:bg-indigo-900/40 shadow-lg border-l-4 border-indigo-500' 
                      : 'bg-white/50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <span className="font-semibold text-lg">{faq.question}</span>
                  <ChevronDown 
                    className={`transition-transform duration-300 ${
                      openIndex === index ? 'transform rotate-180 text-indigo-500 dark:text-indigo-400' : ''
                    }`} 
                  />
                </button>
                
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 bg-white/30 dark:bg-gray-800/30 rounded-b-xl border-l-4 border-indigo-500/50">
                        <p className="text-gray-700 dark:text-gray-300">{faq.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </AnimatedGroup>
          ))}
        </div>
      </div>
    </section>
  );
}
