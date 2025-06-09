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
}

interface LoanComparisonChartProps {
  data: ChartData[];
  title: string;
  height?: number;
  lineConfig?: LineConfig[];
  showInterest?: boolean;
  showSavings?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const filteredPayload = payload.filter((entry: any) => entry.value !== null && entry.value !== undefined);
    
    if (filteredPayload.length === 0) return null;
    
    return (
      <div className="bg-white p-3 border rounded-lg shadow-lg">
        <p className="text-sm font-semibold mb-2">Month {label}</p>
        {filteredPayload.map((entry: any) => (
          <p key={entry.name} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const LoanComparisonChart: React.FC<LoanComparisonChartProps> = ({
  data = [],
  title = 'Loan Comparison',
  height = 320,
  lineConfig = [
    { dataKey: 'originalBalance', name: 'Original Balance', color: '#8884d8' },
    { dataKey: 'modifiedBalance', name: 'Modified Balance', color: '#82ca9d' }
  ],
  showInterest = false,
  showSavings = false
}) => {
  // If data is empty, show a message instead
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold mb-4">{title}</h3>
          <div className="h-[300px] w-full flex items-center justify-center bg-gray-50 border rounded-md">
            <p className="text-gray-500">No data available for chart</p>
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
              
              {lineConfig.map((config) => (
                <Line
                  key={config.dataKey}
                  type="monotone"
                  dataKey={config.dataKey}
                  name={config.name}
                  stroke={config.color}
                  dot={false}
                  connectNulls
                />
              ))}
              
              {/* Interest lines */}
              {showInterest && (
                <>
                  {data[0]?.originalInterest !== undefined && (
                    <Line
                      type="monotone"
                      dataKey="originalInterest"
                      name="Original Interest"
                      stroke="#ffc658"
                      dot={false}
                      connectNulls
                    />
                  )}
                  {data[0]?.modifiedInterest !== undefined && (
                    <Line
                      type="monotone"
                      dataKey="modifiedInterest"
                      name="Modified Interest"
                      stroke="#ff7300"
                      dot={false}
                      connectNulls
                    />
                  )}
                  {data[0]?.rateChangeInterest !== undefined && (
                    <Line
                      type="monotone"
                      dataKey="rateChangeInterest"
                      name="Rate Change Interest"
                      stroke="#ff7300"
                      dot={false}
                      connectNulls
                    />
                  )}
                  {data[0]?.combinedInterest !== undefined && (
                    <Line
                      type="monotone"
                      dataKey="combinedInterest"
                      name="Combined Interest"
                      stroke="#8884d8"
                      dot={false}
                      connectNulls
                    />
                  )}
                </>
              )}
              
              {/* Savings line */}
              {showSavings && data[0]?.savings !== undefined && (
                <Line
                  type="monotone"
                  dataKey="savings"
                  name="Withdrawal Limit"
                  stroke="#00C49F"
                  dot={false}
                  strokeDasharray="5 5"
                  connectNulls
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoanComparisonChart;