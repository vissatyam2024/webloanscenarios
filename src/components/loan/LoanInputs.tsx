"use client";

import React, { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { RotateCcw } from 'lucide-react';
import { EditableField } from '@/components/ui/EditableField';
import { FrequencyType } from '@/types/loan.types';
import { formatCurrency } from '@/utils/formatters';

interface PrimaryInputsProps {
  loanAmount: number;
  tenure: number;
  effectiveTenure: number;
  isYearMode: boolean;
  currentRate: number;
  emiInputMode: 'tenure' | 'emi';
  emiInput: number;
  computedEMI: number;
  onLoanAmountChange: (value: number) => void;
  onTenureChange: (value: number) => void;
  onYearModeChange: (value: boolean) => void;
  onCurrentRateChange: (value: number) => void;
  onEmiInputModeChange: (mode: 'tenure' | 'emi') => void;
  onEmiInputChange: (value: number) => void;
}

export const PrimaryInputs: React.FC<PrimaryInputsProps> = ({
  loanAmount,
  tenure,
  effectiveTenure,
  isYearMode,
  currentRate,
  emiInputMode,
  emiInput,
  computedEMI,
  onLoanAmountChange,
  onTenureChange,
  onYearModeChange,
  onCurrentRateChange,
  onEmiInputModeChange,
  onEmiInputChange,
}) => {
  const [isTenureEditing, setIsTenureEditing] = useState(false);

  // EMI slider bounds: range between EMI at 30yr and EMI at 5yr
  const r = currentRate / 12 / 100;
  const emiSliderMin = r > 0
    ? Math.round(loanAmount * r * Math.pow(1 + r, 360) / (Math.pow(1 + r, 360) - 1))
    : Math.round(loanAmount / 360);
  const emiSliderMax = r > 0
    ? Math.round(loanAmount * r * Math.pow(1 + r, 60) / (Math.pow(1 + r, 60) - 1))
    : Math.round(loanAmount / 60);
  const emiSliderStep = Math.max(500, Math.round((emiSliderMax - emiSliderMin) / 200 / 500) * 500);

  // Display tenure label for the derived (read-only) field
  const tenureDisplayLabel = isYearMode
    ? `${Math.floor(effectiveTenure / 12)}y ${effectiveTenure % 12 > 0 ? `${effectiveTenure % 12}m` : ''}`.trim()
    : `${effectiveTenure} months`;

  return (
    <div className="p-3 rounded-xl bg-secondary/40 space-y-3">
        {/* Loan Amount */}
        <div className="space-y-2">
          <EditableField
            label="Loan Amount"
            value={loanAmount}
            type="amount"
            onEdit={onLoanAmountChange}
          />
          <Slider
            value={[loanAmount]}
            min={100000}
            max={30000000}
            step={100000}
            onValueChange={([v]) => onLoanAmountChange(v)}
          />
        </div>

        {/* Tenure ↔ EMI mode toggle */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Loan Term
          </span>
          <ToggleGroup
            type="single"
            value={emiInputMode}
            onValueChange={(v) => v && onEmiInputModeChange(v as 'tenure' | 'emi')}
          >
            <ToggleGroupItem value="tenure">Set Tenure</ToggleGroupItem>
            <ToggleGroupItem value="emi">Set EMI</ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Tenure field */}
        <div className="space-y-2">
          {emiInputMode === 'tenure' ? (
            <>
              <div className="flex items-center justify-between">
                <EditableField
                  label="Tenure"
                  value={isYearMode ? tenure / 12 : tenure}
                  type="tenure"
                  isYearMode={isYearMode}
                  maxLength={15}
                  onEdit={(v) => {
                    if (isYearMode) {
                      const years = Math.min(35, Math.max(1, v));
                      onTenureChange(Math.round(years * 12));
                    } else {
                      const months = Math.min(420, Math.max(1, v));
                      onTenureChange(months);
                    }
                    setIsTenureEditing(false);
                  }}
                  onEditStart={() => setIsTenureEditing(true)}
                  onEditCancel={() => setIsTenureEditing(false)}
                  action={
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={isYearMode}
                        disabled={isTenureEditing}
                        onCheckedChange={onYearModeChange}
                        className={isTenureEditing ? 'opacity-50' : ''}
                      />
                      <span className="text-sm">{isYearMode ? 'Years' : 'Months'}</span>
                    </div>
                  }
                />
              </div>
              <Slider
                value={[isYearMode ? tenure / 12 : tenure]}
                min={1}
                max={isYearMode ? 35 : 420}
                step={isYearMode ? 0.083 : 1}
                onValueChange={([v]) => {
                  if (isYearMode) {
                    onTenureChange(Math.round(v * 12));
                  } else {
                    onTenureChange(v);
                  }
                }}
                className="w-full"
              />
            </>
          ) : (
            /* Derived tenure (read-only) when in EMI mode */
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/40 border border-border/50">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Tenure</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-primary/20 text-primary font-medium">calc</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-foreground">{tenureDisplayLabel}</span>
                <div className="flex items-center gap-1.5">
                  <Switch
                    checked={isYearMode}
                    onCheckedChange={onYearModeChange}
                  />
                  <span className="text-xs text-muted-foreground">{isYearMode ? 'Yrs' : 'Mo'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* EMI field */}
        <div className="space-y-2">
          {emiInputMode === 'emi' ? (
            <>
              <EditableField
                label="Monthly EMI"
                value={emiInput}
                type="amount"
                onEdit={(v) => onEmiInputChange(Math.max(1, v))}
              />
              <Slider
                value={[Math.min(emiSliderMax, Math.max(emiSliderMin, emiInput))]}
                min={emiSliderMin}
                max={emiSliderMax}
                step={emiSliderStep}
                onValueChange={([v]) => onEmiInputChange(v)}
              />
              <p className="text-xs text-muted-foreground">
                Range: {formatCurrency(emiSliderMin)} (30 yr) — {formatCurrency(emiSliderMax)} (5 yr)
              </p>
            </>
          ) : (
            /* Derived EMI (read-only) when in tenure mode */
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/40 border border-border/50">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Monthly EMI</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-primary/20 text-primary font-medium">calc</span>
              </div>
              <span className="text-base font-bold text-foreground">{formatCurrency(computedEMI)}</span>
            </div>
          )}
        </div>

        {/* Current Rate */}
        <div className="space-y-2">
          <EditableField
            label="Current Interest Rate"
            value={currentRate}
            type="rate"
            onEdit={onCurrentRateChange}
          />
          <Slider
            value={[currentRate]}
            min={7}
            max={15}
            step={0.05}
            onValueChange={([v]) => onCurrentRateChange(v)}
          />
        </div>
    </div>
  );
};

interface ComparisonInputsProps {
  currentRate: number;
  currentEMI: number;
  newRate: number;
  extraPayment: number;
  frequency: FrequencyType;
  lumpSumYear: number;
  tenure: number;
  newTenure: number;
  isYearMode: boolean;
  emiMultiplier: number;
  extraPaymentMode: 'amount' | 'emi';
  extraEmiCount: number;
  onNewRateChange: (value: number) => void;
  onNewTenureChange: (value: number) => void;
  onYearModeChange: (value: boolean) => void;
  onExtraPaymentChange: (value: number) => void;
  onFrequencyChange: (value: FrequencyType) => void;
  onLumpSumYearChange: (value: number) => void;
  onEmiMultiplierChange: (value: number) => void;
  onExtraPaymentModeChange: (value: 'amount' | 'emi') => void;
  onExtraEmiCountChange: (value: number) => void;
}

const EMI_COUNT_OPTIONS = [0, 0.5, 1, 1.5, 2, 3];

export const ComparisonInputs: React.FC<ComparisonInputsProps> = ({
  currentRate,
  currentEMI,
  newRate,
  extraPayment,
  frequency,
  lumpSumYear,
  tenure,
  newTenure,
  isYearMode,
  emiMultiplier,
  extraPaymentMode,
  extraEmiCount,
  onNewRateChange,
  onNewTenureChange,
  onYearModeChange,
  onExtraPaymentChange,
  onFrequencyChange,
  onLumpSumYearChange,
  onEmiMultiplierChange,
  onExtraPaymentModeChange,
  onExtraEmiCountChange,
}) => {
  const tenureYears = Math.floor(tenure / 12);
  const monthlyMultiplierExtra = Math.round((emiMultiplier - 1) * currentEMI);

  return (
    <div className="p-3 rounded-xl bg-secondary/40 space-y-3">
        {/* New Rate */}
        <div className="space-y-2">
          <EditableField
            label="New Interest Rate"
            value={newRate}
            type="rate"
            onEdit={onNewRateChange}
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNewRateChange(currentRate)}
                className="h-6 px-2"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            }
          />
          <Slider
            value={[newRate]}
            min={7}
            max={15}
            step={0.05}
            onValueChange={([v]) => onNewRateChange(v)}
          />
        </div>

        {/* New Tenure */}
        <div className="space-y-2">
          <EditableField
            label="New Tenure"
            value={isYearMode ? newTenure / 12 : newTenure}
            type="tenure"
            isYearMode={isYearMode}
            onEdit={(v) => {
              if (isYearMode) {
                const years = Math.min(35, Math.max(1, v));
                onNewTenureChange(Math.round(years * 12));
              } else {
                const months = Math.min(420, Math.max(1, v));
                onNewTenureChange(months);
              }
            }}
            action={
              <div className="flex items-center gap-2">
                <Switch
                  checked={isYearMode}
                  onCheckedChange={onYearModeChange}
                />
                <span className="text-sm">{isYearMode ? 'Years' : 'Months'}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNewTenureChange(tenure)}
                  className="h-6 px-2"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            }
          />
          <Slider
            value={[isYearMode ? newTenure / 12 : newTenure]}
            min={1}
            max={isYearMode ? 35 : 420}
            step={isYearMode ? 0.083 : 1}
            onValueChange={([v]) => {
              if (isYearMode) {
                onNewTenureChange(Math.round(v * 12));
              } else {
                onNewTenureChange(v);
              }
            }}
          />
        </div>

        {/* EMI Multiplier */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">EMI Multiplier</span>
            <span className="text-sm font-bold">
              {emiMultiplier.toFixed(1)}×
              {monthlyMultiplierExtra > 0 && (
                <span className="ml-1 text-xs text-primary font-normal">
                  (+{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(monthlyMultiplierExtra)}/mo)
                </span>
              )}
            </span>
          </div>
          <Slider
            value={[emiMultiplier]}
            min={1}
            max={3}
            step={0.1}
            onValueChange={([v]) => onEmiMultiplierChange(Math.round(v * 10) / 10)}
          />
        </div>

        {/* Extra Payment */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Extra Payment</span>
            <ToggleGroup
              type="single"
              value={extraPaymentMode}
              onValueChange={(v) => v && onExtraPaymentModeChange(v as 'amount' | 'emi')}
            >
              <ToggleGroupItem value="amount" className="px-2 py-1">₹ Amount</ToggleGroupItem>
              <ToggleGroupItem value="emi" className="px-2 py-1">× EMIs</ToggleGroupItem>
            </ToggleGroup>
          </div>

          {extraPaymentMode === 'amount' ? (
            <>
              <div className="flex items-center justify-between">
                <EditableField
                  label=""
                  value={extraPayment}
                  type="amount"
                  onEdit={onExtraPaymentChange}
                />
                <select
                  value={frequency}
                  onChange={e => onFrequencyChange(e.target.value as FrequencyType)}
                  className="h-9 px-2 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                  <option value="lumpsum">One-time</option>
                </select>
              </div>
              <Slider
                value={[extraPayment]}
                min={0}
                max={500000}
                step={1000}
                onValueChange={([v]) => onExtraPaymentChange(v)}
              />
              {frequency === 'lumpsum' && (
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-sm text-muted-foreground">Pay after</span>
                  <input
                    type="number"
                    min={1}
                    max={tenureYears}
                    value={lumpSumYear}
                    onChange={e => {
                      const val = Math.min(tenureYears, Math.max(1, parseInt(e.target.value) || 1));
                      onLumpSumYearChange(val);
                    }}
                    className="w-16 h-9 px-2 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <span className="text-sm text-muted-foreground">year{lumpSumYear !== 1 ? 's' : ''}</span>
                  {lumpSumYear >= tenureYears && (
                    <span className="text-xs text-destructive">
                      Note: Loan ends at year {tenureYears} — payment may not apply
                    </span>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2">
              <select
                value={extraEmiCount}
                onChange={e => onExtraEmiCountChange(parseFloat(e.target.value))}
                className="h-9 px-2 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {EMI_COUNT_OPTIONS.map(n => (
                  <option key={n} value={n}>{n === 0 ? '0 (off)' : `${n} EMI${n !== 1 ? 's' : ''}`}</option>
                ))}
              </select>
              <span className="text-sm text-muted-foreground">per</span>
              <select
                value={frequency === 'lumpsum' ? 'yearly' : frequency}
                onChange={e => onFrequencyChange(e.target.value as FrequencyType)}
                className="h-9 px-2 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="monthly">month</option>
                <option value="quarterly">quarter</option>
                <option value="yearly">year</option>
              </select>
              {extraEmiCount > 0 && currentEMI > 0 && (
                <span className="text-xs text-muted-foreground">
                  ≈ {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(extraEmiCount * currentEMI)}
                </span>
              )}
            </div>
          )}
        </div>
    </div>
  );
};
