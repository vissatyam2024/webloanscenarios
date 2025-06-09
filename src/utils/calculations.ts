// src/utils/calculations.ts

import { LoanMetrics } from '../types/loan.types';

export const calculateLoan = (
  principal: number,
  currentRate: number,
  newRate: number,
  tenure: number,
  extraPayment: number = 0
): LoanMetrics => {
  try {
    // Safety checks
    if (!principal || principal <= 0) throw new Error("Invalid principal");
    if (!currentRate || currentRate <= 0) throw new Error("Invalid current rate");
    if (!newRate || newRate <= 0) throw new Error("Invalid new rate");
    if (!tenure || tenure <= 0) throw new Error("Invalid tenure");

    const monthlyRate = (rate: number): number => rate / 12 / 100;
    const pmt = (rate: number, n: number, p: number): number => 
      p * rate * Math.pow(1 + rate, n) / (Math.pow(1 + rate, n) - 1);
    
    const cr = monthlyRate(currentRate);
    const nr = monthlyRate(newRate);
    const currentEMI = pmt(cr, tenure, principal);
    const newEMI = pmt(nr, tenure, principal);

    // Calculate current interest
    const totalCurrentInterest = (currentEMI * tenure) - principal;
    const totalNewInterest = (newEMI * tenure) - principal;
    
    // Calculate new tenure with same EMI
    const newTenure = Math.ceil(Math.log(currentEMI / (currentEMI - principal * nr)) / Math.log(1 + nr));

    // Extra payment impact
    let p = principal;
    let m = 0;
    let totalExtraInterest = 0;
    const totalPayment = newEMI + extraPayment;

    while (p > 0 && m < tenure) {
      const interest = p * nr;
      totalExtraInterest += interest;
      p -= (totalPayment - interest);
      m++;
    }

    return {
      currentEMI: Math.round(currentEMI),
      newEMI: Math.round(newEMI),
      monthlySaving: Math.round(currentEMI - newEMI),
      interestSaving: Math.round(totalCurrentInterest - totalNewInterest),
      newTenure,
      tenureReduction: tenure - newTenure,
      extraPaymentSaving: Math.round(totalNewInterest - totalExtraInterest),
      extraTenureReduction: tenure - m,
      totalSaving: Math.round(totalCurrentInterest - totalExtraInterest),
      monthsWithExtra: m,
      totalInterestWithExtra: Math.round(totalExtraInterest),
      totalCurrentInterest: Math.round(totalCurrentInterest)
    };
  } catch (error) {
    console.error("Error in calculateLoan:", error);
    // Return default values if calculation fails
    return {
      currentEMI: 0,
      newEMI: 0,
      monthlySaving: 0,
      interestSaving: 0,
      newTenure: 0,
      tenureReduction: 0,
      extraPaymentSaving: 0,
      extraTenureReduction: 0,
      totalSaving: 0,
      monthsWithExtra: 0,
      totalInterestWithExtra: 0,
      totalCurrentInterest: 0
    };
  }
};

interface AmortizationEntry {
  month: number;
  payment: number;
  principalPaid: number;
  interestPaid: number;
  balance: number;
  cumulativeInterest: number;
}

/**
 * Generate a complete amortization schedule for a loan
 */
export const generateAmortizationSchedule = (
  principal: number,
  interestRate: number,
  tenureMonths: number,
  monthlyExtraPayment: number = 0,
  fixedEMI?: number
): AmortizationEntry[] => {
  // Safety checks
  if (!principal || principal <= 0) return [];
  if (!interestRate || interestRate <= 0) return [];
  if (!tenureMonths || tenureMonths <= 0) return [];
  
  try {
    const monthlyRate = interestRate / 12 / 100;
    
    // Calculate EMI if not provided
    const emi = fixedEMI || (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths) / 
                            (Math.pow(1 + monthlyRate, tenureMonths) - 1));
    
    const schedule: AmortizationEntry[] = [];
    let remainingBalance = principal;
    let month = 1;
    let cumulativeInterest = 0;

    while (remainingBalance > 0 && month <= tenureMonths * 1.5) { // Add buffer to handle shorter tenures
      const monthlyInterest = remainingBalance * monthlyRate;
      let principalPayment = emi - monthlyInterest;
      
      // Add extra payment (if any)
      if (monthlyExtraPayment > 0) {
        principalPayment += monthlyExtraPayment;
      }
      
      // Ensure we don't overpay the loan
      if (principalPayment > remainingBalance) {
        principalPayment = remainingBalance;
      }
      
      remainingBalance -= principalPayment;
      cumulativeInterest += monthlyInterest;
      
      schedule.push({
        month,
        payment: principalPayment + monthlyInterest,
        principalPaid: principalPayment,
        interestPaid: monthlyInterest,
        balance: remainingBalance,
        cumulativeInterest
      });
      
      // Stop if the loan is paid off
      if (remainingBalance <= 0) {
        break;
      }
      
      month++;
    }
    
    return schedule;
  } catch (error) {
    console.error("Error in generateAmortizationSchedule:", error);
    return [];
  }
};

/**
 * Generate comparison data for Same EMI scenario
 */
export const generateSameEMIData = (
  principal: number,
  currentRate: number,
  newRate: number,
  tenureMonths: number
) => {
  // Safety checks
  if (!principal || principal <= 0) return [];
  if (!currentRate || currentRate <= 0) return [];
  if (!newRate || newRate <= 0) return [];
  if (!tenureMonths || tenureMonths <= 0) return [];
  
  try {
    // Calculate the original EMI
    const monthlyRate = currentRate / 12 / 100;
    const originalEMI = principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths) / 
                        (Math.pow(1 + monthlyRate, tenureMonths) - 1);
    
    // Generate original schedule
    const originalSchedule = generateAmortizationSchedule(
      principal, 
      currentRate, 
      tenureMonths
    );
    
    // Generate modified schedule with same EMI
    const modifiedSchedule = generateAmortizationSchedule(
      principal, 
      newRate, 
      tenureMonths * 1.5, // Add buffer for tenure
      0, // No extra payment
      originalEMI // Use same EMI
    );
    
    // Create comparison data with potentially different end points
    const maxMonths = Math.max(
      originalSchedule.length,
      modifiedSchedule.length
    );
    
    const comparisonData = [];
    
    for (let i = 0; i < maxMonths; i++) {
      const month = i + 1;
      const original = originalSchedule[i] || { balance: 0, interestPaid: 0, cumulativeInterest: 0 };
      const modified = modifiedSchedule[i] || { balance: 0, interestPaid: 0, cumulativeInterest: 0 };
      
      comparisonData.push({
        month,
        originalBalance: original.balance > 0 ? original.balance : null,
        modifiedBalance: modified.balance > 0 ? modified.balance : null,
        originalInterest: original.cumulativeInterest,
        modifiedInterest: modified.cumulativeInterest,
        savings: original.balance - modified.balance
      });
    }
    
    return comparisonData;
  } catch (error) {
    console.error("Error in generateSameEMIData:", error);
    return [];
  }
};

/**
 * Generate comparison data for Combined Impact (Same EMI + Extra Payment)
 */
export const generateCombinedImpactData = (
  principal: number,
  currentRate: number,
  newRate: number,
  tenureMonths: number,
  extraPayment: number
) => {
  // Safety checks
  if (!principal || principal <= 0) return [];
  if (!currentRate || currentRate <= 0) return [];
  if (!newRate || newRate <= 0) return [];
  if (!tenureMonths || tenureMonths <= 0) return [];
  
  try {
    // Calculate original EMI
    const monthlyRate = currentRate / 12 / 100;
    const originalEMI = principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths) / 
                        (Math.pow(1 + monthlyRate, tenureMonths) - 1);
    
    // Generate schedules
    const originalSchedule = generateAmortizationSchedule(
      principal, 
      currentRate, 
      tenureMonths
    );
    
    // Rate change with same EMI
    const rateChangeSchedule = generateAmortizationSchedule(
      principal, 
      newRate, 
      tenureMonths * 1.5, // Add buffer for tenure
      0, // No extra payment
      originalEMI // Use same EMI
    );
    
    // Combined: Rate change with same EMI + extra payment
    const combinedSchedule = generateAmortizationSchedule(
      principal, 
      newRate, 
      tenureMonths * 1.5, // Add buffer for tenure
      extraPayment,
      originalEMI // Use same EMI
    );
    
    // Get maximum months
    const maxMonths = Math.max(
      originalSchedule.length,
      rateChangeSchedule.length,
      combinedSchedule.length
    );
    
    const comparisonData = [];
    
    for (let i = 0; i < maxMonths; i++) {
      const month = i + 1;
      const original = originalSchedule[i] || { balance: 0, interestPaid: 0, cumulativeInterest: 0 };
      const rateChange = rateChangeSchedule[i] || { balance: 0, interestPaid: 0, cumulativeInterest: 0 };
      const combined = combinedSchedule[i] || { balance: 0, interestPaid: 0, cumulativeInterest: 0 };
      
      comparisonData.push({
        month,
        originalBalance: original.balance > 0 ? original.balance : null,
        rateChangeBalance: rateChange.balance > 0 ? rateChange.balance : null,
        combinedBalance: combined.balance > 0 ? combined.balance : null,
        originalInterest: original.cumulativeInterest,
        rateChangeInterest: rateChange.cumulativeInterest,
        combinedInterest: combined.cumulativeInterest,
        savings: original.balance - combined.balance
      });
    }
    
    return comparisonData;
  } catch (error) {
    console.error("Error in generateCombinedImpactData:", error);
    return [];
  }
};