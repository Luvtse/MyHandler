import React from 'react';
import { MapPin, Package, Shield, Clock } from 'lucide-react';

const features = [
  {
    icon: MapPin,
    title: 'Real-time Tracking',
    description: 'Monitor your shipments in real-time with accurate GPS tracking and status updates.',
  },
  {
    icon: Package,
    title: 'Global Network',
    description: 'Our extensive network ensures your packages reach virtually any destination worldwide.',
  },
  {
    icon: Shield,
    title: 'Secure Handling',
    description: 'Advanced security measures protect your packages throughout the entire journey.',
  },
  {
    icon: Clock,
    title: 'Reliable Service',
    description: 'Count on our proven track record for consistent, on-time delivery performance.',
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="logistics-container">
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <span className="badge-blue mb-4 inline-block">Why GoodsHandler</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-balance">
            Logistics built on speed, trust, and precision
          </h2>
          <p className="text-gray-500 mt-4 text-lg text-pretty">
            We combine cutting-edge technology with exceptional service to provide the best logistics experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group relative rounded-2xl border border-gray-100 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-100 hover:shadow-xl hover:shadow-brand/5"
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-brand-50 transition-colors group-hover:bg-brand group-hover:text-white">
                <Icon className="h-7 w-7 text-brand transition-colors group-hover:text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-500 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
