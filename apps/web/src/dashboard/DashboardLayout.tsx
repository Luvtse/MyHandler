
import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks';
import { 
  Package, 
  BarChart3, 
  Settings, 
  Users, 
  LogOut, 
  Menu, 
  X,
  Home,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const DashboardLayout: React.FC = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const mainMenuItems = [
    { 
      label: "Dashboard", 
      icon: <Home className="mr-2 h-4 w-4" />, 
      path: "/dashboard" 
    },
    { 
      label: "Shipments", 
      icon: <Package className="mr-2 h-4 w-4" />, 
      path: "/dashboard/shipments" 
    },
    { 
      label: "Reports", 
      icon: <BarChart3 className="mr-2 h-4 w-4" />, 
      path: "/dashboard/reports" 
    },
  ];

  const secondaryMenuItems = [
    { 
      label: "Settings", 
      icon: <Settings className="mr-2 h-4 w-4" />, 
      path: "/dashboard/settings" 
    },
    { 
      label: "User Management", 
      icon: <Users className="mr-2 h-4 w-4" />, 
      path: "/dashboard/users" 
    },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b shadow-sm w-full z-10">
        <div className="flex items-center justify-between px-4 py-2 h-16">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleSidebar}
              className="mr-4 md:hidden"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
            <div className="flex items-center">
              <Link to="/" className="flex items-center font-bold text-xl text-primary">
                <Package className="h-6 w-6 mr-2" />
                <span>GoodsHandler</span>
              </Link>
              <span className="ml-2 text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-md">
                Admin
              </span>
            </div>
          </div>
          <div className="flex items-center">
            <div className="mr-4 text-right hidden md:block">
              <div className="text-sm font-semibold">{user?.name}</div>
              <div className="text-xs text-muted-foreground">{user?.email}</div>
            </div>
            <Button variant="ghost" size="icon">
              <LogOut size={20} />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar for desktop */}
        <aside className={`
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0 fixed md:static top-16 bottom-0 w-64 bg-white border-r 
          shadow-sm transition-transform duration-300 ease-in-out z-30
        `}>
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4">
              <nav className="space-y-6">
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground tracking-wide uppercase px-2">
                    Main
                  </h4>
                  {mainMenuItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center py-2 px-3 text-sm rounded-md w-full ${
                        isActive(item.path) 
                          ? "bg-primary text-white hover:bg-primary/90" 
                          : "text-foreground hover:bg-muted"
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  ))}
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground tracking-wide uppercase px-2">
                    Administration
                  </h4>
                  {secondaryMenuItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center py-2 px-3 text-sm rounded-md w-full ${
                        isActive(item.path) 
                          ? "bg-primary text-white hover:bg-primary/90" 
                          : "text-foreground hover:bg-muted"
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  ))}
                </div>
              </nav>
            </div>
            
            <div className="p-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => navigate('/create-shipment')}
                className="w-full flex items-center justify-center gap-2"
              >
                <Package size={16} />
                New Shipment
              </Button>
            </div>
          </div>
        </aside>
        
        {/* Main content */}
        <main className="flex-1">
          {/* Overlay when sidebar is open on mobile */}
          {sidebarOpen && (
            <div 
              className="fixed inset-0 bg-black/30 z-20 md:hidden" 
              onClick={() => setSidebarOpen(false)}
            />
          )}
          
          <div className="p-4 md:p-6 max-w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
