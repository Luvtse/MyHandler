
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';

const CTASection = () => {
  return (
    <section className="py-16 bg-white">
      <div className="logistics-container">
        <div className="bg-gradient-to-r from-brand to-brand-700 rounded-2xl py-12 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between">
          <div className="mb-6 md:mb-0 text-center md:text-left md:max-w-xl">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to ship with confidence?</h2>
            <p className="text-white text-opacity-90 text-lg">
              Join thousands of satisfied customers who trust AHUNUNU for their logistics needs. Sign up now and experience the difference.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/register">
              <Button size="lg" className="bg-white text-brand hover:bg-gray-100">
                Sign Up Now
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-brand-600">
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
