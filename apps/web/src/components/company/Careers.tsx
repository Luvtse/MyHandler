import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Briefcase, Heart, Star, Truck, Users, Warehouse } from 'lucide-react';
import { Link } from 'react-router-dom';
import JobApplication from '@/components/careers/JobApplication';

interface JobPosition {
  title: string;
  department: string;
  location: string;
  type: string;
  icon: React.ReactNode;
}

const jobPositions: JobPosition[] = [
  {
    title: 'Logistics Coordinator',
    department: 'Operations',
    location: 'New York, NY',
    type: 'Full-time',
    icon: <Truck className="h-6 w-6 text-brand" />
  },
  {
    title: 'Warehouse Manager',
    department: 'Warehouse',
    location: 'Los Angeles, CA',
    type: 'Full-time',
    icon: <Warehouse className="h-6 w-6 text-brand" />
  },
  {
    title: 'Customer Service Representative',
    department: 'Customer Support',
    location: 'Remote',
    type: 'Full-time',
    icon: <Heart className="h-6 w-6 text-brand" />
  },
];

const Careers = () => {
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  return (
    <MainLayout>
      <div className="logistics-container py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Join Our Team</h1>
          
          <div className="prose prose-lg max-w-none mb-12">
            <p className="text-xl text-gray-600">
              Be part of a dynamic team that's revolutionizing the logistics industry.
              We offer exciting opportunities for growth and development in a fast-paced environment.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-lg p-6 shadow-md text-center">
              <Star className="h-8 w-8 text-brand mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Competitive Benefits</h3>
              <p className="text-gray-600">Comprehensive healthcare, 401(k) matching, and paid time off</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md text-center">
              <Users className="h-8 w-8 text-brand mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Inclusive Culture</h3>
              <p className="text-gray-600">Diverse and welcoming workplace where everyone can thrive</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md text-center">
              <Briefcase className="h-8 w-8 text-brand mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Career Growth</h3>
              <p className="text-gray-600">Professional development and advancement opportunities</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">Open Positions</h2>
          
          <div className="space-y-4 mb-8">
            {jobPositions.map((position, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-start">
                  <div className="mr-4">{position.icon}</div>
                  <div className="flex-grow">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{position.title}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span>{position.department}</span>
                      <span>•</span>
                      <span>{position.location}</span>
                      <span>•</span>
                      <span>{position.type}</span>
                    </div>
                  </div>
                  <Button 
                    className="bg-brand hover:bg-brand-600"
                    onClick={() => setSelectedJob(position.title)}
                  >
                    Apply Now
                  </Button>
                  {selectedJob === position.title && (
                    <JobApplication 
                      jobTitle={position.title} 
                      onClose={() => setSelectedJob(null)} 
                    />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Don't see the right position?</h3>
            <p className="text-gray-600 mb-6">
              We're always looking for talented individuals to join our team.
              Send us your resume and we'll keep you in mind for future opportunities.
            </p>
            <Button variant="outline" className="border-brand text-brand hover:bg-brand-50">
              Submit General Application
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Careers;