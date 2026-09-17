"use client";

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '@/utils/formatters';
import { YearlyData } from '@/utils/calculations';
import { chartColors } from '@/styles/theme';

interface TooltipEntry {
  dataKey: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: number;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const principal = payload.find(p => p.dataKey === 'principal')?.value ?? 0;
  const interest = payload.find(p => p.dataKey === 'interest')?.value ?? 0;
  return (
    <div className="bg-card border border-border p-3.5 rounded-xl shadow-lg min-w-[160px]">
      <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wide mb-2">Year {label}</p>
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: chartColors.principal }} />
            Principal
          </span>
          <span className="text-sm font-bold tabular-nums" style={{ color: chartColors.principal }}>{formatCurrency(principal)}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: chartColors.interest }} />
            Interest
          </span>
          <span className="text-sm font-bold tabular-nums" style={{ color: chartColors.interest }}>{formatCurrency(interest)}</span>
        </div>
      </div>
      <div className="flex items-center justify-between gap-4 mt-2 pt-2 border-t border-border">
        <span className="text-xs font-semibold text-foreground">Total</span>
        <span className="text-sm font-bold tabular-nums text-foreground">{formatCurrency(principal + interest)}</span>
      </div>
    </div>
  );
};

interface YearlyBreakdownChartProps {
  data: YearlyData[];
}

const YearlyBreakdownChart: React.FC<YearlyBreakdownChartProps> = ({ data }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-xs font-bold text-foreground uppercase tracking-wide mb-1">Year by Year Breakdown</h3>
      <p className="text-xs text-muted-foreground mb-4">
        Principal and interest paid over time.
      </p>
      <div style={{ height: '400px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.10)" strokeWidth={0.5} />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
              tickMargin={8}
            />
            <YAxis
              tickFormatter={formatCurrency}
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
              width={64}
              tickCount={5}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--secondary) / 0.5)' }} />
            <Legend
              verticalAlign="top"
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 12, paddingBottom: 8, color: 'hsl(var(--muted-foreground))' }}
            />
            <Bar dataKey="principal" name="Principal" stackId="a" fill={chartColors.principal} radius={[0, 0, 0, 0]} />
            <Bar dataKey="interest" name="Interest" stackId="a" fill={chartColors.interest} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default YearlyBreakdownChart;
