import React, { useState, useEffect } from 'react';
import { apiService } from '@/services';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Search, Download } from 'lucide-react';

const AuditLogs = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [date, setDate] = useState<Date>();
  const [eventType, setEventType] = useState('all');
  const [auditLogs, setAuditLogs] = useState<Array<{
    id: string;
    timestamp: string;
    user: string;
    action: string;
    details: string;
    status: string;
  }>>([]);

  useEffect(() => {
    const loadAuditLogs = async () => {
      try {
        const response = await apiService.request({
          method: 'GET',
          url: '/audit/logs',
        });
        setAuditLogs(response.data || []);
      } catch (error) {
        console.error('Error loading audit logs:', error);
      }
    };
    loadAuditLogs();
  }, []);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground">Track and monitor system activities</p>
        </div>
        <Button className="flex items-center gap-2">
          <Download size={16} />
          Export Logs
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Activity</CardTitle>
          <CardDescription>View and filter system audit logs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>

            <Select value={eventType} onValueChange={setEventType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Event Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="user">User Events</SelectItem>
                <SelectItem value="role">Role Events</SelectItem>
                <SelectItem value="shipment">Shipment Events</SelectItem>
                <SelectItem value="security">Security Events</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-[240px] justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(auditLogs) && auditLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.timestamp}</TableCell>
                    <TableCell>{log.user}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                        {log.action}
                      </span>
                    </TableCell>
                    <TableCell>{log.details}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                          log.status === 'success'
                            ? 'bg-green-50 text-green-700 ring-green-600/20'
                            : 'bg-red-50 text-red-700 ring-red-600/20'
                        }`}
                      >
                        {log.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLogs;