"use client";

import React from 'react';

interface ComparisonStatProps {
  title: string;
  oldValue: string;
  newValue: string;
  /** true = new value is better (lime), false = new value is worse (red), undefined = neutral */
  improved?: boolean;
  /** Optional inline callout, e.g. "₹10,021/mo lower" or "6y 8m sooner" */
  deltaText?: string;
  /** Defaults to `improved` when omitted */
  deltaImproved?: boolean;
}

export const ComparisonStat: React.FC<ComparisonStatProps> = ({ title, oldValue, newValue, improved, deltaText, deltaImproved }) => {
  const newValueColor = improved === true ? 'text-primary' : improved === false ? 'text-destructive' : 'text-foreground';
  const isDeltaImproved = deltaImproved ?? improved;

  return (
    <div className="relative overflow-hidden p-5 flex flex-col gap-3">
      <span className="text-xs font-extrabold text-foreground tracking-wide uppercase">{title}</span>
      <div className="flex items-baseline gap-3 flex-wrap">
        <span className="text-lg font-bold text-muted-foreground/60 line-through decoration-muted-foreground/40 tabular-nums">
          {oldValue}
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/60 shrink-0">
          <path d="M5 12h14" /><path d="M13 6l6 6-6 6" />
        </svg>
        <span className={`text-2xl font-extrabold tabular-nums ${newValueColor}`}>{newValue}</span>
      </div>
      {deltaText && (
        <div
          className={`inline-flex items-center gap-1.5 self-start rounded-full px-2.5 py-1 text-xs font-extrabold ${
            isDeltaImproved === true
              ? 'bg-primary/10 text-primary'
              : isDeltaImproved === false
                ? 'bg-destructive/10 text-destructive'
                : 'bg-muted text-muted-foreground'
          }`}
        >
          {isDeltaImproved !== undefined && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              {isDeltaImproved ? <path d="M12 5v14M6 13l6 6 6-6" /> : <path d="M12 19V5M6 11l6-6 6 6" />}
            </svg>
          )}
          {deltaText}
        </div>
      )}
    </div>
  );
};
