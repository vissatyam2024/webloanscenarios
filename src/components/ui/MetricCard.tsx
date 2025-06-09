"use client";

import React from 'react';
import { MetricCardProps } from '@/types/loan.types';
import { formatCurrency, formatTenure } from '@/utils/formatters';

export const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  type = 'currency', 
  subtext 
}) => {
  const formattedValue = type === 'currency' ? formatCurrency(value) :
                        type === 'tenure' ? formatTenure(value, false) :
                        type === 'percent' ? `${value}%` : value;
                        
  return (
    <div className="p-3 border rounded-lg">
      <div className="text-sm text-gray-600">{title}</div>
      <div className="text-xl font-bold">
        {formattedValue}
      </div>
      {subtext && <div className="text-xs text-gray-500">{subtext}</div>}
    </div>
  );
};