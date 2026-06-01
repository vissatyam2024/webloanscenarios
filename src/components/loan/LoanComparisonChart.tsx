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
      <div className="bg-card border border-border p-3 rounded-lg shadow-lg">
        <p className="text-sm font-semibold mb-2">Month {label}</p>
        {filteredPayload.map((entry) => (
          <p key={entry.name} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {formatCurrency(entry.value ?? 0)}
          </p>
        ))}
        {extraPaymentApplied > 0 && (
          <p className="text-sm font-semibold mt-2" style={{ color: chartColors.extraPayment }}>
            ⬇ Extra Payment: {formatCurrency(extraPaymentApplied)}
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
          <h3 className="text-lg font-semibold mb-4">{title}</h3>
          <div className="h-[300px] w-full flex items-center justify-center bg-secondary border rounded-md">
            <p className="text-muted-foreground">No data available for chart</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div style={{ height: `${height}px`, width: '100%' }}>
          <ResponsiveContainer>
            <LineChart
              data={data}
              margin={{ top: 15, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                label={{ value: 'Months', position: 'insideBottom', offset: -2 }}
              />
              <YAxis
                tickFormatter={formatCurrency}
                label={{ value: 'Amount (₹)', angle: -90, position: 'insideLeft', offset: -12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />

              {lineConfig.map((config, idx) => (
                <Line
                  key={config.dataKey}
                  type="monotone"
                  dataKey={config.dataKey}
                  name={config.name}
                  stroke={config.color}
                  dot={idx === 1 ? <ExtraPaymentDot /> : false}
                  connectNulls
                />
              ))}

              {showInterest && (
                <>
                  {data[0]?.originalInterest !== undefined && (
                    <Line type="monotone" dataKey="originalInterest" name="Original Interest"
                      stroke={chartColors.interest} dot={false} connectNulls />
                  )}
                  {data[0]?.modifiedInterest !== undefined && (
                    <Line type="monotone" dataKey="modifiedInterest" name="Modified Interest"
                      stroke={chartColors.extraPayment} dot={false} connectNulls />
                  )}
                  {data[0]?.rateChangeInterest !== undefined && (
                    <Line type="monotone" dataKey="rateChangeInterest" name="Rate Change Interest"
                      stroke={chartColors.extraPayment} dot={false} connectNulls />
                  )}
                  {data[0]?.combinedInterest !== undefined && (
                    <Line type="monotone" dataKey="combinedInterest" name="Combined Interest"
                      stroke={chartColors.original} dot={false} connectNulls />
                  )}
                </>
              )}

              {showSavings && data[0]?.savings !== undefined && (
                <Line type="monotone" dataKey="savings" name="Savings Gap"
                  stroke={chartColors.savings} dot={false} strokeDasharray="5 5" connectNulls />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoanComparisonChart;
