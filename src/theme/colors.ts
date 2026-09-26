export const colors = {
  // Honey core
  gold: '#F1C40F',
  goldBright: '#FFD700',
  honey: '#E8A317',
  honeyDark: '#C6860A',
  honeyDeep: '#9C6400',
  honeyLight: '#FFE08A',
  sunny: '#FFF3B0',

  // Backgrounds
  cream: '#FFFDD0',
  creamSoft: '#FFF8E7',
  offWhite: '#FDFDFD',
  white: '#FFFFFF',
  skyTop: '#FFF6D5',
  skyBottom: '#FFE9A8',
  sky: '#CDEBFF',
  skyDeep: '#8FD3F4',
  skyNight: '#5FB8E6',

  // Playful accents (garden palette)
  leaf: '#8FD16F',
  leafDark: '#4F9D3F',
  leafLight: '#D9F2C7',
  coral: '#FF8A65',
  coralDark: '#E0623C',
  coralLight: '#FFD5C4',
  berry: '#C77DBA',
  berryDark: '#9B4F8E',
  berryLight: '#F1D6EE',
  aqua: '#5FD4C7',
  aquaDark: '#2FA396',

  // Text
  text: '#4A3426',
  textMuted: '#7A5C45',
  brown: '#6B4423',
  chocolate: '#3E2A1A',

  // Hive
  hive: '#D4A017',
  hiveDark: '#A67C00',

  // Feedback
  softRed: '#E57373',
  softRedOutline: '#EF9A9A',
  successGlow: '#FFE566',

  // Bee
  beeBody: '#2C2C2C',
  beeStripe: '#F1C40F',
  cheek: '#FFB4A2',
  wing: 'rgba(255, 255, 255, 0.78)',
  wingEdge: '#BFE6F7',

  shadow: 'rgba(107, 68, 35, 0.18)',
} as const;

export type ColorKey = keyof typeof colors;

/** Solid "toy block" bottom edge + soft drop shadow used across kid UI. */
export const toyShadow = {
  shadowColor: colors.honeyDeep,
  shadowOpacity: 0.16,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 6 },
  elevation: 4,
} as const;
