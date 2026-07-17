// src/dashboard/hr/LeaveRequestList.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle
} from 'lucide-react';
import { apiService } from '@/lib/api/client';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth/hooks';

interface LeaveRequest {
  id: string;
  employee: {
    user: {
      name: string;
    };
  };
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  status: string;
  managerApproval: string;
  hrApproval: string;
  manager: {
    id: string;
  };
}

export const LeaveRequestList = () => {
  const { user } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLeaveRequests = async () => {
      try {
        setLoading(true);
        const response = await apiService.request({
          method: 'GET',
          url: '/hr/leave-requests'
        });
        
        if (response.success) {
          const leaves = Array.isArray(response.data) ? response.data : [];
          setLeaveRequests(leaves);
        }
      } catch (err) {
        toast.error('Failed to load leave requests');
      } finally {
        setLoading(false);
      }
    };
    
    loadLeaveRequests();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  const getApprovalStatus = (approval?: string) => {
    if (!approval) return null;
    
    const variants = {
      PENDING: 'bg-gray-100 text-gray-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
    };
    
    return (
      <Badge className={variants[approval as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {approval}
      </Badge>
    );
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leave Requests</CardTitle>
      </CardHeader>
      <CardContent>
        {leaveRequests.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">No leave requests found</div>
        ) : (
          <div className="space-y-4">
            {leaveRequests.map((leave) => (
              <div key={leave.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="font-semibold flex items-center gap-2">
                    {leave.employee?.user?.name || 'Unknown Employee'}
                    <Badge variant="outline">{leave.leaveType}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                      {leave.totalDays} days
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right text-sm">
                    <div className="flex items-center gap-2 justify-end mb-1">
                      <span className="text-muted-foreground text-xs">Manager:</span>
                      {getApprovalStatus(leave.managerApproval)}
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                      <span className="text-muted-foreground text-xs">HR:</span>
                      {getApprovalStatus(leave.hrApproval)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};