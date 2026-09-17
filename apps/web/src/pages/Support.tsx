
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Search, Phone, Mail, MessageSquare } from 'lucide-react';

const Support = () => {
  return (
    <MainLayout>
      <section className="py-10 bg-gray-50">
        <div className="logistics-container">
          <h1 className="page-header">Customer Support</h1>
          
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-2/3 space-y-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <div className="max-w-2xl mx-auto">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">How can we help you?</h2>
                  <div className="relative">
                    <Input
                      type="search"
                      placeholder="Search for answers..."
                      className="pl-10 py-6 text-lg"
                    />
                    <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  </div>
                  <div className="mt-4 text-sm text-gray-600">
                    Popular searches: 
                    <button className="ml-2 text-brand hover:underline">tracking issues</button>,
                    <button className="ml-2 text-brand hover:underline">delivery delays</button>,
                    <button className="ml-2 text-brand hover:underline">damaged package</button>
                  </div>
                </div>
              </div>
              
              <div>
                <h2 className="section-header">Frequently Asked Questions</h2>
                <Accordion type="single" collapsible className="bg-white rounded-lg shadow-sm border border-gray-100">
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="px-6 py-4 hover:bg-gray-50">
                      How do I track my package?
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-4">
                      <p className="text-gray-600">
                        You can track your package by entering your tracking number on our tracking page. 
                        The tracking number can be found in your shipping confirmation email or receipt. 
                        Alternatively, you can use our mobile app to scan the QR code on your receipt for instant tracking.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-2">
                    <AccordionTrigger className="px-6 py-4 hover:bg-gray-50">
                      What should I do if my package is delayed?
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-4">
                      <p className="text-gray-600">
                        If your package is delayed, first check the tracking information for any status updates. 
                        Weather conditions, customs clearance, or high shipping volumes can cause delays. 
                        If the delay exceeds our service commitment, please contact our customer support team for assistance.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-3">
                    <AccordionTrigger className="px-6 py-4 hover:bg-gray-50">
                      How do I schedule a package pickup?
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-4">
                      <p className="text-gray-600">
                        You can schedule a package pickup through your account dashboard or by calling our customer service. 
                        For business accounts, we offer regular scheduled pickups. Please ensure all packages are properly 
                        labeled and ready for collection at the designated time.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-4">
                    <AccordionTrigger className="px-6 py-4 hover:bg-gray-50">
                      What shipping options do you offer?
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-4">
                      <p className="text-gray-600">
                        We offer several shipping options including Express (1-2 days), Priority (2-3 days), 
                        Standard (3-5 days), and Economy (5-7 days). International shipping timeframes vary by destination. 
                        Use our rate calculator to compare prices and delivery times for each service.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-5">
                    <AccordionTrigger className="px-6 py-4 hover:bg-gray-50">
                      How do I file a claim for a damaged package?
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-4">
                      <p className="text-gray-600">
                        If your package arrived damaged, please keep all original packaging materials and take photos of 
                        the damage. Visit our claims portal or contact customer service within 7 days of delivery to file 
                        a claim. Having shipping insurance expedites the claims process.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
            
            <div className="lg:w-1/3 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Us</CardTitle>
                  <CardDescription>
                    Our support team is here to help you
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start">
                    <Phone className="h-5 w-5 text-brand mt-1 mr-3" />
                    <div>
                      <p className="font-medium">Phone Support</p>
                      <p className="text-gray-600">+1 (800) 123-4567</p>
                      <p className="text-sm text-gray-500">Mon-Fri: 8AM-8PM, Sat: 9AM-5PM</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 text-brand mt-1 mr-3" />
                    <div>
                      <p className="font-medium">Email Support</p>
                      <p className="text-gray-600">support@woriyaexpress.com</p>
                      <p className="text-sm text-gray-500">Response within 24 hours</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <MessageSquare className="h-5 w-5 text-brand mt-1 mr-3" />
                    <div>
                      <p className="font-medium">Live Chat</p>
                      <p className="text-gray-600">Available on our website</p>
                      <p className="text-sm text-gray-500">7 days a week: 8AM-10PM</p>
                    </div>
                  </div>
                  
                  <Button className="w-full bg-brand hover:bg-brand-600 mt-2">
                    Start Live Chat
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Request a Callback</CardTitle>
                  <CardDescription>
                    We'll call you back at your preferred time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Your Name
                      </label>
                      <Input id="name" placeholder="John Smith" />
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <Input id="phone" placeholder="(123) 456-7890" />
                    </div>
                    
                    <div>
                      <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                        Preferred Time
                      </label>
                      <select
                        id="time"
                        className="block w-full rounded-md border border-gray-300 p-2.5 text-gray-900 shadow-sm focus:border-brand focus:ring focus:ring-brand focus:ring-opacity-50"
                      >
                        <option>Morning (9AM - 12PM)</option>
                        <option>Afternoon (12PM - 4PM)</option>
                        <option>Evening (4PM - 7PM)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                        Reason for Contact
                      </label>
                      <select
                        id="reason"
                        className="block w-full rounded-md border border-gray-300 p-2.5 text-gray-900 shadow-sm focus:border-brand focus:ring focus:ring-brand focus:ring-opacity-50"
                      >
                        <option>Tracking Issue</option>
                        <option>Delivery Problem</option>
                        <option>Billing Question</option>
                        <option>Claims & Refunds</option>
                        <option>Other</option>
                      </select>
                    </div>
                    
                    <Button type="submit" className="w-full bg-brand hover:bg-brand-600">
                      Request Callback
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Support;
