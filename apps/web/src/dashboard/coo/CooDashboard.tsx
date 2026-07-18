import React from 'react';
import {
  Package, Truck, Clock, AlertTriangle, TrendingUp,
  Zap, Bot, RefreshCw, AlertCircle, CheckCircle, BarChart3,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useAuth } from '@/features/auth/hooks';
import { getCooData } from '@/services/executive';
import type { CooData, ExecutiveInsight } from '@/services/executive';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function InsightCard({ insight }: { insight: ExecutiveInsight }) {
  const Icon = insight.severity === 'high' ? AlertCircle : insight.severity === 'medium' ? Zap : CheckCircle;
  const cls = { high: 'text-red-500', medium: 'text-amber-500', low: 'text-green-500' }[insight.severity];
  const bg = { high: 'border-red-100 bg-red-50/30', medium: 'border-amber-100 bg-amber-50/30', low: 'border-green-100 bg-green-50/30' }[insight.severity];
  return (
    <div className={`p-4 rounded-xl border ${bg} space-y-2`}>
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${cls}`} />
        <span className="text-sm font-semibold text-gray-800">{insight.title}</span>
        <span className="ml-auto text-xs text-gray-400">{Math.round(insight.confidence * 100)}% conf.</span>
      </div>
      <p className="text-sm text-gray-600">{insight.message}</p>
      <p className="text-xs text-brand-700 font-medium bg-brand-50 rounded-lg px-3 py-1.5">💡 {insight.recommendation}</p>
    </div>
  );
}

function KpiCard({ label, value, sub, icon: Icon, loading }: { label: string; value: string; sub: string; icon: React.ElementType; loading: boolean }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-500">{label}</span>
          <div className="p-2 bg-brand-50 rounded-lg"><Icon className="h-4 w-4 text-brand-600" /></div>
        </div>
        {loading ? <Skeleton className="h-8 w-28 mb-1" /> : <p className="text-2xl font-bold text-gray-900">{value}</p>}
        <p className="text-xs text-gray-400 mt-1">{sub}</p>
      </CardContent>
    </Card>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

const CooDashboard = () => {
  const { user } = useAuth();
  const { data, isLoading, isError, refetch, isFetching } = useQuery<CooData>({
    queryKey: ['coo-dashboard'],
    queryFn: getCooData,
    staleTime: 2 * 60_000,
    retry: 1,
  });

  const m = data?.metrics;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">COO Operations Dashboard</h1>
          <p className="text-sm text-gray-500">Good morning, {user?.name ?? 'COO'} · Live operational performance</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          Failed to load operations data. <button className="underline ml-1" onClick={() => refetch()}>Retry</button>
        </div>
      )}

      {/* Active alerts */}
      {!isLoading && m && (m.delayedShipments > 0 || m.stockoutItems > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {m.delayedShipments > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3 text-amber-800 text-sm">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span><strong>{m.delayedShipments}</strong> shipment{m.delayedShipments > 1 ? 's' : ''} currently delayed</span>
            </div>
          )}
          {m.stockoutItems > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-800 text-sm">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span><strong>{m.stockoutItems}</strong> inventory SKU{m.stockoutItems > 1 ? 's' : ''} out of stock</span>
            </div>
          )}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="On-Time Delivery" value={m ? `${m.onTimeDeliveryRate}%` : '—'} sub="Delivered ÷ (delivered + delayed)" icon={TrendingUp} loading={isLoading} />
        <KpiCard label="Avg Fulfillment" value={m ? `${m.avgFulfillmentTime}h` : '—'} sub="Creation → delivery (30-day avg)" icon={Clock} loading={isLoading} />
        <KpiCard label="Shipments This Month" value={m ? m.shipmentsProcessed.toLocaleString() : '—'} sub="Created since month start" icon={Package} loading={isLoading} />
        <KpiCard label="Fleet Utilization" value={m ? `${m.fleetUtilization}%` : '—'} sub={m ? `${m.activeVehicles} active · ${m.idleVehicles} idle` : 'Loading…'} icon={Truck} loading={isLoading} />
      </div>

      {/* Fulfillment trend + Fleet stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Fulfillment Time Trend (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-52 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={data?.fulfillmentTrend ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}h`} />
                  <Tooltip formatter={(v: number) => [`${v.toFixed(1)}h`, 'Avg time']} />
                  <Line type="monotone" dataKey="time" stroke="#1A3C8F" strokeWidth={2.5} dot={{ fill: '#1A3C8F', r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <BarChart3 className="h-4 w-4 text-brand-600" /> Inventory Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            {isLoading ? (
              [1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full" />)
            ) : (
              <>
                <div className="p-3 rounded-lg bg-gray-50 flex justify-between items-center">
                  <span className="text-sm text-gray-600">Inventory Turnover</span>
                  <span className="text-sm font-bold text-gray-900">{m?.inventoryTurnover ?? '—'}×</span>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 flex justify-between items-center">
                  <span className="text-sm text-gray-600">SKUs Out of Stock</span>
                  <span className={`text-sm font-bold ${(m?.stockoutItems ?? 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>{m?.stockoutItems ?? '—'}</span>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 flex justify-between items-center">
                  <span className="text-sm text-gray-600">Fleet Active</span>
                  <span className="text-sm font-bold text-gray-900">{m?.activeVehicles ?? '—'} vehicles</span>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 flex justify-between items-center">
                  <span className="text-sm text-gray-600">Fleet Idle</span>
                  <span className={`text-sm font-bold ${(m?.idleVehicles ?? 0) > (m?.activeVehicles ?? 0) * 0.25 ? 'text-amber-600' : 'text-green-600'}`}>{m?.idleVehicles ?? '—'} vehicles</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Bot className="h-4 w-4 text-brand-600" /> AI Operations Insights
          </CardTitle>
          <CardDescription>Anomalies and recommendations from live operational data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            [1, 2].map(i => <Skeleton key={i} className="h-24 w-full" />)
          ) : (
            (data?.insights ?? []).map(ins => <InsightCard key={ins.id} insight={ins} />)
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CooDashboard;
