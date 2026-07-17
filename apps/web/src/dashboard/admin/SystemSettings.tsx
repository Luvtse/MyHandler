import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Label } from '@/shared/ui/Label';
import { Switch } from '@/shared/ui/Switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/Tabs';
import { Settings, Users, Shield, Database, Bell, LayoutDashboard, Eye, EyeOff } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/shared/ui/Dialog';
import { Badge } from '@/shared/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/Table';
import { Checkbox } from '@/shared/ui/Checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/Select';
import { ROLE_PERMISSIONS, UserRole, Permission, User } from '@/types/auth';
import { userService } from '@/services/userService';
import { toast } from 'sonner';
import { format } from 'date-fns';

import { useSearchParams } from 'react-router-dom';

const SystemSettings = () => {
  // Visibility states for modals/panels
  const [manageOpen, setManageOpen] = useState(false);
  const [permissionsOpen, setPermissionsOpen] = useState(false);
  const [logsOpen, setLogsOpen] = useState(false);

  // Edit Permissions state
  const [editUser, setEditUser] = useState<User | null>(null);
  const roleOptions: UserRole[] = useMemo(() => ['admin','customer','driver','finance','report','warehouse','hr_manager','hr_staff','operations','service_point_agent','fleet_manager', 'account_manager', 'coo', 'cfo', 'cmo', 'ceo', 'regional_manager'], []);
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [selectedPermissions, setSelectedPermissions] = useState<Record<Permission, boolean>>(() => {
    const initial: Record<Permission, boolean> = {} as any;
    ROLE_PERMISSIONS['admin'].forEach(p => { initial[p] = true; });
    return initial;
  });

  const allPermissionsForRole = useMemo(() => ROLE_PERMISSIONS[selectedRole], [selectedRole]);

  const togglePermission = (perm: Permission) => {
    setSelectedPermissions(prev => ({ ...prev, [perm]: !prev[perm] }));
  };

  // Dashboard visibility states
  const [dashboardVisibility, setDashboardVisibility] = useState<Record<UserRole, Record<string, boolean>>>(() => {
    const defaultVisibility = {
      admin: {
        shipments: true,
        users: true,
        reports: true,
        finance: true,
        settings: true,
        notifications: true,
        leave_management: true,
        analytics: true,
        system_status: true
      },
      customer: {
        shipments: true,
        notifications: true,
        profile: true,
        settings: true,
        payout_request: true,
        leave_dashboard: true
      },
      driver: {
        shipments: true,
        notifications: true,
        profile: true,
        settings: true,
        leave_dashboard: true
      },
      finance: {
        invoices: true,
        payments: true,
        payout_requests: true,
        analytics: true,
        reports: true,
        notifications: true,
        profile: true,
        settings: true,
        leave_dashboard: true
      },
      report: {
        reports: true,
        analytics: true,
        shipments: true,
        notifications: true,
        profile: true,
        settings: true,
        leave_dashboard: true
      },
      warehouse: {
        shipments: true,
        inventory: true,
        notifications: true,
        profile: true,
        settings: true,
        leave_dashboard: true
      },
      hr_manager: {
        leave_management: true,
        employees: true,
        approvals: true,
        notifications: true,
        profile: true,
        settings: true,
        reports: true,
        hr_dashboard: true
      },
      hr_staff: {
        leave_management: true,
        employees: true,
        approvals: true,
        notifications: true,
        profile: true,
        settings: true,
        reports: true,
        hr_dashboard: true
      },
      service_point_agent: {
        shipments: true,
        notifications: true,
        profile: true,
        settings: true
      },
      operations: {
        shipments: true,
        users: true,
        reports: true,
        analytics: true,
        system_status: true
      },
      
      fleet_manager: {
        shipments: true,
        notifications: true,
        profile: true,
        settings: true
      },
      account_manager: {
        users: true,
        notifications: true,
        profile: true,
        settings: true
      },
      coo: {
        shipments: true,
        notifications: true,
        profile: true,
        settings: true
      },
      cfo: {
        shipments: true,
        notifications: true,
        profile: true,
        settings: true
      },
      cmo: {
        shipments: true,
        users: true,
        reports: true,
        analytics: true,
        system_status: true
       },
      ceo: {
        shipments: true,
        users: true,
        reports: true,
        analytics: true,
        system_status: true
       },
      regional_manager: {
        shipments: true,
        users: true,
        reports: true,
        analytics: true,
        system_status: true
       },
    };
    return {...defaultVisibility, operations: defaultVisibility.admin, fleet_manager: defaultVisibility.admin, account_manager: defaultVisibility.admin, coo: defaultVisibility.admin, cfo: defaultVisibility.admin} as Record<UserRole, Record<string, boolean>>;
  });

  const toggleDashboardVisibility = (role: UserRole, section: string) => {
    setDashboardVisibility(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [section]: !prev[role][section]
      }
    }));
  };

  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'general';
  const [tabValue, setTabValue] = useState(initialTab);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
          <p className="text-muted-foreground">Manage your system configurations</p>
        </div>
      </div>

      <Tabs value={tabValue} onValueChange={setTabValue} className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard Visibility</TabsTrigger>
          <TabsTrigger value="backup">Backup & Restore</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure basic system settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Company Name</Label>
                <Input placeholder="Enter company name" />
              </div>
              <div className="space-y-2">
                <Label>Support Email</Label>
                <Input type="email" placeholder="support@example.com" />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="notifications" />
                <Label htmlFor="notifications">Enable Email Notifications</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure security options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch id="2fa" />
                <Label htmlFor="2fa">Require Two-Factor Authentication</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="audit" />
                <Label htmlFor="audit">Enable Audit Logging</Label>
              </div>
              <div className="space-y-2">
                <Label>Session Timeout (minutes)</Label>
                <Input type="number" placeholder="30" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Roles & Permissions</CardTitle>
              <CardDescription>Manage user roles and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button className="w-full" onClick={() => setManageOpen(true)}>Manage Roles</Button>
                <Button className="w-full" onClick={() => setPermissionsOpen(true)}>Edit Permissions</Button>
                <Button className="w-full" onClick={() => setLogsOpen(true)}>View Access Logs</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5" />
                Dashboard Visibility Settings
              </CardTitle>
              <CardDescription>Control which dashboard sections are visible for each user role</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label>Select Role</Label>
                  <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole)}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Dashboard Section</TableHead>
                        <TableHead className="text-center">Visible</TableHead>
                        <TableHead className="text-center">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(dashboardVisibility[selectedRole] || {}).map(([section, isVisible]) => (
                        <TableRow key={section}>
                          <TableCell className="font-medium capitalize">
                            {section.replace(/_/g, ' ')}
                          </TableCell>
                          <TableCell className="text-center">
                            {isVisible ? (
                              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                                <Eye className="h-3 w-3 mr-1" />
                                Visible
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
                                <EyeOff className="h-3 w-3 mr-1" />
                                Hidden
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleDashboardVisibility(selectedRole, section)}
                              className={isVisible ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                            >
                              {isVisible ? 'Hide' : 'Show'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => {
                    setDashboardVisibility({
                      admin: {
                        shipments: true,
                        users: true,
                        reports: true,
                        finance: true,
                        settings: true,
                        notifications: true,
                        leave_management: true,
                        analytics: true,
                        system_status: true,
                        operations: true
                      },
                      customer: {
                        shipments: true,
                        notifications: true,
                        profile: true,
                        settings: true,
                        payout_request: true,
                        leave_dashboard: true
                      },
                      fleet_manager: {
                        shipments: true,
                        notifications: true,
                        profile: true,
                        settings: true
                      },
                      service_point_agent: {
                        shipments: true,
                        notifications: true,
                        profile: true,
                        settings: true
                      },
                      driver: {
                        shipments: true,
                        notifications: true,
                        profile: true,
                        settings: true,
                        leave_dashboard: true
                      },
                      finance: {
                        invoices: true,
                        payments: true,
                        payout_requests: true,
                        analytics: true,
                        reports: true,
                        notifications: true,
                        profile: true,
                        settings: true,
                        leave_dashboard: true
                      },
                      report: {
                        reports: true,
                        analytics: true,
                        shipments: true,
                        notifications: true,
                        profile: true,
                        settings: true,
                        leave_dashboard: true
                      },
                      warehouse: {
                        shipments: true,
                        inventory: true,
                        notifications: true,
                        profile: true,
                        settings: true,
                        leave_dashboard: true
                      },
                      hr_manager: {
                        leave_management: true,
                        employees: true,
                        approvals: true,
                        notifications: true,
                        profile: true,
                        settings: true,
                        reports: true,
                        hr_dashboard: true
                      },
                      hr_staff: {
                        leave_management: true,
                        employees: true,
                        approvals: true,
                        notifications: true,
                        profile: true,
                        settings: true,
                        reports: true,
                        hr_dashboard: true
                      },
                      operations: {
                        shipments: true,
                        users: true,
                        reports: true,
                        analytics: true,
                        system_status: true
                      },
                      account_manager: {
                        shipments: true,
                        users: true,
                        reports: true,
                        analytics: true,
                        system_status: true
                      },
                      coo: {
                        shipments: true,
                        users: true,
                        reports: true,
                        analytics: true,
                        system_status: true
                      },
                      cfo: {
                        shipments: true,
                        users: true,
                        reports: true,
                        analytics: true,
                        system_status: true
                      },
                      cmo: {
                        shipments: true,
                        users: true,
                        reports: true,
                        analytics: true,
                        system_status: true
                      },
                      ceo: {
                        shipments: true,
                        users: true,
                        reports: true,
                        analytics: true,
                        system_status: true
                      },
                      regional_manager: {
                        shipments: true,
                        users: true,
                        reports: true,
                        analytics: true,
                        system_status: true
                      },
                    } as Record<UserRole, Record<string, boolean>>);
                  }}>
                    Reset to Defaults
                  </Button>
                  <Button>Save Changes</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Backup & Restore</CardTitle>
              <CardDescription>Manage system backups</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button className="w-full">Create Backup</Button>
                <Button className="w-full" variant="outline">Restore from Backup</Button>
                <div className="text-sm text-muted-foreground">
                  Last backup: Never
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>      </Tabs>

      {/* Manage Roles Modal */}
      <Dialog open={manageOpen} onOpenChange={setManageOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Roles</DialogTitle>
            <DialogDescription>
              Add, edit, or remove user roles in the system.
            </DialogDescription>
          </DialogHeader>
          <ManageRolesPanel />
        </DialogContent>
      </Dialog>

      {/* Edit Permissions Modal */}
      <Dialog open={permissionsOpen} onOpenChange={setPermissionsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Permissions</DialogTitle>
            <DialogDescription>
              Modify permissions for the selected role.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label>Role</Label>
              <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Permission</TableHead>
                    <TableHead className="text-center">Granted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allPermissionsForRole.map((perm) => (
                    <TableRow key={perm}>
                      <TableCell className="font-medium capitalize">{perm.replace(/_/g, ' ')}</TableCell>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={!!selectedPermissions[perm]}
                          onCheckedChange={() => togglePermission(perm)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPermissionsOpen(false)}>Cancel</Button>
            <Button onClick={() => setPermissionsOpen(false)}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Access Logs Modal */}
      <Dialog open={logsOpen} onOpenChange={setLogsOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Access Logs</DialogTitle>
            <DialogDescription>
              View recent access and activity logs.
            </DialogDescription>
          </DialogHeader>
          <AccessLogsPanel />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SystemSettings;

function ManageRolesPanel() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState<UserRole | 'all'>('all');
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);

  const roleOptions: UserRole[] = React.useMemo(() => ['admin','customer','driver','finance','report','warehouse','hr_manager','hr_staff','operations','service_point_agent', 'fleet_manager', 'account_manager', 'coo', 'cfo', 'cmo', 'ceo', 'regional_manager'], []);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await userService.getUsers({ page: 1, limit: 100, role: roleFilter === 'all' ? undefined : roleFilter, search });
      setUsers(res.users);
    } catch (e: any) {
      setError(e?.message || 'Failed to load users');
      toast.error(e?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter]);

  const handleAssignRole = async (userId: string, role: UserRole) => {
    try {
      setUpdatingId(userId);
      await userService.assignRole(userId, role);
      toast.success('Role updated');
      await loadUsers();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update role');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleSecondaryRole = async (userId: string, role: UserRole, checked: boolean) => {
    try {
      setUpdatingId(userId);
      const current = users.find(u => u.id === userId)?.secondaryRoles || [];
      const next = checked ? Array.from(new Set([...current, role])) : current.filter(r => r !== role);
      await userService.updateUser(userId, { secondaryRoles: next });
      toast.success('Secondary roles updated');
      await loadUsers();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update secondary roles');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = users.filter(u =>
    (search.trim() === '' || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <Label>Filter by Role</Label>
          <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as UserRole | 'all')}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {roleOptions.map((r) => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-2">
          <Label>Search</Label>
          <Input placeholder="Search by name or email" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Current Role</TableHead>
              <TableHead>Secondary Roles</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4}>
                  Loading users...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={4} className="text-red-600">
                  {error}
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Select value={u.role} onValueChange={(value) => handleAssignRole(u.id, value as UserRole)}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roleOptions.map((r) => (
                          <SelectItem key={r} value={r}>{r}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="grid grid-cols-2 gap-2">
                      {roleOptions.filter(r => r !== u.role).map((r) => (
                        <div key={r} className="flex items-center gap-2">
                          <Checkbox
                            checked={(u.secondaryRoles || []).includes(r)}
                            disabled={updatingId === u.id}
                            onCheckedChange={(c) => handleToggleSecondaryRole(u.id, r, !!c)}
                          />
                          <span className="text-xs capitalize">{r}</span>
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" onClick={() => handleAssignRole(u.id, 'customer')} disabled={updatingId === u.id}>Set Customer</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={loadUsers}>Refresh</Button>
        <Button onClick={() => toast.success('Changes saved')}>Done</Button>
      </div>
    </div>
  );
}

function AccessLogsPanel() {
  const [activities, setActivities] = React.useState<{ id: string; userId: string; action: string; details: string; timestamp: string; ipAddress?: string }[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(50);
  const [total, setTotal] = React.useState(0);

  const loadLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await userService.getUserActivities(undefined, page, limit);
      setActivities(res.activities);
      setTotal(res.total);
    } catch (e: any) {
      setError(e?.message || 'Failed to load logs');
      toast.error(e?.message || 'Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadLogs();
  }, [page, limit]);

  const canPrev = page > 1;
  const canNext = page * limit < total;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label>Page Size</Label>
          <Select value={String(limit)} onValueChange={(v) => setLimit(Number(v))}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={!canPrev}>Prev</Button>
          <span className="text-sm">Page {page}</span>
          <Button variant="outline" onClick={() => setPage((p) => p + 1)} disabled={!canNext}>Next</Button>
          <Button onClick={loadLogs}>Refresh</Button>
        </div>
      </div>

      <div className="rounded-md border">
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Time</TableHead>
        <TableHead>User ID</TableHead>
        <TableHead>Action</TableHead>
        <TableHead>Details</TableHead>
        <TableHead>IP Address</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {loading ? (
        <TableRow>
          <TableCell colSpan={5}>Loading logs...</TableCell>
        </TableRow>
      ) : error ? (
        <TableRow>
          <TableCell colSpan={5} className="text-red-600">{error}</TableCell>
        </TableRow>
      ) : activities.length === 0 ? (
        <TableRow>
          <TableCell colSpan={5} className="text-muted-foreground">No logs found</TableCell>
        </TableRow>
      ) : (
        activities.map(a => {
          // Parse the timestamp and check if it's valid
          const timestampDate = new Date(a.timestamp);
          const isValidDate = !isNaN(timestampDate.getTime());
          
          return (
            <TableRow key={a.id}>
              <TableCell>
                {isValidDate ? format(timestampDate, 'PPpp') : 'Invalid date'}
              </TableCell>
              <TableCell>{a.userId}</TableCell>
              <TableCell>{a.action}</TableCell>
              <TableCell className="max-w-[300px] truncate">{a.details}</TableCell>
              <TableCell>{a.ipAddress || '-'}</TableCell>
            </TableRow>
          );
        })
      )}
    </TableBody>
  </Table>
</div>
</div>
  );
}
