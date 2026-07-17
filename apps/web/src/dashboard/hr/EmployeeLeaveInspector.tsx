// src/dashboard/hr/EmployeeLeaveInspector.tsx
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { Calendar, Clock, FileText, Plus, Eye } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/Card';
import { Badge } from '@/shared/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/Tabs';
import { LeaveRequestForm } from '@/dashboard/hr/LeaveRequestForm';
import {
  useLeaveRequests,
  useCreateLeaveRequest,
  useEmployees,
  useLeaveBalance,
} from '@/hooks/useLeaveRequests';
import { toast } from 'sonner';

interface UiLeaveBalanceItem {
  leaveType: string;
  used: number;
  total: number;
  remaining: number;
}

const LEAVE_TYPE_LABELS: Record<string, string> = {
  annualLeave: 'Annual Leave',
  sickLeave: 'Sick Leave',
  personalLeave: 'Personal Leave',
};

export const EmployeeLeaveInspector: React.FC = () => {
  const { id: employeeId } = useParams<{ id: string }>();
  const [showForm, setShowForm] = useState(false);

  const { data: leaveRequestsResponse, isLoading: loadingRequests } = useLeaveRequests();
  const { data: apiBalance, isLoading: loadingBalance } = useLeaveBalance(employeeId);
  const createLeaveRequest = useCreateLeaveRequest();
  const { data: employees = [] } = useEmployees();

  // Map API balance to UI format
  const leaveBalance: UiLeaveBalanceItem[] = React.useMemo(() => {
    if (!apiBalance) return [];
    return [
      { key: 'annualLeave', label: 'Annual Leave' },
      { key: 'sickLeave', label: 'Sick Leave' },
      { key: 'personalLeave', label: 'Personal Leave' },
    ]
      .map(({ key, label }) => {
        const entry = (apiBalance as any)[key];
        if (!entry || typeof entry.total !== 'number') return null;
        const used = entry.used ?? 0;
        const total = entry.total;
        return {
          leaveType: label,
          used,
          total,
          remaining: total - used,
        };
      })
      .filter(Boolean) as UiLeaveBalanceItem[];
  }, [apiBalance]);

  const employeeLeaves = React.useMemo(() => {
    if (!leaveRequestsResponse || !employeeId) return [];
    return leaveRequestsResponse.leaves.filter((req) => req.employeeId === employeeId);
  }, [leaveRequestsResponse, employeeId]);

  const handleSubmitLeaveRequest = async (formData: any) => {
    try {
      await createLeaveRequest.mutateAsync({ ...formData, employeeId });
      toast.success('Leave request submitted successfully');
      setShowForm(false);
    } catch (error) {
      toast.error('Failed to submit leave request');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      PENDING: 'secondary',
      APPROVED: 'success',
      REJECTED: 'destructive',
      CANCELLED: 'secondary',
    } as const;
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status}
      </Badge>
    );
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

  if (loadingRequests || loadingBalance) {
    return <div className="p-6">Loading employee leave data...</div>;
  }

  if (!employeeId) {
    return <div className="p-6 text-destructive">Employee ID not provided</div>;
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Leave Inspector</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Request Leave (On Behalf)
        </Button>
      </div>

      {/* Leave Balance — ONLY from API */}
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
              Leave balance not available. Contact system admin.
            </CardContent>
          </Card>
        )}
      </div>

      <Tabs defaultValue="requests" className="w-full">
        <TabsList>
          <TabsTrigger value="requests">Leave Requests</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Employee Leave Requests</CardTitle>
              <CardDescription>View all leave activity for this employee</CardDescription>
            </CardHeader>
            <CardContent>
              {employeeLeaves.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>No leave requests found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {employeeLeaves.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
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
                        <div className="text-xs text-gray-600">
                          Backup: {request.backupEmployeeId ? 'Assigned' : 'None'}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
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
                    <h3 className="text-lg font-semibold leading-6">
                      Request Leave on Behalf of Employee
                    </h3>
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
