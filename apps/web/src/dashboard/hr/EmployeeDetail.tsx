// src/dashboard/hr/EmployeeDetail.tsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  User,
  Briefcase,
  Building,
  Users,
  Calendar,
  Phone,
  Mail,
  MapPin,
  FileText,
  BadgeCheck,
  Clock,
} from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { Badge } from '@/shared/ui/Badge';
import { apiService } from '@/lib/api/client';
import { useAuth } from '@/features/auth/hooks';
import { toast } from 'sonner';

interface EmployeeData {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  position: string;
  employmentStatus: string;
  joinDate: string;
  terminationDate?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  address?: string;
  phone?: string; // ✅ ADD THIS - phone is in Employee model
  emergencyContact?: string;
  salary?: string;
  bankDetails?: string;
  taxId?: string;
  user: {
    email: string;
    name: string;
    // phone is NOT in user model anymore
  };
  department?: {
    id: string;
    name: string;
  };
  team?: {
    id: string;
    name: string;
  };
  manager?: {
    id: string;
    firstName: string;
    lastName: string;
    position: string;
  };
  leaveSummary?: {
    allocatedDays: number;
    usedDays: number;
    balanceDays: number;
    pendingRequests: number;
  };
}

export const EmployeeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [employee, setEmployee] = React.useState<EmployeeData | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
  const fetchEmployee = async () => {
    try {
      const empResponse = await apiService.request({
        method: 'GET',
        url: `/hr/employees/${id}`,
      });
      
      if (!empResponse.success) {
        throw new Error(empResponse.error || 'Failed to fetch employee');
      }

      // Try different access patterns
      const empData = empResponse.data?.employee || 
                     empResponse.data?.data || 
                     empResponse.data || 
                     empResponse;
      
      if (!empData || typeof empData !== 'object') {
        throw new Error('Invalid employee data format');
      }
      
      setEmployee(empData);
    } catch (err) {
      console.error('Error fetching employee:', err);
      toast.error('Failed to load employee details');
      navigate('/dashboard/hr/employees');
    } finally {
      setLoading(false);
    }
  };
  if (id) fetchEmployee();
}, [id, navigate]);

  const canEdit = user?.role === 'admin' || user?.role === 'hr_manager';

  if (loading) return <div className="p-6">Loading employee details...</div>;
  if (!employee) return null;

  const statusVariant = {
    ACTIVE: 'success',
    ON_LEAVE: 'warning',
    TERMINATED: 'destructive',
    PROBATION: 'secondary',
    REMOTE: 'default',
  }[employee.employmentStatus] || 'default';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          {employee.firstName} {employee.lastName}
        </h1>
        {canEdit && (
          <Button onClick={() => navigate(`/dashboard/hr/employees/${id}/edit`)}>
            Edit Employee
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-3 w-3 text-muted-foreground" />
              {/* ✅ Handle undefined user */}
              <span>{employee.user.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-3 w-3 text-muted-foreground" />
              {/* ✅ Use employee.phone instead of employee.user.phone */}
              <span>{employee.phone || 'Not provided'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-3 w-3 text-muted-foreground" />
              <span>{employee.address || 'Not provided'}</span>
            </div>
            {employee.dateOfBirth && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <span>Born: {format(new Date(employee.dateOfBirth), 'PPP')}</span>
              </div>
            )}
            {employee.nationality && (
              <div className="flex items-center gap-2 text-sm">
                <BadgeCheck className="h-3 w-3 text-muted-foreground" />
                <span>Nationality: {employee.nationality}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Employment Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Employment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Employee ID</p>
              <p className="font-medium">{employee.employeeId}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Position</p>
              <p className="font-medium">{employee.position}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant={statusVariant as "success" | "destructive" | "secondary" | "default" | "outline"}>{employee.employmentStatus}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Join Date</p>
              <p className="font-medium">{format(new Date(employee.joinDate), 'PPP')}</p>
            </div>
            {employee.terminationDate && (
              <div>
                <p className="text-sm text-muted-foreground">Termination Date</p>
                <p className="font-medium">{format(new Date(employee.terminationDate), 'PPP')}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Organization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Organization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Department</p>
              <p className="font-medium">{employee.department?.name || 'Unassigned'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Team</p>
              <p className="font-medium">{employee.team?.name || 'Unassigned'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Manager</p>
              <p className="font-medium">
                {employee.manager
                  ? `${employee.manager.firstName} ${employee.manager.lastName} (${employee.manager.position})`
                  : 'None'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Compensation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Compensation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Salary</p>
              <p className="font-medium">{employee.salary ? `$${employee.salary.toLocaleString()}` : 'Not set'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bank Details</p>
              <p className="font-medium">{employee.bankDetails || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tax ID</p>
              <p className="font-medium">{employee.taxId || 'Not provided'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Leave Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Leave Summary (Annual)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Allocated Days</p>
              <p className="font-medium">{employee.leaveSummary?.allocatedDays || 21}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Used Days</p>
              <p className="font-medium">{employee.leaveSummary?.usedDays || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Remaining</p>
              <p className="font-medium">{employee.leaveSummary?.balanceDays || 21}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Requests</p>
              <p className="font-medium">{employee.leaveSummary?.pendingRequests || 0}</p>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Emergency Contact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{employee.emergencyContact || 'Not provided'}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};