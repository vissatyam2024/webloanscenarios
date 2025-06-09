"use client";

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { EditableField } from '@/components/ui/EditableField';
import { FrequencyType } from '@/types/loan.types';


interface LoanInputsProps {
  loanAmount: number;
  tenure: number; // Always in months
  isYearMode: boolean;
  currentRate: number;
  newRate: number;
  extraPayment: number;
  frequency: FrequencyType;
  onLoanAmountChange: (value: number) => void;
  onTenureChange: (value: number) => void;
  onYearModeChange: (value: boolean) => void;
  onCurrentRateChange: (value: number) => void;
  onNewRateChange: (value: number) => void;
  onExtraPaymentChange: (value: number) => void;
  onFrequencyChange: (value: FrequencyType) => void;
}

export const LoanInputs: React.FC<LoanInputsProps> = ({
  loanAmount,
  tenure,
  isYearMode,
  currentRate,
  newRate,
  extraPayment,
  frequency,
  onLoanAmountChange,
  onTenureChange,
  onYearModeChange,
  onCurrentRateChange,
  onNewRateChange,
  onExtraPaymentChange,
  onFrequencyChange,
}) => {
  // State to track if tenure field is being edited
  const [isTenureEditing, setIsTenureEditing] = useState(false);

  return (
    <>
      {/* Primary Inputs */}
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
          // In years mode, validate and convert to months
          const years = Math.min(35, Math.max(1, v));
          onTenureChange(Math.round(years * 12));
        } else {
          // In months mode, validate and store directly
          const months = Math.min(420, Math.max(1, v));
          onTenureChange(months);
        }
        // Reset editing state when edit is complete
        setIsTenureEditing(false);
      }}
      onEditStart={() => setIsTenureEditing(true)}
      onEditCancel={() => setIsTenureEditing(false)}
      action={
        <div className="flex items-center gap-2">
          <Switch 
            checked={isYearMode}
            // Disable the switch when tenure field is being edited
            disabled={isTenureEditing}
            onCheckedChange={onYearModeChange}
            className={isTenureEditing ? "opacity-50" : ""}
          />
          <span className="text-sm">{isYearMode ? 'Years' : 'Months'}</span>
        </div>
      }
    />
  </div>
  
  <Slider
    // Display value based on mode
    value={[isYearMode ? tenure / 12 : tenure]}
    // Set range based on mode
    min={isYearMode ? 1 : 1}
    max={isYearMode ? 35 : 420}
    // Set step based on mode
    step={isYearMode ? 0.083 : 1}
    onValueChange={([v]) => {
      if (isYearMode) {
        // In years mode, convert to months
        onTenureChange(Math.round(v * 12));
      } else {
        // In months mode, store directly
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

      {/* Comparison Inputs */}
      <Card>
        <CardContent className="p-4 bg-gray-50 space-y-4">
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

          {/* Extra Payment */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <EditableField 
                label="Extra Payment"
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
              </select>
            </div>
            <Slider
            value={[extraPayment]}
            min={0}
            max={500000}
            step={1000}
            onValueChange={([v]) => onExtraPaymentChange(v)}
          />
        </div>
      </CardContent>
    </Card>
  </>
);
};

export default LoanInputs;