
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/hooks';
import { Package, Users, ShieldCheck, TrendingUp, UserPlus, Copy } from 'lucide-react';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AuthService } from '@/features/auth/lib/service';
import { toast } from 'sonner';
import type { UserRole } from '@/types/auth';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [role, setRole] = React.useState<UserRole | ''>('');
  const [submitting, setSubmitting] = React.useState(false);
  const [inviteLink, setInviteLink] = React.useState<string | null>(null);
  const allowedRoles: UserRole[] = ['admin','driver','warehouse','finance','report','hr_manager','hr_staff','service_point_agent', 'account_manager', 'coo', 'cfo', 'cmo', 'ceo', 'regional_manager'];
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
      const res = await AuthService.inviteInternal({ email, name: fullName, role: role as UserRole, phone });
      setInviteLink(res.inviteLink);
      toast.success('Employee invite created');
    } catch (e: any) {
      const msg = typeof e === 'string' ? e : e?.message || 'Failed to send invite';
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
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name}</p>
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
              <Link to="/dashboard/admin/air-ops">Air Operations</Link>
            </Button>
            <Button asChild>
              <Link to="/dashboard/reports">View Reports</Link>
            </Button>
            <Button asChild>
              <Link to="/dashboard/settings">System Settings</Link>
            </Button>
            <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
              <DialogTrigger asChild>
                <Button variant="default" disabled={!canInvite} className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" /> Invite Employee
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite Internal Employee</DialogTitle>
                  <DialogDescription>Send an invitation to create a staff account.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="inviteName">Full Name</Label>
                    <Input id="inviteName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inviteEmail">Email</Label>
                    <Input id="inviteEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="invitePhone">Phone (optional)</Label>
                    <Input id="invitePhone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+251 9XX XXX XXX" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inviteRole">Role</Label>
                    <Select value={role || ''} onValueChange={(v) => setRole(v as UserRole)}>
                      <SelectTrigger id="inviteRole">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {allowedRoles.map((r) => (
                          <SelectItem key={`role-${r}`} value={r}>{r.replace(/_/g, ' ')}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {inviteLink && (
                    <div className="space-y-2">
                      <Label>Invite Link</Label>
                      <div className="flex items-center gap-2">
                        <Input value={inviteLink} readOnly />
                        <Button type="button" variant="outline" onClick={copyInvite} className="flex items-center gap-2">
                          <Copy className="h-4 w-4" /> Copy
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setInviteOpen(false)}>Close</Button>
                  <Button type="button" onClick={onInvite} disabled={submitting || !canInvite}>
                    {submitting ? 'Sending...' : 'Send Invite'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>All systems operational</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm">Shipping API</div>
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                  <div className="text-sm text-muted-foreground">Operational</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm">Tracking Service</div>
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                  <div className="text-sm text-muted-foreground">Operational</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm">Payment Processing</div>
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                  <div className="text-sm text-muted-foreground">Operational</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm">Driver App</div>
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                  <div className="text-sm text-muted-foreground">Operational</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Recent alerts and approvals</CardDescription>
          </CardHeader>
          <CardContent>
            <NotificationCenter />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
