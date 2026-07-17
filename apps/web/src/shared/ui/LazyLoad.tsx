import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

interface LazyLoadProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const DefaultLoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

export const LazyLoad: React.FC<LazyLoadProps> = ({
  children,
  fallback = <DefaultLoadingSpinner />
}) => {
  return <Suspense fallback={fallback}>{children}</Suspense>;
};

type LazyComponentProps<P> = {
  factory: () => Promise<{ default: React.ComponentType<P> }>;
  props: P;
  fallback?: React.ReactNode;
};

export function LazyComponent<P extends Record<string, unknown>>({ 
  factory, 
  props, 
  fallback = <DefaultLoadingSpinner />
}: LazyComponentProps<P>) {
  const Component = React.lazy(factory);
  const SafeComponent = Component as React.ComponentType<P>;
  
  return (
    <LazyLoad fallback={fallback}>
      <SafeComponent {...props} />
    </LazyLoad>
  );
}
