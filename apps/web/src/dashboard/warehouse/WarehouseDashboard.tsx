import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/Table';
import { Badge } from '@/shared/ui/Badge';
import { Progress } from '@/shared/ui/Progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/Tabs';
import { Package, Boxes, Truck, Wrench, QrCode, AlertTriangle, Plus, Edit, Trash2, Archive, Clock, CheckCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link, useSearchParams } from 'react-router-dom';

const WarehouseDashboard = () => {
  // Mock data for inventory items
  const inventory = [
    {
      id: 'item1',
      sku: 'SKU001',
      name: 'Product A',
      quantity: 150,
      location: 'A-01-01',
      status: 'In Stock',
      reorderPoint: 50,
    },
    {
      id: 'item2',
      sku: 'SKU002',
      name: 'Product B',
      quantity: 30,
      location: 'B-02-03',
      status: 'Low Stock',
      reorderPoint: 40,
    },
  ];

  // Mock data for equipment
  const equipment = [
    {
      id: 'equip1',
      name: 'Forklift 1',
      status: 'Operational',
      lastMaintenance: '2024-02-15',
      nextMaintenance: '2024-03-15',
    },
    {
      id: 'equip2',
      name: 'Scanner 2',
      status: 'Maintenance Required',
      lastMaintenance: '2024-01-20',
      nextMaintenance: '2024-02-20',
    },
  ];

  // Mock data for storage metrics
  const storageMetrics = {
    totalCapacity: 1000,
    usedCapacity: 650,
    incomingShipments: 12,
    outgoingShipments: 8,
  };

  const { toast } = useToast();

  // Extra sections ported from old root Warehouse dashboard
  const pendingShipments = [
    { id: 'SH-1001', destination: 'New York, NY', status: 'Pending' },
    { id: 'SH-1002', destination: 'Dallas, TX', status: 'Pending' },
    { id: 'SH-1003', destination: 'Seattle, WA', status: 'Delayed' },
  ];

  const todaySchedule = [
    { time: '09:00', task: 'Receive shipment #SH-1001', status: 'Scheduled' },
    { time: '11:30', task: 'Cycle count - Zone B', status: 'In Progress' },
    { time: '14:00', task: 'Load outbound truck #TR-88', status: 'Scheduled' },
    { time: '16:30', task: 'Maintenance check - Forklift 1', status: 'Scheduled' },
  ];

  const warehouseStats = {
    processingSpeed: '120 packages/hour',
    avgPickTime: '2.4 min/order',
    ordersProcessedToday: 340,
    issuesReported: 3,
  };

  const scanItems = () => {
    toast({
      title: 'Scanner coming soon',
      description: 'QR/Barcode scanning will be available in a future update.',
    });
  };

  const addItem = () => {
    toast({
      title: 'Add item',
      description: 'Item creation flow (mock). Integrate with inventory form.',
    });
  };

  const editItem = (item: { id: string; name: string; sku: string }) => {
    toast({
      title: 'Edit item',
      description: `Editing ${item.name} (${item.sku}).`,
    });
  };

  const deleteItem = (item: { id: string; name: string; sku: string }) => {
    toast({
      title: 'Item deleted (mock)',
      description: `${item.name} (${item.sku}) removed from inventory.`,
      variant: 'destructive',
    });
  };

  const scheduleMaintenance = (equip: { id: string; name: string }) => {
    toast({
      title: 'Maintenance scheduled (mock)',
      description: `Scheduling maintenance for ${equip.name}.`,
    });
  };

  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'inventory';
  const [tabValue, setTabValue] = useState(initialTab);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Warehouse Dashboard</h1>
          <p className="text-muted-foreground">Manage inventory and warehouse operations</p>
        </div>
        <div className="flex items-center gap-2">
          <Button className="flex items-center gap-2" onClick={scanItems}>
            <QrCode size={16} />
            Scan Items
          </Button>
          <Button variant="outline" asChild>
            <Link to="/dashboard/shipments">View All Shipments</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Capacity</CardTitle>
            <Boxes className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((storageMetrics.usedCapacity / storageMetrics.totalCapacity) * 100)}%
            </div>
            <Progress
              value={(storageMetrics.usedCapacity / storageMetrics.totalCapacity) * 100}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {storageMetrics.usedCapacity} of {storageMetrics.totalCapacity} units used
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">Across all categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shipments</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {storageMetrics.incomingShipments + storageMetrics.outgoingShipments}
            </div>
            <p className="text-xs text-muted-foreground">
              {storageMetrics.incomingShipments} incoming, {storageMetrics.outgoingShipments} outgoing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Equipment Status</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">90%</div>
            <p className="text-xs text-muted-foreground">Equipment operational rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Extra cards: Pending Shipments, Today's Schedule, Warehouse Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-sm font-medium">Pending Shipments</CardTitle>
              <CardDescription>Shipments awaiting processing or dispatch</CardDescription>
            </div>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Shipment ID</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingShipments.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.id}</TableCell>
                      <TableCell>{s.destination}</TableCell>
                      <TableCell>
                        <Badge variant={s.status === 'Delayed' ? 'destructive' : 'default'}>
                          {s.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" asChild>
                          <Link to="/dashboard/shipments">View</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-sm font-medium">Today’s Schedule</CardTitle>
              <CardDescription>Key warehouse tasks for today</CardDescription>
            </div>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todaySchedule.map((e, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground w-16">{e.time}</span>
                    <span className="text-sm">{e.task}</span>
                  </div>
                  <Badge variant={e.status === 'In Progress' ? 'default' : 'secondary'}>
                    {e.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Warehouse Stats</CardTitle>
          <CardDescription>Operational metrics snapshot</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <div className="text-xs text-muted-foreground">Processing Speed</div>
              <div className="text-xl font-semibold">{warehouseStats.processingSpeed}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Avg. Pick Time</div>
              <div className="text-xl font-semibold">{warehouseStats.avgPickTime}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Orders Processed Today</div>
              <div className="text-xl font-semibold">{warehouseStats.ordersProcessedToday}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Issues Reported</div>
              <div className="text-xl font-semibold">{warehouseStats.issuesReported}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={tabValue} onValueChange={setTabValue} className="space-y-4">
        {/* Quick Actions migrated from root dashboard */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common warehouse operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex-col" asChild>
                <Link to="/dashboard/warehouse?tab=inventory">
                  <Package className="h-5 w-5 mb-1" />
                  Scan Packages
                </Link>
              </Button>
              <Button variant="outline" className="h-20 flex-col" asChild>
                <Link to="/dashboard/warehouse?tab=inventory">
                  <Archive className="h-5 w-5 mb-1" />
                  Check Inventory
                </Link>
              </Button>
              <Button variant="outline" className="h-20 flex-col" asChild>
                <Link to="/dashboard/warehouse?tab=equipment">
                  <Clock className="h-5 w-5 mb-1" />
                  View Schedule
                </Link>
              </Button>
              <Button variant="outline" className="h-20 flex-col" asChild>
                <Link to="/dashboard/warehouse?tab=storage">
                  <CheckCheck className="h-5 w-5 mb-1" />
                  Submit Reports
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        <TabsList>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Inventory Management</CardTitle>
                  <CardDescription>Track and manage warehouse inventory</CardDescription>
                </div>
                <Button className="flex items-center gap-2" onClick={addItem}>
                  <Plus size={16} />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reorder Point</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventory.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.sku}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.location}</TableCell>
                        <TableCell>
                          <Badge
                            variant={item.status === 'In Stock' ? 'default' : 'destructive'}
                          >
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{item.reorderPoint}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => editItem(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-500"
                            onClick={() => deleteItem(item)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="equipment">
          <Card>
            <CardHeader>
              <CardTitle>Equipment Maintenance</CardTitle>
              <CardDescription>Track equipment status and maintenance schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Equipment</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Maintenance</TableHead>
                      <TableHead>Next Maintenance</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {equipment.map((equip) => (
                      <TableRow key={equip.id}>
                        <TableCell className="font-medium">{equip.name}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              equip.status === 'Operational' ? 'default' : 'destructive'
                            }
                          >
                            {equip.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{equip.lastMaintenance}</TableCell>
                        <TableCell>{equip.nextMaintenance}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => scheduleMaintenance(equip)}
                          >
                            <Wrench className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="storage">
          <Card>
            <CardHeader>
              <CardTitle>Storage Optimization</CardTitle>
              <CardDescription>View and optimize storage space usage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Zone Utilization</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Zone A</span>
                            <span>85%</span>
                          </div>
                          <Progress value={85} />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Zone B</span>
                            <span>65%</span>
                          </div>
                          <Progress value={65} />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Zone C</span>
                            <span>45%</span>
                          </div>
                          <Progress value={45} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Optimization Alerts</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 p-3 rounded-md">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="text-sm">Zone A approaching capacity</span>
                        </div>
                        <div className="flex items-center gap-2 text-blue-600 bg-blue-50 p-3 rounded-md">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="text-sm">Suggested reorganization for Zone B</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WarehouseDashboard;
