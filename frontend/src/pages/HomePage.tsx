import React from 'react';
import HeroSection from "@/components/hero-section";
import Example from "@/components/features-section";
import HowItWorksSection from "@/components/how-it-works";
import CTASection from "@/components/cta-section";
import FAQSection from "@/components/faq-section";
import { useTranslation } from "react-i18next";

export default function HomePage() {
    const { t } = useTranslation();

    React.useEffect(() => {
        console.log("HomePage mounted");
    }, []);

    return (
        <>
            {/* Pass t to sections if they need translation */}
            <HeroSection t={t} />
            <Example t={t} />
            <HowItWorksSection />
            <FAQSection t={t} />
            <CTASection t={t} />
            {/* You can add more sections or components here as needed */}
        </>
    );
}

