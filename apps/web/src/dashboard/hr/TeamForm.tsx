// src/dashboard/hr/TeamForm.tsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Users } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Label } from '@/shared/ui/Label';
import { Textarea } from '@/shared/ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { apiService } from '@/lib/api/client';
import { toast } from 'sonner';

interface TeamFormData {
  name: string;
  description?: string;
  departmentId: string;
  leaderId: string;
}

export const TeamForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { isSubmitting }, reset, watch } = useForm<TeamFormData>();
  
  const [departments, setDepartments] = React.useState<Array<{ id: string; name: string }>>([]);
  const [leaders, setLeaders] = React.useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = React.useState(true);
  const [isEdit, setIsEdit] = React.useState(false);

  const departmentId = watch('departmentId');

  React.useEffect(() => {
    const loadData = async () => {
      try {
        // Load departments and employees
        const [{ success: depsSuccess, data: depsData }, { success: empsSuccess, data: empsData }] = await Promise.all([
          apiService.request({ method: 'GET', url: '/hr/departments' }),
          apiService.request({ method: 'GET', url: '/hr/employees' })
        ]);
        
        if (!depsSuccess || !empsSuccess) {
          throw new Error('Failed to load data');
        }

        // Handle response formats
        const deps = Array.isArray(depsData) ? depsData : (Array.isArray(depsData?.data) ? depsData.data : []);
        const emps = Array.isArray(empsData) ? empsData : (Array.isArray(empsData?.data) ? empsData.data : []);

        // Map departments
        setDepartments(deps.map(d => ({ id: d.id, name: d.name })));
        
        // Map leaders
        setLeaders(
          emps
            .filter(e => e.id && (e.firstName || e.lastName))
            .map(e => ({
              id: e.id,
              name: `${e.firstName || ''} ${e.lastName || ''}`.trim() || e.employeeId || 'Unknown'
            }))
        );

        // If editing, load team data
        if (id) {
          setIsEdit(true);
          const teamResponse = await apiService.request({ method: 'GET', url: `/hr/teams/${id}` });
          if (!teamResponse.success) throw new Error(teamResponse.error || 'Failed to load team');
          
          const team = teamResponse.data;
          reset({
            name: team.name || '',
            description: team.description || '',
            departmentId: team.departmentId || '',
            leaderId: team.leaderId || ''
          });
        }
      } catch (err: any) {
        console.error('Load error:', err);
        toast.error(err.message || 'Failed to load data');
        navigate('/dashboard/hr/teams');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id, reset, navigate]);

  // Filter leaders by department when department changes
  React.useEffect(() => {
    if (!departmentId) return;
    
    // In real app, you'd filter by department, but for now keep all leaders
    // (Your backend doesn't link employees to departments in the employee list)
  }, [departmentId]);

  const onSubmit = async (data: TeamFormData) => {
    if (!data.name.trim()) {
      toast.error('Team name is required');
      return;
    }
    if (!data.departmentId) {
      toast.error('Please select a department');
      return;
    }
    if (!data.leaderId) {
      toast.error('Please select a team leader');
      return;
    }

    try {
      let response;
      if (isEdit) {
        response = await apiService.request({
          method: 'PATCH',
          url: `/hr/teams/${id}`,
          data,
        });
      } else {
        response = await apiService.request({
          method: 'POST',
          url: '/hr/teams',
          data,
        });
      }

      if (!response.success) {
        throw new Error(response.error || `Failed to ${isEdit ? 'update' : 'create'} team`);
      }

      toast.success(`Team ${isEdit ? 'updated' : 'created'} successfully`);
      navigate('/dashboard/hr/teams');
    } catch (err: any) {
      console.error('Submit error:', err);
      toast.error(err.message || `Failed to ${isEdit ? 'update' : 'create'} team`);
    }
  };

  if (loading) return <div className="p-6">Loading data...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          {isEdit ? 'Edit Team' : 'Create New Team'}
        </h1>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Team Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Team Name *</Label>
              <Input {...register('name', { required: true })} placeholder="e.g., Delivery Team" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea {...register('description')} placeholder="Optional description" />
            </div>
            <div className="space-y-2">
              <Label>Department *</Label>
              <select 
                {...register('departmentId', { required: true })}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Team Leader *</Label>
              <select 
                {...register('leaderId', { required: true })}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select team leader</option>
                {leaders.map((leader) => (
                  <option key={leader.id} value={leader.id}>{leader.name}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEdit ? 'Update Team' : 'Create Team'}
          </Button>
        </div>
      </form>
    </div>
  );
};