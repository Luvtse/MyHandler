import React from 'react';
import { format } from 'date-fns';
import { User, Calendar, Clock, FileText, CheckCircle, XCircle, UserCheck, Phone } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Textarea } from '@/shared/ui/Textarea';
import { Label } from '@/shared/ui/Label';
import { Badge } from '@/shared/ui/Badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/Dialog';
import { LeaveRequest, ApprovalStatus } from '@/types/leave';

interface LeaveApprovalModalProps {
  leave: LeaveRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (leaveId: string, comments: string) => void;
  onReject: (leaveId: string, comments: string) => void;
  isLoading?: boolean;
  userRole: 'manager' | 'hr';
}

export const LeaveApprovalModal: React.FC<LeaveApprovalModalProps> = ({
  leave,
  isOpen,
  onClose,
  onApprove,
  onReject,
  isLoading = false,
  userRole
}) => {
  const [comments, setComments] = React.useState('');

  if (!leave) return null;

  const canApprove = userRole === 'manager' 
    ? leave.status === 'PENDING' && leave.managerApproval === 'PENDING'
    : leave.status === 'PENDING' && leave.managerApproval === 'APPROVED' && leave.hrApproval === 'PENDING';

  const handleApprove = () => {
    onApprove(leave.id, comments);
    setComments('');
  };

  const handleReject = () => {
    onReject(leave.id, comments);
    setComments('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Leave Request Approval</DialogTitle>
          <DialogDescription>
            Review and approve/reject the leave request from {leave.employee.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Employee Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-4">
              <User className="h-5 w-5 text-gray-600" />
              <div>
                <p className="font-medium">{leave.employee.name}</p>
                <p className="text-sm text-gray-600">{leave.employee.email}</p>
                <p className="text-sm text-gray-600">{leave.employee.department}</p>
              </div>
            </div>
          </div>

          {/* Leave Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium">Leave Type:</span>
              </div>
              <Badge variant="outline">{leave.leaveType.name}</Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium">Duration:</span>
              </div>
              <p className="text-sm">{leave.totalDays} days</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium">Start Date:</span>
              </div>
              <p className="text-sm">{format(new Date(leave.startDate), 'PPP')}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium">End Date:</span>
              </div>
              <p className="text-sm">{format(new Date(leave.endDate), 'PPP')}</p>
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium">Reason:</span>
            </div>
            <p className="text-sm bg-gray-50 p-3 rounded-md">{leave.reason}</p>
          </div>

          {/* Backup & Emergency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium">Backup Employee:</span>
              </div>
              <p className="text-sm">{leave.backupEmployee?.name || 'None'}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium">Emergency Contact:</span>
              </div>
              <p className="text-sm">{leave.emergencyContact}</p>
            </div>
          </div>

          {/* Approval Section */}
          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <Label>Comments (Optional)</Label>
              <Textarea 
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Add comments for approval/rejection..."
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleReject}
            disabled={isLoading || !canApprove}
          >
            Reject
          </Button>
          <Button 
            onClick={handleApprove}
            disabled={isLoading || !canApprove}
          >
            Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
