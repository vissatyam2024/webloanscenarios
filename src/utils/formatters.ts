export const formatCurrency = (value: number): string => {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
};

export const formatTenure = (value: number, isYearMode?: boolean): string => {
  if (isYearMode) {
    // If we're in years mode, the input value is already in years
    // We need to handle a decimal value like 2.08333 properly
    const years = Math.floor(value);
    const decimalPart = value - years;
    const months = Math.round(decimalPart * 12);
    
    if (months === 0) {
      return `${years} ${years === 1 ? 'year' : 'years'}`;
    } else if (months === 12) {
      // If months rounds to 12, just add another year
      return `${years + 1} ${years + 1 === 1 ? 'year' : 'years'}`;
    } else {
      return `${years} ${years === 1 ? 'year' : 'years'} ${months} ${months === 1 ? 'month' : 'months'}`;
    }
  } else {
    // In months mode, display raw value with "months" label
    return `${value} ${value === 1 ? 'month' : 'months'}`;
  }
};