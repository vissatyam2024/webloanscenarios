"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/utils/formatters';
import { colors } from '@/styles/theme';

const STATES = [
  'Maharashtra',
  'Telangana',
  'Karnataka',
  'Andhra Pradesh',
  'Delhi/Gurgaon',
  'Gujarat',
  'West Bengal',
  'Other (Generic)',
] as const;

type State = typeof STATES[number];
type LenderType = 'PSU' | 'Private';

function calcMODT(state: State, loanAmount: number): number {
  switch (state) {
    case 'Maharashtra':    return Math.round(loanAmount * 0.003);
    case 'Telangana':      return Math.min(Math.round(loanAmount * 0.005), 50000);
    case 'Karnataka':      return Math.round(loanAmount * 0.0065);
    case 'Andhra Pradesh': return Math.round(loanAmount * 0.0055);
    case 'Delhi/Gurgaon':  return 0;
    case 'Gujarat':        return Math.round(loanAmount * 0.0035);
    case 'West Bengal':    return 0;
    default:               return Math.round(loanAmount * 0.003);
  }
}

function modtHint(state: State): string {
  switch (state) {
    case 'Maharashtra':    return '0.30% of loan';
    case 'Telangana':      return '0.50% of loan, capped ₹50,000';
    case 'Karnataka':      return '0.65% of loan';
    case 'Andhra Pradesh': return '0.55% of loan';
    case 'Delhi/Gurgaon':  return 'Nil';
    case 'Gujarat':        return '0.35% of loan';
    case 'West Bengal':    return 'Nil';
    default:               return '0.30% of loan';
  }
}

function calcNOI(state: State): number {
  return state === 'Maharashtra' ? 18000 : 0;
}

function calcLegalTech(lenderType: LenderType, loanAmount: number): number {
  if (lenderType === 'Private') return 0;
  return loanAmount >= 10000000 ? 22000 : 15000;
}

function calcProcessingFee(state: State, lenderType: LenderType): number {
  if (lenderType === 'PSU') {
    return state === 'Gujarat' ? 5000 : 10000;
  }
  return ['Telangana', 'Andhra Pradesh', 'Karnataka'].includes(state) ? 0 : 17500;
}

// ── Sub-components ──────────────────────────────────────────────────────────

const CostField: React.FC<{
  label: string;
  hint?: string;
  value: number;
  onChange: (v: number) => void;
}> = ({ label, hint, value, onChange }) => (
  <div className="p-3 border border-border rounded-lg space-y-1">
    <div className="text-xs font-medium text-muted-foreground">{label}</div>
    {hint && <div className="text-xs text-muted-foreground opacity-70">{hint}</div>}
    <div className="flex items-baseline gap-1 mt-1">
      <span className="text-sm text-muted-foreground">₹</span>
      <input
        type="number"
        min={0}
        value={value}
        onChange={e => onChange(Math.max(0, parseInt(e.target.value) || 0))}
        className="w-full bg-transparent text-base font-extrabold text-foreground outline-none
          [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none
          [&::-webkit-inner-spin-button]:appearance-none"
      />
    </div>
  </div>
);

const SummaryCard: React.FC<{
  label: string;
  value: string;
  color?: string;
}> = ({ label, value, color }) => (
  <div className="p-3 border border-border rounded-lg">
    <div className="text-sm font-medium text-muted-foreground">{label}</div>
    <div
      className="text-xl font-extrabold mt-0.5"
      style={{ color: color ?? 'hsl(var(--foreground))' }}
    >
      {value}
    </div>
  </div>
);

// ── Main component ───────────────────────────────────────────────────────────

interface BalanceTransferAnalyserProps {
  loanAmount: number;
  currentEMI: number;
  newEMI: number;
  interestSaving: number;
}

const BalanceTransferAnalyser: React.FC<BalanceTransferAnalyserProps> = ({
  loanAmount,
  currentEMI,
  newEMI,
  interestSaving,
}) => {
  const [selectedState, setSelectedState] = useState<State>('Maharashtra');
  const [lenderType, setLenderType] = useState<LenderType>('PSU');
  const [modt, setModt] = useState(0);
  const [noi, setNoi] = useState(0);
  const [legalTech, setLegalTech] = useState(0);
  const [processingFee, setProcessingFee] = useState(0);

  // Auto-fill whenever state / lender type / loan amount changes
  useEffect(() => {
    setModt(calcMODT(selectedState, loanAmount));
    setNoi(calcNOI(selectedState));
    setLegalTech(calcLegalTech(lenderType, loanAmount));
    setProcessingFee(calcProcessingFee(selectedState, lenderType));
  }, [selectedState, lenderType, loanAmount]);

  // ── Derived summary ──────────────────────────────────────────────────────
  const totalBTCost   = modt + noi + legalTech + processingFee;
  const monthlySaving = Math.round(currentEMI - newEMI);
  const breakEven     = monthlySaving > 0 ? Math.ceil(totalBTCost / monthlySaving) : null;
  const netSaving     = interestSaving - totalBTCost;

  // ── Verdict ──────────────────────────────────────────────────────────────
  let verdictText  = '';
  let verdictColor: string = colors.textSecondary;

  if (monthlySaving <= 0) {
    verdictText  = 'No EMI saving detected — check rate inputs in Compare & Optimise';
    verdictColor = colors.textSecondary;
  } else if (breakEven !== null && breakEven < 12) {
    verdictText  = `BT Recommended — costs recovered in ${breakEven} month${breakEven !== 1 ? 's' : ''}`;
    verdictColor = colors.success;
  } else if (breakEven !== null && breakEven <= 24) {
    verdictText  = 'BT Viable — discuss with borrower';
    verdictColor = colors.warning;
  } else {
    verdictText  = 'BT Not Recommended at current rate difference';
    verdictColor = colors.error;
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Balance Transfer Cost Analyser
        </p>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">State</span>
            <select
              value={selectedState}
              onChange={e => setSelectedState(e.target.value as State)}
              className="px-2 py-1 text-sm border border-input rounded bg-background text-foreground"
            >
              {STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">Lender</span>
            <div className="flex rounded border border-border overflow-hidden text-xs">
              {(['PSU', 'Private'] as LenderType[]).map(lt => (
                <button
                  key={lt}
                  onClick={() => setLenderType(lt)}
                  className={`px-3 py-1 font-medium transition-colors ${
                    lenderType === lt
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background text-muted-foreground'
                  }`}
                >
                  {lt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 4 Editable cost fields */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <CostField
            label="MODT / EQM"
            hint={modtHint(selectedState)}
            value={modt}
            onChange={setModt}
          />
          <CostField
            label="NOI"
            hint={selectedState === 'Maharashtra' ? '₹18,000 for Maharashtra' : 'Nil for this state'}
            value={noi}
            onChange={setNoi}
          />
          <CostField
            label="Legal & Technical"
            hint={lenderType === 'Private' ? 'Nil for Private lenders' : loanAmount >= 10000000 ? '₹22,000 PSU (loan ≥ ₹1 Cr)' : '₹15,000 PSU (loan < ₹1 Cr)'}
            value={legalTech}
            onChange={setLegalTech}
          />
          <CostField
            label="Processing Fee"
            hint={
              lenderType === 'PSU'
                ? selectedState === 'Gujarat' ? '₹5,000 (Gujarat PSU)' : '₹10,000 (PSU)'
                : ['Telangana', 'Andhra Pradesh', 'Karnataka'].includes(selectedState)
                  ? 'Nil for Private'
                  : '₹17,500 (Private)'
            }
            value={processingFee}
            onChange={setProcessingFee}
          />
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <SummaryCard label="Total BT Cost" value={formatCurrency(totalBTCost)} />
          <SummaryCard
            label="Monthly Saving"
            value={monthlySaving > 0 ? formatCurrency(monthlySaving) : '—'}
            color={monthlySaving > 0 ? colors.success : undefined}
          />
          <SummaryCard
            label="Break-even"
            value={breakEven !== null ? `${breakEven} months` : '—'}
          />
          <SummaryCard
            label="Net Saving"
            value={formatCurrency(netSaving)}
            color={netSaving > 0 ? colors.success : colors.error}
          />
        </div>

        {/* Verdict */}
        <div
          className="p-3 rounded-lg text-sm font-semibold"
          style={{
            backgroundColor: `${verdictColor}22`,
            color: verdictColor,
            border: `1px solid ${verdictColor}44`,
          }}
        >
          {verdictText}
        </div>
      </CardContent>
    </Card>
  );
};

export default BalanceTransferAnalyser;
