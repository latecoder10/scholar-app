/**
 * The web app's visual vocabulary, expressed once for React Native.
 *
 * Every screen used to hand-roll its own StyleSheet, which is how the two
 * clients drifted into different products — dark slate cards and emoji here,
 * light hairline-bordered cards and lucide icons there. These primitives are
 * the mobile equivalent of the utility strings the web repeats
 * (`bg-white border border-slate-100 rounded-2xl p-5 shadow-xs`), so a screen
 * describes intent and the geometry stays consistent.
 */
import React, { type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, type LucideIcon } from 'lucide-react-native';
import { colors, fontSize, palette, radius, shadow, spacing, TAP_TARGET } from '../theme';

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

interface ScreenProps {
  children: ReactNode;
  /** Set false for screens that manage their own scrolling (exam simulator). */
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}

export function Screen({ children, scroll = true, contentStyle }: ScreenProps) {
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      {scroll ? (
        <ScrollView
          contentContainerStyle={[styles.scrollContent, contentStyle]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.flex, contentStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

/**
 * The web's back affordance: a quiet chevron link above the page title, not a
 * heavy nav bar.
 */
export function BackLink({ label = 'Back', onPress }: { label?: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [styles.backLink, pressed && styles.pressedFaint]}
    >
      <ChevronLeft size={16} color={colors.textFaint} />
      <Text style={styles.backLinkText}>{label}</Text>
    </Pressable>
  );
}

interface PageHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  accent?: string;
}

/** Mirrors the web page header: small uppercase eyebrow, bold title, muted sub. */
export function PageHeading({ eyebrow, title, subtitle, icon: Icon, accent }: PageHeadingProps) {
  return (
    <View style={styles.pageHeadingRow}>
      {Icon && (
        <View style={[styles.pageHeadingIcon, accent ? { backgroundColor: accent } : null]}>
          <Icon size={20} color={accent ? palette.white : colors.primary} />
        </View>
      )}
      <View style={styles.flex}>
        {eyebrow && <Text style={styles.eyebrow}>{eyebrow}</Text>}
        <Text style={styles.pageTitle}>{title}</Text>
        {subtitle && <Text style={styles.pageSubtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
}

export function SectionHeading({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[styles.sectionHeading, style]}>{children}</Text>;
}

// ---------------------------------------------------------------------------
// Surfaces
// ---------------------------------------------------------------------------

interface CardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Tinted variant, e.g. the web's `bg-indigo-50/60 border-indigo-100`. */
  tone?: 'default' | 'muted' | 'primary' | 'success' | 'danger' | 'warning';
  padded?: boolean;
}

const CARD_TONES: Record<NonNullable<CardProps['tone']>, ViewStyle> = {
  default: { backgroundColor: colors.surface, borderColor: colors.border },
  muted: { backgroundColor: colors.surfaceMuted, borderColor: colors.border },
  primary: { backgroundColor: colors.primarySoft, borderColor: colors.primarySoftBorder },
  success: { backgroundColor: colors.successSoft, borderColor: colors.successSoftBorder },
  danger: { backgroundColor: colors.dangerSoft, borderColor: colors.dangerSoftBorder },
  warning: { backgroundColor: colors.warningSoft, borderColor: colors.warningSoftBorder },
};

export function Card({ children, style, tone = 'default', padded = true }: CardProps) {
  return (
    <View style={[styles.card, CARD_TONES[tone], padded && styles.cardPadded, style]}>{children}</View>
  );
}

/** A Card that responds to touch — used for the dashboard's launcher rows. */
export function PressableCard({
  children,
  onPress,
  style,
  tone = 'default',
  disabled,
}: CardProps & { onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.card,
        CARD_TONES[tone],
        styles.cardPadded,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'success' | 'danger';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: LucideIcon;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  /** Override the fill for exam-accented actions. */
  accent?: string;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon: Icon,
  disabled,
  loading,
  fullWidth,
  style,
  accent,
}: ButtonProps) {
  const solid = variant === 'primary' || variant === 'success' || variant === 'danger';
  const fill =
    accent ??
    (variant === 'primary'
      ? colors.primary
      : variant === 'success'
        ? colors.successStrong
        : variant === 'danger'
          ? colors.dangerStrong
          : undefined);

  const labelColor = solid
    ? palette.white
    : variant === 'ghost'
      ? colors.textFaint
      : colors.textPrimary;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        solid ? { backgroundColor: fill } : styles.buttonOutline,
        variant === 'ghost' && styles.buttonGhost,
        fullWidth && styles.fullWidth,
        pressed && styles.pressed,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={labelColor} />
      ) : (
        <>
          {Icon && <Icon size={15} color={labelColor} />}
          <Text style={[styles.buttonLabel, { color: labelColor }]}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

interface BadgeProps {
  label: string;
  tone?: 'neutral' | 'primary' | 'success' | 'danger' | 'warning';
  icon?: LucideIcon;
  style?: StyleProp<ViewStyle>;
}

const BADGE_TONES = {
  neutral: { bg: palette.slate50, border: colors.border, text: colors.textFaint },
  primary: { bg: colors.primarySoft, border: colors.primarySoftBorder, text: colors.primaryText },
  success: { bg: colors.successSoft, border: colors.successSoftBorder, text: colors.successText },
  danger: { bg: colors.dangerSoft, border: colors.dangerSoftBorder, text: colors.dangerText },
  warning: { bg: colors.warningSoft, border: colors.warningSoftBorder, text: colors.warningText },
} as const;

export function Badge({ label, tone = 'neutral', icon: Icon, style }: BadgeProps) {
  const t = BADGE_TONES[tone];
  return (
    <View style={[styles.badge, { backgroundColor: t.bg, borderColor: t.border }, style]}>
      {Icon && <Icon size={11} color={t.text} />}
      <Text style={[styles.badgeText, { color: t.text }]}>{label}</Text>
    </View>
  );
}

/** Segmented selector matching the web's exam/paper tab row. */
export function Chip({
  label,
  active,
  onPress,
  accent,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  accent?: string;
}) {
  const fill = accent ?? colors.primary;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        active ? { backgroundColor: fill, borderColor: fill } : null,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

export function ProgressBar({ value, color }: { value: number; color?: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: color || colors.primary }]} />
    </View>
  );
}

/** The dashboard's inset stat block: big number over a small uppercase label. */
export function StatTile({
  value,
  label,
  color,
  style,
}: {
  value: string | number;
  label: string;
  color?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.statTile, style]}>
      <Text style={[styles.statValue, color ? { color } : null]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  message,
}: {
  icon: LucideIcon;
  title: string;
  message: string;
}) {
  return (
    <Card style={styles.emptyState}>
      <Icon size={40} color={palette.slate300} strokeWidth={1.25} />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyMessage}>{message}</Text>
    </Card>
  );
}

// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  flex: { flex: 1 },
  fullWidth: { width: '100%' },
  screen: { flex: 1, backgroundColor: colors.background },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'] + spacing.xl,
    gap: spacing.lg,
  },

  pressed: { opacity: 0.85 },
  pressedFaint: { opacity: 0.6 },
  disabled: { opacity: 0.45 },

  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
  },
  backLinkText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textFaint,
  },

  pageHeadingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  pageHeadingIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  eyebrow: {
    fontSize: fontSize['2xs'],
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginBottom: 2,
  },
  pageTitle: {
    fontSize: fontSize['2xl'],
    fontWeight: '700',
    color: colors.textHeading,
    letterSpacing: -0.3,
  },
  pageSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 17,
  },
  sectionHeading: {
    fontSize: fontSize.base,
    fontWeight: '700',
    color: colors.textPrimary,
  },

  card: {
    borderWidth: 1,
    borderRadius: radius.xl,
    ...shadow.card,
  },
  cardPadded: {
    padding: spacing.lg,
  },

  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: TAP_TARGET,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.lg,
  },
  buttonOutline: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  buttonGhost: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  buttonLabel: {
    fontSize: fontSize.base,
    fontWeight: '600',
  },

  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },

  chip: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    minHeight: 38,
    justifyContent: 'center',
  },
  chipText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textFaint,
  },
  chipTextActive: {
    color: palette.white,
  },

  progressTrack: {
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.full,
  },

  statTile: {
    flex: 1,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.xl,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
  },
  statValue: {
    fontSize: fontSize['3xl'],
    fontWeight: '700',
    color: colors.textHeading,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: fontSize['2xs'],
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },

  emptyState: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing['3xl'],
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  emptyMessage: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
