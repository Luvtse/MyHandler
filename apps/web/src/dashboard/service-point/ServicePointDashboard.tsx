import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/Table';
import { Search, UserSearch, CreditCard, Receipt, PackagePlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { userService } from '@/services/userService';
import { useAuth } from '@/features/auth/hooks';
import { useNavigate } from 'react-router-dom';

const ServicePointDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Array<{ id: string; name: string; email: string; phone?: string; businessAccountCode?: string }>>([]);
  const notApproved = user && user.isApproved === false;

  const lookupCustomers = async () => {
    try {
      setLoading(true);
      const resp = await userService.getUsers({ search: searchTerm, role: 'customer', limit: 10 });
      setCustomers(resp.users);
    } catch (error: any) {
      toast({ title: 'Lookup Failed', description: error?.message || 'Could not search customers', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // initial load optional
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Service Point</h1>
      </div>

      {notApproved && (
        <div className="bg-yellow-100 border border-yellow-200 text-yellow-900 p-4 rounded-md">
          Your account is pending admin approval. Actions are limited until approval is granted.
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserSearch className="h-5 w-5" />
            Customer Lookup
          </CardTitle>
          <CardDescription>Search by email, phone, or account code</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <div className="relative w-full">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Enter email, phone, or 6-digit account code"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && lookupCustomers()}
                className="pl-8"
              />
            </div>
            <Button onClick={lookupCustomers} disabled={loading}>
              Search
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Account Code</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>{c.email}</TableCell>
                    <TableCell>{c.phone || '-'}</TableCell>
                    <TableCell>{c.businessAccountCode || '-'}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/create-shipment')}
                        disabled={!!notApproved}
                        className="mr-2"
                      >
                        <PackagePlus className="h-4 w-4 mr-1" /> Create Shipment
                      </Button>
                      <Button variant="outline" size="sm" disabled={!!notApproved} className="mr-2">
                        <CreditCard className="h-4 w-4 mr-1" /> Process Payment
                      </Button>
                      <Button variant="outline" size="sm">
                        <Receipt className="h-4 w-4 mr-1" /> Receipts
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {customers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No results
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServicePointDashboard;
