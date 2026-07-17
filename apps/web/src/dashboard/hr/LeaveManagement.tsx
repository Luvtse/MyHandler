// src/dashboard/hr/LeaveManagement.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/Tabs';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle,
  Plus,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '@/features/auth/hooks';
import { apiService } from '@/lib/api/client';
import { toast } from 'sonner';

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

const LeaveManagement = () => {
  const { user } = useAuth();
  
  // ✅ ALL HOOKS AT TOP LEVEL - NO CONDITIONAL HOOKS
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  // ✅ Calculate stats and filtered data with useMemo (not useState)
  const leaveStats = useMemo(() => {
    const pending = leaveRequests.filter(l => l.status === 'PENDING').length;
    const approved = leaveRequests.filter(l => l.status === 'APPROVED').length;
    const rejected = leaveRequests.filter(l => l.status === 'REJECTED').length;
    
    return {
      pendingRequests: pending,
      approvedRequests: approved,
      rejectedRequests: rejected,
      totalRequests: leaveRequests.length
    };
  }, [leaveRequests]);

  const filteredLeaves = useMemo(() => {
    switch (activeTab) {
      case 'pending':
        return leaveRequests.filter(l => l.status === 'PENDING');
      case 'approved':
        return leaveRequests.filter(l => l.status === 'APPROVED');
      case 'rejected':
        return leaveRequests.filter(l => l.status === 'REJECTED');
      default:
        return leaveRequests;
    }
  }, [activeTab, leaveRequests]);

  // Fetch leave data
  useEffect(() => {
    const loadLeaveData = async () => {
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
    
    loadLeaveData();
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

  const handleApprove = (leave: LeaveRequest) => {
    setSelectedLeave(leave);
    setShowApprovalModal(true);
  };

  const handleReject = (leave: LeaveRequest) => {
    setSelectedLeave(leave);
    setShowApprovalModal(true);
  };

  const canApproveAsManager = (leave: LeaveRequest) => {
    return !!user && 
           leave.managerApproval === 'PENDING' && 
           leave.manager && leave.manager.id === user.id &&

           leave.employee.user.name !== user?.name;
  };

  const canApproveAsHr = (leave: LeaveRequest) => {
    return !!user && (user.role === 'hr_manager' || user.role === 'hr_staff') &&
           leave.managerApproval === 'APPROVED' && 
           leave.hrApproval === 'PENDING';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Leave Management</h1>
        <Button onClick={() => setShowRequestForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Leave Request
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leaveStats.pendingRequests}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved (Total)</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leaveStats.approvedRequests}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected (Total)</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leaveStats.rejectedRequests}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leaveStats.totalRequests}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Requests</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Leave Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredLeaves.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">No leave requests found</div>
              ) : (
                <div className="space-y-4">
                  {filteredLeaves.map((leave) => (
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
                        
                        {(canApproveAsManager(leave) || canApproveAsHr(leave)) && (
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleReject(leave)}>
                              Reject
                            </Button>
                            <Button size="sm" onClick={() => handleApprove(leave)}>
                              Approve
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Approval Modal */}
      {showApprovalModal && selectedLeave && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Approve Leave Request
            </h3>
            <p className="mb-4">
              Are you sure you want to approve this leave request for {selectedLeave.employee?.user?.name}?
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowApprovalModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={async () => {
                  try {
                    const isHr = user?.role === 'hr_manager' || user?.role === 'hr_staff';
                    
                    if (isHr) {
                      await apiService.request({
                        method: 'PATCH',
                        url: `/hr/leave-requests/${selectedLeave.id}/hr-approval`,
                        data: { approvalStatus: 'APPROVED', comments: '' }
                      });
                    } else {
                      await apiService.request({
                        method: 'PATCH',
                        url: `/hr/leave-requests/${selectedLeave.id}/manager-approval`,
                        data: { approvalStatus: 'APPROVED', comments: '' }
                      });
                    }
                    
                    toast.success('Leave request approved successfully');
                    setShowApprovalModal(false);
                    // Refresh data
                    const response = await apiService.request({
                      method: 'GET',
                      url: '/hr/leave-requests'
                    });
                    if (response.success) {
                      setLeaveRequests(Array.isArray(response.data) ? response.data : []);
                    }
                  } catch (err) {
                    toast.error('Failed to approve leave request');
                  }
                }}
              >
                Approve
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;