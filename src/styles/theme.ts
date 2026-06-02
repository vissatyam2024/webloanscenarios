// SURE Design System — Dark Theme (graphite + lime)
// Single source of truth for all design tokens.
// Update here to change the entire app's palette.

export const colors = {
  background:    '#100F0F',
  surface:       '#122027',
  surfaceSoft:   '#282828',
  foreground:    '#D7D7D7',
  textSecondary: '#9CA4A8',
  primary:       '#E2FF90',
  primaryDeep:   '#BAE052',
  border:        '#29383A',
  borderControl: '#5E6E73',
  success:       '#83B100',
  warning:       '#FEDD30',
  error:         '#FE5A5A',
} as const;

export const chartColors = {
  principal:    colors.success,       // #83B100 dark green — principal payments
  interest:     colors.error,         // #FE5A5A coral — interest payments
  original:     colors.textSecondary, // #9CA4A8 slate — original loan line
  optimised:    colors.primary,       // #E2FF90 lime — optimised loan line
  combined:     colors.primaryDeep,   // #BAE052 deep lime — combined impact
  savings:      colors.success,
  extraPayment: colors.error,
} as const;
