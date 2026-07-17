
import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { User as UserIcon, UserPlus, Search, CheckCircle2, XCircle } from 'lucide-react';
import { userService } from '@/services/userService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/features/auth/hooks';

const UsersManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<Array<{ id: string; name: string; email: string; role: string; isApproved?: boolean }>>([]);
  const [loading, setLoading] = useState(false);
  
  const loadUsers = async () => {
    try {
      setLoading(true);
      const resp = await userService.getUsers({ search: searchTerm });
      setUsers(resp.users);
    } catch (error: any) {
      toast({ title: 'Error', description: error?.message || 'Failed to load users', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const toggleApproval = async (id: string, current?: boolean) => {
    try {
      const updated = await userService.updateApproval(id, !current);
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, isApproved: updated.isApproved } : u)));
      toast({ title: 'Success', description: `User ${!current ? 'approved' : 'unapproved'} successfully` });
    } catch (error: any) {
      toast({ title: 'Error', description: error?.message || 'Failed to update approval', variant: 'destructive' });
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
        <Button className="flex items-center gap-2">
          <UserPlus size={16} />
          Add New User
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Users</CardTitle>
          <CardDescription>Manage users and their permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex justify-between">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <input 
                placeholder="Search users..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadUsers()}
                className="pl-8 h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium flex items-center">
                      <UserIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                      {user.name}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.isApproved ? (
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1">
                          <CheckCircle2 size={14} /> Approved
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200 flex items-center gap-1">
                          <XCircle size={14} /> Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => toggleApproval(user.id, user.isApproved)}>
                        {user.isApproved ? 'Unapprove' : 'Approve'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersManagement;
