"use client";

import React from 'react';
import { MetricCardProps } from '@/types/loan.types';
import { formatCurrency } from '@/utils/formatters';

const tenureLabel = (months: number): string => {
  if (months <= 0) return '—';
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  return remainingMonths > 0 ? `${years} yrs ${remainingMonths} mo` : `${years} yrs`;
};

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  type = 'currency',
  subtext,
  showMonthsSuffix = false,
}) => {
  const formattedValue = type === 'currency' ? formatCurrency(value) :
                        type === 'tenure' ? tenureLabel(value) :
                        type === 'percent' ? `${value}%` : value;

  const subtextLine = type === 'tenure' && showMonthsSuffix && value > 0
    ? `${value} months${subtext ? ` • ${subtext}` : ''}`
    : subtext;

  return (
    <div className="p-3 border border-border/40 rounded-lg">
      <div className="text-sm font-medium text-muted-foreground">{title}</div>
      <div className="text-lg font-semibold">
        {formattedValue}
      </div>
      {subtextLine && <div className="text-xs text-muted-foreground">{subtextLine}</div>}
    </div>
  );
};