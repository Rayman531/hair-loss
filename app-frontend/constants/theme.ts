/**
 * Follix Design System — Premium, calm, medical-tech aesthetic
 *
 * Color philosophy:
 * - Light mode: Soft neutral backgrounds, muted borders, gentle shadows.
 *   Beige is used ONLY for accents (active states, buttons, highlights).
 *   No pure white backgrounds or pure black text — everything is softened.
 *
 * - Dark mode: Deep neutral charcoal base with layered card surfaces.
 *   Beige accents shift warmer/deeper so they feel natural at night.
 *   No pure black backgrounds or stark white text.
 */

import { Platform } from 'react-native';

// ─── Brand Beige Palette ────────────────────────────────────────

const beige = {
  light: {
    primary: '#C4A882',
    soft: '#D4C4A0',
    muted: '#E8DCC8',
    background: '#FFF8EF',
    surface: '#F5EDDF',
  },
  dark: {
    primary: '#BFA276',
    soft: '#A8916E',
    muted: '#8A7A60',
    background: '#2A2318',
    surface: '#33291E',
  },
};

// ─── Core Color Tokens ──────────────────────────────────────────

export const Colors = {
  light: {
    background: '#F8F8F8',
    backgroundSecondary: '#FFFFFF',
    backgroundTertiary: '#F2F2F2',

    text: '#1C1C1E',
    textSecondary: '#636366',
    textTertiary: '#8E8E93',
    textInverse: '#FFFFFF',

    tint: beige.light.primary,
    accent: beige.light.primary,
    accentSoft: beige.light.soft,
    accentMuted: beige.light.muted,
    accentBackground: beige.light.background,
    accentSurface: beige.light.surface,

    border: '#E5E5E5',
    borderLight: '#EEEEEE',
    divider: '#E8E8E8',

    success: '#3BAF5C',
    successBackground: '#EDF7F0',
    successBorder: '#C8E6CF',
    error: '#D44332',
    errorBackground: '#FDF2F0',
    errorBorder: '#F5D0CB',
    warning: '#E5B94E',
    warningBackground: '#FFF9EC',

    cardBackground: '#FFFFFF',
    cardBorder: '#EBEBEB',

    icon: '#8C8C8C',
    tabIconDefault: '#8C8C8C',
    tabIconSelected: beige.light.primary,

    pressed: 'rgba(196, 168, 130, 0.12)',
    switchTrackOff: '#DDDDDD',
    switchTrackOn: beige.light.primary,

    checkboxBorder: '#C8C8C8',
    checkboxChecked: '#3BAF5C',
    progressBarTrack: '#EBEBEB',
    progressBarFill: '#1C1C1E',
    heatmapEmpty: '#EEEEEE',
    todayBorder: beige.light.primary,
  },
  dark: {
    background: '#121214',
    backgroundSecondary: '#1C1C1E',
    backgroundTertiary: '#262628',

    text: '#E5E5EA',
    textSecondary: '#8E8E93',
    textTertiary: '#636366',
    textInverse: '#121214',

    tint: beige.dark.primary,
    accent: beige.dark.primary,
    accentSoft: beige.dark.soft,
    accentMuted: beige.dark.muted,
    accentBackground: beige.dark.background,
    accentSurface: beige.dark.surface,

    border: '#333336',
    borderLight: '#262628',
    divider: '#2C2C2E',

    success: '#4CAF6A',
    successBackground: '#1E2A1E',
    successBorder: '#2E4A2E',
    error: '#E0574A',
    errorBackground: '#2A1E1E',
    errorBorder: '#4A2E2E',
    warning: '#E5B94E',
    warningBackground: '#2A2518',

    cardBackground: '#1C1C1E',
    cardBorder: '#333336',

    icon: '#7C7C7E',
    tabIconDefault: '#7C7C7E',
    tabIconSelected: beige.dark.primary,

    pressed: 'rgba(191, 162, 118, 0.15)',
    switchTrackOff: '#333336',
    switchTrackOn: beige.dark.primary,

    checkboxBorder: '#48484A',
    checkboxChecked: '#4CAF6A',
    progressBarTrack: '#262628',
    progressBarFill: '#E5E5EA',
    heatmapEmpty: '#262628',
    todayBorder: beige.dark.primary,
  },
};

// ─── Shadow Presets ─────────────────────────────────────────────

export const Shadows = {
  light: {
    card: {
      shadowColor: '#888888',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
  },
  dark: {
    card: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 2,
    },
  },
};

// ─── Heatmap Scale ──────────────────────────────────────────────

export const HeatmapColors = {
  light: [
    '#EEEEEE',
    '#E8DCC8',
    '#D4C4A0',
    '#B8A47A',
    '#1C1C1E',
  ],
  dark: [
    '#262628',
    '#3D362C',
    '#5A4E3E',
    '#8A7A60',
    '#E5E5EA',
  ],
};

// ─── Font System ────────────────────────────────────────────────

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
