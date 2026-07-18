import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Target, History } from 'lucide-react';
import { Link } from 'react-router-dom';
import TeamSection from '@/components/about/TeamSection';
import ValuesSection from '@/components/about/ValuesSection';

const About = () => {
  return (
    <MainLayout>
      <div className="logistics-container py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">About GoodsHandler</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-gray-600 mb-8">
              GoodsHandler is a leading global provider of logistics and transportation solutions,
              committed to connecting businesses and people through innovative and sustainable delivery services.
            </p>

            <TeamSection />
            
            <ValuesSection />

            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <div className="flex items-start mb-6">
                <Target className="h-6 w-6 text-brand mr-4 mt-1" />
                <p className="text-gray-600">
                  To provide exceptional logistics services that empower businesses to thrive in the global marketplace,
                  while maintaining the highest standards of reliability, efficiency, and customer service.
                </p>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our History</h2>
              <div className="flex items-start">
                <History className="h-6 w-6 text-brand mr-4 mt-1" />
                <p className="text-gray-600">
                  Since our founding, we've grown from a small local courier service to a comprehensive
                  global logistics provider, serving thousands of customers worldwide.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/careers">
                <Button className="w-full sm:w-auto bg-brand hover:bg-brand-600">
                  Join Our Team
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" className="w-full sm:w-auto border-brand text-brand hover:bg-brand-50">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default About;