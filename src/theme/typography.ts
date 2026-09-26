import { TextStyle } from 'react-native';
import { colors } from './colors';

export const fonts = {
  regular: 'Nunito_400Regular',
  semiBold: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
  extraBold: 'Nunito_800ExtraBold',
  black: 'Nunito_900Black',
  /** Rounded, bubbly display face for headlines and big buttons */
  display: 'Baloo2_800ExtraBold',
  displayBold: 'Baloo2_700Bold',
} as const;

export const typography = {
  brandHero: {
    fontFamily: fonts.display,
    fontSize: 60,
    letterSpacing: 1,
    color: colors.honeyDark,
    textShadowColor: colors.white,
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 0,
  } satisfies TextStyle,
  brandSmall: {
    fontFamily: fonts.display,
    fontSize: 24,
    letterSpacing: 0.5,
    color: colors.honeyDark,
  } satisfies TextStyle,
  title: {
    fontFamily: fonts.display,
    fontSize: 30,
    color: colors.chocolate,
  } satisfies TextStyle,
  subtitle: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textMuted,
  } satisfies TextStyle,
  body: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.text,
  } satisfies TextStyle,
  button: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.white,
  } satisfies TextStyle,
  hexLetter: {
    fontFamily: fonts.extraBold,
    fontSize: 22,
    color: colors.text,
  } satisfies TextStyle,
  label: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.textMuted,
  } satisfies TextStyle,
  /** Small uppercase section header used on cards */
  eyebrow: {
    fontFamily: fonts.extraBold,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.honeyDark,
  } satisfies TextStyle,
} as const;
