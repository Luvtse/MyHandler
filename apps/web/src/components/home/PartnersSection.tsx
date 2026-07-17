
import React from 'react';

const PartnersSection = () => {
  // Sample partner logos - in a real app, you'd use actual images
  const partners = [
    { name: 'Amazon', logo: 'amazon.svg' },
    { name: 'DHL', logo: 'dhl.svg' },
    { name: 'FedEx', logo: 'fedex.svg' },
    { name: 'UPS', logo: 'ups.svg' },
    { name: 'Maersk', logo: 'maersk.svg' },
    { name: 'Alibaba', logo: 'alibaba.svg' }
  ];

  return (
    <section className="py-12 bg-white">
      <div className="logistics-container">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900">With Us</h2>
          <p className="mt-4 text-lg text-gray-600">
            Trusted by leading companies around the world
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center justify-items-center">
          {partners.map((partner) => (
            <div key={partner.name} className="flex items-center justify-center h-16">
              {/* In a real app, replace with actual logo images */}
              <div className="bg-gray-100 rounded-lg px-6 py-3 flex items-center justify-center min-w-32">
                <span className="text-gray-600 font-semibold">{partner.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
