import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { apiRequestData } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

const EtaCalculator: React.FC = () => {
  const [originCity, setOriginCity] = React.useState('Addis Ababa');
  const [destinationCity, setDestinationCity] = React.useState('Mekelle');
  const [serviceLevel, setServiceLevel] = React.useState('express-domestic');
  const [dropoffTime, setDropoffTime] = React.useState(new Date().toISOString().slice(0,16));
  const [result, setResult] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);

  const calculate = async () => {
    setLoading(true);
    try {
      const data = await apiRequestData<any>({
        method: 'POST',
        url: API_ENDPOINTS.shipments.etaCalculate,
        data: { originCity, destinationCity, serviceLevel, dropoffTime: new Date(dropoffTime).toISOString() },
      });
      setResult(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input value={originCity} onChange={(e) => setOriginCity(e.target.value)} placeholder="Origin City" />
        <Input value={destinationCity} onChange={(e) => setDestinationCity(e.target.value)} placeholder="Destination City" />
        <Select value={serviceLevel} onValueChange={setServiceLevel}>
          <SelectTrigger>
            <SelectValue placeholder="Service Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="express-domestic">Express Domestic</SelectItem>
            <SelectItem value="priority">Priority</SelectItem>
            <SelectItem value="standard">Standard</SelectItem>
            <SelectItem value="economy">Economy</SelectItem>
          </SelectContent>
        </Select>
        <Input type="datetime-local" value={dropoffTime} onChange={(e) => setDropoffTime(e.target.value)} />
      </div>
      <Button onClick={calculate} disabled={loading}>{loading ? 'Calculating…' : 'Calculate ETA'}</Button>
      {result && (
        <div className="mt-4 space-y-2">
          <div className="font-semibold">Estimated Delivery: {new Date(result.estimatedDelivery).toLocaleString()}</div>
          <div className="text-sm">Total Hours: {result.totalHours}</div>
          <div className="text-sm">Total Days: {result.totalDays}</div>
        </div>
      )}
    </div>
  );
};

export default EtaCalculator;
