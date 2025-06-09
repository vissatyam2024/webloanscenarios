"use client";
import React, { useState, useEffect } from 'react';
import { Edit2 } from 'lucide-react';
import { EditableFieldProps } from '@/types/loan.types';
import { formatCurrency, formatTenure } from '@/utils/formatters';

export const EditableField: React.FC<EditableFieldProps> = ({ 
  label, 
  value, 
  type, 
  onEdit, 
  action,
  isYearMode,
  onEditStart,
  onEditCancel,
  maxLength = 10 
}) => {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(value.toString());
  
  // For tenure in years mode, we'll use separate fields
  const [yearValue, setYearValue] = useState(0);
  const [monthValue, setMonthValue] = useState(0);
  
  // Setup initial years and months values when editing starts
  useEffect(() => {
    if (editing && type === 'tenure' && isYearMode) {
      const years = Math.floor(value);
      const monthsDecimal = value - years;
      const months = Math.round(monthsDecimal * 12);
      
      if (months === 12) {
        setYearValue(years + 1);
        setMonthValue(0);
      } else {
        setYearValue(years);
        setMonthValue(months);
      }
    }
  }, [editing, type, value, isYearMode]);

  // Start editing mode
  const startEditing = () => {
    setEditing(true);
    if (type !== 'tenure' || !isYearMode) {
      setEditValue(value.toString());
    }
    if (onEditStart) onEditStart();
  };

  // Complete editing and save value
  const handleComplete = () => {
    if (type === 'tenure' && isYearMode) {
      // Calculate the combined value from years and months
      const combinedValue = yearValue + (monthValue / 12);
      onEdit(combinedValue);
    } else {
      const v = parseFloat(editValue.replace(/[^0-9.]/g, ''));
      if (!isNaN(v)) onEdit(v);
    }
    setEditing(false);
  };

  // Cancel editing without saving
  const handleCancel = () => {
    setEditing(false);
    if (onEditCancel) onEditCancel();
  };

  // Handle standard input change with character limit
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue.length <= maxLength) {
      setEditValue(inputValue);
    }
  };

  // Handle years input change
  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value === '') {
      setYearValue(0);
    } else {
      const numValue = parseInt(value);
      // Cap at 35 years
      setYearValue(Math.min(35, numValue));
    }
  };

  // Handle months input change
  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value === '') {
      setMonthValue(0);
    } else {
      const numValue = parseInt(value);
      // If they enter more than 11 months, convert to years
      if (numValue >= 12) {
        const additionalYears = Math.floor(numValue / 12);
        const remainingMonths = numValue % 12;
        setYearValue(prev => Math.min(35, prev + additionalYears));
        setMonthValue(remainingMonths);
      } else {
        setMonthValue(numValue);
      }
    }
  };

  // Handle keyboard events for accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleComplete();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const formatted = type === 'amount' ? formatCurrency(value) :
                   type === 'tenure' ? formatTenure(value, isYearMode) :
                   type === 'rate' ? `${value}%` : value;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">{label}:</span>
      {editing ? (
        <>
          {type === 'tenure' && isYearMode ? (
            <div className="flex items-center gap-2">
              <div className="relative w-16">
                <input
                  type="text"
                  value={yearValue}
                  onChange={handleYearChange}
                  onBlur={handleComplete}
                  onKeyDown={handleKeyDown}
                  className="w-full px-2 py-1 text-sm border rounded"
                  autoFocus
                  maxLength={2}
                />
                <span className="text-xs text-gray-500 absolute right-1 top-1.5">y</span>
              </div>
              <div className="relative w-16">
                <input
                  type="text"
                  value={monthValue}
                  onChange={handleMonthChange}
                  onBlur={handleComplete}
                  onKeyDown={handleKeyDown}
                  className="w-full px-2 py-1 text-sm border rounded"
                  maxLength={2}
                />
                <span className="text-xs text-gray-500 absolute right-1 top-1.5">m</span>
              </div>
            </div>
          ) : (
            <div className="relative">
              <input
                type="text"
                value={editValue}
                onChange={handleInputChange}
                onBlur={handleComplete}
                onKeyDown={handleKeyDown}
                className="w-24 px-2 py-1 text-sm border rounded"
                autoFocus
                maxLength={maxLength}
              />
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{formatted}</span>
          <Edit2 className="w-4 h-4 text-gray-400 cursor-pointer" onClick={startEditing} />
        </div>
      )}
      {action}
    </div>
  );
};