import React from 'react';

const stats = [
  { value: '500+', label: 'Cities Covered' },
  { value: '1M+', label: 'Packages Delivered' },
  { value: '98.7%', label: 'On-Time Delivery' },
  { value: '50+', label: 'Countries Served' },
];

const StatsSection = () => {
  return (
    <section className="relative overflow-hidden bg-brand-dark py-16">
      {/* subtle accent glow */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-mid/30 blur-3xl" />
      <div className="pointer-events-none absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-brand-mid/20 blur-3xl" />

      <div className="relative logistics-container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-10 divide-y divide-white/10 md:divide-y-0 md:divide-x">
          {stats.map(({ value, label }) => (
            <div key={label} className="px-4 text-center">
              <div className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                {value}
              </div>
              <div className="mx-auto mt-3 h-0.5 w-8 rounded-full bg-brand-yellow" />
              <div className="mt-3 text-sm font-medium uppercase tracking-wide text-blue-100/80">
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
