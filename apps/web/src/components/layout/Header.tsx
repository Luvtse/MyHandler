
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {
  Package,
  Search,
  Menu,
  X,
  User,
  Clock,
  MapPin,
  LogOut,
  Settings,
  UserCircle,
  Truck,
  ShieldCheck
} from "lucide-react";
import { useAuth } from '@/features/auth/hooks';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NotificationCenter from '@/components/notifications/NotificationCenter';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getRoleIcon = () => {
    switch (user?.role) {
      case 'admin':
        return <ShieldCheck className="h-4 w-4 mr-2 text-red-500" />;
      case 'driver':
        return <Truck className="h-4 w-4 mr-2 text-blue-500" />;
      default:
        return <UserCircle className="h-4 w-4 mr-2 text-brand" />;
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="logistics-container">
        <div className="flex justify-between items-center py-2">
          <div className="flex items-center">
            <Link to="/">
              <img 
                src="/logo.png" 
                alt="AHUNUNU Logo" 
                className="h-16 w-auto" 
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/tracking" className="flex items-center text-gray-700 hover:text-brand transition-colors">
              <Search className="h-5 w-5 mr-1" />
              <span>Track</span>
            </Link>
            <Link to="/create-shipment" className="flex items-center text-gray-700 hover:text-brand transition-colors">
              <Package className="h-5 w-5 mr-1" />
              <span>Ship</span>
            </Link>
            <Link to="/schedule-pickup" className="flex items-center text-gray-700 hover:text-brand transition-colors">
              <Truck className="h-5 w-5 mr-1" />
              <span>Schedule Pickup</span>
            </Link>
            <Link to="/locations" className="flex items-center text-gray-700 hover:text-brand transition-colors">
              <MapPin className="h-5 w-5 mr-1" />
              <span>Locations</span>
            </Link>
            <Link to="/support" className="flex items-center text-gray-700 hover:text-brand transition-colors">
              <Clock className="h-5 w-5 mr-1" />
              <span>Support</span>
            </Link>
          </nav>

          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <>
                <NotificationCenter />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center">
                    {getRoleIcon()}
                    {user.name.split(' ')[0]}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>{user.name}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                      <span className="text-xs font-medium mt-1 capitalize bg-gray-100 px-2 py-0.5 rounded-full w-fit">{user.role}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                    <UserCircle className="h-4 w-4 mr-2" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm" className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="bg-brand hover:bg-brand-600">Register</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 animate-fade-in">
            <div className="flex flex-col space-y-3">
              <Link 
                to="/tracking" 
                className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:bg-brand-50 hover:text-brand"
                onClick={() => setIsOpen(false)}
              >
                <Search className="h-5 w-5 mr-2" />
                <span>Track</span>
              </Link>
              <Link 
                to="/create-shipment" 
                className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:bg-brand-50 hover:text-brand"
                onClick={() => setIsOpen(false)}
              >
                <Package className="h-5 w-5 mr-2" />
                <span>Ship</span>
              </Link>
              <Link 
                to="/schedule-pickup" 
                className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:bg-brand-50 hover:text-brand"
                onClick={() => setIsOpen(false)}
              >
                <Truck className="h-5 w-5 mr-2" />
                <span>Schedule Pickup</span>
              </Link>
              <Link 
                to="/locations" 
                className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:bg-brand-50 hover:text-brand"
                onClick={() => setIsOpen(false)}
              >
                <MapPin className="h-5 w-5 mr-2" />
                <span>Locations</span>
              </Link>
              <Link 
                to="/support" 
                className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:bg-brand-50 hover:text-brand"
                onClick={() => setIsOpen(false)}
              >
                <Clock className="h-5 w-5 mr-2" />
                <span>Support</span>
              </Link>
              
              <div className="pt-2 flex flex-col space-y-2">
                {user ? (
                  <>
                    <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full justify-start">
                        <UserCircle className="h-4 w-4 mr-2" />
                        Dashboard
                      </Button>
                    </Link>
                    <Button 
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }} 
                      className="w-full justify-start bg-brand hover:bg-brand-600"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full justify-center">
                        <User className="h-4 w-4 mr-2" />
                        Login
                      </Button>
                    </Link>
                    <Link to="/register" onClick={() => setIsOpen(false)}>
                      <Button className="w-full justify-center bg-brand hover:bg-brand-600">
                        Register
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
