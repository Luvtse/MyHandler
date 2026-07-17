// @/dashboard/fleet/ScheduleMaintenancePage.tsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';

const maintenanceTypes = [
  { value: 'oil_change', label: 'Oil Change' },
  { value: 'tire_rotation', label: 'Tire Rotation' },
  { value: 'brake_service', label: 'Brake Service' },
  { value: 'full_inspection', label: 'Full Inspection' },
  { value: 'other', label: 'Other' },
];

const ScheduleMaintenancePage = () => {
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    type: 'full_inspection',
    scheduledDate: '',
    mileageAtService: '',
    notes: '',
    vendor: '',
    estimatedCost: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.scheduledDate || !formData.mileageAtService) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success('Maintenance scheduled successfully!');
      navigate(`/dashboard/fleet/${vehicleId}`);
    } catch (err) {
      toast.error('Failed to schedule maintenance');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Schedule Maintenance</h1>
        <p className="text-muted-foreground">Plan service for vehicle {vehicleId}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Maintenance Details</CardTitle>
          <CardDescription>Enter service information below</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="type">Service Type *</Label>
                <Select value={formData.type} onValueChange={v => handleChange('type', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {maintenanceTypes.map(t => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scheduledDate">Scheduled Date *</Label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="scheduledDate"
                    type="date"
                    className="pl-10"
                    value={formData.scheduledDate}
                    onChange={e => handleChange('scheduledDate', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mileageAtService">Mileage at Service *</Label>
                <Input
                  id="mileageAtService"
                  type="number"
                  placeholder="e.g. 150000"
                  value={formData.mileageAtService}
                  onChange={e => handleChange('mileageAtService', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vendor">Service Vendor</Label>
                <Input
                  id="vendor"
                  placeholder="e.g. Addis Auto Works"
                  value={formData.vendor}
                  onChange={e => handleChange('vendor', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedCost">Estimated Cost (ETB)</Label>
                <Input
                  id="estimatedCost"
                  type="number"
                  placeholder="e.g. 2500"
                  value={formData.estimatedCost}
                  onChange={e => handleChange('estimatedCost', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Special instructions or observations..."
                value={formData.notes}
                onChange={e => handleChange('notes', e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit">Schedule Maintenance</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScheduleMaintenancePage;