// src/components/LoanAnalyzer.tsx

import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { PrimaryInputs, ComparisonInputs } from './loan/LoanInputs';
import LoanSummary from './loan/LoanSummary';
import LoanMetrics from './loan/LoanMetrics';
import AmortizationTable from './loan/AmortizationTable';
import BalanceTransferAnalyser from './loan/BalanceTransferAnalyser';
import YearlyBreakdownChart from './loan/YearlyBreakdownChart';
import { calculateLoan, generateAmortizationSchedule, generateYearlyBreakdown } from '@/utils/calculations';
import { FrequencyType, LoanMetrics as LoanMetricsType } from '@/types/loan.types';
import { CalculatorInfoModal } from './loan/CalculatorInfoModal';

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

function deriveEMI(principal: number, annualRate: number, tenureMonths: number): number {
  const r = annualRate / 12 / 100;
  if (r === 0) return Math.round(principal / tenureMonths);
  return Math.round(principal * r * Math.pow(1 + r, tenureMonths) / (Math.pow(1 + r, tenureMonths) - 1));
}

function deriveTenure(principal: number, annualRate: number, emi: number): number {
  const r = annualRate / 12 / 100;
  if (r === 0) return Math.max(1, Math.min(420, Math.round(principal / emi)));
  const minEMI = principal * r;
  if (emi <= minEMI) return 420;
  const n = Math.log(emi / (emi - principal * r)) / Math.log(1 + r);
  return Math.max(1, Math.min(420, Math.round(n)));
}

const LoanAnalyzer: React.FC = () => {
  const [loanAmount, setLoanAmount] = useState<number>(10000000);
  const [tenure, setTenure] = useState<number>(300);
  const [isYearMode, setIsYearMode] = useState<boolean>(true);
  const [currentRate, setCurrentRate] = useState<number>(9);
  const [newRate, setNewRate] = useState<number>(7.5);

  const [extraPayment, setExtraPayment] = useState<number>(0);
  const [frequency, setFrequency] = useState<FrequencyType>('yearly');
  const [lumpSumYear, setLumpSumYear] = useState<number>(1);

  const [emiMultiplier, setEmiMultiplier] = useState<number>(1.0);
  const [extraPaymentMode, setExtraPaymentMode] = useState<'amount' | 'emi'>('amount');
  const [extraEmiCount, setExtraEmiCount] = useState<number>(0);

  // EMI ↔ Tenure input mode
  const [emiInputMode, setEmiInputMode] = useState<'tenure' | 'emi'>('tenure');
  const [emiInput, setEmiInput] = useState<number>(0);

  // When switching to EMI mode, seed the EMI field with the currently derived EMI
  const handleEmiInputModeChange = (mode: 'tenure' | 'emi') => {
    if (mode === 'emi' && emiInput === 0) {
      setEmiInput(deriveEMI(loanAmount, currentRate, tenure));
    }
    setEmiInputMode(mode);
  };

  // Effective tenure: direct state in tenure mode, derived from EMI in emi mode
  const effectiveTenure: number = useMemo(() => {
    if (emiInputMode === 'tenure' || emiInput <= 0) return tenure;
    return deriveTenure(loanAmount, currentRate, emiInput);
  }, [emiInputMode, emiInput, tenure, loanAmount, currentRate]);

  const frequencyMonths = frequency === 'monthly' ? 1 : frequency === 'quarterly' ? 3 : 12;
  const lumpSumTargetMonth = frequency === 'lumpsum' ? lumpSumYear * 12 : undefined;

  const metrics = useMemo(() => {
    try {
      if (loanAmount && currentRate && newRate && effectiveTenure) {
        const baseEMI = deriveEMI(loanAmount, currentRate, effectiveTenure);
        const resolvedPeriodic = extraPaymentMode === 'emi'
          ? extraEmiCount * baseEMI
          : extraPayment;
        const monthlyExtra = (emiMultiplier - 1) * baseEMI;
        return calculateLoan(
          loanAmount, currentRate, newRate, effectiveTenure,
          resolvedPeriodic, frequencyMonths, lumpSumTargetMonth, monthlyExtra
        );
      }
      return defaultMetrics;
    } catch (error) {
      console.error("Error calculating loan metrics:", error);
      return defaultMetrics;
    }
  }, [loanAmount, currentRate, newRate, effectiveTenure, extraPayment, extraPaymentMode, extraEmiCount, emiMultiplier, frequencyMonths, lumpSumTargetMonth]);

  const baseEMI = metrics.currentEMI || 0;
  const resolvedPeriodicExtra = extraPaymentMode === 'emi' ? extraEmiCount * baseEMI : extraPayment;
  const monthlyMultiplierExtra = Math.round((emiMultiplier - 1) * baseEMI);

  const yearlyData = useMemo(() => {
    if (!loanAmount || !currentRate || !effectiveTenure) return [];
    try { return generateYearlyBreakdown(loanAmount, currentRate, effectiveTenure); } catch { return []; }
  }, [loanAmount, currentRate, effectiveTenure]);

  const baseSchedule = useMemo(() => {
    if (!loanAmount || !currentRate || !effectiveTenure) return [];
    try { return generateAmortizationSchedule(loanAmount, currentRate, effectiveTenure); } catch { return []; }
  }, [loanAmount, currentRate, effectiveTenure]);

  const optimisedSchedule = useMemo(() => {
    if (!loanAmount || !newRate || !effectiveTenure) return [];
    try {
      return generateAmortizationSchedule(
        loanAmount, newRate, effectiveTenure,
        resolvedPeriodicExtra, undefined, frequencyMonths, lumpSumTargetMonth, monthlyMultiplierExtra
      );
    } catch { return []; }
  }, [loanAmount, newRate, effectiveTenure, resolvedPeriodicExtra, frequencyMonths, lumpSumTargetMonth, monthlyMultiplierExtra]);

  const handleCurrentRateChange = (value: number) => {
    setCurrentRate(value);
    setNewRate(value);
  };

  return (
    <div className="min-h-screen w-full">
      <div className="w-full pt-8 pb-12 px-4 md:px-8 xl:px-10 space-y-3">
        <div className="flex items-center justify-center">
          <h1 className="text-2xl font-bold text-foreground border-b-2 border-foreground pb-1">
            Home Loan Analyzer (Calculate - Compare - Save)
          </h1>
          <CalculatorInfoModal />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Card 1 — Current Loan */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Current Loan</p>
              <PrimaryInputs
                loanAmount={loanAmount}
                tenure={tenure}
                effectiveTenure={effectiveTenure}
                isYearMode={isYearMode}
                currentRate={currentRate}
                emiInputMode={emiInputMode}
                emiInput={emiInput}
                computedEMI={baseEMI}
                onLoanAmountChange={setLoanAmount}
                onTenureChange={setTenure}
                onYearModeChange={setIsYearMode}
                onCurrentRateChange={handleCurrentRateChange}
                onEmiInputModeChange={handleEmiInputModeChange}
                onEmiInputChange={setEmiInput}
              />
              <LoanSummary
                currentEMI={metrics.currentEMI || 0}
                totalInterest={(metrics.currentEMI || 0) * effectiveTenure - loanAmount}
                totalAmount={(metrics.currentEMI || 0) * effectiveTenure}
                loanAmount={loanAmount}
                emiInputMode={emiInputMode}
                effectiveTenure={effectiveTenure}
              />
              <YearlyBreakdownChart data={yearlyData} />
            </CardContent>
          </Card>

          {/* Card 2 — Compare & Optimise */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Compare & Optimise</p>
              <ComparisonInputs
                currentRate={currentRate}
                currentEMI={baseEMI}
                newRate={newRate}
                extraPayment={extraPayment}
                frequency={frequency}
                lumpSumYear={lumpSumYear}
                tenure={effectiveTenure}
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
                tenure={effectiveTenure}
                extraPayment={resolvedPeriodicExtra}
                frequency={frequency}
                lumpSumYear={lumpSumYear}
                emiInputMode={emiInputMode}
                setEMI={emiInput}
              />
            </CardContent>
          </Card>
        </div>

        {/* Balance Transfer Cost Analyser */}
        <BalanceTransferAnalyser
          loanAmount={loanAmount}
          currentEMI={metrics.currentEMI || 0}
          newEMI={metrics.newEMI || 0}
          interestSaving={metrics.interestSaving || 0}
        />

        {/* Amortization schedules side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <AmortizationTable title="Base Loan" schedule={baseSchedule} />
          <AmortizationTable title="Optimised Loan" schedule={optimisedSchedule} />
        </div>
      </div>
    </div>
  );
};

export default LoanAnalyzer;
