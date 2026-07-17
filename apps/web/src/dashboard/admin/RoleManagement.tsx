import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Search, UserPlus, Edit, Trash2, Shield } from 'lucide-react';
import { UserRole, ROLE_PERMISSIONS } from '@/types/auth';

const RoleManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Role Management</h1>
          <p className="text-muted-foreground">Manage user roles and permissions</p>
        </div>
        <Button className="flex items-center gap-2">
          <UserPlus size={16} />
          Add New Role
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Roles & Permissions</CardTitle>
          <CardDescription>Configure role-based access control</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex justify-between items-center">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search roles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role Name</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.keys(ROLE_PERMISSIONS).map((role) => (
                  <TableRow key={role}>
                    <TableCell className="font-medium flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      {role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ')}
                    </TableCell>
                    <TableCell>
{/* TODO: Replace with actual users data once available */}
{0}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {ROLE_PERMISSIONS[role as UserRole].slice(0, 3).map((permission) => (
                          <Badge key={permission} variant="secondary" className="text-xs">
                            {permission.split(':')[0]}
                          </Badge>
                        ))}
                        {ROLE_PERMISSIONS[role as UserRole].length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{ROLE_PERMISSIONS[role as UserRole].length - 3} more
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                        Active
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500">
                        <Trash2 className="h-4 w-4" />
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

export default RoleManagement;