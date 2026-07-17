import React from 'react';
import { Shield, Heart, Globe, Zap, Award, Users } from 'lucide-react';

interface Value {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const values: Value[] = [
  {
    title: 'Integrity',
    description: 'We conduct our business with the highest ethical standards, ensuring transparency and trust in all our operations.',
    icon: <Shield className="h-8 w-8 text-brand" />
  },
  {
    title: 'Customer Focus',
    description: 'Our customers are at the heart of everything we do. We strive to exceed their expectations and deliver exceptional service.',
    icon: <Heart className="h-8 w-8 text-brand" />
  },
  {
    title: 'Sustainability',
    description: 'We are committed to environmentally responsible practices and reducing our carbon footprint across our operations.',
    icon: <Globe className="h-8 w-8 text-brand" />
  },
  {
    title: 'Innovation',
    description: 'We continuously invest in technology and new solutions to improve our services and operational efficiency.',
    icon: <Zap className="h-8 w-8 text-brand" />
  },
  {
    title: 'Excellence',
    description: 'We pursue excellence in every aspect of our business, from delivery accuracy to customer support.',
    icon: <Award className="h-8 w-8 text-brand" />
  },
  {
    title: 'Teamwork',
    description: 'We foster a collaborative environment where diverse perspectives and talents come together to achieve common goals.',
    icon: <Users className="h-8 w-8 text-brand" />
  }
];

const ValuesSection = () => {
  return (
    <div className="py-12">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Our Values</h2>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {values.map((value, index) => (
          <div key={index} className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              {value.icon}
              <h3 className="text-xl font-semibold text-gray-900 ml-3">{value.title}</h3>
            </div>
            <p className="text-gray-600">{value.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ValuesSection;