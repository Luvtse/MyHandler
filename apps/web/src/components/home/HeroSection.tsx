import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Search, Package, Truck, ShieldCheck, Clock, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-brand-dark">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="/images/hero-logistics.png"
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0C1D4A]/95 via-[#122B6E]/85 to-[#1A3C8F]/55" />
      </div>

      <div className="relative logistics-container py-20 md:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-7 text-white">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white ring-1 ring-inset ring-white/20 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-brand-yellow animate-pulse-yellow" />
              Trusted logistics &amp; express delivery
            </span>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.08] tracking-tight text-balance">
              Move goods faster with{' '}
              <span className="text-brand-yellow">GoodsHandler</span>
            </h1>

            <p className="text-lg md:text-xl text-blue-100/90 max-w-xl text-pretty leading-relaxed">
              Fast. Reliable. Affordable. From your doorstep to anywhere in the world, we deliver your packages safely and on time, every time.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/create-shipment" className="w-full sm:w-auto">
                <Button className="w-full bg-brand-yellow text-[#0F172A] hover:bg-yellow-dark font-semibold text-base py-6 px-7 shadow-lg shadow-black/20">
                  <Package className="mr-2 h-5 w-5" />
                  Create Shipment
                </Button>
              </Link>
              <Link to="/schedule-pickup" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full border-white/40 bg-white/5 text-white hover:bg-white/15 hover:text-white text-base py-6 px-7 backdrop-blur">
                  <Truck className="mr-2 h-5 w-5" />
                  Schedule Pickup
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 pt-4 text-sm text-blue-100/90">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-brand-yellow" />
                Secure handling
              </span>
              <span className="inline-flex items-center gap-2">
                <Clock className="h-5 w-5 text-brand-yellow" />
                98.7% on-time
              </span>
              <span className="inline-flex items-center gap-2">
                <Globe className="h-5 w-5 text-brand-yellow" />
                50+ countries
              </span>
            </div>
          </div>

          {/* Tracking card */}
          <div className="lg:justify-self-end w-full max-w-md">
            <div className="rounded-2xl bg-white shadow-2xl shadow-black/25 p-7 ring-1 ring-black/5">
              <div className="mb-5">
                <span className="badge-yellow mb-3 inline-block">Real-time tracking</span>
                <h2 className="text-2xl font-bold text-gray-900">Track Your Shipment</h2>
                <p className="text-gray-500 mt-1">Enter your tracking number to get the latest status.</p>
              </div>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="e.g. GH123456789"
                    className="h-12 pl-10 border-gray-200 focus-visible:ring-brand focus-visible:border-brand font-mono"
                  />
                </div>
                <Link to="/tracking">
                  <Button className="w-full h-12 bg-brand hover:bg-brand-600 text-base font-semibold">
                    <Search className="mr-2 h-5 w-5" />
                    Track Now
                  </Button>
                </Link>
                <p className="text-center text-xs text-gray-400">
                  Need help?{' '}
                  <Link to="/support" className="text-brand font-medium hover:underline">
                    Contact support
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
