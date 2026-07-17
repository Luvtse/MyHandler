// @/dashboard/fleet/MaintenanceCalendarPage.tsx
import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wrench, Truck, CalendarPlus } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

// Mock data — replace with API
interface MaintenanceEvent {
  id: string;
  title: string;
  vehicleId: string;
  plateNumber: string;
  start: string; // ISO date
  end: string;
  type: 'oil_change' | 'tire_rotation' | 'brake_service' | 'full_inspection' | 'emergency';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  assignedMechanic: string;
}

const mockEvents: MaintenanceEvent[] = [
  {
    id: 'evt-001',
    title: 'Full Inspection - ADD-1234',
    vehicleId: 'V001',
    plateNumber: 'ADD-1234',
    start: '2026-01-10T09:00:00',
    end: '2026-01-10T11:00:00',
    type: 'full_inspection',
    status: 'scheduled',
    assignedMechanic: 'Yohannes T.',
  },
  {
    id: 'evt-002',
    title: 'Brake Service - HAW-5678',
    vehicleId: 'V002',
    plateNumber: 'HAW-5678',
    start: '2026-01-10T14:00:00',
    end: '2026-01-10T15:30:00',
    type: 'brake_service',
    status: 'in_progress',
    assignedMechanic: 'Selamawit G.',
  },
];

const getStatusColor = (status: MaintenanceEvent['status']) => {
  switch (status) {
    case 'scheduled': return 'bg-blue-100 text-blue-800';
    case 'in_progress': return 'bg-yellow-100 text-yellow-800';
    case 'completed': return 'bg-green-100 text-green-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    default: return 'bg-muted';
  }
};

const getTypeIcon = (type: MaintenanceEvent['type']) => {
  switch (type) {
    case 'emergency': return '🚨';
    case 'full_inspection': return '🔍';
    default: return '🔧';
  }
};

const MaintenanceCalendarPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<MaintenanceEvent[]>(mockEvents);

  const handleDateSelect = (selectInfo: any) => {
    const confirm = window.confirm('Would you like to schedule a new maintenance?');
    if (confirm) {
      // Redirect to schedule with pre-filled date
      navigate(`/dashboard/fleet/schedule-maintenance?start=${selectInfo.startStr}&end=${selectInfo.endStr}`);
    }
  };

  const handleEventClick = (clickInfo: any) => {
    const event = events.find(e => e.id === clickInfo.event.id);
    if (event) {
      navigate(`/dashboard/fleet/${event.vehicleId}`);
    }
  };

  // Fetch real events from API (replace mock)
  useEffect(() => {
    // const fetchEvents = async () => { ... }
    // fetchEvents();
  }, []);

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
          <CardDescription>Drag to reschedule • Click to view vehicle</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-md border">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay',
              }}
              events={events.map(e => ({
                id: e.id,
                title: `${getTypeIcon(e.type)} ${e.plateNumber}`,
                start: e.start,
                end: e.end,
                backgroundColor: e.status === 'in_progress' ? '#fde68a' :
                              e.status === 'completed' ? '#bbf7d0' :
                              e.status === 'cancelled' ? '#fecaca' : '#dbeafe',
                borderColor: 'transparent',
                textColor: '#1e293b',
                extendedProps: e,
              }))}
              selectable={true}
              select={handleDateSelect}
              eventClick={handleEventClick}
              nowIndicator={true}
              height="auto"
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
                <Badge className={getStatusColor(status)}>{status.replace('_', ' ')}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MaintenanceCalendarPage;