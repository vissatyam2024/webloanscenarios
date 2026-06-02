"use client";

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { EditableField } from '@/components/ui/EditableField';
import { FrequencyType } from '@/types/loan.types';

interface PrimaryInputsProps {
  loanAmount: number;
  tenure: number;
  isYearMode: boolean;
  currentRate: number;
  onLoanAmountChange: (value: number) => void;
  onTenureChange: (value: number) => void;
  onYearModeChange: (value: boolean) => void;
  onCurrentRateChange: (value: number) => void;
}

export const PrimaryInputs: React.FC<PrimaryInputsProps> = ({
  loanAmount,
  tenure,
  isYearMode,
  currentRate,
  onLoanAmountChange,
  onTenureChange,
  onYearModeChange,
  onCurrentRateChange,
}) => {
  const [isTenureEditing, setIsTenureEditing] = useState(false);

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
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

        {/* Tenure */}
        <div className="space-y-2">
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
      </CardContent>
    </Card>
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
  emiMultiplier: number;
  extraPaymentMode: 'amount' | 'emi';
  extraEmiCount: number;
  onNewRateChange: (value: number) => void;
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
  emiMultiplier,
  extraPaymentMode,
  extraEmiCount,
  onNewRateChange,
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
    <Card>
      <CardContent className="p-4 bg-secondary space-y-4">
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

        {/* EMI Multiplier */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">EMI Multiplier</span>
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
            <span className="text-sm font-medium text-gray-700">Extra Payment</span>
            <div className="flex rounded border border-border overflow-hidden text-xs">
              <button
                className={`px-2 py-1 font-medium transition-colors ${extraPaymentMode === 'amount' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground'}`}
                onClick={() => onExtraPaymentModeChange('amount')}
              >
                ₹ Amount
              </button>
              <button
                className={`px-2 py-1 font-medium transition-colors ${extraPaymentMode === 'emi' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground'}`}
                onClick={() => onExtraPaymentModeChange('emi')}
              >
                × EMIs
              </button>
            </div>
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
                  className="px-2 py-1 text-sm border rounded"
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
                    className="w-16 px-2 py-1 text-sm border rounded"
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
                className="px-2 py-1 text-sm border rounded"
              >
                {EMI_COUNT_OPTIONS.map(n => (
                  <option key={n} value={n}>{n === 0 ? '0 (off)' : `${n} EMI${n !== 1 ? 's' : ''}`}</option>
                ))}
              </select>
              <span className="text-sm text-muted-foreground">per</span>
              <select
                value={frequency === 'lumpsum' ? 'yearly' : frequency}
                onChange={e => onFrequencyChange(e.target.value as FrequencyType)}
                className="px-2 py-1 text-sm border rounded"
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
      </CardContent>
    </Card>
  );
};
