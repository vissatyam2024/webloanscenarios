"use client";

import React from 'react';
import { formatCurrency } from '@/utils/formatters';

interface ScenarioHeroProps {
  title: string;
  value: number;
  improved: boolean;
  subtext?: string;
}

const ScenarioHero: React.FC<ScenarioHeroProps> = ({ title, value, improved, subtext }) => {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <span className="text-xs font-extrabold text-foreground tracking-widest uppercase">{title}</span>
      <div className="relative inline-block w-fit">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle, hsl(var(${improved ? '--primary' : '--destructive'}) / 0.22), transparent 70%)`,
            transform: 'scale(2.5)',
          }}
        />
        <span className={`relative text-5xl font-black tracking-tight tabular-nums ${improved ? 'text-primary' : 'text-destructive'}`}>
          {formatCurrency(value)}
        </span>
      </div>
      {subtext && <span className="text-sm font-medium text-muted-foreground">{subtext}</span>}
    </div>
  );
};

export default ScenarioHero;
