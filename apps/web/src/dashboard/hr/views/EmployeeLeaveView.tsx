// src/dashboard/hr/views/EmployeeLeaveView.tsx

import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, FileText, Plus } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/Card';
import { Badge } from '@/shared/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/Tabs';
import { LeaveRequestForm } from '@/dashboard/hr/LeaveRequestForm';
import {
  useLeaveRequests,
  useLeaveBalance,
  useCreateLeaveRequest,
  useEmployeeSelf,
  useColleagues,
} from '@/hooks/useLeaveRequests';
import { useAuth } from '@/features/auth/hooks';
import { toast } from 'sonner';

// Define roles that can view any employee's leave balance
const ROLES_WITH_FULL_ACCESS = [
  'admin',
  'hr_manager', 
  'ceo', 
  'hr_staff',
];

// Helper functions
const getStatusBadge = (status: string) => {
  const variants: Record<string, any> = {
    PENDING: 'secondary',
    APPROVED: 'success',
    REJECTED: 'destructive',
    CANCELLED: 'secondary',
  };
  return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
};

const getLeaveTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    ANNUAL: 'Annual Leave',
    SICK: 'Sick Leave',
    MATERNITY: 'Maternity Leave',
    PATERNITY: 'Paternity Leave',
    BEREAVEMENT: 'Bereavement Leave',
    PERSONAL: 'Personal Leave',
    UNPAID: 'Unpaid Leave',
    OTHER: 'Other',
  };
  return map[type] || type;
};

export const EmployeeLeaveView = () => {
  const { user, isRole } = useAuth();
  const [showForm, setShowForm] = useState(false);

  // Get current employee's profile
  const { data: employeeSelf, isLoading: loadingSelf } = useEmployeeSelf();
  
  // Determine employeeId for leave requests (not for balance)
  const employeeId = employeeSelf?.id || user?.id;
  
  // Check if user has access to view any employee's balance
  const hasFullAccess = ROLES_WITH_FULL_ACCESS.some(role => isRole(role as any));
  
  console.log('User role:', user?.role);
  console.log('Has full access:', hasFullAccess);

  // Get employee-specific data
  const { data: leaveRequestsResponse, isLoading: loadingRequests } = useLeaveRequests({
    employeeId
  });
  
  // FIX: Only pass employeeId to useLeaveBalance if user has full access
  const { data: apiBalance, isLoading: loadingBalance } = useLeaveBalance(
    hasFullAccess ? employeeId : undefined
  );
  
  const createLeaveRequest = useCreateLeaveRequest();
  const { data: colleagues = [], isLoading: loadingColleagues } = useColleagues();

  const leaveBalance = React.useMemo(() => {
    if (!apiBalance) return [];
    return [
      { key: 'annualLeave', label: 'Annual Leave' },
      { key: 'sickLeave', label: 'Sick Leave' },
      { key: 'personalLeave', label: 'Personal Leave' },
    ]
      .map(({ key, label }) => {
        const entry = (apiBalance as any)[key];
        if (!entry) return null;
        const total = entry.total ?? (entry.allocatedDays ?? 0);
        const used = entry.used ?? 0;
        return {
          leaveType: label,
          used,
          total,
          remaining: total - used,
        };
      })
      .filter(Boolean);
  }, [apiBalance]);

  const myLeaveRequests = React.useMemo(() => {
    if (!leaveRequestsResponse) return [];
    const leaves = leaveRequestsResponse.leaves || [];
    if (!employeeId) return leaves;
    return leaves.filter((req) => req.employeeId === employeeId);
  }, [leaveRequestsResponse, employeeId]);

  const handleSubmitLeaveRequest = async (formData: any) => {
    try {
      if (!employeeId) {
        throw new Error('Employee ID not found');
      }
      await createLeaveRequest.mutateAsync({ ...formData, employeeId });
      toast.success('Leave request submitted successfully');
      setShowForm(false);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to submit leave request');
    }
  };

  const isLoading = loadingSelf || loadingRequests || loadingBalance || loadingColleagues;

  if (isLoading) {
    return <div className="p-6">Loading your leave data...</div>;
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Leave</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Request Leave
        </Button>
      </div>

      {/* Leave Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {leaveBalance.length > 0 ? (
          leaveBalance.map((balance) => (
            <Card key={balance.leaveType}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">{balance.leaveType}</CardTitle>
                <CardDescription className="text-xs">
                  {balance.used} of {balance.total} days used
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Remaining</span>
                    <span className="font-semibold">{Math.max(0, balance.remaining)} days</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${Math.min(100, (balance.used / balance.total) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-full">
            <CardContent className="py-8 text-center text-muted-foreground">
              Leave balance not available. Contact HR.
            </CardContent>
          </Card>
        )}
      </div>

      {/* My Requests */}
      <Tabs defaultValue="requests" className="w-full">
        <TabsList>
          <TabsTrigger value="requests">My Requests</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Requests</CardTitle>
              <CardDescription>View and manage your leave requests</CardDescription>
            </CardHeader>
            <CardContent>
              {myLeaveRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>No leave requests found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myLeaveRequests.map((request: any) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{getLeaveTypeLabel(request.leaveType)}</span>
                          {getStatusBadge(request.status)}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground gap-4">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(request.startDate), 'MMM dd, yyyy')} –{' '}
                            {format(new Date(request.endDate), 'MMM dd, yyyy')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {request.totalDays} days
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Request Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg dark:bg-gray-900">
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4 dark:bg-gray-900">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg font-semibold leading-6">Request New Leave</h3>
                    <div className="mt-4">
                      <LeaveRequestForm
                        onSubmit={handleSubmitLeaveRequest}
                        isLoading={createLeaveRequest.isPending}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 dark:bg-gray-800">
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};