
import React from 'react';
import { Package, Truck, Globe, Calendar, ShieldCheck, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
}

const ServiceCard = ({ icon, title, description, link }: ServiceCardProps) => {
  return (
    <Link
      to={link}
      className="group relative flex flex-col h-full overflow-hidden rounded-2xl border border-gray-100 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-100 hover:shadow-xl hover:shadow-brand/5"
    >
      <span className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-brand-yellow transition-transform duration-300 group-hover:scale-x-100" />
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-brand-50 transition-colors group-hover:bg-brand">
        <span className="text-brand transition-colors group-hover:[&_svg]:text-white">{icon}</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-5 flex-grow leading-relaxed">{description}</p>
      <span className="inline-flex items-center font-medium text-brand">
        Learn more
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 transition-transform duration-200 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </span>
    </Link>
  );
};

const ServicesSection = () => {
  return (
    <section className="py-20 bg-muted">
      <div className="logistics-container">
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <span className="badge-yellow mb-4 inline-block">Our Services</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-balance">
            Solutions for every shipment
          </h2>
          <p className="text-gray-500 mt-4 text-lg text-pretty">
            From Express Delivery to International Shipping, we provide reliable logistics solutions tailored to your needs.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <ServiceCard 
            icon={<Package className="h-6 w-6 text-brand" />}
            title="Express Delivery"
            description="Same-day and next-day delivery options for urgent shipments when time is of the essence."
            link="/express-delivery"
          />
          <ServiceCard 
            icon={<Truck className="h-6 w-6 text-brand" />}
            title="Standard Shipping"
            description="Cost-effective shipping solutions with reliable delivery timeframes for regular shipments."
            link="/standard-shipping"
          />
          <ServiceCard 
            icon={<Globe className="h-6 w-6 text-brand" />}
            title="International Shipping"
            description="Global reach with customs handling and international logistics expertise for worldwide delivery."
            link="/international"
          />
          <ServiceCard 
            icon={<ShieldCheck className="h-6 w-6 text-brand" />}
            title="Secure Shipping"
            description="Enhanced security measures for high-value items and sensitive documents."
            link="/secure-shipping"
          />
          <ServiceCard 
            icon={<Clock className="h-6 w-6 text-brand" />}
            title="Time-Definite Delivery"
            description="Guaranteed delivery by a specific time to meet your scheduling requirements."
            link="/time-definite"
          />
          <ServiceCard 
            icon={<Calendar className="h-6 w-6 text-brand" />}
            title="Scheduled Pickup"
            description="Regular scheduled pickups for businesses with consistent shipping needs."
            link="/scheduled-pickup"
          />
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
