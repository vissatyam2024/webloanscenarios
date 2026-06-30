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
  const tenureYears = Math.floor(effectiveTenure / 12);
  const tenureMonths = effectiveTenure % 12;
  const tenureLabel = tenureMonths > 0
    ? `${tenureYears} yrs ${tenureMonths} mo`
    : `${tenureYears} yrs`;

  return (
    <Card className="card-enhanced">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard
            title="Principal Amount"
            value={loanAmount}
            type="currency"
            // subtext="Total loan amount"
          />
          {emiInputMode === 'tenure' ? (
            <MetricCard
              title="Current EMI"
              value={currentEMI}
              type="currency"
              // subtext="Current monthly payment"
            />
          ) : (
            <div className="p-3 border border-border/40 rounded-lg">
              <div className="text-sm font-medium text-muted-foreground">Loan Tenure</div>
              <div className="text-xl font-extrabold">{tenureLabel}</div>
              <div className="text-xs text-muted-foreground">{effectiveTenure} months • Calculated from EMI</div>
            </div>
          )}
          <MetricCard
            title="Total Interest"
            value={totalInterest}
            type="currency"
            // subtext="Interest over loan term"
          />
          <MetricCard
            title="Total Amount"
            value={totalAmount}
            type="currency"
            subtext="Principal + Interest"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default LoanSummary;