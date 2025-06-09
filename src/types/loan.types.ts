import { ReactNode } from 'react';

export interface LoanMetrics {
  currentEMI: number;
  newEMI: number;
  monthlySaving: number;
  interestSaving: number;
  newTenure: number;
  tenureReduction: number;
  extraPaymentSaving: number;
  extraTenureReduction: number;
  totalSaving: number;
  monthsWithExtra: number;
  totalInterestWithExtra: number;
  totalCurrentInterest: number;
}

export interface LoanMetricsProps {
  metrics: LoanMetrics;
  loanAmount: number;
  currentRate: number;
}

export interface EditableFieldProps {
  label: string;
  value: number;
  type: 'amount' | 'tenure' | 'rate' |'years';
  onEdit: (value: number) => void;
  action?: ReactNode;
  isYearMode?: boolean;
  onEditStart?: () => void;  // Called when editing starts
  onEditCancel?: () => void; // Called when editing is canceled
  maxLength?:number;
}

export interface MetricCardProps {
  title: string;
  value: number;
  type?: 'currency' | 'tenure' | 'percent' ;
  subtext?: string;
}

export type FrequencyType = 'monthly' | 'quarterly' | 'yearly';

export interface ChartData {
  month: number;
  originalBalance?: number;
  modifiedBalance?: number;
  originalInterest?: number;
  modifiedInterest?: number;
  savings?: number;
}