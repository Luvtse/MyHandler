
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
    <div className="card-logistics p-6 flex flex-col h-full">
      <div className="bg-brand-50 rounded-full w-14 h-14 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4 flex-grow">{description}</p>
      <Link to={link} className="text-brand hover:text-brand-700 font-medium inline-flex items-center">
        Learn more
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
};

const ServicesSection = () => {
  return (
    <section className="py-16 bg-white">
      <div className="logistics-container">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900">Our Services</h2>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
            From Express Delivery to International Shipping, we provide reliable logistics solutions tailored to your needs.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
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
