// src/dashboard/hr/CorrespondenceDetail.tsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Mail, User, Calendar } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { apiService } from '@/lib/api/client';
import { toast } from 'sonner';
import { CORRESPONDENCE_TYPE_LABELS } from '@/types/Correspondence';

export const CorrespondenceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [correspondence, setCorrespondence] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadCorrespondence = async () => {
      try {
        const response = await apiService.request({
          method: 'GET',
          url: `/hr/correspondence/${id}`
        });
        
        if (response.success) {
          setCorrespondence(response.data);
        }
      } catch (err) {
        toast.error('Failed to load correspondence');
        navigate('/dashboard/hr/correspondence');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) loadCorrespondence();
  }, [id, navigate]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!correspondence) return null;

  const canEdit = ['admin', 'hr_manager'].includes(localStorage.getItem('userRole') || '');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Correspondence Details</h1>
        {canEdit && (
          <Button onClick={() => navigate(`/dashboard/hr/correspondence/${id}/edit`)}>
            Edit
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{correspondence.subject}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Type</p>
              <p className="font-medium">
                {CORRESPONDENCE_TYPE_LABELS[correspondence.type as keyof typeof CORRESPONDENCE_TYPE_LABELS]}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Employee</p>
              <p className="font-medium">
                {correspondence.employee.firstName} {correspondence.employee.lastName} ({correspondence.employee.employeeId})
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sent By</p>
              <p className="font-medium">{correspondence.sentByUser?.name || 'System'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sent Date</p>
              <p className="font-medium">{format(new Date(correspondence.sentDate), 'PPP')}</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Content</p>
            <div className="mt-2 p-4 bg-gray-50 rounded-md whitespace-pre-wrap">
              {correspondence.content}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};