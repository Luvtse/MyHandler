import React from 'react';
import {
  DollarSign, TrendingUp, Wallet, AlertCircle, BarChart3,
  Zap, Bot, RefreshCw, ArrowUpRight, CheckCircle, FileWarning,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { useAuth } from '@/features/auth/hooks';
import { toast } from 'sonner';
import { getCfoData } from '@/services/executive';
import type { CfoData, ExecutiveInsight } from '@/services/executive';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n >= 1_000_000 ? `ETB ${(n / 1_000_000).toFixed(2)}M` : n >= 1_000 ? `ETB ${(n / 1_000).toFixed(0)}K` : `ETB ${n.toLocaleString()}`;
}

function SeverityIcon({ s }: { s: string }) {
  if (s === 'high') return <AlertCircle className="h-4 w-4 text-red-500" />;
  if (s === 'medium') return <Zap className="h-4 w-4 text-amber-500" />;
  return <CheckCircle className="h-4 w-4 text-green-500" />;
}

function InsightCard({ insight }: { insight: ExecutiveInsight }) {
  const bg = { high: 'border-red-100 bg-red-50/30', medium: 'border-amber-100 bg-amber-50/30', low: 'border-green-100 bg-green-50/30' }[insight.severity];
  return (
    <div className={`p-4 rounded-xl border ${bg} space-y-2`}>
      <div className="flex items-center gap-2">
        <SeverityIcon s={insight.severity} />
        <span className="text-sm font-semibold text-gray-800">{insight.title}</span>
        <span className="ml-auto text-xs text-gray-400">{Math.round(insight.confidence * 100)}% conf.</span>
      </div>
      <p className="text-sm text-gray-600">{insight.message}</p>
      <p className="text-xs text-brand-700 font-medium bg-brand-50 rounded-lg px-3 py-1.5">💡 {insight.recommendation}</p>
    </div>
  );
}

function KpiCard({ label, value, sub, icon: Icon, color, loading }: { label: string; value: string; sub: string; icon: React.ElementType; color: string; loading: boolean }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-500">{label}</span>
          <div className="p-2 rounded-lg" style={{ background: `${color}18` }}>
            <Icon className="h-4 w-4" style={{ color }} />
          </div>
        </div>
        {loading ? <Skeleton className="h-8 w-28 mb-1" /> : <p className="text-2xl font-bold text-gray-900">{value}</p>}
        <p className="text-xs text-gray-400 mt-1">{sub}</p>
      </CardContent>
    </Card>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

const CfoDashboard = () => {
  const { user } = useAuth();
  const { data, isLoading, isError, refetch, isFetching } = useQuery<CfoData>({
    queryKey: ['cfo-dashboard'],
    queryFn: getCfoData,
    staleTime: 2 * 60_000,
    retry: 1,
  });

  const m = data?.metrics;

  const invoiceColors: Record<string, string> = {
    PAID: '#22C55E', PENDING: '#F59E0B', OVERDUE: '#EF4444', DRAFT: '#94A3B8',
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CFO Financial Dashboard</h1>
          <p className="text-sm text-gray-500">Good morning, {user?.name ?? 'CFO'} · Live financial position</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          Failed to load financial data. <button className="underline ml-1" onClick={() => refetch()}>Retry</button>
        </div>
      )}

      {/* Overdue alert */}
      {!isLoading && m && m.overdueInvoices > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3 text-amber-800 text-sm">
          <FileWarning className="h-4 w-4 shrink-0" />
          <span><strong>{m.overdueInvoices}</strong> overdue invoice{m.overdueInvoices > 1 ? 's' : ''} totalling <strong>{fmt(m.overdueAmount)}</strong>. Follow up immediately.</span>
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="YTD Revenue" value={m ? fmt(m.revenue) : '—'} sub={m ? `${m.ytdGrowth >= 0 ? '+' : ''}${m.ytdGrowth}% vs last year` : 'Loading…'} icon={DollarSign} color="#1A3C8F" loading={isLoading} />
        <KpiCard label="Net Profit (Est.)" value={m ? fmt(m.netProfit) : '—'} sub={m ? `${m.operatingMargin}% operating margin (est.)` : 'Loading…'} icon={TrendingUp} color="#22C55E" loading={isLoading} />
        <KpiCard label="Cash Collected" value={m ? fmt(m.cashFlow) : '—'} sub="Paid invoices — all time" icon={Wallet} color="#FFC107" loading={isLoading} />
        <KpiCard label="Overdue" value={m ? `${m.overdueInvoices} inv.` : '—'} sub={m ? fmt(m.overdueAmount) : 'Loading…'} icon={AlertCircle} color="#EF4444" loading={isLoading} />
      </div>

      {/* Revenue chart + Invoice breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Monthly Revenue (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-52 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data?.revenueByMonth ?? []} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : `${(v / 1_000).toFixed(0)}K`} />
                  <Tooltip formatter={(v: number) => [fmt(v), 'Revenue']} />
                  <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                    {(data?.revenueByMonth ?? []).map((_, i) => (
                      <Cell key={i} fill={i === (data?.revenueByMonth?.length ?? 1) - 1 ? '#1A3C8F' : '#93A8D4'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <BarChart3 className="h-4 w-4 text-brand-600" /> Invoice Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-10 w-full" />)
            ) : (
              (data?.invoiceSummary ?? []).map((s: any) => (
                <div key={s.status} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: invoiceColors[s.status] ?? '#94A3B8' }} />
                    <span className="text-sm font-medium text-gray-700 capitalize">{s.status.toLowerCase()}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{s._count?.id ?? 0}</p>
                    <p className="text-xs text-gray-400">{fmt(s._sum?.totalAmount ?? 0)}</p>
                  </div>
                </div>
              ))
            )}
            {!isLoading && (!data?.invoiceSummary || data.invoiceSummary.length === 0) && (
              <p className="text-sm text-gray-400 text-center py-6">No invoices yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Bot className="h-4 w-4 text-brand-600" /> AI Financial Insights
          </CardTitle>
          <CardDescription>Anomalies and recommendations from live financial data</CardDescription>
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

export default CfoDashboard;
