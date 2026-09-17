// src/components/loan/LoanComparisonChart.tsx

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/utils/formatters';
import { chartColors } from '@/styles/theme';

interface LineConfig {
  dataKey: string;
  name: string;
  color: string;
}

interface ChartData {
  month: number;
  originalBalance?: number | null;
  modifiedBalance?: number | null;
  rateChangeBalance?: number | null;
  combinedBalance?: number | null;
  originalInterest?: number;
  modifiedInterest?: number;
  rateChangeInterest?: number;
  combinedInterest?: number;
  savings?: number;
  extraPaymentApplied?: number;
}

interface LoanComparisonChartProps {
  data: ChartData[];
  title: string;
  height?: number;
  lineConfig?: LineConfig[];
  showInterest?: boolean;
  showSavings?: boolean;
}

interface TooltipEntry {
  name: string;
  value: number | null;
  color: string;
  payload: ChartData;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: number;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const filteredPayload = payload.filter((entry) => entry.value !== null && entry.value !== undefined);
    if (filteredPayload.length === 0) return null;

    const extraPaymentApplied: number = payload[0]?.payload?.extraPaymentApplied ?? 0;

    return (
      <div className="bg-card border border-border p-3.5 rounded-xl shadow-lg min-w-[160px]">
        <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wide mb-2">Month {label}</p>
        <div className="flex flex-col gap-1">
          {filteredPayload.map((entry) => (
            <div key={entry.name} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                {entry.name}
              </span>
              <span className="text-sm font-bold tabular-nums" style={{ color: entry.color }}>
                {formatCurrency(entry.value ?? 0)}
              </span>
            </div>
          ))}
        </div>
        {extraPaymentApplied > 0 && (
          <p className="text-xs font-bold mt-2 pt-2 border-t border-border" style={{ color: chartColors.extraPayment }}>
            ↓ Extra Payment: {formatCurrency(extraPaymentApplied)}
          </p>
        )}
      </div>
    );
  }
  return null;
};

interface DotProps {
  cx?: number;
  cy?: number;
  payload?: ChartData;
}

const ExtraPaymentDot: React.FC<DotProps> = ({ cx, cy, payload }) => {
  if (!payload?.extraPaymentApplied || payload.extraPaymentApplied <= 0) return null;
  return <circle cx={cx} cy={cy} r={5} fill={chartColors.extraPayment} stroke="#fff" strokeWidth={2} />;
};

const LoanComparisonChart: React.FC<LoanComparisonChartProps> = ({
  data = [],
  title = 'Loan Comparison',
  height = 320,
  lineConfig = [
    { dataKey: 'originalBalance', name: 'Original Balance', color: chartColors.original },
    { dataKey: 'modifiedBalance', name: 'Modified Balance', color: chartColors.optimised }
  ],
  showInterest = false,
  showSavings = false
}) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="p-4">
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wide mb-4">{title}</h3>
          <div className="h-[300px] w-full flex items-center justify-center bg-secondary border border-border/40 rounded-lg">
            <p className="text-muted-foreground">No data available for chart</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="text-xs font-bold text-foreground uppercase tracking-wide mb-4">{title}</h3>
        <div style={{ height: `${height}px`, width: '100%' }}>
          <ResponsiveContainer>
            <LineChart
              data={data}
              margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.10)" strokeWidth={0.5} />
              <XAxis
                dataKey="month"
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
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12, paddingTop: 12, color: 'hsl(var(--muted-foreground))' }}
              />

              {lineConfig.map((config, idx) => (
                <Line
                  key={config.dataKey}
                  type="monotone"
                  dataKey={config.dataKey}
                  name={config.name}
                  stroke={config.color}
                  strokeWidth={2}
                  dot={idx === 1 ? <ExtraPaymentDot /> : false}
                  activeDot={{ r: 4 }}
                  connectNulls
                />
              ))}

              {showInterest && (
                <>
                  {data[0]?.originalInterest !== undefined && (
                    <Line type="monotone" dataKey="originalInterest" name="Original Interest"
                      stroke={chartColors.interest} strokeWidth={2} dot={false} connectNulls />
                  )}
                  {data[0]?.modifiedInterest !== undefined && (
                    <Line type="monotone" dataKey="modifiedInterest" name="Modified Interest"
                      stroke={chartColors.extraPayment} strokeWidth={2} dot={false} connectNulls />
                  )}
                  {data[0]?.rateChangeInterest !== undefined && (
                    <Line type="monotone" dataKey="rateChangeInterest" name="Rate Change Interest"
                      stroke={chartColors.extraPayment} strokeWidth={2} dot={false} connectNulls />
                  )}
                  {data[0]?.combinedInterest !== undefined && (
                    <Line type="monotone" dataKey="combinedInterest" name="Combined Interest"
                      stroke={chartColors.original} strokeWidth={2} dot={false} connectNulls />
                  )}
                </>
              )}

              {showSavings && data[0]?.savings !== undefined && (
                <Line type="monotone" dataKey="savings" name="Savings Gap"
                  stroke={chartColors.savings} strokeWidth={2} dot={false} strokeDasharray="5 5" connectNulls />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoanComparisonChart;
