"use client";

// src/components/loan/LoanSummary.tsx

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MetricCard } from '@/components/ui/MetricCard';

interface LoanSummaryProps {
  currentEMI: number;
  totalInterest: number;
  totalAmount: number;
  loanAmount: number;
  emiInputMode?: 'tenure' | 'emi';
  effectiveTenure?: number;
}

const LoanSummary: React.FC<LoanSummaryProps> = ({
  currentEMI,
  totalInterest,
  totalAmount,
  loanAmount,
  emiInputMode = 'tenure',
  effectiveTenure = 0,
}) => {
  return (
    <Card>
      <CardContent className="p-3">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard
            title="Principal Amount"
            value={loanAmount}
            type="currency"
          />
          {emiInputMode === 'tenure' ? (
            <MetricCard
              title="Current EMI"
              value={currentEMI}
              type="currency"
            />
          ) : (
            <MetricCard
              title="Loan Tenure"
              value={effectiveTenure}
              type="tenure"
              subtext="Calculated from EMI"
              showMonthsSuffix
            />
          )}
          <MetricCard
            title="Total Interest"
            value={totalInterest}
            type="currency"
            subtext="Interest over loan term"
          />
          <MetricCard
            title="Total Amt (P+I)"
            value={totalAmount}
            type="currency"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default LoanSummary;