/**
 * Design tokens mirroring the web app's Tailwind palette, so the two clients
 * read as one product.
 *
 * The web uses stock Tailwind v4 (src/index.css is a bare `@import
 * "tailwindcss"`), so these are the literal Tailwind default hex values —
 * nothing bespoke to keep in sync beyond this file. React Native has no
 * utility classes, so anything the web expresses as `bg-white border
 * border-slate-100 rounded-2xl` is expressed here once and consumed through
 * src/components/ui.tsx.
 */

export const palette = {
  white: '#FFFFFF',

  slate50: '#F8FAFC',
  slate100: '#F1F5F9',
  slate200: '#E2E8F0',
  slate300: '#CBD5E1',
  slate400: '#94A3B8',
  slate500: '#64748B',
  slate600: '#475569',
  slate700: '#334155',
  slate800: '#1E293B',
  slate900: '#0F172A',

  indigo50: '#EEF2FF',
  indigo100: '#E0E7FF',
  indigo200: '#C7D2FE',
  indigo500: '#6366F1',
  indigo600: '#4F46E5',
  indigo700: '#4338CA',
  indigo800: '#3730A3',

  emerald50: '#ECFDF5',
  emerald100: '#D1FAE5',
  emerald200: '#A7F3D0',
  emerald500: '#10B981',
  emerald600: '#059669',
  emerald700: '#047857',

  rose50: '#FFF1F2',
  rose100: '#FFE4E6',
  rose200: '#FECDD3',
  rose500: '#F43F5E',
  rose600: '#E11D48',
  rose700: '#BE123C',

  amber50: '#FFFBEB',
  amber100: '#FEF3C7',
  amber200: '#FDE68A',
  amber500: '#F59E0B',
  amber700: '#B45309',
  amber800: '#92400E',

  purple50: '#FAF5FF',
  purple100: '#F3E8FF',
  purple200: '#E9D5FF',
  purple600: '#9333EA',
  purple700: '#7E22CE',

  blue50: '#EFF6FF',
  blue200: '#BFDBFE',
  blue700: '#1D4ED8',
} as const;

/** Semantic roles — screens should reach for these, not raw palette entries. */
export const colors = {
  /** App background: the web's `bg-slate-50/50` over white. */
  background: palette.slate50,
  surface: palette.white,
  /** Inset panels: the web's `bg-slate-50` blocks inside white cards. */
  surfaceMuted: palette.slate50,
  border: palette.slate100,
  borderStrong: palette.slate200,

  textPrimary: palette.slate800,
  textHeading: palette.slate900,
  textBody: palette.slate600,
  textMuted: palette.slate400,
  textFaint: palette.slate500,

  primary: palette.indigo600,
  primaryPressed: palette.indigo700,
  primarySoft: palette.indigo50,
  primarySoftBorder: palette.indigo100,
  primaryText: palette.indigo600,

  success: palette.emerald500,
  successStrong: palette.emerald600,
  successSoft: palette.emerald50,
  successSoftBorder: palette.emerald100,
  successText: palette.emerald700,

  danger: palette.rose500,
  dangerStrong: palette.rose600,
  dangerSoft: palette.rose50,
  dangerSoftBorder: palette.rose100,
  dangerText: palette.rose700,

  warning: palette.amber500,
  warningSoft: palette.amber50,
  warningSoftBorder: palette.amber100,
  warningText: palette.amber800,
} as const;

/** Per-exam accents, matching src/lib/examTheme.ts's color keys on the web. */
export interface ExamAccent {
  solid: string;
  solidPressed: string;
  soft: string;
  softBorder: string;
  softText: string;
}

export const examAccents: Record<string, ExamAccent> = {
  purple: {
    solid: palette.purple600,
    solidPressed: palette.purple700,
    soft: palette.purple50,
    softBorder: palette.purple200,
    softText: palette.purple700,
  },
  amber: {
    solid: palette.amber500,
    solidPressed: palette.amber700,
    soft: palette.amber50,
    softBorder: palette.amber200,
    softText: palette.amber800,
  },
  indigo: {
    solid: palette.indigo600,
    solidPressed: palette.indigo700,
    soft: palette.indigo50,
    softBorder: palette.indigo200,
    softText: palette.indigo700,
  },
  emerald: {
    solid: palette.emerald600,
    solidPressed: palette.emerald700,
    soft: palette.emerald50,
    softBorder: palette.emerald200,
    softText: palette.emerald700,
  },
};

export function getExamAccent(colorKey: string | undefined): ExamAccent {
  return examAccents[colorKey || 'indigo'] || examAccents.indigo;
}

/** `rounded-lg` / `-xl` / `-2xl` / `-3xl` as the web uses them. */
export const radius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  full: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
} as const;

/**
 * The web's type ramp. RN has no rem, so these are the px values the browser
 * resolves Tailwind's text-[10px] … text-3xl to.
 */
export const fontSize = {
  '2xs': 10,
  xs: 11,
  sm: 12,
  base: 13,
  md: 14,
  lg: 16,
  xl: 18,
  '2xl': 22,
  '3xl': 28,
} as const;

export const fontWeight = {
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
} as const;

/**
 * The web's `shadow-xs` / `shadow-sm` on cards. Kept deliberately faint —
 * the design leans on hairline borders, not elevation.
 */
export const shadow = {
  card: {
    shadowColor: palette.slate900,
    shadowOpacity: 0.04,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  raised: {
    shadowColor: palette.slate900,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
} as const;

/** Minimum comfortable tap target, matching the web's `min-h-11`. */
export const TAP_TARGET = 44;
