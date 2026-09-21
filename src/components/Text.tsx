import React, { createContext, useContext } from 'react';
import { Text as RNText, TextInput as RNTextInput, TextInputProps, TextProps } from 'react-native';

import { translate } from '../i18n';
import { useAppStore } from '../store/useAppStore';

/**
 * The app's Text and TextInput: React Native's, with every string they show
 * run through the language dictionary (Settings → Language). Screens import
 * these instead of the React Native ones, so a language change reaches every
 * label, heading, button and placeholder without each screen calling t().
 * Dynamic content (names, prices, post bodies) passes through untouched when
 * the dictionary has no entry for it.
 */

const LanguageContext = createContext('English');

/** Publishes the chosen language once, at the root, to every Text below. */
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const language = useAppStore((s) => s.language);
  return <LanguageContext.Provider value={language}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}

/** Translate the string parts of a Text's children, leaving elements alone. */
function localize(node: React.ReactNode, language: string): React.ReactNode {
  if (typeof node === 'string') return translate(node, language);
  if (Array.isArray(node)) return node.map((n) => localize(n, language));
  return node;
}

export type Text = RNText;
export const Text = React.forwardRef<RNText, TextProps>(function Text({ children, ...rest }, ref) {
  const language = useLanguage();
  return (
    <RNText ref={ref} {...rest}>
      {language === 'English' ? children : localize(children, language)}
    </RNText>
  );
});

export type TextInput = RNTextInput;
export const TextInput = React.forwardRef<RNTextInput, TextInputProps>(function TextInput({ placeholder, ...rest }, ref) {
  const language = useLanguage();
  return <RNTextInput ref={ref} {...rest} placeholder={placeholder && language !== 'English' ? translate(placeholder, language) : placeholder} />;
});
