import React from 'react';
import { UserPlus, FileText, MessageSquareQuote, Calendar, Star } from 'lucide-react';
import { AnimatedGroup } from '@/components/ui/animated-group';
import { useTranslation } from "react-i18next";

// Helper for step number styling
function numberClass(color: "blue" | "purple") {
  return `flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg mr-4 ${color === "blue"
    ? "bg-blue-600 text-white"
    : "bg-purple-600 text-white"
  }`;
}

// Helper for step row styling
const stepRowClass = "flex items-start gap-4";

// Steps data
const steps = [
  {
    number: 1,
    customerTitle: "step_1_create_account",
    customerDescription: "step_1_create_account_desc",
    providerTitle: "step_1_provider_create_account",
    providerDescription: "step_1_provider_create_account_desc",
    icon: <UserPlus className="h-6 w-6" />
  },
  {
    number: 2,
    customerTitle: "step_2_post_request",
    customerDescription: "step_2_post_request_desc",
    providerTitle: "step_2_setup_listing",
    providerDescription: "step_2_setup_listing_desc",
    icon: <FileText className="h-6 w-6" />
  },
  {
    number: 3,
    customerTitle: "step_3_receive_quotes",
    customerDescription: "step_3_receive_quotes_desc",
    providerTitle: "step_3_send_quotes",
    providerDescription: "step_3_send_quotes_desc",
    icon: <MessageSquareQuote className="h-6 w-6" />
  },
  {
    number: 4,
    customerTitle: "step_4_book_pay",
    customerDescription: "step_4_book_pay_desc",
    providerTitle: "step_4_get_booked_deliver",
    providerDescription: "step_4_get_booked_deliver_desc",
    icon: <Calendar className="h-6 w-6" />
  },
  {
    number: 5,
    customerTitle: "step_5_leave_review",
    customerDescription: "step_5_leave_review_desc",
    providerTitle: "step_5_get_reviewed_grow",
    providerDescription: "step_5_get_reviewed_grow_desc",
    icon: <Star className="h-6 w-6" />
  }
];

export default function HowItWorksSection() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  return (
    <section
      className="py-24 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-500"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="container mx-auto px-4">
        <AnimatedGroup>
          <h2 className="text-4xl font-bold text-center mb-4">{t("how_it_works")}</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 text-center max-w-3xl mx-auto mb-16">
            {t("platform_easy_for_customers_providers")}
          </p>
        </AnimatedGroup>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
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
                        <h4 className="font-semibold text-lg">{t(step.customerTitle)}</h4>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300">{t(step.customerDescription)}</p>
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
                        <h4 className="font-semibold text-lg">{t(step.providerTitle)}</h4>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300">{t(step.providerDescription)}</p>
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