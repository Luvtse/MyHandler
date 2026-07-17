import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Eye, EyeOff, Settings, Users, Package, DollarSign, Truck, Building, FileText } from 'lucide-react';

interface DashboardSection {
  key: string;
  title: string;
  description: string;
  icon: React.ElementType;
  roles: string[];
}

interface VisibilitySettings {
  [role: string]: {
    [section: string]: boolean;
  };
}

const dashboardSections: DashboardSection[] = [
  {
    key: 'shipments',
    title: 'Shipments Management',
    description: 'View and manage shipments',
    icon: Package,
    roles: ['admin', 'warehouse', 'driver', 'customer'],
  },
  {
    key: 'shipmentVisibility',
    title: 'Shipment Visibility Controls',
    description: 'Control which roles can see all shipments vs only their own',
    icon: Eye,
    roles: ['admin'],
  },
  {
    key: 'users',
    title: 'User Management',
    description: 'Manage system users',
    icon: Users,
    roles: ['admin'],
  },
  {
    key: 'finance',
    title: 'Finance Dashboard',
    description: 'Financial reports and analytics',
    icon: DollarSign,
    roles: ['admin', 'finance'],
  },
  {
    key: 'warehouse',
    title: 'Warehouse Operations',
    description: 'Warehouse and inventory management',
    icon: Building,
    roles: ['admin', 'warehouse'],
  },
  {
    key: 'driver',
    title: 'Driver Dashboard',
    description: 'Driver assignments and routes',
    icon: Truck,
    roles: ['admin', 'driver'],
  },
  {
    key: 'reports',
    title: 'Reports & Analytics',
    description: 'System reports and analytics',
    icon: FileText,
    roles: ['admin', 'finance', 'report'],
  },
  {
    key: 'hr',
    title: 'HR Management',
    description: 'Human resources management',
    icon: Users,
    roles: ['admin', 'hr'],
  },
  {
    key: 'settings',
    title: 'System Settings',
    description: 'System configuration',
    icon: Settings,
    roles: ['admin'],
  },
  {
    key: 'operations',
    title: 'Operations Dashboard',
    description: 'Operations management',
    icon: Users,
    roles: ['admin', 'operations'],
  },
  {
    key: 'account_manager',
    title: 'Account Manager Dashboard',
    description: 'Account management',
    icon: Users,
    roles: ['admin', 'account_manager'],
  },
  {
    key: 'coo',
    title: 'COO Dashboard',
    description: 'COO management',
    icon: Users,
    roles: ['admin', 'coo'],
  },
  {
    key: 'cfo',
    title: 'CFO Dashboard',
    description: 'CFO management',
    icon: Users,
    roles: ['admin', 'cfo'],
  },
{
    key: 'ceo',
    title: 'CEO Dashboard',
    description: 'CEO management',
    icon: Users,
    roles: ['admin', 'ceo'],
},
  {
    key: 'regional_manager',
    title: 'REGIONAL MANAGER Dashboard',
    description: 'REGIONAL management',
    icon: Users,
    roles: ['admin', 'regional_manager'],
  }

];

export const DashboardVisibilitySettings: React.FC = () => {
  const [settings, setSettings] = useState<VisibilitySettings>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/dashboard-visibility', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings || {});
      }
    } catch (error) {
      console.error('Error fetching dashboard visibility settings:', error);
      toast.error('Failed to load dashboard visibility settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = (role: string, section: string, enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [section]: enabled,
      },
    }));
  };

  const [shipmentVisibilityRoles, setShipmentVisibilityRoles] = useState<string[]>(['admin', 'finance', 'report', 'warehouse', 'marketing', 'operations', 'account_manager', 'coo', 'cfo', 'cmo', 'ceo', 'regional_manager']);

  useEffect(() => {
    fetchSettings();
    fetchShipmentVisibilityRoles();
  }, []);

  const fetchShipmentVisibilityRoles = async () => {
    try {
      const response = await fetch('/api/admin/shipment-visibility-roles', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setShipmentVisibilityRoles(data.roles || ['admin', 'finance', 'report', 'warehouse', 'marketing', 'operations', 'account_manager', 'coo', 'cfo', 'cmo', 'ceo', 'regional_manager']);
      }
    } catch (error) {
      console.error('Error fetching shipment visibility roles:', error);
      toast.error('Failed to load shipment visibility roles');
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Save dashboard visibility settings
      const response = await fetch('/api/admin/dashboard-visibility', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ settings }),
      });

      // Save shipment visibility roles
      const shipmentResponse = await fetch('/api/admin/shipment-visibility-roles', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ roles: shipmentVisibilityRoles }),
      });

      if (response.ok && shipmentResponse.ok) {
        toast.success('Dashboard visibility settings updated successfully');
      } else {
        toast.error('Failed to update dashboard visibility settings');
      }
    } catch (error) {
      console.error('Error saving dashboard visibility settings:', error);
      toast.error('Failed to update dashboard visibility settings');
    } finally {
      setIsSaving(false);
    }
  };

  const getDefaultSettings = () => {
    const defaultSettings: VisibilitySettings = {};
    
    // Get all unique roles
    const allRoles = [...new Set(dashboardSections.flatMap(section => section.roles))];
    
    allRoles.forEach(role => {
      defaultSettings[role] = {};
      dashboardSections.forEach(section => {
        defaultSettings[role][section.key] = section.roles.includes(role);
      });
    });
    
    return defaultSettings;
  };

  const resetToDefaults = () => {
    setSettings(getDefaultSettings());
    setShipmentVisibilityRoles(['admin', 'finance', 'report', 'warehouse', 'marketing', 'operations', 'account_manager', 'coo', 'cfo', 'cmo', 'ceo', 'regional_manager']);
    toast.info('Settings reset to defaults');
  };

  const allRoles = [...new Set(dashboardSections.flatMap(section => section.roles))].sort();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Dashboard Visibility Settings
          </CardTitle>
          <CardDescription>Control which dashboard sections are visible to different user roles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Dashboard Visibility Settings
          </CardTitle>
          <CardDescription>Control which dashboard sections are visible to different user roles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
            <Button variant="outline" onClick={resetToDefaults}>
              Reset to Defaults
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Section</th>
                  {allRoles.map(role => (
                    <th key={role} className="text-center p-3 font-medium capitalize">
                      {role.replace('_', ' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dashboardSections.map(section => {
                  const Icon = section.icon;
                  return (
                    <tr key={section.key} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <Icon className="h-4 w-4 text-gray-500" />
                          <div>
                            <div className="font-medium">{section.title}</div>
                            <div className="text-sm text-gray-500">{section.description}</div>
                          </div>
                        </div>
                      </td>
                      {allRoles.map(role => (
                        <td key={role} className="text-center p-3">
                          {section.roles.includes(role) ? (
                            <Switch
                              checked={settings[role]?.[section.key] !== false}
                              onCheckedChange={(checked) => handleToggle(role, section.key, checked)}
                            />
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Shipment Visibility Controls */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Shipment Visibility Controls</h3>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-3">Roles that can view all shipments:</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['admin', 'finance', 'report', 'warehouse', 'marketing', 'operations', 'account_manager', 'coo', 'cfo'].map(role => (
                    <div key={role} className="flex items-center space-x-2">
                      <Switch
                        checked={shipmentVisibilityRoles.includes(role)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setShipmentVisibilityRoles(prev => [...prev, role]);
                          } else {
                            setShipmentVisibilityRoles(prev => prev.filter(r => r !== role));
                          }
                        }}
                      />
                      <Label className="capitalize">{role.replace('_', ' ')}</Label>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  Users with these roles will be able to see all shipments. Users without these roles will only see their own shipments.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">How it works:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Toggle switches to show/hide dashboard sections for each role</li>
              <li>• Users will only see sections that are enabled for their role</li>
              <li>• Shipment visibility controls determine which roles can see all shipments</li>
              <li>• Changes take effect immediately after saving</li>
              <li>• Use "Reset to Defaults" to restore original settings</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};