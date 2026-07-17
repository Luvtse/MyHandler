import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/lib/api/client';

const InvitePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const token = React.useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('token') || '';
  }, [location.search]);

  React.useEffect(() => {
    if (!token) {
      toast({ title: 'Invalid Link', description: 'Missing invitation token', variant: 'destructive' });
      navigate('/login', { replace: true });
    }
  }, [token, toast, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast({ title: 'Invalid Link', description: 'Missing invitation token', variant: 'destructive' });
      navigate('/login', { replace: true });
      return;
    }
    if (!password || password.length < 8) {
      toast({ title: 'Weak Password', description: 'Password must be at least 8 characters', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const { success, error } = await apiService.request<{ success: boolean }>({
        method: 'POST',
        url: '/invite/complete',
        data: { token, password }
      });
      if (!success) throw error || 'Activation failed';
      toast({ title: 'Account Activated', description: 'You can now log in' });
      navigate('/login', { replace: true });
    } catch (err: any) {
      const message = typeof err === 'string' ? err : err?.message || 'Invalid or expired link';
      toast({ title: 'Activation Failed', description: message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Set Your Password</CardTitle>
          <CardDescription>Complete your account setup</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter a strong password"
                disabled={loading}
              />
              <p className="text-sm text-muted-foreground">Minimum 8 characters</p>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Activating...' : 'Activate Account'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvitePage;
