// src/components/LoanAnalyzer.tsx

import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import LoanInputs from './loan/LoanInputs';
import LoanSummary from './loan/LoanSummary';
import LoanMetrics from './loan/LoanMetrics';
import { calculateLoan } from '@/utils/calculations';
import { FrequencyType, LoanMetrics as LoanMetricsType } from '@/types/loan.types';
import { CalculatorInfoModal } from './loan/CalculatorInfoModal';
import AnimatedBackground from './AnimatedBackground'; // Import the animated background

// Default metrics object with all required properties
const defaultMetrics: LoanMetricsType = {
  currentEMI: 0,
  newEMI: 0,
  monthlySaving: 0,
  interestSaving: 0,
  newTenure: 0,
  tenureReduction: 0,
  extraPaymentSaving: 0,
  extraTenureReduction: 0,
  totalSaving: 0,
  monthsWithExtra: 0,
  totalInterestWithExtra: 0,
  totalCurrentInterest: 0
};

const LoanAnalyzer: React.FC = () => {
  const [loanAmount, setLoanAmount] = useState<number>(10000000);
  const [tenure, setTenure] = useState<number>(300);
  const [isYearMode, setIsYearMode] = useState<boolean>(true);
  const [currentRate, setCurrentRate] = useState<number>(9);
  const [newRate, setNewRate] = useState<number>(7.5);
  const [extraPayment, setExtraPayment] = useState<number>(0);
  const [frequency, setFrequency] = useState<FrequencyType>('yearly');

  const monthlyExtra = useMemo(() => 
    Math.round(extraPayment * (
      frequency === 'monthly' ? 1 :
      frequency === 'quarterly' ? 1/3 : 1/12
    )),
    [extraPayment, frequency]
  );

  // Calculate loan metrics with error handling
  const metrics = useMemo(() => {
    try {
      if (loanAmount && currentRate && newRate && tenure) {
        return calculateLoan(loanAmount, currentRate, newRate, tenure, monthlyExtra);
      }
      return defaultMetrics;
    } catch (error) {
      console.error("Error calculating loan metrics:", error);
      return defaultMetrics;
    }
  }, [loanAmount, currentRate, newRate, tenure, monthlyExtra]);

  const handleCurrentRateChange = (value: number) => {
    setCurrentRate(value);
    setNewRate(value);
  };

  return (
    <>
      {/* The AnimatedBackground component is now fixed to the viewport */}
      <AnimatedBackground />
      
      <div className="relative min-h-full w-full">
        <div className="w-full max-w-4xl mx-auto pt-8 pb-12 px-4 space-y-3 relative z-10">
          <div className="flex items-center justify-center">
            <h1 className="text-xl font-bold text-gray-800 border-b-2 border-gray-800 pb-1">
              Home Loan Analyzer (Calculate - Compare - Save)
            </h1>
            <CalculatorInfoModal />
          </div>
        
          {/* Primary Inputs with Loan Summary */}
          <Card className="bg-white/95">
            <CardContent className="p-4 space-y-4">
              <LoanInputs
                loanAmount={loanAmount}
                tenure={tenure}
                isYearMode={isYearMode}
                currentRate={currentRate}
                newRate={newRate}
                extraPayment={extraPayment}
                frequency={frequency}
                onLoanAmountChange={setLoanAmount}
                onTenureChange={setTenure}
                onYearModeChange={setIsYearMode}
                onCurrentRateChange={handleCurrentRateChange}
                onNewRateChange={setNewRate}
                onExtraPaymentChange={setExtraPayment}
                onFrequencyChange={setFrequency}
              />
              
              <LoanSummary
                currentEMI={metrics.currentEMI || 0}
                totalInterest={(metrics.currentEMI || 0) * tenure - loanAmount}
                totalAmount={(metrics.currentEMI || 0) * tenure}
                loanAmount={loanAmount}
              />
            </CardContent>
          </Card>

          {/* Metrics Dashboard */}
          <Card className="bg-white/95">
            <CardContent className="p-4">
              <LoanMetrics 
                metrics={metrics} 
                loanAmount={loanAmount}
                currentRate={currentRate}
                newRate={newRate}
                tenure={tenure}
                extraPayment={monthlyExtra}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default LoanAnalyzer;