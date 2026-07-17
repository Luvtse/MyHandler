// src/dashboard/hr/CorrespondenceList.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Mail, FileText, User } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@/shared/ui/Table';
import { apiService } from '@/lib/api/client';
import { toast } from 'sonner';
import { CORRESPONDENCE_TYPE_LABELS } from '@/types/Correspondence';

interface CorrespondenceItem {
  id: string;
  subject: string;
  type: keyof typeof CORRESPONDENCE_TYPE_LABELS;
  sentDate: string;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    employeeId: string;
  };
  sentByUser: {
    name: string;
  };
}

export const CorrespondenceList = () => {
  const navigate = useNavigate();
  const [correspondence, setCorrespondence] = useState<CorrespondenceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCorrespondence = async () => {
      try {
        const response = await apiService.request({
          method: 'GET',
          url: '/hr/correspondence'
        });
        
        if (response.success) {
          setCorrespondence(response.data || []);
        }
      } catch (err) {
        toast.error('Failed to load correspondence');
      } finally {
        setLoading(false);
      }
    };
    
    loadCorrespondence();
  }, []);

  const rows = useMemo(() => {
    return correspondence.map(item => ({
      id: item.id,
      subject: item.subject,
      type: CORRESPONDENCE_TYPE_LABELS[item.type as keyof typeof CORRESPONDENCE_TYPE_LABELS],
      sentDate: format(new Date(item.sentDate), 'MMM dd, yyyy'),
      employee: `${item.employee.firstName} ${item.employee.lastName} (${item.employee.employeeId})`,
      sentBy: item.sentByUser?.name || 'System'
    }));
  }, [correspondence]);

  if (loading) {
    return <div className="p-6">Loading correspondence...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">HR Correspondence</h1>
        <Button onClick={() => navigate('/dashboard/hr/correspondence/new')}>
          New Correspondence
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Correspondence Records</CardTitle>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>No correspondence records found</p>
            </div>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Subject</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Employee</TableCell>
                  <TableCell>Sent By</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map(row => (
                  <TableRow 
                    key={row.id} 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => navigate(`/dashboard/hr/correspondence/${row.id}`)}
                  >
                    <TableCell className="font-medium">{row.subject}</TableCell>
                    <TableCell>{row.type}</TableCell>
                    <TableCell>{row.employee}</TableCell>
                    <TableCell>{row.sentBy}</TableCell>
                    <TableCell>{row.sentDate}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};