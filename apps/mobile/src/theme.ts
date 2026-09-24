// Values from the Figma file "Steve Suhr App" (qmCXTfCss1RToNWk3jGMgn).
export const colors = {
  accent: '#F97316',
  accentPressed: '#E0660F',
  background: '#F5F5F7',
  surface: '#FFFFFF',
  surfaceMuted: '#F2F2F5',
  text: '#1A1A1F',
  textCard: '#26262B',
  textMuted: '#737380',
  textSubtle: '#8C8C99',
  textFieldLabel: '#80808C',
  border: '#E5E5EB',
  inputBorder: '#DEDEE3',
  danger: '#BF3326',
  dangerPressed: '#A62B20',
  overlay: 'rgba(0, 0, 0, 0.45)',
  google: '#4285F5',
  white: '#FFFFFF',
} as const;

/** Inter, loaded in the root layout. Use these instead of fontWeight so Android picks the right face. */
export const fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
} as const;

export const radius = { sm: 4, md: 10, lg: 12, xl: 16, appMark: 24, pill: 999 } as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 } as const;

/** Horizontal screen padding used on every screen in the design. */
export const screenPadding = 20;
