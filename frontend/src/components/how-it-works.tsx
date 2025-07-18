import React from 'react';
import { UserPlus, FileText, MessageSquareQuote, Calendar, Star } from 'lucide-react';
import { AnimatedGroup } from '@/components/ui/animated-group';

// Step data structure
interface Step {
    number: number;
    customerTitle: string;
    customerDescription: string;
    providerTitle: string;
    providerDescription: string;
    icon: React.ReactNode;
}

export default function HowItWorksSection() {
    // Define the steps for both customers and providers
    const steps: Step[] = [
        {
            number: 1,
            customerTitle: "Create an account",
            customerDescription: "Sign up in minutes with your email or social accounts",
            providerTitle: "Create an account",
            providerDescription: "Showcase your skills, experience, and availability",
            icon: <UserPlus className="size-6" />,
        },
        {
            number: 2,
            customerTitle: "Post a service request",
            customerDescription: "Describe what you need and set your budget",
            providerTitle: "Set up your service listing",
            providerDescription: "Define your offerings, pricing, and service areas",
            icon: <FileText className="size-6" />,
        },
        {
            number: 3,
            customerTitle: "Receive and review quotes",
            customerDescription: "Compare proposals from qualified providers",
            providerTitle: "Send quotes for open requests",
            providerDescription: "Respond to customer requests with personalized offers",
            icon: <MessageSquareQuote className="size-6" />,
        },
        {
            number: 4,
            customerTitle: "Book and pay securely",
            customerDescription: "Schedule service and pay through our secure platform",
            providerTitle: "Get booked and deliver the service",
            providerDescription: "Provide excellent service and fulfill the request",
            icon: <Calendar className="size-6" />,
        },
        {
            number: 5,
            customerTitle: "Leave a review",
            customerDescription: "Share your experience and help the community",
            providerTitle: "Get reviewed and grow your reputation",
            providerDescription: "Build your reputation to attract more clients",
            icon: <Star className="size-6" />,
        },
    ];

    return (
        <section className="py-24 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-500">
            <div className="container mx-auto px-4">
                <AnimatedGroup>
                    <h2 className="text-4xl font-bold text-center mb-4">How It Works</h2>
                    <p className="text-xl text-gray-600 dark:text-gray-400 text-center max-w-3xl mx-auto mb-16">
                        Our platform makes it easy for customers to find services and for providers to grow their business
                    </p>
                </AnimatedGroup>

                <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
                    {/* Customers Column */}
                    <div className="bg-blue-50 dark:bg-gray-800 p-8 rounded-2xl">
                        <h3 className="text-2xl font-bold text-blue-700 dark:text-blue-400 mb-8 text-center">For Customers</h3>
                        <div className="space-y-8">
                            {steps.map((step, index) => (
                                <AnimatedGroup 
                                    key={`customer-${index}`}
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
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-700 text-blue-600 dark:text-blue-300 size-12 rounded-full flex items-center justify-center font-bold text-xl">
                                            {step.number}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-blue-600 dark:text-blue-300">
                                                    {step.icon}
                                                </span>
                                                <h4 className="font-semibold text-lg">{step.customerTitle}</h4>
                                            </div>
                                            <p className="text-gray-600 dark:text-gray-300">{step.customerDescription}</p>
                                        </div>
                                    </div>
                                </AnimatedGroup>
                            ))}
                        </div>
                    </div>

                    {/* Providers Column */}
                    <div className="bg-purple-50 dark:bg-gray-800 p-8 rounded-2xl">
                        <h3 className="text-2xl font-bold text-purple-700 dark:text-purple-400 mb-8 text-center">For Providers</h3>
                        <div className="space-y-8">
                            {steps.map((step, index) => (
                                <AnimatedGroup 
                                    key={`provider-${index}`}
                                    variants={{
                                        item: {
                                            hidden: { opacity: 0, y: 20 },
                                            visible: { 
                                                opacity: 1, 
                                                y: 0,
                                                transition: { delay: index * 0.1 + 0.3, duration: 0.5 }
                                            }
                                        }
                                    }}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 bg-purple-100 dark:bg-purple-700 text-purple-600 dark:text-purple-300 size-12 rounded-full flex items-center justify-center font-bold text-xl">
                                            {step.number}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-purple-600 dark:text-purple-300">
                                                    {step.icon}
                                                </span>
                                                <h4 className="font-semibold text-lg">{step.providerTitle}</h4>
                                            </div>
                                            <p className="text-gray-600 dark:text-gray-300">{step.providerDescription}</p>
                                        </div>
                                    </div>
                                </AnimatedGroup>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
