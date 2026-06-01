// src/components/loan/LoanMetrics.tsx

import React, { useMemo } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { MetricCard } from '@/components/ui/MetricCard';
import LoanComparisonChart from './LoanComparisonChart';
import { LoanMetrics as LoanMetricsType, FrequencyType } from '@/types/loan.types';
import {
  generateAmortizationSchedule,
  generateSameEMIData,
  generateCombinedImpactData
} from '@/utils/calculations';
import { formatCurrency } from '@/utils/formatters';
import { chartColors } from '@/styles/theme';

// Default metrics to prevent undefined errors
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

interface LoanMetricsProps {
  metrics: LoanMetricsType;
  loanAmount: number;
  currentRate: number;
  newRate: number;
  tenure: number;
  extraPayment: number;
  frequency: FrequencyType;
  lumpSumYear: number;
}

export const LoanMetrics: React.FC<LoanMetricsProps> = ({
  metrics = defaultMetrics,
  loanAmount = 0,
  currentRate = 0,
  newRate = 0,
  tenure = 0,
  extraPayment = 0,
  frequency = 'monthly',
  lumpSumYear = 1
}) => {
  // Ensure metrics is never undefined
  const safeMetrics = metrics || defaultMetrics;

  const frequencyMonths = frequency === 'monthly' ? 1 : frequency === 'quarterly' ? 3 : 12;
  const lumpSumTargetMonth = frequency === 'lumpsum' ? lumpSumYear * 12 : undefined;

  // Generate chart data for Same Tenure scenario
  const sameTenureData = useMemo(() => {
    if (!loanAmount || !currentRate || !newRate || !tenure) return [];
    
    try {
      const originalSchedule = generateAmortizationSchedule(loanAmount, currentRate, tenure);
      const newSchedule = generateAmortizationSchedule(loanAmount, newRate, tenure);
      
      return originalSchedule.map((item, index) => ({
        month: item.month,
        originalBalance: item.balance,
        modifiedBalance: newSchedule[index]?.balance || 0,
        originalInterest: item.cumulativeInterest,
        modifiedInterest: newSchedule[index]?.cumulativeInterest || 0,
        savings: item.balance - (newSchedule[index]?.balance || 0)
      }));
    } catch (error) {
      console.error("Error generating sameTenureData:", error);
      return [];
    }
  }, [loanAmount, currentRate, newRate, tenure]);

  // Generate chart data for Same EMI scenario
  const sameEMIData = useMemo(() => {
    if (!loanAmount || !currentRate || !newRate || !tenure) return [];

    try {
      return generateSameEMIData(loanAmount, currentRate, newRate, tenure);
    } catch (error) {
      console.error("Error generating sameEMIData:", error);
      return [];
    }
  }, [loanAmount, currentRate, newRate, tenure]);

  // Interest saved in Same EMI scenario (keep original EMI, finish earlier at lower rate)
  const sameEMIInterestSaved = useMemo(() => {
    if (!loanAmount || !currentRate || !newRate || !tenure) return 0;
    try {
      const monthlyRate = currentRate / 12 / 100;
      const originalEMI = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenure) /
                          (Math.pow(1 + monthlyRate, tenure) - 1);
      const original = generateAmortizationSchedule(loanAmount, currentRate, tenure);
      const modified = generateAmortizationSchedule(loanAmount, newRate, tenure * 1.5, 0, originalEMI);
      const origInterest = original[original.length - 1]?.cumulativeInterest ?? 0;
      const modInterest = modified[modified.length - 1]?.cumulativeInterest ?? 0;
      return Math.round(origInterest - modInterest);
    } catch { return 0; }
  }, [loanAmount, currentRate, newRate, tenure]);

  // Generate chart data for Extra Payment scenario
  const extraPaymentData = useMemo(() => {
    if (!loanAmount || !newRate || !tenure) return [];

    try {
      const originalSchedule = generateAmortizationSchedule(loanAmount, newRate, tenure);
      const withExtraSchedule = generateAmortizationSchedule(loanAmount, newRate, tenure, extraPayment, undefined, frequencyMonths, lumpSumTargetMonth);

      return originalSchedule.map((item, index) => {
        const modifiedEntry = withExtraSchedule[index] || { balance: 0, cumulativeInterest: 0, extraPaymentApplied: 0 };

        return {
          month: item.month,
          originalBalance: item.balance > 0 ? item.balance : null,
          modifiedBalance: modifiedEntry.balance > 0 ? modifiedEntry.balance : null,
          originalInterest: item.cumulativeInterest,
          modifiedInterest: modifiedEntry.cumulativeInterest,
          savings: item.balance - modifiedEntry.balance,
          extraPaymentApplied: modifiedEntry.extraPaymentApplied ?? 0
        };
      });
    } catch (error) {
      console.error("Error generating extraPaymentData:", error);
      return [];
    }
  }, [loanAmount, newRate, tenure, extraPayment, frequencyMonths, lumpSumTargetMonth]);

  // Generate chart data for Combined Impact
  const combinedData = useMemo(() => {
    if (!loanAmount || !currentRate || !newRate || !tenure) return [];

    try {
      return generateCombinedImpactData(loanAmount, currentRate, newRate, tenure, extraPayment, frequencyMonths, lumpSumTargetMonth);
    } catch (error) {
      console.error("Error generating combinedData:", error);
      return [];
    }
  }, [loanAmount, currentRate, newRate, tenure, extraPayment, frequencyMonths, lumpSumTargetMonth]);

  return (
    <Tabs defaultValue="rateImpact">
      <TabsList className="grid w-full grid-cols-3 mb-4">
        <TabsTrigger value="rateImpact">Rate Impact</TabsTrigger>
        <TabsTrigger value="extraPayment">Extra Payment</TabsTrigger>
        <TabsTrigger value="combined">Combined Impact</TabsTrigger>
      </TabsList>

      <TabsContent value="rateImpact">
        <Tabs defaultValue="sameTenure">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="sameTenure">Same Tenure</TabsTrigger>
            <TabsTrigger value="sameEMI">Same EMI</TabsTrigger>
          </TabsList>

          <TabsContent value="sameTenure">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <MetricCard
                  title="New EMI"
                  value={safeMetrics.newEMI || 0}
                  subtext={`vs ${formatCurrency(safeMetrics.currentEMI || 0)}`}
                />
                <MetricCard
                  title="Monthly Savings"
                  value={safeMetrics.monthlySaving || 0}
                  subtext="Reduction in EMI"
                />
                <MetricCard
                  title="Interest Savings"
                  value={safeMetrics.interestSaving || 0}
                  subtext="Total interest saved"
                />
              </div>
              {sameTenureData.length > 0 && (
                <LoanComparisonChart
                  data={sameTenureData}
                  title="Loan Balance Comparison - Same Tenure"
                  lineConfig={[
                    { dataKey: 'originalBalance', name: 'Original Loan', color: chartColors.original },
                    { dataKey: 'modifiedBalance', name: 'New Rate Loan', color: chartColors.optimised }
                  ]}
                  showSavings
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="sameEMI">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <MetricCard
                  title="New Tenure"
                  value={safeMetrics.newTenure || 0}
                  type="tenure"
                  subtext="With current EMI"
                />
                <MetricCard
                  title="Time Saved"
                  value={safeMetrics.tenureReduction || 0}
                  type="tenure"
                  subtext="Reduction in duration"
                />
                <MetricCard
                  title="Interest Saved"
                  value={sameEMIInterestSaved}
                  subtext="By finishing earlier"
                />
              </div>
              {sameEMIData.length > 0 && (
                <LoanComparisonChart
                  data={sameEMIData}
                  title="Loan Balance Comparison - Same EMI"
                  lineConfig={[
                    { dataKey: 'originalBalance', name: 'Original Loan', color: chartColors.original },
                    { dataKey: 'modifiedBalance', name: 'Modified (Lower Rate)', color: chartColors.optimised }
                  ]}
                  showInterest
                />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </TabsContent>

      <TabsContent value="extraPayment">
        <div className="space-y-6">
          <div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <MetricCard
                title="Time Saved"
                value={safeMetrics.extraTenureReduction || 0}
                type="tenure"
                subtext="Reduction in tenure"
              />
              <MetricCard
                title="Interest Saved"
                value={safeMetrics.extraPaymentSaving || 0}
                subtext="Through extra payments"
              />
            
              <MetricCard
                title="Total Interest"
                value={safeMetrics.totalInterestWithExtra || 0}
                subtext="After extra payments"
              />
              <MetricCard
                title="Total Amount"
                value={(loanAmount || 0) + (safeMetrics.totalInterestWithExtra || 0)}
                subtext="Principal + Interest"
              />
            </div>
          </div>
          {extraPaymentData.length > 0 && (
            <LoanComparisonChart
              data={extraPaymentData}
              title="Impact of Extra Payments"
              lineConfig={[
                { dataKey: 'originalBalance', name: 'Original Balance', color: chartColors.original },
                { dataKey: 'modifiedBalance', name: 'Modified Balance', color: chartColors.optimised }
              ]}
              showSavings
            />
          )}
        </div>
      </TabsContent>

      <TabsContent value="combined">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <MetricCard
              title="Total Savings"
              value={safeMetrics.totalSaving || 0}
              subtext="Combined interest savings"
            />
            <MetricCard
              title="Total Time Saved"
              value={(safeMetrics.tenureReduction || 0) + (safeMetrics.extraTenureReduction || 0)}
              type="tenure"
              subtext="Overall reduction"
            />
            <MetricCard
              title="Final Amount"
              value={(loanAmount || 0) + (safeMetrics.totalInterestWithExtra || 0)}
              subtext="Total loan cost"
            />
          </div>
          {combinedData.length > 0 && (
            <LoanComparisonChart
              data={combinedData}
              title="Combined Impact - Rate Change & Extra Payments"
              lineConfig={[
                { dataKey: 'originalBalance', name: 'Original Loan', color: chartColors.original },
                { dataKey: 'combinedBalance', name: 'Rate Change + Extra Payments', color: chartColors.combined }
              ]}
              showSavings
            />
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default LoanMetrics;