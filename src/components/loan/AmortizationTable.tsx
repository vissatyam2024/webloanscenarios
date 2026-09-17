"use client";

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { AmortizationEntry } from '@/utils/calculations';
import { chartColors } from '@/styles/theme';

interface ScheduleEntry {
  title: string;
  schedule: AmortizationEntry[];
}

interface AmortizationTableProps {
  schedules: ScheduleEntry[];
}

const ScheduleTable: React.FC<{ title: string; schedule: AmortizationEntry[] }> = ({ title, schedule }) => (
  <div className="flex flex-col gap-2 min-w-0">
    <p className="text-xs font-semibold text-muted-foreground">
      {title} ({schedule.length} months)
    </p>
    <div className="max-h-[520px] overflow-y-auto rounded border">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-secondary z-10">
          <tr className="border-b">
            <th className="py-2 px-3 text-left font-medium text-muted-foreground">Month</th>
            <th className="py-2 px-3 text-right font-medium text-muted-foreground">EMI</th>
            <th className="py-2 px-3 text-right font-medium text-muted-foreground">Principal</th>
            <th className="py-2 px-3 text-right font-medium text-muted-foreground">Interest</th>
            <th className="py-2 px-3 text-right font-medium text-muted-foreground">Balance</th>
          </tr>
        </thead>
        <tbody>
          {schedule.map((row) => (
            <tr key={row.month} className="border-b hover:bg-secondary/50">
              <td className="py-1.5 px-3">
                {row.month}
                {row.extraPaymentApplied > 0 && (
                  <span className="ml-1.5 text-xs bg-destructive/10 text-destructive px-1.5 py-0.5 rounded">
                    +{formatCurrency(row.extraPaymentApplied)}
                  </span>
                )}
              </td>
              <td className="py-1.5 px-3 text-right tabular-nums">{formatCurrency(row.payment)}</td>
              <td className="py-1.5 px-3 text-right tabular-nums" style={{ color: chartColors.principal }}>{formatCurrency(row.principalPaid)}</td>
              <td className="py-1.5 px-3 text-right tabular-nums" style={{ color: chartColors.interest }}>{formatCurrency(row.interestPaid)}</td>
              <td className="py-1.5 px-3 text-right tabular-nums">{formatCurrency(row.balance)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const AmortizationTable: React.FC<AmortizationTableProps> = ({ schedules }) => {
  const [isOpen, setIsOpen] = useState(false);

  const visible = schedules.filter(s => s.schedule && s.schedule.length > 0);
  if (visible.length === 0) return null;

  return (
    <Card>
      <CardContent className="p-4">
        <Button
          variant="ghost"
          className="w-full flex items-center justify-between h-auto py-1 px-0"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="text-sm font-semibold">Amortization Schedule</span>
          {isOpen ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
        </Button>

        {isOpen && (
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
            {visible.map((s) => (
              <ScheduleTable key={s.title} title={s.title} schedule={s.schedule} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AmortizationTable;
