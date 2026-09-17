
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';

const CTASection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="logistics-container">
        <div className="relative overflow-hidden rounded-3xl bg-brand px-6 py-14 md:px-14 md:py-16">
          {/* accent glows */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand-mid/40 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-brand-yellow/10 blur-3xl" />

          <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left md:max-w-xl">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-balance">
                Ready to ship with confidence?
              </h2>
              <p className="text-blue-100/90 text-lg text-pretty">
                Join thousands of satisfied customers who trust WORIYA EXPRESS for their logistics needs. Sign up now and experience the difference.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link to="/register">
                <Button size="lg" className="w-full bg-brand-yellow text-[#0F172A] hover:bg-yellow-dark font-semibold shadow-lg shadow-black/20">
                  Sign Up Now
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="w-full border-white/40 bg-white/5 text-white hover:bg-white/15 hover:text-white backdrop-blur">
                  Contact Sales
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
