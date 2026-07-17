
import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { Link } from 'react-router-dom';
import { Package, LayoutDashboard, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/hooks';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { user, isRole } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="fixed bottom-8 right-8 z-0 pointer-events-none">
        <div className="flex flex-col gap-2">
          {user && isRole('admin') && (
            <Link to="/dashboard">
              <Button className="rounded-full w-14 h-14 shadow-lg flex items-center justify-center bg-secondary hover:bg-secondary/90 pointer-events-auto">
                <LayoutDashboard className="h-6 w-6" />
              </Button>
            </Link>
          )}
          <Link to="/create-shipment">
            <Button className="rounded-full w-14 h-14 shadow-lg flex items-center justify-center pointer-events-auto">
              <Package className="h-6 w-6" />
            </Button>
          </Link>
          <Link to="/schedule-pickup">
            <Button className="rounded-full w-14 h-14 shadow-lg flex items-center justify-center bg-brand hover:bg-brand/90 pointer-events-auto">
              <Truck className="h-6 w-6" />
            </Button>
          </Link>
        </div>
      </div>
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
