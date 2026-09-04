import { TextStyle } from 'react-native';
import { colors } from './colors';

export const fonts = {
  regular: 'Nunito_400Regular',
  semiBold: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
  extraBold: 'Nunito_800ExtraBold',
  black: 'Nunito_900Black',
} as const;

export const typography = {
  brandHero: {
    fontFamily: fonts.black,
    fontSize: 52,
    letterSpacing: 1,
    color: colors.honeyDark,
    textShadowColor: colors.goldBright,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 0,
  } satisfies TextStyle,
  brandSmall: {
    fontFamily: fonts.extraBold,
    fontSize: 22,
    letterSpacing: 0.5,
    color: colors.honeyDark,
  } satisfies TextStyle,
  title: {
    fontFamily: fonts.extraBold,
    fontSize: 28,
    color: colors.text,
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
    fontFamily: fonts.extraBold,
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
} as const;
