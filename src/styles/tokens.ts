/**
 * Design Tokens for CivicFix Admin & Cross-Platform UI
 * Standardized color mappings and design constants.
 */

export const TOKENS = {
  colors: {
    civic: {
      50: '#fbfbfa',
      100: '#f4f4f2',
      200: '#e8e8e4',
      300: '#d5d5cd',
      400: '#a3a398',
      500: '#737367',
      600: '#525248',
      700: '#3f3f37',
      800: '#272722',
      900: '#191916',
      950: '#0d0d0b',
    },
    accent: {
      default: '#d9531e',
      hover: '#c24513',
      subtle: '#fef3ec',
      border: '#fbdacf',
    },
    status: {
      reported: '#dc2626',
      acknowledged: '#ea580c',
      inProgress: '#d97706',
      resolved: '#16a34a',
      closed: '#52525b',
    },
    severity: {
      low: '#2563eb',
      medium: '#d97706',
      high: '#ea580c',
      critical: '#dc2626',
    },
  },
  typography: {
    fontSans: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
    fontMono: 'JetBrains Mono, monospace',
  },
} as const;

export type DesignTokens = typeof TOKENS;
