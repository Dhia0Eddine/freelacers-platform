import React from 'react';
import ScrollStack, { ScrollStackItem } from '@/blocks/Components/ScrollStack/ScrollStack';

export default function Content6() {
    return (
      <div className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">Our Solutions</h2>
          
          <ScrollStack 
            itemDistance={150}
            itemScale={0.05}
            itemStackDistance={15}
            rotationAmount={1} 
            blurAmount={0.5}
            className="max-w-4xl mx-auto px-4"
          >
            <ScrollStackItem itemClassName="bg-blue-50 dark:bg-blue-900 text-blue-900 dark:text-blue-50">
              <h2 className="text-2xl font-bold mb-4">AI-Powered Automation</h2>
              <p className="text-lg">Streamline your workflows with intelligent automation that learns and adapts to your business needs.</p>
            </ScrollStackItem>
            
            <ScrollStackItem itemClassName="bg-purple-50 dark:bg-purple-900 text-purple-900 dark:text-purple-50">
              <h2 className="text-2xl font-bold mb-4">Data Analytics Platform</h2>
              <p className="text-lg">Transform raw data into actionable insights with our comprehensive analytics tools.</p>
            </ScrollStackItem>
            
            <ScrollStackItem itemClassName="bg-green-50 dark:bg-green-900 text-green-900 dark:text-green-50">
              <h2 className="text-2xl font-bold mb-4">Customer Engagement Suite</h2>
              <p className="text-lg">Build stronger relationships with your customers through personalized experiences and communication.</p>
            </ScrollStackItem>
            
            <ScrollStackItem itemClassName="bg-amber-50 dark:bg-amber-900 text-amber-900 dark:text-amber-50">
              <h2 className="text-2xl font-bold mb-4">Cloud Infrastructure</h2>
              <p className="text-lg">Scalable, secure, and reliable cloud solutions designed for enterprise needs.</p>
            </ScrollStackItem>
            
            <ScrollStackItem itemClassName="bg-red-50 dark:bg-red-900 text-red-900 dark:text-red-50">
              <h2 className="text-2xl font-bold mb-4">Security & Compliance</h2>
              <p className="text-lg">Protect your business with enterprise-grade security and regulatory compliance tools.</p>
            </ScrollStackItem>
          </ScrollStack>
        </div>
      </div>
    );
}