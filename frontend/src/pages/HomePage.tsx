import React from 'react';
import HeroSection from "@/components/hero-section";
import Example from "@/components/features-section";
import HowItWorksSection from "@/components/how-it-works";
import CTASection from "@/components/cta-section";
import FAQSection from "@/components/faq-section";

export default function HomePage() {
    React.useEffect(() => {
        console.log("HomePage mounted");
    }, []);

    return (
        <>
            <HeroSection />
            <Example />
            <HowItWorksSection />
            <FAQSection />
            <CTASection />
            {/* You can add more sections or components here as needed */}
        </>
    );
}

