import React from 'react';
import { UserPlus, FileText, MessageSquareQuote, Calendar, Star } from 'lucide-react';
import { AnimatedGroup } from '@/components/ui/animated-group';
import { useTranslation } from "react-i18next";

// Step data structure
interface Step {
    number: number;
    customerTitle: string;
    customerDescription: string;
    providerTitle: string;
    providerDescription: string;
    icon: React.ReactNode;
}

export default function HowItWorksSection({ t }: { t: any }) {
    const { i18n } = useTranslation();

    // Define the steps for both customers and providers
    const steps: Step[] = [
        {
            number: 1,
            customerTitle: t("step_1_create_account"),
            customerDescription: t("step_1_create_account_desc"),
            providerTitle: t("step_1_provider_create_account"),
            providerDescription: t("step_1_provider_create_account_desc"),
            icon: <UserPlus className="size-6" />,
        },
        {
            number: 2,
            customerTitle: t("step_2_post_request"),
            customerDescription: t("step_2_post_request_desc"),
            providerTitle: t("step_2_setup_listing"),
            providerDescription: t("step_2_setup_listing_desc"),
            icon: <FileText className="size-6" />,
        },
        {
            number: 3,
            customerTitle: t("step_3_receive_quotes"),
            customerDescription: t("step_3_receive_quotes_desc"),
            providerTitle: t("step_3_send_quotes"),
            providerDescription: t("step_3_send_quotes_desc"),
            icon: <MessageSquareQuote className="size-6" />,
        },
        {
            number: 4,
            customerTitle: t("step_4_book_pay"),
            customerDescription: t("step_4_book_pay_desc"),
            providerTitle: t("step_4_get_booked_deliver"),
            providerDescription: t("step_4_get_booked_deliver_desc"),
            icon: <Calendar className="size-6" />,
        },
        {
            number: 5,
            customerTitle: t("step_5_leave_review"),
            customerDescription: t("step_5_leave_review_desc"),
            providerTitle: t("step_5_get_reviewed_grow"),
            providerDescription: t("step_5_get_reviewed_grow_desc"),
            icon: <Star className="size-6" />,
        },
    ];

    const isRTL = i18n.language === "ar";

    // Helper for flex direction and alignment
    const stepRowClass = isRTL
        ? "flex flex-row-reverse items-start gap-4 text-right"
        : "flex items-start gap-4";

    const numberClass = (color: "blue" | "purple") =>
        [
            "flex-shrink-0 size-12 rounded-full flex items-center justify-center font-bold text-xl",
            color === "blue"
                ? "bg-blue-100 dark:bg-blue-700 text-blue-600 dark:text-blue-300"
                : "bg-purple-100 dark:bg-purple-700 text-purple-600 dark:text-purple-300"
        ].join(" ");

    return (
        <section className="py-24 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-500">
            <div className="container mx-auto px-4">
                <AnimatedGroup>
                    <h2 className="text-4xl font-bold text-center mb-4">{t("how_it_works")}</h2>
                    <p className="text-xl text-gray-600 dark:text-gray-400 text-center max-w-3xl mx-auto mb-16">
                        {t("platform_easy_for_customers_providers")}
                    </p>
                </AnimatedGroup>

                <div className={`grid lg:grid-cols-2 gap-8 lg:gap-16${isRTL ? " lg:flex-row-reverse" : ""}`}>
                    {/* Customers Column */}
                    <div className="bg-blue-50 dark:bg-gray-800 p-8 rounded-2xl">
                        <h3 className="text-2xl font-bold text-blue-700 dark:text-blue-400 mb-8 text-center">{t("for_customers")}</h3>
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
                                    <div className={stepRowClass}>
                                        <div className={numberClass("blue")}>
                                            {step.number}
                                        </div>
                                        <div className="flex-1">
                                            <div className={`flex items-center gap-2 mb-1${isRTL ? " flex-row-reverse" : ""}`}>
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
                        <h3 className="text-2xl font-bold text-purple-700 dark:text-purple-400 mb-8 text-center">{t("for_providers")}</h3>
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
                                    <div className={stepRowClass}>
                                        <div className={numberClass("purple")}>
                                            {step.number}
                                        </div>
                                        <div className="flex-1">
                                            <div className={`flex items-center gap-2 mb-1${isRTL ? " flex-row-reverse" : ""}`}>
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
