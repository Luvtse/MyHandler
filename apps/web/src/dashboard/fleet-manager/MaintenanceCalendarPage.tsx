// @/dashboard/fleet-manager/MaintenanceCalendarPage.tsx
import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wrench, CalendarPlus } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { apiService } from '@/lib/api/client';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MaintenanceEvent {
  id: string;
  vehicleId: string;
  plateNumber: string;
  type: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  scheduledAt: string;
  completedAt: string | null;
  notes: string | null;
  vendor: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  scheduled:   '#dbeafe',
  in_progress: '#fde68a',
  completed:   '#bbf7d0',
  cancelled:   '#fecaca',
};

const STATUS_BADGE: Record<string, string> = {
  scheduled:   'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  completed:   'bg-green-100 text-green-800',
  cancelled:   'bg-red-100 text-red-800',
};

const TYPE_ICON: Record<string, string> = {
  emergency:      '🚨',
  full_inspection:'🔍',
  oil_change:     '🛢️',
  tire_rotation:  '🔄',
  brake_service:  '🛑',
};

// ─── Component ────────────────────────────────────────────────────────────────

const MaintenanceCalendarPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<MaintenanceEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const res = await apiService.request<MaintenanceEvent[]>({
          url: '/fleet/maintenance',
          method: 'GET',
        });
        if (res.success && Array.isArray(res.data)) {
          setEvents(res.data);
        } else {
          throw new Error((res as any).message ?? 'Failed to load maintenance events');
        }
      } catch (err) {
        console.error('[MaintenanceCalendar] Fetch failed:', err);
        toast.error('Could not load maintenance schedule');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleDateSelect = (selectInfo: any) => {
    const ok = window.confirm('Schedule a new maintenance starting here?');
    if (ok) {
      navigate(
        `/dashboard/fleet/schedule-maintenance?start=${selectInfo.startStr}&end=${selectInfo.endStr}`,
      );
    }
  };

  const handleEventClick = (clickInfo: any) => {
    const evt = events.find(e => e.id === clickInfo.event.id);
    if (evt?.vehicleId) navigate(`/dashboard/fleet/${evt.vehicleId}`);
  };

  const calendarEvents = events.map(e => ({
    id: e.id,
    title: `${TYPE_ICON[e.type] ?? '🔧'} ${e.plateNumber || e.vehicleId}`,
    start: e.scheduledAt,
    end: e.completedAt ?? undefined,
    backgroundColor: STATUS_COLORS[e.status] ?? '#e2e8f0',
    borderColor: 'transparent',
    textColor: '#1e293b',
    extendedProps: e,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workshop Calendar</h1>
          <p className="text-muted-foreground">Scheduled vehicle maintenance and repairs</p>
        </div>
        <Button onClick={() => navigate('/dashboard/fleet/schedule-maintenance')}>
          <CalendarPlus className="h-4 w-4 mr-2" />
          New Maintenance
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Maintenance Schedule</CardTitle>
          <CardDescription>
            {loading ? 'Loading…' : `${events.length} record${events.length !== 1 ? 's' : ''} · Click to view vehicle · Click date to schedule`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-md border">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              headerToolbar={{
                left:   'prev,next today',
                center: 'title',
                right:  'dayGridMonth,timeGridWeek,timeGridDay',
              }}
              events={calendarEvents}
              selectable={true}
              select={handleDateSelect}
              eventClick={handleEventClick}
              nowIndicator={true}
              height="auto"
              loading={isLoading => setLoading(isLoading)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4">
            {(['scheduled', 'in_progress', 'completed', 'cancelled'] as const).map(status => (
              <div key={status} className="flex items-center gap-2">
                <Badge className={STATUS_BADGE[status]}>{status.replace('_', ' ')}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MaintenanceCalendarPage;
