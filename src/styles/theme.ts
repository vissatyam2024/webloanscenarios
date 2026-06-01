// SURE Design System — Light Paper Theme
// Single source of truth for all design tokens.
// Update here to change the entire app's palette.

export const colors = {
  background:    '#F0EEE6',
  surface:       '#FAF9F4',
  surfaceSoft:   '#EAE7DC',
  foreground:    '#1F1E1A',
  textSecondary: '#514E45',
  primary:       '#81A51D',
  primaryDeep:   '#354706',
  border:        '#DAD6C8',
  borderControl: '#807B6D',
  success:       '#3E6B43',
  warning:       '#B8862B',
  error:         '#B5462E',
} as const;

export const chartColors = {
  principal:    colors.success,       // forest green — principal payments
  interest:     colors.error,         // terracotta — interest payments
  original:     colors.textSecondary, // warm taupe — original loan line
  optimised:    colors.primary,       // grass green — optimised loan line
  combined:     colors.primaryDeep,   // deep green — combined impact line
  savings:      colors.success,       // savings/gap fill
  extraPayment: colors.error,         // extra payment dot/badge
} as const;
