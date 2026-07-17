// src/dashboard/hr/CorrespondenceForm.tsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Label } from '@/shared/ui/Label';
import { Textarea } from '@/shared/ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { apiService } from '@/lib/api/client';
import { toast } from 'sonner';
import { CORRESPONDENCE_TYPE_LABELS, CorrespondenceType } from '@/types/Correspondence';

interface CorrespondenceFormData {
  employeeId: string;
  type: CorrespondenceType;
  subject: string;
  content: string;
}

export const CorrespondenceForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { isSubmitting }, reset, watch } = useForm<CorrespondenceFormData>();
  
  const [employees, setEmployees] = React.useState<Array<{ id: string; name: string; employeeId: string }>>([]);
  const [loading, setLoading] = React.useState(true);
  const [isEdit, setIsEdit] = React.useState(false);

  const employeeId = watch('employeeId');
  const type = watch('type');

  // Load employees and existing correspondence (if editing)
  React.useEffect(() => {
    const loadData = async () => {
      try {
        // Load all employees
        const empResponse = await apiService.request({
            method: 'GET',
            url: '/hr/employees'
          });

          if (!empResponse.success) {
            console.error('API Error:', empResponse.error);
            throw new Error(empResponse.error || 'Failed to load employees');
          }

          // Handle different response structures
          let empList = [];
          if (Array.isArray(empResponse.data)) {
            empList = empResponse.data;
          } else if (empResponse.data?.data && Array.isArray(empResponse.data.data)) {
            empList = empResponse.data.data;
          } else if (empResponse.data?.employees && Array.isArray(empResponse.data.employees)) {
            empList = empResponse.data.employees;
          }

          console.log('Processed employee list:', empList);

          const mappedEmployees = empList
            .filter(e => e && e.id) // Filter out invalid entries
            .map(e => ({
              id: e.id,
              name: `${e.firstName || ''} ${e.lastName || ''}`.trim() || 'Unnamed Employee',
              employeeId: e.employeeId || e.id
            }));

          setEmployees(mappedEmployees);
                } catch (err: any) {
                  toast.error(err.message || 'Failed to load data');
                  navigate('/dashboard/hr/correspondence');
                } finally {
                  setLoading(false);
                }
              };
              
              loadData();
            }, [id, reset, navigate]);

  const onSubmit = async (data: CorrespondenceFormData) => {
    try {
      let response;
      if (isEdit) {
        response = await apiService.request({
          method: 'PATCH',
          url: `/hr/correspondence/${id}`,
          data
        });
      } else {
        response = await apiService.request({
          method: 'POST',
          url: '/hr/correspondence',
          data
        });
      }

      if (!response.success) {
        throw new Error(response.error || 'Operation failed');
      }

      toast.success(`Correspondence ${isEdit ? 'updated' : 'created'} successfully`);
      navigate('/dashboard/hr/correspondence');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save correspondence');
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          {isEdit ? 'Edit Correspondence' : 'New HR Correspondence'}
        </h1>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Correspondence Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Employee *</Label>
              <select 
                {...register('employeeId', { required: true })}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select employee</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.employeeId})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Type *</Label>
              <select 
                {...register('type', { required: true })}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select type</option>
                {Object.entries(CORRESPONDENCE_TYPE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Subject *</Label>
              <Input {...register('subject', { required: true })} placeholder="Enter subject" />
            </div>

            <div className="space-y-2">
              <Label>Content *</Label>
              <Textarea {...register('content', { required: true })} placeholder="Enter correspondence content" rows={8} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEdit ? 'Update' : 'Create'}
          </Button>
        </div>
      </form>
    </div>
  );
};