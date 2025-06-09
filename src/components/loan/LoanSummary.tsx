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
}

const LoanSummary: React.FC<LoanSummaryProps> = ({
  currentEMI,
  totalInterest,
  totalAmount,
  loanAmount
}) => {
  return (
    <Card className="card-enhanced">
      <CardContent className="p-4">
        <h4 className="text-lg font-semibold mb-4">Current Loan Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Principal Amount"
            value={loanAmount}
            type="currency"
            subtext="Total loan amount"
          />
          <MetricCard
            title="Monthly EMI"
            value={currentEMI}
            type="currency"
            subtext="Current monthly payment"
          />
          <MetricCard
            title="Total Interest"
            value={totalInterest}
            type="currency"
            subtext="Interest over loan term"
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