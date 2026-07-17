import React from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SHIPMENT_STATUSES, ShipmentStatusOption } from '@/types/shipmentStatus';

interface StatusUpdateDropdownProps {
  currentStatus: string;
  onStatusUpdate: (status: string, location: string, notes: string) => void;
  userRole: 'driver' | 'customer';
}

const StatusUpdateDropdown: React.FC<StatusUpdateDropdownProps> = ({
  currentStatus,
  onStatusUpdate,
  userRole
}) => {
  const [selectedStatus, setSelectedStatus] = React.useState(currentStatus);
  const [location, setLocation] = React.useState('');
  const [notes, setNotes] = React.useState('');

  // Group statuses by category
  const statusesByCategory = SHIPMENT_STATUSES.reduce((acc, status) => {
    if (!acc[status.category]) {
      acc[status.category] = [];
    }
    acc[status.category].push(status);
    return acc;
  }, {} as Record<string, ShipmentStatusOption[]>);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStatus && location) {
      onStatusUpdate(selectedStatus, location, notes);
      setLocation('');
      setNotes('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="status">Update Status</Label>
        <Select
          value={selectedStatus}
          onValueChange={setSelectedStatus}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select new status" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(statusesByCategory).map(([category, statuses]) => (
              <SelectGroup key={category}>
                <SelectLabel>{category}</SelectLabel>
                {statuses.map((status) => (
                  <SelectItem
                    key={status.id}
                    value={status.id}
                    title={status.description}
                  >
                    {status.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Enter current location"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Additional Notes</Label>
        <Input
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any relevant notes"
        />
      </div>

      <Button type="submit" className="w-full">
        Update Status
      </Button>
    </form>
  );
};

export default StatusUpdateDropdown;