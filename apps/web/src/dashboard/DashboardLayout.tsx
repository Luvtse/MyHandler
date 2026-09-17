
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
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const formatRole = (role?: string) => {
  if (!role) return 'Member';
  return role
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const getInitials = (name?: string, email?: string) => {
  if (name) {
    const parts = name.trim().split(/\s+/);
    return (parts[0]?.[0] || '') + (parts[1]?.[0] || '');
  }
  return (email?.[0] || 'U').toUpperCase();
};

const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const mainMenuItems = [
    { label: 'Dashboard', icon: Home, path: '/dashboard' },
    { label: 'Shipments', icon: Package, path: '/dashboard/shipments' },
    { label: 'Reports', icon: BarChart3, path: '/dashboard/reports' },
  ];

  const secondaryMenuItems = [
    { label: 'Settings', icon: Settings, path: '/dashboard/settings' },
    { label: 'User Management', icon: Users, path: '/dashboard/users' },
  ];

  const isActive = (path: string) =>
    path === '/dashboard'
      ? location.pathname === path
      : location.pathname.startsWith(path);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const renderNavLink = (item: { label: string; icon: typeof Home; path: string }) => {
    const Icon = item.icon;
    const active = isActive(item.path);
    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={() => setSidebarOpen(false)}
        className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
          active
            ? 'bg-brand text-white shadow-sm shadow-brand/30'
            : 'text-gray-600 hover:bg-brand-50 hover:text-brand'
        }`}
      >
        <Icon
          className={`h-[18px] w-[18px] shrink-0 ${
            active ? 'text-white' : 'text-gray-400 group-hover:text-brand'
          }`}
        />
        {item.label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-muted flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-gray-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="md:hidden"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="WORIYA EXPRESS" className="h-9 w-auto" />
            </Link>
            <span className="hidden sm:inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand">
              {formatRole(user?.role)}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:block text-right leading-tight">
              <div className="text-sm font-semibold text-gray-900">{user?.name}</div>
              <div className="text-xs text-gray-500">{user?.email}</div>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white">
              {getInitials(user?.name, user?.email)}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              aria-label="Log out"
              className="text-gray-500 hover:text-brand hover:bg-brand-50"
            >
              <LogOut size={18} />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static top-16 bottom-0 w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out z-30`}
        >
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4">
              <nav className="space-y-8">
                <div className="space-y-1.5">
                  <h4 className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Main
                  </h4>
                  {mainMenuItems.map(renderNavLink)}
                </div>

                <div className="space-y-1.5">
                  <h4 className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Administration
                  </h4>
                  {secondaryMenuItems.map(renderNavLink)}
                </div>
              </nav>
            </div>

            <div className="p-4 border-t border-gray-100">
              <Button
                onClick={() => navigate('/create-shipment')}
                className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-brand-600 font-semibold shadow-sm"
              >
                <Plus size={16} />
                New Shipment
              </Button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/30 z-20 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          <div className="p-4 md:p-6 lg:p-8 max-w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
