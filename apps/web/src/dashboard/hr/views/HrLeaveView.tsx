// src/features/leave/views/HrLeaveView.tsx
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, User, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { usePendingHrApprovals, useUpdateHrApproval, LeaveRequest } from '@/hooks/useLeaveRequests';
import { toast } from 'sonner';
import { LeaveApprovalModal } from '@/dashboard/hr/LeaveApprovalModal';

export const HrLeaveView = () => {
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [showModal, setShowModal] = useState(false);

  const { data: rawLeaves = [], isLoading } = usePendingHrApprovals();
  const updateApproval = useUpdateHrApproval();

  const handleApprove = async (leaveId: string, comments: string) => {
    try {
      await updateApproval.mutateAsync({ id: leaveId, status: 'APPROVED', comments });
      toast.success('Leave approved by HR');
      setShowModal(false);
    } catch (err) {
      toast.error('Failed to approve leave');
    }
  };

  const handleReject = async (leaveId: string, comments: string) => {
    try {
      await updateApproval.mutateAsync({ id: leaveId, status: 'REJECTED', comments });
      toast.success('Leave rejected by HR');
      setShowModal(false);
    } catch (err) {
      toast.error('Failed to reject leave');
    }
  };

  const openModal = (leave: LeaveRequest) => {
    setSelectedLeave(leave);
    setShowModal(true);
  };

  if (isLoading) return <div className="p-6">Loading HR approvals...</div>;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <h1 className="text-2xl font-bold">HR Final Approvals</h1>

      <Card>
        <CardHeader>
          <CardTitle>Pending HR Approvals</CardTitle>
        </CardHeader>
        <CardContent>
          {rawLeaves.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>All requests processed</p>
            </div>
          ) : (
            <div className="space-y-4">
              {rawLeaves.map((leave) => (
                <div key={leave.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="font-medium flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {leave.employee?.user?.name || 'Unknown Employee'}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(leave.startDate), 'MMM dd')} – {format(new Date(leave.endDate), 'MMM dd')}
                      <span className="text-xs bg-blue-100 px-2 py-0.5 rounded-full">
                        {leave.totalDays} days
                      </span>
                    </div>
                    <div className="text-xs text-gray-600">
                      Manager: {leave.managerApproval}
                    </div>
                  </div>
                  <Button size="sm" variant="default" onClick={() => openModal(leave)}>
                    Final Review
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedLeave && (
        <LeaveApprovalModal
          leave={{
            id: selectedLeave.id,
            employee: {
              name: selectedLeave.employee?.user?.name || '',
              email: selectedLeave.employee?.user?.email || '',
            },
            leaveType: { name: selectedLeave.leaveType },
            totalDays: selectedLeave.totalDays,
            startDate: new Date(selectedLeave.startDate),
            endDate: new Date(selectedLeave.endDate),
            reason: selectedLeave.reason || '',
            emergencyContact: selectedLeave.emergencyContact || '',
            backupEmployee: selectedLeave.backupEmployeeId ? { name: 'Backup Employee' } : null,
            managerApproval: selectedLeave.managerApproval as 'PENDING' | 'APPROVED' | 'REJECTED',
            hrApproval: selectedLeave.hrApproval as 'PENDING' | 'APPROVED' | 'REJECTED',
            status: selectedLeave.status as 'PENDING' | 'APPROVED' | 'REJECTED',
          }}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onApprove={handleApprove}
          onReject={handleReject}
          isLoading={updateApproval.isPending}
          userRole="hr"
        />
      )}
    </div>
  );
};
