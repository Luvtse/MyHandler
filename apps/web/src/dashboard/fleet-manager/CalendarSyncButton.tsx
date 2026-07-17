// @/dashboard/fleet/components/CalendarSyncButton.tsx
import { Button } from '@/components/ui/button';
import { Calendar, Globe, Mail } from 'lucide-react';
import { toast } from 'sonner';

interface CalendarSyncButtonProps {
  vehicleId: string;
  eventName: string;
  start: string;
  end: string;
}

export const CalendarSyncButton = ({ vehicleId, eventName, start, end }: CalendarSyncButtonProps) => {
  const syncToGoogle = async () => {
    // Redirect to your backend OAuth flow
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/google-calendar?redirect=/dashboard/fleet/${vehicleId}&event=${encodeURIComponent(JSON.stringify({ title: eventName, start, end }))}`;
  };

  const syncToOutlook = async () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/outlook-calendar?redirect=/dashboard/fleet/${vehicleId}&event=${encodeURIComponent(JSON.stringify({ title: eventName, start, end }))}`;
  };

  return (
    <div className="flex gap-2 mt-2">
      <Button variant="outline" size="sm" onClick={syncToGoogle}>
        <Globe className="h-4 w-4 mr-1" /> Google
      </Button>
      <Button variant="outline" size="sm" onClick={syncToOutlook}>
        <Mail className="h-4 w-4 mr-1" /> Outlook
      </Button>
    </div>
  );
};