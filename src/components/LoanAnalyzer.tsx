// src/components/LoanAnalyzer.tsx

import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { PrimaryInputs, ComparisonInputs } from './loan/LoanInputs';
import LoanSummary from './loan/LoanSummary';
import LoanMetrics from './loan/LoanMetrics';
import AmortizationTable from './loan/AmortizationTable';
import YearlyBreakdownChart from './loan/YearlyBreakdownChart';
import { calculateLoan, generateAmortizationSchedule, generateYearlyBreakdown } from '@/utils/calculations';
import { FrequencyType, LoanMetrics as LoanMetricsType } from '@/types/loan.types';
import { CalculatorInfoModal } from './loan/CalculatorInfoModal';
import AnimatedBackground from './AnimatedBackground';

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

  // Extra payment — amount mode
  const [extraPayment, setExtraPayment] = useState<number>(0);
  const [frequency, setFrequency] = useState<FrequencyType>('yearly');
  const [lumpSumYear, setLumpSumYear] = useState<number>(1);

  // Extra payment — EMI multiplier
  const [emiMultiplier, setEmiMultiplier] = useState<number>(1.0);

  // Extra payment — extra EMIs mode
  const [extraPaymentMode, setExtraPaymentMode] = useState<'amount' | 'emi'>('amount');
  const [extraEmiCount, setExtraEmiCount] = useState<number>(0);

  const frequencyMonths = frequency === 'monthly' ? 1 : frequency === 'quarterly' ? 3 : 12;
  const lumpSumTargetMonth = frequency === 'lumpsum' ? lumpSumYear * 12 : undefined;

  // Base metrics (no extras — used to derive currentEMI for calculations below)
  const metrics = useMemo(() => {
    try {
      if (loanAmount && currentRate && newRate && tenure) {
        const baseEMI = loanAmount && currentRate && tenure
          ? loanAmount * (currentRate / 12 / 100) * Math.pow(1 + currentRate / 12 / 100, tenure) /
            (Math.pow(1 + currentRate / 12 / 100, tenure) - 1)
          : 0;
        const resolvedPeriodic = extraPaymentMode === 'emi'
          ? extraEmiCount * Math.round(baseEMI)
          : extraPayment;
        const monthlyExtra = (emiMultiplier - 1) * Math.round(baseEMI);
        return calculateLoan(
          loanAmount, currentRate, newRate, tenure,
          resolvedPeriodic, frequencyMonths, lumpSumTargetMonth, monthlyExtra
        );
      }
      return defaultMetrics;
    } catch (error) {
      console.error("Error calculating loan metrics:", error);
      return defaultMetrics;
    }
  }, [loanAmount, currentRate, newRate, tenure, extraPayment, extraPaymentMode, extraEmiCount, emiMultiplier, frequencyMonths, lumpSumTargetMonth]);

  const baseEMI = metrics.currentEMI || 0;
  const resolvedPeriodicExtra = extraPaymentMode === 'emi' ? extraEmiCount * baseEMI : extraPayment;
  const monthlyMultiplierExtra = Math.round((emiMultiplier - 1) * baseEMI);

  const yearlyData = useMemo(() => {
    if (!loanAmount || !currentRate || !tenure) return [];
    try { return generateYearlyBreakdown(loanAmount, currentRate, tenure); } catch { return []; }
  }, [loanAmount, currentRate, tenure]);

  const baseSchedule = useMemo(() => {
    if (!loanAmount || !currentRate || !tenure) return [];
    try { return generateAmortizationSchedule(loanAmount, currentRate, tenure); } catch { return []; }
  }, [loanAmount, currentRate, tenure]);

  const optimisedSchedule = useMemo(() => {
    if (!loanAmount || !newRate || !tenure) return [];
    try {
      return generateAmortizationSchedule(
        loanAmount, newRate, tenure,
        resolvedPeriodicExtra, undefined, frequencyMonths, lumpSumTargetMonth, monthlyMultiplierExtra
      );
    } catch { return []; }
  }, [loanAmount, newRate, tenure, resolvedPeriodicExtra, frequencyMonths, lumpSumTargetMonth, monthlyMultiplierExtra]);

  const handleCurrentRateChange = (value: number) => {
    setCurrentRate(value);
    setNewRate(value);
  };

  return (
    <>
      <AnimatedBackground />

      <div className="relative min-h-full w-full">
        <div className="w-full pt-8 pb-12 px-4 md:px-8 xl:px-10 space-y-3 relative z-10">
          <div className="flex items-center justify-center">
            <h1 className="text-xl font-bold text-gray-800 border-b-2 border-gray-800 pb-1">
              Home Loan Analyzer (Calculate - Compare - Save)
            </h1>
            <CalculatorInfoModal />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Card 1 — Current Loan */}
            <Card className="bg-white/95">
              <CardContent className="p-4 space-y-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Current Loan</p>
                <PrimaryInputs
                  loanAmount={loanAmount}
                  tenure={tenure}
                  isYearMode={isYearMode}
                  currentRate={currentRate}
                  onLoanAmountChange={setLoanAmount}
                  onTenureChange={setTenure}
                  onYearModeChange={setIsYearMode}
                  onCurrentRateChange={handleCurrentRateChange}
                />
                <LoanSummary
                  currentEMI={metrics.currentEMI || 0}
                  totalInterest={(metrics.currentEMI || 0) * tenure - loanAmount}
                  totalAmount={(metrics.currentEMI || 0) * tenure}
                  loanAmount={loanAmount}
                />
                <YearlyBreakdownChart data={yearlyData} />
              </CardContent>
            </Card>

            {/* Card 2 — Compare & Optimise */}
            <Card className="bg-white/95">
              <CardContent className="p-4 space-y-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Compare & Optimise</p>
                <ComparisonInputs
                  currentRate={currentRate}
                  currentEMI={baseEMI}
                  newRate={newRate}
                  extraPayment={extraPayment}
                  frequency={frequency}
                  lumpSumYear={lumpSumYear}
                  tenure={tenure}
                  emiMultiplier={emiMultiplier}
                  extraPaymentMode={extraPaymentMode}
                  extraEmiCount={extraEmiCount}
                  onNewRateChange={setNewRate}
                  onExtraPaymentChange={setExtraPayment}
                  onFrequencyChange={setFrequency}
                  onLumpSumYearChange={setLumpSumYear}
                  onEmiMultiplierChange={setEmiMultiplier}
                  onExtraPaymentModeChange={setExtraPaymentMode}
                  onExtraEmiCountChange={setExtraEmiCount}
                />
                <LoanMetrics
                  metrics={metrics}
                  loanAmount={loanAmount}
                  currentRate={currentRate}
                  newRate={newRate}
                  tenure={tenure}
                  extraPayment={resolvedPeriodicExtra}
                  frequency={frequency}
                  lumpSumYear={lumpSumYear}
                />
              </CardContent>
            </Card>
          </div>

          {/* Amortization schedules side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <AmortizationTable title="Base Loan" schedule={baseSchedule} />
            <AmortizationTable title="Optimised Loan" schedule={optimisedSchedule} />
          </div>
        </div>
      </div>
    </>
  );
};

export default LoanAnalyzer;
