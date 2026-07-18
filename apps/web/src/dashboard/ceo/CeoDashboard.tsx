import React from 'react';
import {
  TrendingUp, Users, DollarSign, Package, BarChart3, Target, Bot,
  RefreshCw, AlertCircle, Zap, CheckCircle,
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useAuth } from '@/features/auth/hooks';
import { toast } from 'sonner';
import { getCeoData } from '@/services/executive';
import type { CeoData, ExecutiveInsight, StrategicGoal } from '@/services/executive';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n >= 1_000_000
    ? `ETB ${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
    ? `ETB ${(n / 1_000).toFixed(0)}K`
    : `ETB ${n.toLocaleString()}`;
}

function SeverityBadge({ severity }: { severity: ExecutiveInsight['severity'] }) {
  const cls = { high: 'bg-red-100 text-red-700', medium: 'bg-amber-100 text-amber-700', low: 'bg-green-100 text-green-700' }[severity];
  return <span className={`${cls} text-xs font-medium px-2 py-0.5 rounded-full capitalize`}>{severity}</span>;
}

function GoalCard({ goal }: { goal: StrategicGoal }) {
  const pct = Math.min(100, Math.round((goal.current / goal.target) * 100));
  const colors = { on_track: '#22C55E', at_risk: '#F59E0B', off_track: '#EF4444' };
  const color = colors[goal.status];
  return (
    <div className="p-4 rounded-xl border border-gray-100 bg-gray-50 space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">{goal.title}</span>
        <span className="text-xs font-semibold" style={{ color }}>{goal.status.replace('_', ' ')}</span>
      </div>
      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{goal.unit === 'ETB' ? fmt(goal.current) : `${goal.current}${goal.unit}`}</span>
          <span>{goal.unit === 'ETB' ? fmt(goal.target) : `${goal.target}${goal.unit}`}</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
        </div>
        <p className="text-xs text-gray-400 mt-1 text-right">{pct}% of target</p>
      </div>
    </div>
  );
}

function InsightCard({ insight }: { insight: ExecutiveInsight }) {
  const icons = { high: <AlertCircle className="h-4 w-4 text-red-500" />, medium: <Zap className="h-4 w-4 text-amber-500" />, low: <CheckCircle className="h-4 w-4 text-green-500" /> };
  return (
    <div className="p-4 rounded-xl border border-gray-100 bg-white space-y-2">
      <div className="flex items-center gap-2">
        {icons[insight.severity]}
        <span className="text-sm font-semibold text-gray-800">{insight.title}</span>
        <SeverityBadge severity={insight.severity} />
        <span className="ml-auto text-xs text-gray-400">{Math.round(insight.confidence * 100)}% conf.</span>
      </div>
      <p className="text-sm text-gray-600">{insight.message}</p>
      <p className="text-xs text-brand-700 font-medium bg-brand-50 rounded-lg px-3 py-1.5">💡 {insight.recommendation}</p>
    </div>
  );
}

function MetricCard({ title, value, sub, icon: Icon, loading }: { title: string; value: string; sub: string; icon: React.ElementType; loading: boolean }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-500">{title}</span>
          <div className="p-2 bg-brand-50 rounded-lg"><Icon className="h-4 w-4 text-brand-600" /></div>
        </div>
        {loading ? <Skeleton className="h-8 w-32 mb-1" /> : <p className="text-2xl font-bold text-gray-900">{value}</p>}
        <p className="text-xs text-gray-400 mt-1">{sub}</p>
      </CardContent>
    </Card>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

const CeoDashboard = () => {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data, isLoading, isError, refetch, isFetching } = useQuery<CeoData>({
    queryKey: ['ceo-dashboard'],
    queryFn: getCeoData,
    staleTime: 2 * 60_000,
    retry: 1,
  });

  const m = data?.metrics;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CEO Strategic Dashboard</h1>
          <p className="text-sm text-gray-500">Good morning, {user?.name ?? 'CEO'} · Live company performance</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          Failed to load dashboard data. <button className="underline ml-1" onClick={() => refetch()}>Retry</button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="YTD Revenue" value={m ? fmt(m.revenue) : '—'} sub={m ? `${m.ytdGrowth >= 0 ? '+' : ''}${m.ytdGrowth}% vs last year` : 'Loading…'} icon={DollarSign} loading={isLoading} />
        <MetricCard title="Client Retention" value={m ? `${m.customerRetention}%` : '—'} sub="Last 90 days vs prior 90 days" icon={Users} loading={isLoading} />
        <MetricCard title="On-Time Delivery" value={m ? `${m.onTimeDelivery}%` : '—'} sub="YTD shipments delivered on time" icon={Package} loading={isLoading} />
        <MetricCard title="Total Clients" value={m ? m.totalClients.toLocaleString() : '—'} sub={m ? `${m.activeShipments.toLocaleString()} active shipments` : 'Loading…'} icon={BarChart3} loading={isLoading} />
      </div>

      {/* Revenue Chart + Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Revenue Trend (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-52 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data?.revenueChart ?? []} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : `${(v / 1_000).toFixed(0)}K`} />
                  <Tooltip formatter={(v: number) => [fmt(v), 'Revenue']} />
                  <Bar dataKey="revenue" fill="#1A3C8F" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Target className="h-4 w-4 text-brand-600" /> Strategic Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              [1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)
            ) : (
              (data?.goals ?? []).map(g => <GoalCard key={g.id} goal={g} />)
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Bot className="h-4 w-4 text-brand-600" /> AI Strategic Insights
          </CardTitle>
          <CardDescription>Anomalies and recommendations computed from live company data</CardDescription>
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

export default CeoDashboard;
