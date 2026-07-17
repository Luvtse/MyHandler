import React from 'react';
import { LinkedinIcon, TwitterIcon } from 'lucide-react';

interface TeamMember {
  name: string;
  role: string;
  image: string;
  bio: string;
  linkedin?: string;
  twitter?: string;
}

const teamMembers: TeamMember[] = [
  {
    name: 'Sarah Chen',
    role: 'Chief Executive Officer',
    image: '/team/ceo.jpg',
    bio: 'With over 20 years of experience in logistics and supply chain management, Sarah leads our global operations with a focus on innovation and sustainability.',
    linkedin: 'https://linkedin.com/in/sarahchen',
    twitter: 'https://twitter.com/sarahchen'
  },
  {
    name: 'Michael Rodriguez',
    role: 'Chief Operations Officer',
    image: '/team/coo.jpg',
    bio: 'Michael oversees our day-to-day operations, ensuring efficient delivery networks and customer satisfaction across all regions.',
    linkedin: 'https://linkedin.com/in/michaelrodriguez'
  },
  {
    name: 'David Kim',
    role: 'Chief Technology Officer',
    image: '/team/cto.jpg',
    bio: 'David leads our technology initiatives, driving digital transformation and implementing cutting-edge solutions for logistics management.',
    linkedin: 'https://linkedin.com/in/davidkim',
    twitter: 'https://twitter.com/davidkim'
  },
  {
    name: 'Emily Thompson',
    role: 'VP of Customer Success',
    image: '/team/vp-cs.jpg',
    bio: 'Emily ensures our customers receive exceptional service and support, leading our customer success initiatives worldwide.',
    linkedin: 'https://linkedin.com/in/emilythompson'
  }
];

const TeamSection = () => {
  return (
    <div className="py-12">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Leadership Team</h2>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {teamMembers.map((member, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="aspect-w-1 aspect-h-1">
              <img
                src={member.image}
                alt={member.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
              <p className="text-brand font-medium mb-3">{member.role}</p>
              <p className="text-gray-600 text-sm mb-4">{member.bio}</p>
              
              <div className="flex space-x-4">
                {member.linkedin && (
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-brand transition-colors"
                  >
                    <LinkedinIcon className="h-5 w-5" />
                  </a>
                )}
                {member.twitter && (
                  <a
                    href={member.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-brand transition-colors"
                  >
                    <TwitterIcon className="h-5 w-5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamSection;