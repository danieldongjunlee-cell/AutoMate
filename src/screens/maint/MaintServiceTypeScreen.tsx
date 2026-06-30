import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Text, View } from 'react-native';

import { PrimaryButton } from '../../components/PrimaryButton';
import { Tappable } from '../../components/Tappable';
import { Screen } from '../../components/ui';
import { MaintStackParamList } from '../../navigation/types';
import { MAINT_CATEGORIES } from '../../services/mock/data';
import { radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<MaintStackParamList, 'MaintServiceType'>;

/**
 * First step of booking a maintenance service: pick one or more service types
 * (big multi-select buttons), then continue to the shop map. Shown for guests
 * and signed-in users alike — guests are only gated when they pick a shop.
 */
export function MaintServiceTypeScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const count = selected.size;

  return (
    <Screen>
      <Text style={{ fontSize: 22, fontWeight: '800', color: colors.textPrimary, marginBottom: 2 }}>
        What service do you need?
      </Text>
      <Text style={{ fontSize: 14, color: colors.textTertiary, marginBottom: spacing.md }}>
        Select all that apply — we&apos;ll find shops that offer them.
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md }}>
        {MAINT_CATEGORIES.map((cat) => {
          const on = selected.has(cat.id);
          return (
            <Tappable
              key={cat.id}
              onPress={() => toggle(cat.id)}
              style={{
                width: '47.5%',
                flexGrow: 1,
                backgroundColor: on ? colors.primarySurface : colors.surface,
                borderWidth: on ? 2 : 1,
                borderColor: on ? colors.primary : colors.border,
                borderRadius: radii.lg,
                padding: spacing.md,
                minHeight: 96,
                justifyContent: 'center',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 30 }}>{cat.icon}</Text>
                {on ? (
                  <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: colors.onPrimary, fontSize: 13, fontWeight: '800' }}>✓</Text>
                  </View>
                ) : null}
              </View>
              <Text style={{ fontSize: 15, fontWeight: '800', color: on ? colors.primaryDeep : colors.textPrimary, marginTop: 8 }}>
                {cat.name}
              </Text>
              <Text style={{ fontSize: 12, color: on ? colors.primaryDark : colors.textTertiary, marginTop: 1 }}>
                {cat.blurb}
              </Text>
            </Tappable>
          );
        })}
      </View>

      <PrimaryButton
        label={count > 0 ? `Find shops — ${count} service${count !== 1 ? 's' : ''} →` : 'Select a service type'}
        disabled={count === 0}
        onPress={() => navigation.navigate('MaintSchedule')}
      />
    </Screen>
  );
}
