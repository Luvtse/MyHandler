import React from 'react';
import {
  Users, TrendingUp, FileText, AlertCircle, RefreshCw,
  BarChart3, Target, Bot, CheckCircle, Zap,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { useAuth } from '@/features/auth/hooks';
import { getCmoData } from '@/services/executive';
import type { CmoData, ExecutiveInsight } from '@/services/executive';

// ─── Constants — defined at module scope so they're always available in JSX ───

const DEAL_STATUSES: Record<string, { label: string; color: string }> = {
  won:     { label: 'Won',     color: '#22C55E' },
  pending: { label: 'Pending', color: '#F59E0B' },
  lost:    { label: 'Lost',    color: '#EF4444' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n >= 1_000_000
    ? `ETB ${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
    ? `ETB ${(n / 1_000).toFixed(0)}K`
    : `ETB ${n.toLocaleString()}`;
}

function InsightCard({ insight }: { insight: ExecutiveInsight }) {
  const Icon = insight.severity === 'high' ? AlertCircle : insight.severity === 'medium' ? Zap : CheckCircle;
  const cls  = { high: 'text-red-500', medium: 'text-amber-500', low: 'text-green-500' }[insight.severity];
  const bg   = {
    high:   'border-red-100 bg-red-50/30',
    medium: 'border-amber-100 bg-amber-50/30',
    low:    'border-green-100 bg-green-50/30',
  }[insight.severity];
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

function KpiCard({ label, value, sub, icon: Icon, loading }: {
  label: string; value: string; sub: string; icon: React.ElementType; loading: boolean;
}) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-500">{label}</span>
          <div className="p-2 bg-brand-50 rounded-lg"><Icon className="h-4 w-4 text-brand-600" /></div>
        </div>
        {loading
          ? <Skeleton className="h-8 w-28 mb-1" />
          : <p className="text-2xl font-bold text-gray-900">{value}</p>}
        <p className="text-xs text-gray-400 mt-1">{sub}</p>
      </CardContent>
    </Card>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

const CmoDashboard = () => {
  const { user } = useAuth();
  const { data, isLoading, isError, refetch, isFetching } = useQuery<CmoData>({
    queryKey:  ['cmo-dashboard'],
    queryFn:   getCmoData,
    staleTime: 2 * 60_000,
    retry:     1,
  });

  const m = data?.metrics;
  const funnelColors = ['#1A3C8F', '#2D5FBF', '#4A85E0', '#FFC107'];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CMO Marketing Dashboard</h1>
          <p className="text-sm text-gray-500">
            Good morning, {user?.name ?? 'CMO'} · Live client &amp; marketing pipeline
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          Failed to load marketing data.{' '}
          <button className="underline ml-1" onClick={() => refetch()}>Retry</button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Total Quotations"  value={m ? m.totalLeads.toLocaleString() : '—'}     sub="All time pipeline"              icon={FileText}  loading={isLoading} />
        <KpiCard label="Conversion Rate"   value={m ? `${m.conversionRate}%` : '—'}             sub="Won ÷ total quotations"          icon={TrendingUp} loading={isLoading} />
        <KpiCard label="Client Retention"  value={m ? `${m.retentionRate}%` : '—'}              sub="Active 90-day vs prior 90"       icon={Users}     loading={isLoading} />
        <KpiCard label="Active Clients"    value={m ? m.activeClients.toLocaleString() : '—'}   sub={m ? `of ${m.totalClients.toLocaleString()} total` : 'Loading…'} icon={Target} loading={isLoading} />
      </div>

      {/* Deal funnel + At-risk clients */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Quotation Pipeline Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-52 w-full" />
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data?.funnelData ?? []} layout="vertical" barSize={28}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: '#475569' }} axisLine={false} tickLine={false} width={90} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {(data?.funnelData ?? []).map((_, i) => (
                        <Cell key={i} fill={funnelColors[i] ?? '#94A3B8'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 flex gap-4 flex-wrap">
                  {[
                    { label: 'Won',     value: m?.wonDeals,     color: '#22C55E' },
                    { label: 'Pending', value: m?.pendingDeals, color: '#F59E0B' },
                    { label: 'Lost',    value: m?.lostDeals,    color: '#EF4444' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50">
                      <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                      <span className="text-sm text-gray-600">{label}</span>
                      <span className="text-sm font-bold text-gray-900">{value ?? '—'}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <AlertCircle className="h-4 w-4 text-amber-500" /> At-Risk Clients
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {isLoading ? (
              [1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full" />)
            ) : (data?.atRiskClients?.length ?? 0) === 0 ? (
              <div className="flex flex-col items-center py-8 text-gray-400">
                <CheckCircle className="h-8 w-8 mb-2 text-green-400" />
                <p className="text-sm font-medium">All clients active</p>
              </div>
            ) : (
              data?.atRiskClients.map((c: { id: string; name: string; status: string; updatedAt: string }) => (
                <div key={c.id} className="p-3 rounded-lg bg-amber-50 border border-amber-100">
                  <p className="text-sm font-semibold text-gray-800">{c.name}</p>
                  <p className="text-xs text-amber-700 capitalize">{c.status.replace(/_/g, ' ')}</p>
                  <p className="text-xs text-gray-400">Updated {new Date(c.updatedAt).toLocaleDateString()}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent acquisitions */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Recent Quotations</CardTitle>
          <CardDescription>Latest pipeline activity from client quotations</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data?.recentAcquisitions ?? []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-gray-400 py-6">
                      No recent quotations
                    </TableCell>
                  </TableRow>
                ) : (
                  (data?.recentAcquisitions ?? []).slice(0, 8).map((q: {
                    id: string;
                    client?: { name: string };
                    clientId: string;
                    totalAmount?: number;
                    status: string;
                    createdAt: string;
                  }) => (
                    <TableRow key={q.id}>
                      <TableCell className="font-medium">{q.client?.name ?? q.clientId}</TableCell>
                      <TableCell>{fmt(q.totalAmount ?? 0)}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          style={{
                            color:       DEAL_STATUSES[q.status]?.color ?? '#64748B',
                            borderColor: DEAL_STATUSES[q.status]?.color ?? '#94A3B8',
                          }}
                        >
                          {DEAL_STATUSES[q.status]?.label ?? q.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-500 text-sm">
                        {new Date(q.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Bot className="h-4 w-4 text-brand-600" /> AI Marketing Insights
          </CardTitle>
          <CardDescription>Anomalies and recommendations from live client &amp; pipeline data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading
            ? [1, 2].map(i => <Skeleton key={i} className="h-24 w-full" />)
            : (data?.insights ?? []).map(ins => <InsightCard key={ins.id} insight={ins} />)
          }
        </CardContent>
      </Card>
    </div>
  );
};

export default CmoDashboard;
