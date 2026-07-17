import React from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Package, Users, ShieldCheck, TrendingUp, UserPlus, Copy } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import { useAuth } from '@/features/auth/hooks';
import { AuthService } from '@/features/auth/lib/service';
import type { UserRole } from '@/types/auth';

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [role, setRole] = React.useState<UserRole | ''>('');
  const [submitting, setSubmitting] = React.useState(false);
  const [inviteLink, setInviteLink] = React.useState<string | null>(null);
  const allowedRoles: UserRole[] = [
    'admin',
    'driver',
    'warehouse',
    'finance',
    'report',
    'hr_manager',
    'hr_staff',
    'service_point_agent',
    'operations',
    'account_manager',
    'coo',
    'cfo',
    'ceo',
    'cmo',
    'regional_manager'
  ];
  const canInvite = user?.role === 'admin';

  const onInvite = async () => {
    if (!canInvite) {
      toast.error('You do not have permission to invite employees');
      return;
    }
    if (!fullName || !email || !role) {
      toast.error('Name, email, and role are required');
      return;
    }

    setSubmitting(true);
    setInviteLink(null);
    try {
      const res = await AuthService.inviteInternal({
        email,
        name: fullName,
        role: role as UserRole,
        phone,
      });
      setInviteLink(res.inviteLink);
      toast.success('Employee invite created');
    } catch (e: unknown) {
      const msg =
        typeof e === "string"
          ? e
          : (e as { message?: string } | null)?.message || 'Failed to send invite';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const copyInvite = async () => {
    if (!inviteLink) return;
    try {
      const full = new URL(inviteLink, window.location.origin).toString();
      await navigator.clipboard.writeText(full);
      toast.success('Invite link copied');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const resetInvite = () => {
    setFullName('');
    setEmail('');
    setPhone('');
    setRole('');
    setInviteLink(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name}</p>
        </div>

        <div className="flex items-center gap-2">
          <Dialog
            open={inviteOpen}
            onOpenChange={(open) => {
              setInviteOpen(open);
              if (!open) resetInvite();
            }}
          >
            <DialogTrigger asChild>
              <Button disabled={!canInvite} className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Invite Employee
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[520px]">
              <DialogHeader>
                <DialogTitle>Invite Employee</DialogTitle>
                <DialogDescription>Create an invite link for an internal employee.</DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-2">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Doe" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@company.com" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+251..." />
                </div>
                <div className="grid gap-2">
                  <Label>Role</Label>
                  <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {allowedRoles.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {inviteLink && (
                <div className="rounded-md border p-3">
                  <div className="text-sm font-medium mb-2">Invite Link</div>
                  <div className="flex items-center gap-2">
                    <Input readOnly value={inviteLink} />
                    <Button type="button" variant="outline" onClick={copyInvite} className="flex items-center gap-2">
                      <Copy className="h-4 w-4" />
                      Copy
                    </Button>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setInviteOpen(false)}>
                  Close
                </Button>
                <Button type="button" onClick={onInvite} disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Invite'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shipments</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,245</div>
            <p className="text-xs text-muted-foreground">+15% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">824</div>
            <p className="text-xs text-muted-foreground">+4% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Drivers</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32</div>
            <p className="text-xs text-muted-foreground">2 drivers on leave</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$48,352</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Access</CardTitle>
            <CardDescription>Manage your logistics operations</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Button asChild>
              <Link to="/dashboard/shipments">Manage Shipments</Link>
            </Button>
            <Button asChild>
              <Link to="/dashboard/users">Manage Users</Link>
            </Button>
            <Button asChild>
              <Link to="/dashboard/admin/role-management">Role Management</Link>
            </Button>
            <Button asChild>
              <Link to="/dashboard/settings">System Settings</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Recent system updates and alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <NotificationCenter />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardPage;

