
import React from 'react';

const StatsSection = () => {
  return (
    <section className="py-12 bg-brand">
      <div className="logistics-container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-4">
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">500+</div>
            <div className="text-brand-100">Cities Covered</div>
          </div>
          
          <div className="p-4">
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">1M+</div>
            <div className="text-brand-100">Packages Delivered</div>
          </div>
          
          <div className="p-4">
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">98.7%</div>
            <div className="text-brand-100">On-Time Delivery</div>
          </div>
          
          <div className="p-4">
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">50+</div>
            <div className="text-brand-100">Countries Served</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
