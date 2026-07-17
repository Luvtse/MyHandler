// src/dashboard/hr/EmployeeEditForm.tsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
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
} from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Label } from '@/shared/ui/Label';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { Textarea } from '@/shared/ui/Textarea';
import { apiService } from '@/lib/api/client';
import { toast } from 'sonner';

interface EmployeeFormData {
  firstName: string;
  lastName: string;
  position: string;
  employmentStatus: 'ACTIVE' | 'ON_LEAVE' | 'TERMINATED' | 'PROBATION' | 'REMOTE';
  joinDate: string;
  terminationDate?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  address?: string;
  phone?: string;
  emergencyContact?: string;
  salary?: string;
  bankDetails?: string;
  taxId?: string;
  departmentId: string;
  teamId: string;
  managerId?: string;
}

interface Department {
  id: string;
  name: string;
  teams: { id: string; name: string }[];
}

interface EmployeeOption {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
}

export const EmployeeEditForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<EmployeeFormData>();

  const [departments, setDepartments] = React.useState<Department[]>([]);
  const [teams, setTeams] = React.useState<{ id: string; name: string }[]>([]);
  const [managers, setManagers] = React.useState<EmployeeOption[]>([]);
  const [loading, setLoading] = React.useState(true);

  const departmentId = watch('departmentId');
  const teamId = watch('teamId');

  // Load departments, teams, managers, and employee data
React.useEffect(() => {
  const loadData = async () => {
    try {
      const [{ data: employeeRes }, { data: depsRes }, { data: empsRes }] = await Promise.all([
        apiService.request({ method: 'GET', url: `/hr/employees/${id}` }),
        apiService.request({ method: 'GET', url: '/hr/departments' }),
        apiService.request({ method: 'GET', url: '/hr/employees' }),
      ]);

      // Parse employee data
      const emp = employeeRes.data || employeeRes;
      
      // Parse departments - handle different response structures
      let deps: Department[] = [];
      if (Array.isArray(depsRes)) {
        deps = depsRes;
      } else if (depsRes?.data && Array.isArray(depsRes.data)) {
        deps = depsRes.data;
      }
      
      // Set departments
      setDepartments(deps);

      // Load teams separately based on employee's department
      let empTeams: { id: string; name: string }[] = [];
      if (emp.departmentId) {
        try {
          // Fetch teams for the employee's department
          const teamsRes = await apiService.request({ 
            method: 'GET', 
            url: '/hr/teams',
            params: { departmentId: emp.departmentId }
          });
          
          // Parse teams response
          if (teamsRes.data) {
            if (Array.isArray(teamsRes.data)) {
              empTeams = teamsRes.data;
            } else if (teamsRes.data.data && Array.isArray(teamsRes.data.data)) {
              empTeams = teamsRes.data.data;
            }
          }
        } catch (err) {
          console.error('Failed to load teams:', err);
        }
      }
      setTeams(empTeams);

      // Parse all employees for manager dropdown
      let allEmployees: any[] = [];
      if (Array.isArray(empsRes)) {
        allEmployees = empsRes;
      } else if (empsRes?.data && Array.isArray(empsRes.data)) {
        allEmployees = empsRes.data;
      }

      // Set managers (exclude current employee)
      setManagers(
        allEmployees
          .filter(e => e && e.id !== id)
          .map(e => ({
            id: e.id,
            firstName: e.firstName || '',
            lastName: e.lastName || '',
            position: e.position || '',
          }))
      );

      // Reset form with employee data
      reset({
        firstName: emp.firstName || '',
        lastName: emp.lastName || '',
        position: emp.position || '',
        employmentStatus: emp.employmentStatus || 'ACTIVE',
        joinDate: emp.joinDate ? emp.joinDate.split('T')[0] : '',
        terminationDate: emp.terminationDate ? emp.terminationDate.split('T')[0] : undefined,
        dateOfBirth: emp.dateOfBirth ? emp.dateOfBirth.split('T')[0] : undefined,
        gender: emp.gender || '',
        nationality: emp.nationality || '',
        address: emp.address || '',
        phone: emp.phone || '',
        emergencyContact: emp.emergencyContact || '',
        salary: emp.salary || '',
        bankDetails: emp.bankDetails || '',
        taxId: emp.taxId || '',
        departmentId: emp.departmentId || '',
        teamId: emp.teamId || '',
        managerId: emp.managerId || '',
      });
    } catch (err) {
      console.error('Load data error:', err);
      toast.error('Failed to load employee data');
      navigate('/dashboard/hr/employees');
    } finally {
      setLoading(false);
    }
  };

  if (id) loadData();
}, [id, reset, navigate]);

  // Update teams when department changes
React.useEffect(() => {
  const loadTeamsForDepartment = async () => {
    if (departmentId) {
      try {
        // Fetch teams for the selected department
        const teamsRes = await apiService.request({ 
          method: 'GET', 
          url: '/hr/teams',
          params: { departmentId }
        });
        
        // Parse teams response
        let fetchedTeams: { id: string; name: string }[] = [];
        if (teamsRes.data) {
          if (Array.isArray(teamsRes.data)) {
            fetchedTeams = teamsRes.data;
          } else if (teamsRes.data.data && Array.isArray(teamsRes.data.data)) {
            fetchedTeams = teamsRes.data.data;
          }
        }
        setTeams(fetchedTeams);
        
        // Clear team selection if current team is not in new department
        const currentTeamId = watch('teamId');
        if (currentTeamId && !fetchedTeams.some(t => t.id === currentTeamId)) {
          setValue('teamId', '');
        }
      } catch (err) {
        console.error('Failed to load teams:', err);
        setTeams([]);
      }
    } else {
      setTeams([]);
      setValue('teamId', '');
    }
  };

  loadTeamsForDepartment();
}, [departmentId, departments, setValue, watch]);

  const onSubmit = async (data: EmployeeFormData) => {
    try {
      if (!data.departmentId || !data.teamId) {
        toast.error('Please select both a department and a team');
        return;
      }

      await apiService.request({
        method: 'PATCH',
        url: `/hr/employees/${id}`,
        data: {
          ...data,
          salary: data.salary ? Number(data.salary) : undefined,
        },
      });
      toast.success('Employee updated successfully');
      navigate(`/dashboard/hr/employees/${id}`);
    } catch (err: any) {
      toast.error(err?.error || 'Failed to update employee');
    }
  };

  if (loading) return <div className="p-6">Loading employee data...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Edit Employee</h1>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name *</Label>
                  <Input {...register('firstName', { required: true })} />
                </div>
                <div className="space-y-2">
                  <Label>Last Name *</Label>
                  <Input {...register('lastName', { required: true })} />
                </div>
              </div>
              <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input {...register('phone')} />
              </div>
              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <Input type="date" {...register('dateOfBirth')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Input {...register('gender')} />
                </div>
                <div className="space-y-2">
                  <Label>Nationality</Label>
                  <Input {...register('nationality')} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Textarea {...register('address')} />
              </div>
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
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Position *</Label>
                <Input {...register('position', { required: true })} />
              </div>
              <div className="space-y-2">
                <Label>Employment Status *</Label>
                <select {...register('employmentStatus')} className="w-full p-2 border rounded-md">
                  <option value="ACTIVE">Active</option>
                  <option value="ON_LEAVE">On Leave</option>
                  <option value="TERMINATED">Terminated</option>
                  <option value="PROBATION">Probation</option>
                  <option value="REMOTE">Remote</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Join Date *</Label>
                  <Input type="date" {...register('joinDate', { required: true })} />
                </div>
                <div className="space-y-2">
                  <Label>Termination Date</Label>
                  <Input type="date" {...register('terminationDate')} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Organization */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Organization *
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Department *</Label>
                <select 
                  value={departmentId || ''}
                  onChange={(e) => setValue('departmentId', e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Team *</Label>
                <select 
                  value={teamId || ''}
                  onChange={(e) => setValue('teamId', e.target.value)}
                  disabled={!departmentId}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select team</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Manager</Label>
                <select 
                  value={watch('managerId') || ''}
                  onChange={(e) => setValue('managerId', e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select manager</option>
                  {managers.map((mgr) => (
                    <option key={mgr.id} value={mgr.id}>
                      {mgr.firstName} {mgr.lastName} ({mgr.position})
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Compensation & Emergency */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Compensation & Emergency
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Emergency Contact *</Label>
                <Input {...register('emergencyContact', { required: true })} />
              </div>
              <div className="space-y-2">
                <Label>Salary (USD)</Label>
                <Input type="number" {...register('salary')} />
              </div>
              <div className="space-y-2">
                <Label>Bank Details</Label>
                <Textarea {...register('bankDetails')} />
              </div>
              <div className="space-y-2">
                <Label>Tax ID</Label>
                <Input {...register('taxId')} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
};