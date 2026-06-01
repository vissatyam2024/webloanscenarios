"use client";

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { AmortizationEntry } from '@/utils/calculations';

interface AmortizationTableProps {
  title: string;
  schedule: AmortizationEntry[];
}

const AmortizationTable: React.FC<AmortizationTableProps> = ({ title, schedule }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!schedule || schedule.length === 0) return null;

  return (
    <Card className="bg-white/95">
      <CardContent className="p-4">
        <Button
          variant="ghost"
          className="w-full flex items-center justify-between h-auto py-1 px-0"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="text-sm font-semibold">
            {title} — Amortization Schedule ({schedule.length} months)
          </span>
          {isOpen ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
        </Button>

        {isOpen && (
          <div className="mt-3 max-h-[520px] overflow-y-auto rounded border">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-50 z-10">
                <tr className="border-b">
                  <th className="py-2 px-3 text-left font-medium text-gray-600">Month</th>
                  <th className="py-2 px-3 text-right font-medium text-gray-600">EMI</th>
                  <th className="py-2 px-3 text-right font-medium text-gray-600">Principal</th>
                  <th className="py-2 px-3 text-right font-medium text-gray-600">Interest</th>
                  <th className="py-2 px-3 text-right font-medium text-gray-600">Balance</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((row) => (
                  <tr key={row.month} className="border-b hover:bg-gray-50">
                    <td className="py-1.5 px-3">
                      {row.month}
                      {row.extraPaymentApplied > 0 && (
                        <span className="ml-1.5 text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded">
                          +{formatCurrency(row.extraPaymentApplied)}
                        </span>
                      )}
                    </td>
                    <td className="py-1.5 px-3 text-right tabular-nums">{formatCurrency(row.payment)}</td>
                    <td className="py-1.5 px-3 text-right tabular-nums text-green-700">{formatCurrency(row.principalPaid)}</td>
                    <td className="py-1.5 px-3 text-right tabular-nums text-orange-600">{formatCurrency(row.interestPaid)}</td>
                    <td className="py-1.5 px-3 text-right tabular-nums">{formatCurrency(row.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AmortizationTable;
