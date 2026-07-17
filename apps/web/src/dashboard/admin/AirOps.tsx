import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { API_CONFIG, API_ENDPOINTS } from '@/lib/api/endpoints';
import { apiRequestData } from '@/lib/api/client';

const AirOps: React.FC = () => {
  const [airports, setAirports] = React.useState<any[]>([]);
  const [schedules, setSchedules] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  const [newAirport, setNewAirport] = React.useState({ code: '', city: '', name: '', type: 'Domestic', processingHours: 5, businessStart: 6, businessEnd: 20, tzOffset: 180, country: 'ET', timezone: 'Africa/Addis_Ababa' });
  const [newSchedule, setNewSchedule] = React.useState({ originCode: '', destinationCode: '', daysOfWeek: '1,2,3,4,5,6', dailyFrequency: 1, lastDepartureLocal: '17:00', flightMinutes: 90 });
  const [csvFile, setCsvFile] = React.useState<File | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const aps = await apiRequestData<any>({ method: 'GET', url: API_ENDPOINTS.shipments.airports });
      const fss = await apiRequestData<any>({ method: 'GET', url: API_ENDPOINTS.shipments.flightSchedules });
      setAirports((aps as any).data || aps);
      setSchedules((fss as any).data || fss);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { load(); }, []);

  const addAirport = async () => {
    await apiRequestData({ method: 'POST', url: API_ENDPOINTS.shipments.airports, data: newAirport });
    await load();
  };

  const addSchedule = async () => {
    const payload = { ...newSchedule, daysOfWeek: newSchedule.daysOfWeek.split(',').map(s => parseInt(s.trim(), 10)).filter(n => n >= 1 && n <= 7) };
    await apiRequestData({ method: 'POST', url: API_ENDPOINTS.shipments.flightSchedules, data: payload });
    await load();
  };

  const uploadCsv = async () => {
    if (!csvFile) return;
    const text = await csvFile.text();
    const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
    const header = lines[0].split(',').map(h => h.trim().toLowerCase());
    const required = ['originCode','destinationCode','daysOfWeek','dailyFrequency','lastDepartureLocal','flightMinutes'].map(s => s.toLowerCase());
    const hasAll = required.every(k => header.includes(k));
    if (!hasAll) return;
    const idx = (k: string) => header.indexOf(k);
    const items = lines.slice(1).map(line => {
      const cols = line.split(',').map(c => c.trim());
      const days = cols[idx('daysofweek')].split(';').map(s => parseInt(s.trim(), 10)).filter(n => n >= 1 && n <= 7);
      return {
        originCode: cols[idx('origincode')],
        destinationCode: cols[idx('destinationcode')],
        daysOfWeek: days,
        dailyFrequency: parseInt(cols[idx('dailyfrequency')], 10) || 1,
        lastDepartureLocal: cols[idx('lastdeparturelocal')],
        flightMinutes: parseInt(cols[idx('flightminutes')], 10) || 90,
      };
    });
    await apiRequestData({ method: 'POST', url: API_ENDPOINTS.shipments.flightSchedules + '/bulk', data: items });
    await load();
    setCsvFile(null);
  };

  return (
    <MainLayout>
      <section className="py-8">
        <div className="logistics-container grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Airports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <Input placeholder="Code" value={newAirport.code} onChange={(e) => setNewAirport({ ...newAirport, code: e.target.value })} />
                <Input placeholder="City" value={newAirport.city} onChange={(e) => setNewAirport({ ...newAirport, city: e.target.value })} />
                <Input placeholder="Name" value={newAirport.name} onChange={(e) => setNewAirport({ ...newAirport, name: e.target.value })} />
                <Input placeholder="Type" value={newAirport.type} onChange={(e) => setNewAirport({ ...newAirport, type: e.target.value })} />
                <Input placeholder="Processing Hours" type="number" value={newAirport.processingHours} onChange={(e) => setNewAirport({ ...newAirport, processingHours: parseInt(e.target.value, 10) || 0 })} />
                <Input placeholder="Start" type="number" value={newAirport.businessStart} onChange={(e) => setNewAirport({ ...newAirport, businessStart: parseInt(e.target.value, 10) || 6 })} />
                <Input placeholder="End" type="number" value={newAirport.businessEnd} onChange={(e) => setNewAirport({ ...newAirport, businessEnd: parseInt(e.target.value, 10) || 20 })} />
                <Input placeholder="TZ Offset" type="number" value={newAirport.tzOffset} onChange={(e) => setNewAirport({ ...newAirport, tzOffset: parseInt(e.target.value, 10) || 180 })} />
                <Input placeholder="Country" value={newAirport.country} onChange={(e) => setNewAirport({ ...newAirport, country: e.target.value })} />
                <Input placeholder="Timezone" value={newAirport.timezone} onChange={(e) => setNewAirport({ ...newAirport, timezone: e.target.value })} />
              </div>
              <Button onClick={addAirport} disabled={loading}>Add Airport</Button>
              <div className="mt-6 space-y-2">
                {airports.map(a => (
                  <div key={a.code} className="p-2 border rounded">
                    <div className="font-medium">{a.code} - {a.city}</div>
                    <div className="text-sm">{a.name} • {a.type} • Proc {a.processingHours}h • {a.businessStart}:00–{a.businessEnd}:00 • {a.timezone || 'TZ'}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Flight Schedules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <Input placeholder="Origin Code" value={newSchedule.originCode} onChange={(e) => setNewSchedule({ ...newSchedule, originCode: e.target.value.toUpperCase() })} />
                <Input placeholder="Destination Code" value={newSchedule.destinationCode} onChange={(e) => setNewSchedule({ ...newSchedule, destinationCode: e.target.value.toUpperCase() })} />
                <Input placeholder="Days Of Week (1-7)" value={newSchedule.daysOfWeek} onChange={(e) => setNewSchedule({ ...newSchedule, daysOfWeek: e.target.value })} />
                <Input placeholder="Daily Frequency" type="number" value={newSchedule.dailyFrequency} onChange={(e) => setNewSchedule({ ...newSchedule, dailyFrequency: parseInt(e.target.value, 10) || 1 })} />
                <Input placeholder="Last Departure (HH:mm)" value={newSchedule.lastDepartureLocal} onChange={(e) => setNewSchedule({ ...newSchedule, lastDepartureLocal: e.target.value })} />
                <Input placeholder="Flight Minutes" type="number" value={newSchedule.flightMinutes} onChange={(e) => setNewSchedule({ ...newSchedule, flightMinutes: parseInt(e.target.value, 10) || 90 })} />
              </div>
              <Button onClick={addSchedule} disabled={loading}>Add Schedule</Button>
              <div className="mt-4">
                <div className="flex items-center gap-2">
                  <Input type="file" accept=".csv" onChange={(e) => setCsvFile(e.target.files?.[0] || null)} />
                  <Button onClick={uploadCsv} disabled={loading || !csvFile}>Upload CSV</Button>
                </div>
              </div>
              <div className="mt-6 space-y-2">
                {schedules.map(s => (
                  <div key={s.id} className="p-2 border rounded">
                    <div className="font-medium">{(s.originCode || s.originCity)} → {(s.destinationCode || s.destinationCity)}</div>
                    <div className="text-sm">Days: {s.daysOfWeek?.join(',')} • Freq {s.dailyFrequency} • Last {s.lastDepartureLocal} • {s.flightMinutes}m</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </MainLayout>
  );
};

export default AirOps;
