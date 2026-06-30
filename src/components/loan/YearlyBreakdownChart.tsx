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
    <div className="bg-card border border-border p-3 rounded-lg shadow-lg text-sm">
      <p className="font-semibold mb-1">Year {label}</p>
      <p style={{ color: chartColors.principal }}>Principal: {formatCurrency(principal)}</p>
      <p style={{ color: chartColors.interest }}>Interest: {formatCurrency(interest)}</p>
      <p className="font-medium mt-1 border-t border-border pt-1">Total: {formatCurrency(principal + interest)}</p>
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
      <p className="text-base font-bold text-foreground">Year by Year Breakdown</p>
      <p className="text-xs font-medium text-muted-foreground mb-2">
        Interest and Prinicple paid over time.
      </p>
      <div style={{ height: '400px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 15 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.08)" strokeWidth={0.5} />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 11 }}
              label={{ value: 'Year', position: 'insideBottom', offset: -8, fontSize: 11 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.25)' }}
              tickLine={{ stroke: 'rgba(255,255,255,0.25)' }}
            />
            <YAxis
              tickFormatter={formatCurrency}
              tick={{ fontSize: 10 }}
              width={70}
              axisLine={{ stroke: 'rgba(255,255,255,0.25)' }}
              tickLine={{ stroke: 'rgba(255,255,255,0.25)' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="principal" name="Principal" stackId="a" fill={chartColors.principal} radius={[0, 0, 0, 0]} />
            <Bar dataKey="interest" name="Interest" stackId="a" fill={chartColors.interest} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default YearlyBreakdownChart;
