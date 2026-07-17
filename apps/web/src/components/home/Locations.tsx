
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Search, MapPin, Phone, Clock } from 'lucide-react';

interface Location {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  hours: string;
  services: string[];
  distance?: number;
}

const locationsData: Location[] = [
  {
    id: 1,
    name: "Headquarter",
    address: "Togo St",
    city: "Addis Ababa",
    state: "Addis Ababa",
    zip: "00000",
    phone: "(251) 970-025-656",
    hours: "Mon-Fri: 8:30AM-7PM, Sat: 8:30AM-7PM, Sun: 8:30AM-12:30PM",
    services: ["Package Drop-off", "Package Pick-up", "Express Services", "Packaging Supplies"]
  },
  {
    id: 2,
    name: "Brooklyn Shipping Hub",
    address: "456 Logistics Ave",
    city: "Brooklyn",
    state: "NY",
    zip: "11201",
    phone: "(718) 555-6789",
    hours: "Mon-Fri: 8AM-8PM, Sat-Sun: 10AM-4PM",
    services: ["Package Drop-off", "Package Pick-up", "International Shipping", "Customs Services"]
  },
  {
    id: 3,
    name: "Queens Distribution Center",
    address: "789 Express Way",
    city: "Queens",
    state: "NY",
    zip: "11101",
    phone: "(718) 555-9012",
    hours: "Mon-Fri: 7AM-9PM, Sat: 8AM-6PM",
    services: ["Package Drop-off", "Package Pick-up", "Freight Services", "Warehousing"]
  },
  {
    id: 4,
    name: "Bronx Delivery Station",
    address: "321 Shipping Rd",
    city: "Bronx",
    state: "NY",
    zip: "10451",
    phone: "(718) 555-3456",
    hours: "Mon-Fri: 8AM-7PM, Sat: 9AM-3PM",
    services: ["Package Drop-off", "Package Pick-up", "Express Services"]
  },
  {
    id: 5,
    name: "Staten Island Service Point",
    address: "555 Courier Blvd",
    city: "Staten Island",
    state: "NY",
    zip: "10301",
    phone: "(718) 555-7890",
    hours: "Mon-Fri: 9AM-6PM, Sat: 10AM-4PM",
    services: ["Package Drop-off", "Package Pick-up", "Retail Services"]
  }
];

const LocationCard = ({ location }: { location: Location }) => {
  return (
    <Card className="h-full">
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{location.name}</h3>
        
        <div className="space-y-3 mt-4">
          <div className="flex items-start">
            <MapPin className="h-5 w-5 text-brand mt-0.5 mr-2 flex-shrink-0" />
            <span className="text-gray-600">
              {location.address}, {location.city}, {location.state} {location.zip}
              {location.distance && (
                <span className="block text-sm text-brand font-medium mt-1">
                  {location.distance} miles away
                </span>
              )}
            </span>
          </div>
          
          <div className="flex items-start">
            <Phone className="h-5 w-5 text-brand mt-0.5 mr-2 flex-shrink-0" />
            <span className="text-gray-600">{location.phone}</span>
          </div>
          
          <div className="flex items-start">
            <Clock className="h-5 w-5 text-brand mt-0.5 mr-2 flex-shrink-0" />
            <span className="text-gray-600">{location.hours}</span>
          </div>
        </div>
        
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-900 mb-2">Services:</p>
          <div className="flex flex-wrap gap-2">
            {location.services.map((service, index) => (
              <span key={index} className="bg-brand-50 text-brand text-xs px-2 py-1 rounded-full">
                {service}
              </span>
            ))}
          </div>
        </div>
        
        <div className="mt-5 flex space-x-3">
          <Button variant="outline" size="sm" className="border-brand text-brand hover:bg-brand-50">
            Get Directions
          </Button>
          <Button size="sm" className="bg-brand hover:bg-brand-600">
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const Locations = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for locations near:", searchQuery);
    // In a real app, this would filter locations or fetch from an API
  };
  
  return (
    <MainLayout>
      <section className="py-10 bg-gray-50">
        <div className="logistics-container">
          <h1 className="page-header">Locations & Service Centers</h1>
          
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="max-w-2xl mx-auto">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Find a Location Near You</h2>
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Enter ZIP code or city"
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Showing all available locations
                    </span>
                    <Button type="submit" className="bg-brand hover:bg-brand-600">
                      Search
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {locationsData.map((location) => (
              <LocationCard key={location.id} location={location} />
            ))}
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Locations;
