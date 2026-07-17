// src/dashboard/hr/DepartmentForm.tsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Building } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Label } from '@/shared/ui/Label';
import { Textarea } from '@/shared/ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { apiService } from '@/lib/api/client';
import { toast } from 'sonner';

interface DepartmentFormData {
  name: string;
  description?: string;
  managerId: string;
}

export const DepartmentForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { isSubmitting }, reset } = useForm<DepartmentFormData>();
  
  const [managers, setManagers] = React.useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = React.useState(true);
  const [isEdit, setIsEdit] = React.useState(false);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        // Load employees for manager selection
        const response = await apiService.request({ method: 'GET', url: '/hr/employees' });
        
        if (!response.success) {
          throw new Error(response.error || 'Failed to load employees');
        }

        // Handle both direct array and { data: [] } responses
        let employees = response.data;
        if (Array.isArray(response.data?.data)) {
          employees = response.data.data;
        } else if (!Array.isArray(response.data)) {
          employees = [];
        }

        // Map to simple format
        const managerOptions = employees
          .filter(emp => emp.id && (emp.firstName || emp.lastName))
          .map(emp => ({
            id: emp.id,
            name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.employeeId || 'Unknown'
          }));

        setManagers(managerOptions);

        // If editing, load department data
        if (id) {
          setIsEdit(true);
          const deptResponse = await apiService.request({ method: 'GET', url: `/hr/departments/${id}` });
          if (!deptResponse.success) throw new Error(deptResponse.error || 'Failed to load department');
          
          const dept = deptResponse.data;
          reset({
            name: dept.name || '',
            description: dept.description || '',
            managerId: dept.managerId || ''
          });
        }
      } catch (err: any) {
        console.error('Load error:', err);
        toast.error(err.message || 'Failed to load data');
        navigate('/dashboard/hr/departments');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id, reset, navigate]);

  const onSubmit = async (data: DepartmentFormData) => {
    // Validate required fields
    if (!data.name.trim()) {
      toast.error('Department name is required');
      return;
    }
    if (!data.managerId) {
      toast.error('Please select a department manager');
      return;
    }

    try {
      let response;
      if (isEdit) {
        response = await apiService.request({
          method: 'PATCH',
          url: `/hr/departments/${id}`,
          data,
        });
      } else {
        response = await apiService.request({
          method: 'POST',
          url: '/hr/departments',
          data,
        });
      }

      if (!response.success) {
        throw new Error(response.error || `Failed to ${isEdit ? 'update' : 'create'} department`);
      }

      toast.success(`Department ${isEdit ? 'updated' : 'created'} successfully`);
      navigate('/dashboard/hr/departments');
    } catch (err: any) {
      console.error('Submit error:', err);
      toast.error(err.message || `Failed to ${isEdit ? 'update' : 'create'} department`);
    }
  };

  if (loading) return <div className="p-6">Loading employee data...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          {isEdit ? 'Edit Department' : 'Create New Department'}
        </h1>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Cancel
        </Button>
      </div>

      {/* CRITICAL: Use handleSubmit() */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Department Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Department Name *</Label>
              <Input {...register('name', { required: true })} placeholder="e.g., Fleet Management" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea {...register('description')} placeholder="Optional description" />
            </div>
            <div className="space-y-2">
              <Label>Department Manager *</Label>
              <select 
                {...register('managerId', { required: true })}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select manager</option>
                {managers.map((mgr) => (
                  <option key={mgr.id} value={mgr.id}>{mgr.name}</option>
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
            {isSubmitting ? 'Saving...' : isEdit ? 'Update Department' : 'Create Department'}
          </Button>
        </div>
      </form>
    </div>
  );
};