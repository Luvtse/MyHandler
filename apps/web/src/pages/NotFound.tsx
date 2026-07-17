
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';

const NotFound = () => {
  return (
    <MainLayout>
      <div className="min-h-[calc(100vh-300px)] flex items-center justify-center py-12 bg-gray-50">
        <div className="max-w-md mx-auto text-center px-4">
          <Package className="h-16 w-16 text-brand mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-xl text-gray-700 mb-2">Page not found</p>
          <p className="text-gray-600 mb-8">
            The page you were looking for doesn't exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/">
              <Button className="w-full bg-brand hover:bg-brand-600">
                Go back home
              </Button>
            </Link>
            <Link to="/support">
              <Button variant="outline" className="w-full border-brand text-brand hover:bg-brand-50">
                Contact support
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default NotFound;
