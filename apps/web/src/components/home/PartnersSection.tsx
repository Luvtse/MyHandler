
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
    <section className="py-16 bg-white border-y border-gray-100">
      <div className="logistics-container">
        <p className="text-center text-sm font-semibold uppercase tracking-widest text-gray-400 mb-10">
          Trusted by leading companies around the world
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 items-center justify-items-center">
          {partners.map((partner) => (
            <div
              key={partner.name}
              className="flex h-14 w-full items-center justify-center rounded-xl border border-transparent transition-colors hover:border-gray-100 hover:bg-gray-50"
            >
              <span className="text-lg font-bold tracking-tight text-gray-400 grayscale transition-all hover:text-brand hover:grayscale-0">
                {partner.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
