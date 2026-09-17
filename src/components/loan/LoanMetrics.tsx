// src/components/loan/LoanMetrics.tsx

import React, { useMemo } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ComparisonStat } from '@/components/ui/ComparisonStat';
import ScenarioHero from './ScenarioHero';
import LoanComparisonChart from './LoanComparisonChart';
import { LoanMetrics as LoanMetricsType, FrequencyType } from '@/types/loan.types';
import {
  generateAmortizationSchedule,
  generateSameEMIData,
  generateCombinedImpactData,
  calculateSIPFutureValue
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

const monthsLabel = (months: number): string => {
  if (months <= 0) return '—';
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  return remainingMonths > 0 ? `${years}y ${remainingMonths}m` : `${years}y`;
};

const secondaryRowClass = 'grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border rounded-xl border border-border overflow-hidden';

const timeBadgeText = (months: number): string =>
  months === 0 ? 'No change yet' : `${monthsLabel(Math.abs(months))} ${months > 0 ? 'sooner' : 'later'}`;

const amountBadgeText = (delta: number): string =>
  delta === 0 ? 'No change yet' : `${formatCurrency(Math.abs(delta))} ${delta > 0 ? 'saved' : 'more'}`;

interface LoanMetricsProps {
  metrics: LoanMetricsType;
  loanAmount: number;
  currentRate: number;
  newRate: number;
  tenure: number;
  newTenureInput: number;
  extraPayment: number;
  frequency: FrequencyType;
  lumpSumYear: number;
  emiInputMode?: 'tenure' | 'emi';
  setEMI?: number;
}

export const LoanMetrics: React.FC<LoanMetricsProps> = ({
  metrics = defaultMetrics,
  loanAmount = 0,
  currentRate = 0,
  newRate = 0,
  tenure = 0,
  newTenureInput = 0,
  extraPayment = 0,
  frequency = 'monthly',
  lumpSumYear = 1,
  emiInputMode = 'tenure',
  setEMI = 0,
}) => {
  // Ensure metrics is never undefined
  const safeMetrics = metrics || defaultMetrics;

  const frequencyMonths = frequency === 'monthly' ? 1 : frequency === 'quarterly' ? 3 : 12;
  const lumpSumTargetMonth = frequency === 'lumpsum' ? lumpSumYear * 12 : undefined;

  const contextLine = `on ${formatCurrency(loanAmount)} for ${monthsLabel(tenure)} · ${currentRate.toFixed(2)}% → ${newRate.toFixed(2)}%`;

  const extraPaymentPhrase = extraPayment > 0
    ? frequency === 'lumpsum'
      ? `+${formatCurrency(extraPayment)} lump sum in year ${lumpSumYear}`
      : `+${formatCurrency(extraPayment)}/${frequency === 'monthly' ? 'mo' : frequency === 'quarterly' ? 'qtr' : 'yr'}`
    : 'no extra payments yet';

  const customTenureContextLine = `on ${formatCurrency(loanAmount)} · ${monthsLabel(tenure)} → ${monthsLabel(newTenureInput)} · ${currentRate.toFixed(2)}% → ${newRate.toFixed(2)}%`;
  const extraPaymentContextLine = `on ${formatCurrency(loanAmount)} at ${currentRate.toFixed(2)}% · ${extraPaymentPhrase}`;
  const combinedContextLine = `on ${formatCurrency(loanAmount)} · ${currentRate.toFixed(2)}% → ${newRate.toFixed(2)}% · ${extraPaymentPhrase}`;

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
      const originalEMI = (emiInputMode === 'emi' && setEMI > 0)
        ? setEMI
        : loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenure) /
          (Math.pow(1 + monthlyRate, tenure) - 1);
      const original = generateAmortizationSchedule(loanAmount, currentRate, tenure);
      const modified = generateAmortizationSchedule(loanAmount, newRate, tenure * 1.5, 0, originalEMI);
      const origInterest = original[original.length - 1]?.cumulativeInterest ?? 0;
      const modInterest = modified[modified.length - 1]?.cumulativeInterest ?? 0;
      return Math.round(origInterest - modInterest);
    } catch { return 0; }
  }, [loanAmount, currentRate, newRate, tenure, emiInputMode, setEMI]);

  // Custom Tenure scenario: new rate AND an independently chosen new tenure
  // (e.g. a refinance offer that changes both), rather than reusing the
  // current loan's tenure.
  const customTenureMetrics = useMemo(() => {
    if (!loanAmount || !newRate || !newTenureInput) {
      return { customEMI: 0, customTotalInterest: 0, monthlyDiff: 0, interestDiff: 0 };
    }
    try {
      const r = newRate / 12 / 100;
      const customEMI = r === 0
        ? loanAmount / newTenureInput
        : loanAmount * r * Math.pow(1 + r, newTenureInput) / (Math.pow(1 + r, newTenureInput) - 1);
      const customTotalInterest = customEMI * newTenureInput - loanAmount;
      const oldEMI = emiInputMode === 'emi' && setEMI > 0 ? setEMI : safeMetrics.currentEMI || 0;
      return {
        customEMI: Math.round(customEMI),
        customTotalInterest: Math.round(customTotalInterest),
        monthlyDiff: Math.round(oldEMI - customEMI),
        interestDiff: Math.round((safeMetrics.totalCurrentInterest || 0) - customTotalInterest),
      };
    } catch {
      return { customEMI: 0, customTotalInterest: 0, monthlyDiff: 0, interestDiff: 0 };
    }
  }, [loanAmount, newRate, newTenureInput, emiInputMode, setEMI, safeMetrics.currentEMI, safeMetrics.totalCurrentInterest]);

  // Generate chart data for Custom Tenure scenario (schedules can have
  // different lengths, so pad the shorter one with nulls past its end)
  const customTenureData = useMemo(() => {
    if (!loanAmount || !currentRate || !newRate || !tenure || !newTenureInput) return [];

    try {
      const originalSchedule = generateAmortizationSchedule(loanAmount, currentRate, tenure);
      const newSchedule = generateAmortizationSchedule(loanAmount, newRate, newTenureInput);
      const maxMonths = Math.max(originalSchedule.length, newSchedule.length);

      const data = [];
      for (let i = 0; i < maxMonths; i++) {
        const original = originalSchedule[i];
        const modified = newSchedule[i];
        data.push({
          month: i + 1,
          originalBalance: original ? original.balance : null,
          modifiedBalance: modified ? modified.balance : null,
          originalInterest: original ? original.cumulativeInterest : (originalSchedule[originalSchedule.length - 1]?.cumulativeInterest ?? 0),
          modifiedInterest: modified ? modified.cumulativeInterest : (newSchedule[newSchedule.length - 1]?.cumulativeInterest ?? 0),
          savings: (original ? original.balance : 0) - (modified ? modified.balance : 0)
        });
      }
      return data;
    } catch (error) {
      console.error("Error generating customTenureData:", error);
      return [];
    }
  }, [loanAmount, currentRate, newRate, tenure, newTenureInput]);

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
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="sameTenure" className="pb-2 text-xs font-medium">Same Tenure</TabsTrigger>
            <TabsTrigger value="sameEMI" className="pb-2 text-xs font-medium">Same EMI</TabsTrigger>
            <TabsTrigger value="customTenure" className="pb-2 text-xs font-medium">Custom Tenure</TabsTrigger>
          </TabsList>

          <TabsContent value="sameTenure">
            <div className="space-y-6">
              {(() => {
                const oldEMI = emiInputMode === 'emi' && setEMI > 0 ? setEMI : safeMetrics.currentEMI || 0;
                const newEMI = safeMetrics.newEMI || 0;
                const interestSaving = safeMetrics.interestSaving || 0;
                const monthlySaving = safeMetrics.monthlySaving || 0;
                const totalInterestOld = safeMetrics.totalCurrentInterest || 0;
                const totalInterestNew = totalInterestOld - interestSaving;
                const totalPayableOld = loanAmount + totalInterestOld;
                const totalPayableNew = loanAmount + totalInterestNew;
                const sip = calculateSIPFutureValue(monthlySaving, tenure);
                const hero = (
                  <ScenarioHero
                    title={interestSaving >= 0 ? 'Interest Saving' : 'Extra Interest'}
                    value={Math.abs(interestSaving)}
                    improved={interestSaving >= 0}
                    subtext={contextLine}
                  />
                );
                return (
                  <>
                    {sip.futureValue > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                        {hero}
                        <ScenarioHero
                          title="If Invested (12% p.a.)"
                          value={sip.futureValue}
                          improved={sip.futureValue >= interestSaving}
                          subtext={`${formatCurrency(sip.totalInvested)} invested → ${formatCurrency(sip.totalGains)} gain`}
                        />
                      </div>
                    ) : hero}
                    <div className={secondaryRowClass}>
                      <ComparisonStat
                        title="Monthly EMI"
                        oldValue={formatCurrency(oldEMI)}
                        newValue={formatCurrency(newEMI)}
                        improved={newEMI !== oldEMI ? newEMI < oldEMI : undefined}
                        deltaText={`${formatCurrency(Math.abs(monthlySaving))}/mo ${monthlySaving >= 0 ? 'lower' : 'higher'}`}
                        deltaImproved={monthlySaving >= 0}
                      />
                      <ComparisonStat
                        title="Total Interest"
                        oldValue={formatCurrency(totalInterestOld)}
                        newValue={formatCurrency(totalInterestNew)}
                        improved={totalInterestNew !== totalInterestOld ? totalInterestNew < totalInterestOld : undefined}
                        deltaText={amountBadgeText(interestSaving)}
                        deltaImproved={interestSaving >= 0}
                      />
                      <ComparisonStat
                        title="Total Payable (Principal + Interest)"
                        oldValue={formatCurrency(totalPayableOld)}
                        newValue={formatCurrency(totalPayableNew)}
                        improved={totalPayableNew !== totalPayableOld ? totalPayableNew < totalPayableOld : undefined}
                        deltaText={amountBadgeText(totalPayableOld - totalPayableNew)}
                        deltaImproved={totalPayableOld - totalPayableNew >= 0}
                      />
                    </div>
                  </>
                );
              })()}
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
              {(() => {
                const newTenureMonths = safeMetrics.newTenure || 0;
                const tenureReduction = safeMetrics.tenureReduction || 0;
                const totalInterestOld = safeMetrics.totalCurrentInterest || 0;
                const totalInterestNew = totalInterestOld - sameEMIInterestSaved;
                const totalPayableOld = loanAmount + totalInterestOld;
                const totalPayableNew = loanAmount + totalInterestNew;
                return (
                  <>
                    <ScenarioHero
                      title={sameEMIInterestSaved >= 0 ? 'Interest Saving' : 'Extra Interest'}
                      value={Math.abs(sameEMIInterestSaved)}
                      improved={sameEMIInterestSaved >= 0}
                      subtext={contextLine}
                    />
                    <div className={secondaryRowClass}>
                      <ComparisonStat
                        title="Loan Tenure"
                        oldValue={monthsLabel(tenure)}
                        newValue={monthsLabel(newTenureMonths)}
                        improved={newTenureMonths !== tenure ? newTenureMonths < tenure : undefined}
                        deltaText={timeBadgeText(tenureReduction)}
                        deltaImproved={tenureReduction >= 0}
                      />
                      <ComparisonStat
                        title="Total Interest"
                        oldValue={formatCurrency(totalInterestOld)}
                        newValue={formatCurrency(totalInterestNew)}
                        improved={totalInterestNew !== totalInterestOld ? totalInterestNew < totalInterestOld : undefined}
                        deltaText={amountBadgeText(sameEMIInterestSaved)}
                        deltaImproved={sameEMIInterestSaved >= 0}
                      />
                      <ComparisonStat
                        title="Total Payable"
                        oldValue={formatCurrency(totalPayableOld)}
                        newValue={formatCurrency(totalPayableNew)}
                        improved={totalPayableNew !== totalPayableOld ? totalPayableNew < totalPayableOld : undefined}
                        deltaText={amountBadgeText(totalPayableOld - totalPayableNew)}
                        deltaImproved={totalPayableOld - totalPayableNew >= 0}
                      />
                    </div>
                  </>
                );
              })()}
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

          <TabsContent value="customTenure">
            <div className="space-y-6">
              {(() => {
                const oldEMI = emiInputMode === 'emi' && setEMI > 0 ? setEMI : safeMetrics.currentEMI || 0;
                const { customEMI, customTotalInterest, interestDiff, monthlyDiff } = customTenureMetrics;
                const totalInterestOld = safeMetrics.totalCurrentInterest || 0;
                const sip = calculateSIPFutureValue(monthlyDiff, newTenureInput);
                const hero = (
                  <ScenarioHero
                    title={interestDiff >= 0 ? 'Interest Saving' : 'Extra Interest'}
                    value={Math.abs(interestDiff)}
                    improved={interestDiff >= 0}
                    subtext={customTenureContextLine}
                  />
                );
                return (
                  <>
                    {sip.futureValue > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                        {hero}
                        <ScenarioHero
                          title="Invest Instead (12% p.a.)"
                          value={sip.futureValue}
                          improved={sip.futureValue >= interestDiff}
                          subtext={`${formatCurrency(sip.totalInvested)} invested → ${formatCurrency(sip.totalGains)} gain`}
                        />
                      </div>
                    ) : hero}
                    <div className={secondaryRowClass}>
                      <ComparisonStat
                        title="Monthly EMI"
                        oldValue={formatCurrency(oldEMI)}
                        newValue={formatCurrency(customEMI)}
                        improved={customEMI !== oldEMI ? customEMI < oldEMI : undefined}
                        deltaText={`${formatCurrency(Math.abs(monthlyDiff))}/mo ${monthlyDiff >= 0 ? 'lower' : 'higher'}`}
                        deltaImproved={monthlyDiff >= 0}
                      />
                      <ComparisonStat
                        title="Loan Tenure"
                        oldValue={monthsLabel(tenure)}
                        newValue={monthsLabel(newTenureInput)}
                        deltaText={tenure === newTenureInput ? 'No change yet' : `${monthsLabel(Math.abs(tenure - newTenureInput))} ${tenure > newTenureInput ? 'shorter' : 'longer'}`}
                      />
                      <ComparisonStat
                        title="Total Interest"
                        oldValue={formatCurrency(totalInterestOld)}
                        newValue={formatCurrency(customTotalInterest)}
                        improved={customTotalInterest !== totalInterestOld ? customTotalInterest < totalInterestOld : undefined}
                        deltaText={amountBadgeText(totalInterestOld - customTotalInterest)}
                        deltaImproved={totalInterestOld - customTotalInterest >= 0}
                      />
                    </div>
                  </>
                );
              })()}
              {customTenureData.length > 0 && (
                <LoanComparisonChart
                  data={customTenureData}
                  title="Loan Balance Comparison - Custom Tenure"
                  lineConfig={[
                    { dataKey: 'originalBalance', name: 'Original Loan', color: chartColors.original },
                    { dataKey: 'modifiedBalance', name: 'New Offer', color: chartColors.optimised }
                  ]}
                  showSavings
                />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </TabsContent>

      <TabsContent value="extraPayment">
        <div className="space-y-6">
          {(() => {
            const extraPaymentSaving = safeMetrics.extraPaymentSaving || 0;
            const extraTenureReduction = safeMetrics.extraTenureReduction || 0;
            const monthsWithExtra = safeMetrics.monthsWithExtra || 0;
            const totalInterestOld = (safeMetrics.totalCurrentInterest || 0) - (safeMetrics.interestSaving || 0);
            const totalInterestNew = safeMetrics.totalInterestWithExtra || 0;
            const totalPayableOld = (loanAmount || 0) + totalInterestOld;
            const totalPayableNew = (loanAmount || 0) + totalInterestNew;
            // Horizon is the full original tenure, not the shortened payoff
            // time — "invest instead" means you don't prepay, so the loan
            // runs its normal course and the extra amount stays investable
            // for the whole term.
            const sip = frequency === 'monthly'
              ? calculateSIPFutureValue(extraPayment, tenure)
              : { futureValue: 0, totalInvested: 0, totalGains: 0 };
            const hero = (
              <ScenarioHero
                title={extraPaymentSaving >= 0 ? 'Interest Saving' : 'Extra Interest'}
                value={Math.abs(extraPaymentSaving)}
                improved={extraPaymentSaving >= 0}
                subtext={extraPaymentContextLine}
              />
            );
            return (
              <>
                {sip.futureValue > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    {hero}
                    <ScenarioHero
                      title="Invest Instead (12% p.a.)"
                      value={sip.futureValue}
                      improved={sip.futureValue >= extraPaymentSaving}
                      subtext={`${formatCurrency(sip.totalInvested)} invested → ${formatCurrency(sip.totalGains)} gain`}
                    />
                  </div>
                ) : hero}
                <div className={secondaryRowClass}>
                  <ComparisonStat
                    title="Payoff Time"
                    oldValue={monthsLabel(tenure)}
                    newValue={monthsLabel(monthsWithExtra)}
                    improved={monthsWithExtra !== tenure ? monthsWithExtra < tenure : undefined}
                    deltaText={timeBadgeText(extraTenureReduction)}
                    deltaImproved={extraTenureReduction >= 0}
                  />
                  <ComparisonStat
                    title="Total Interest"
                    oldValue={formatCurrency(totalInterestOld)}
                    newValue={formatCurrency(totalInterestNew)}
                    improved={totalInterestNew !== totalInterestOld ? totalInterestNew < totalInterestOld : undefined}
                    deltaText={amountBadgeText(extraPaymentSaving)}
                    deltaImproved={extraPaymentSaving >= 0}
                  />
                  <ComparisonStat
                    title="Total Payable"
                    oldValue={formatCurrency(totalPayableOld)}
                    newValue={formatCurrency(totalPayableNew)}
                    improved={totalPayableNew !== totalPayableOld ? totalPayableNew < totalPayableOld : undefined}
                    deltaText={amountBadgeText(totalPayableOld - totalPayableNew)}
                    deltaImproved={totalPayableOld - totalPayableNew >= 0}
                  />
                </div>
              </>
            );
          })()}
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
          {(() => {
            const totalSaving = safeMetrics.totalSaving || 0;
            const extraTenureReduction = safeMetrics.extraTenureReduction || 0;
            const monthsWithExtra = safeMetrics.monthsWithExtra || 0;
            const totalInterestOld = safeMetrics.totalCurrentInterest || 0;
            const totalInterestNew = safeMetrics.totalInterestWithExtra || 0;
            const totalPayableOld = (loanAmount || 0) + totalInterestOld;
            const totalPayableNew = (loanAmount || 0) + totalInterestNew;
            return (
              <>
                <ScenarioHero
                  title={totalSaving >= 0 ? 'Total Savings' : 'Total Extra Cost'}
                  value={Math.abs(totalSaving)}
                  improved={totalSaving >= 0}
                  subtext={combinedContextLine}
                />
                <div className={secondaryRowClass}>
                  <ComparisonStat
                    title="Payoff Time"
                    oldValue={monthsLabel(tenure)}
                    newValue={monthsLabel(monthsWithExtra)}
                    improved={monthsWithExtra !== tenure ? monthsWithExtra < tenure : undefined}
                    deltaText={timeBadgeText(extraTenureReduction)}
                    deltaImproved={extraTenureReduction >= 0}
                  />
                  <ComparisonStat
                    title="Total Interest"
                    oldValue={formatCurrency(totalInterestOld)}
                    newValue={formatCurrency(totalInterestNew)}
                    improved={totalInterestNew !== totalInterestOld ? totalInterestNew < totalInterestOld : undefined}
                    deltaText={amountBadgeText(totalSaving)}
                    deltaImproved={totalSaving >= 0}
                  />
                  <ComparisonStat
                    title="Total Payable"
                    oldValue={formatCurrency(totalPayableOld)}
                    newValue={formatCurrency(totalPayableNew)}
                    improved={totalPayableNew !== totalPayableOld ? totalPayableNew < totalPayableOld : undefined}
                    deltaText={amountBadgeText(totalPayableOld - totalPayableNew)}
                    deltaImproved={totalPayableOld - totalPayableNew >= 0}
                  />
                </div>
              </>
            );
          })()}
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