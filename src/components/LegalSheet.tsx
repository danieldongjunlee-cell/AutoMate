import React from 'react';
import { ScrollView, Text, View } from 'react-native';

import { FormSheet } from './FormSheet';
import { PRIVACY_SECTIONS, TERMS_SECTIONS } from '../services/mock/data';
import { spacing, useTheme } from '../theme';

export type LegalKind = 'terms' | 'privacy' | null;

/**
 * Terms of Service / Privacy Policy reader, shown as a modal sheet. Reuses the
 * same section content as the in-profile legal screens so the auth screens can
 * surface the full, scrollable document (not just a one-line alert).
 */
export function LegalSheet({ kind, onClose }: { kind: LegalKind; onClose: () => void }) {
  const { colors } = useTheme();
  if (!kind) return null;
  const isTerms = kind === 'terms';
  const sections = isTerms ? TERMS_SECTIONS : PRIVACY_SECTIONS;
  return (
    <FormSheet visible onClose={onClose} title={isTerms ? 'Terms of Service' : 'Privacy Policy'}>
      <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
        {sections.map((s) => (
          <View key={s.heading} style={{ marginBottom: spacing.md }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 }}>
              {s.heading}
            </Text>
            <Text style={{ fontSize: 13, lineHeight: 20, color: colors.textSecondary }}>{s.body}</Text>
          </View>
        ))}
      </ScrollView>
    </FormSheet>
  );
}
