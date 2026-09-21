import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '../../components/Text';

import { Glyph, Icon, subjectColor } from '../../components/Icon';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Tappable } from '../../components/Tappable';
import { Screen } from '../../components/ui';
import { useActiveVehicle, vehicleTypeOf } from '../../hooks/useActiveVehicle';
import { MaintStackParamList } from '../../navigation/types';
import { MAINT_CATEGORIES, MaintCategory, MaintSubService } from '../../services/mock/data';
import { useAppStore } from '../../store/useAppStore';
import { radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<MaintStackParamList, 'MaintServiceType'>;

/**
 * First step of booking maintenance (dock → Book maintenance): the six
 * service categories as an accordion. Tapping a category expands it to its
 * services (no prices, those vary by shop); tapping a service adds it to
 * "Your services", which builds up live. "Find shops" then lists the partner
 * shops that offer everything chosen, and the shop's screen is date & time.
 */
export function MaintServiceTypeScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const { active } = useActiveVehicle();
  const recoType = active ? vehicleTypeOf(active.name) : null;
  const setServiceTypePick = useAppStore((s) => s.setServiceTypePick);
  const setServiceSubPick = useAppStore((s) => s.setServiceSubPick);

  // Which category is open (one at a time keeps the list short).
  const [open, setOpen] = useState<string | null>(null);
  // Chosen sub-service ids, in the order they were tapped.
  const [picked, setPicked] = useState<string[]>([]);

  const isPicked = (id: string) => picked.includes(id);
  const pick = (cat: MaintCategory, sub: MaintSubService) =>
    setPicked((prev) => {
      if (prev.includes(sub.id)) return prev.filter((id) => id !== sub.id);
      // One-of categories (oil type, brake size) swap the previous choice out.
      const rest = cat.exclusive ? prev.filter((id) => !cat.services.some((s) => s.id === id)) : prev;
      return [...rest, sub.id];
    });
  const removeCategory = (cat: MaintCategory) => setPicked((prev) => prev.filter((id) => !cat.services.some((s) => s.id === id)));

  /** Chosen services grouped by category, in category order. */
  const chosen = useMemo(
    () =>
      MAINT_CATEGORIES.map((cat) => ({ cat, subs: cat.services.filter((s) => picked.includes(s.id)) })).filter((g) => g.subs.length > 0),
    [picked],
  );
  const count = picked.length;
  const totalMin = chosen.reduce((sum, g) => sum + g.subs.reduce((m, s) => m + s.durationMin, 0), 0);

  const onContinue = () => {
    setServiceTypePick(chosen.map((g) => g.cat.id));
    setServiceSubPick(Object.fromEntries(chosen.map((g) => [g.cat.id, g.subs.map((s) => s.id)])));
    navigation.navigate('MaintSchedule');
  };

  const renderService = (cat: MaintCategory, sub: MaintSubService) => {
    const on = isPicked(sub.id);
    const reco = cat.byVehicleType && sub.vehicleType === recoType;
    return (
      <Tappable
        key={sub.id}
        onPress={() => pick(cat, sub)}
        accessibilityRole={cat.exclusive ? 'radio' : 'checkbox'}
        accessibilityState={{ checked: on }}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.md,
          paddingVertical: 12,
          paddingHorizontal: spacing.md,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.divider,
          backgroundColor: on ? colors.primarySurface : 'transparent',
        }}
      >
        <View
          style={{
            width: 22,
            height: 22,
            borderRadius: cat.exclusive ? 11 : 6,
            borderWidth: 1.5,
            borderColor: on ? colors.primary : colors.border,
            backgroundColor: on ? colors.primary : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {on ? <Icon name="check" size={14} color={colors.onPrimary} strokeWidth={2.4} /> : null}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: on ? '700' : '600', color: colors.textPrimary }}>{sub.name}</Text>
          <Text style={{ fontSize: 12, color: colors.textTertiary, marginTop: 1 }}>~{sub.durationMin} min</Text>
        </View>
        {reco ? (
          <View style={{ backgroundColor: colors.successSurface, borderRadius: radii.pill, paddingHorizontal: 8, paddingVertical: 2 }}>
            <Text style={{ fontSize: 10, fontWeight: '800', letterSpacing: 0.4, color: colors.successDeep }}>FOR YOUR CAR</Text>
          </View>
        ) : null}
      </Tappable>
    );
  };

  return (
    <Screen>
      <Text style={{ fontSize: 22, fontWeight: '800', color: colors.textPrimary, marginBottom: 2 }}>What service do you need?</Text>
      <Text style={{ fontSize: 14, color: colors.textTertiary, marginBottom: spacing.lg }}>
        Tap a category to see its services. Prices vary by shop · you&apos;ll see them once you pick one.
      </Text>

      {/* Six categories · an accordion; the open one lists its services. */}
      <View style={{ gap: spacing.sm, marginBottom: spacing.section }}>
        {MAINT_CATEGORIES.map((cat) => {
          const isOpen = open === cat.id;
          const n = cat.services.filter((s) => picked.includes(s.id)).length;
          const has = n > 0;
          // Recommended option first for categories sized to the car.
          const subs = cat.byVehicleType && recoType ? [...cat.services].sort((a, b) => (b.vehicleType === recoType ? 1 : 0) - (a.vehicleType === recoType ? 1 : 0)) : cat.services;
          return (
            <View
              key={cat.id}
              style={{
                backgroundColor: has ? colors.primarySurface : colors.surface,
                borderWidth: has || isOpen ? 1.5 : 1,
                borderColor: has || isOpen ? colors.primary : colors.border,
                borderRadius: radii.lg,
                overflow: 'hidden',
              }}
            >
              <Tappable
                onPress={() => setOpen((cur) => (cur === cat.id ? null : cat.id))}
                accessibilityRole="button"
                accessibilityState={{ expanded: isOpen, selected: has }}
                accessibilityLabel={cat.name}
                style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md }}
              >
                <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: colors.chip, alignItems: 'center', justifyContent: 'center' }}>
                  <Glyph glyph={cat.icon} size={26} color={subjectColor(cat.icon)} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: has ? colors.primaryDeep : colors.textPrimary }}>{cat.name}</Text>
                  <Text style={{ fontSize: 12, color: has ? colors.primaryDark : colors.textTertiary, marginTop: 1 }}>
                    {has ? `${n} selected` : cat.blurb}
                  </Text>
                </View>
                {has ? (
                  <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="check" size={13} color={colors.onPrimary} strokeWidth={2.4} />
                  </View>
                ) : null}
                <View style={{ transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }}>
                  <Icon name="chevron" size={20} color={colors.textTertiary} />
                </View>
              </Tappable>
              {isOpen ? (
                <View style={{ backgroundColor: colors.surface }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase', color: colors.textTertiary, paddingHorizontal: spacing.md, paddingTop: 10, paddingBottom: 6 }}>
                    {cat.exclusive ? 'Choose one' : 'Choose any'}
                  </Text>
                  {subs.map((sub) => renderService(cat, sub))}
                </View>
              ) : null}
            </View>
          );
        })}
      </View>

      {/* Your services · builds up live as services are tapped. */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md }}>
        <Text style={{ fontSize: 12, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase', color: colors.textTertiary }}>Your services</Text>
        {count ? (
          <Text style={{ fontSize: 12, color: colors.textTertiary }}>
            {count} selected · ~{totalMin} min
          </Text>
        ) : null}
      </View>
      <View style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radii.tile, overflow: 'hidden', marginBottom: spacing.lg }}>
        {count === 0 ? (
          <Text style={{ fontSize: 14, color: colors.textTertiary, textAlign: 'center', padding: spacing.lg }}>
            Open a category above and tap a service to add it here.
          </Text>
        ) : (
          chosen.map(({ cat, subs }, i) => (
            <View key={cat.id} style={{ padding: spacing.md, borderTopWidth: i ? 1 : 0, borderTopColor: colors.border }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <Glyph glyph={cat.icon} size={22} color={subjectColor(cat.icon)} />
                <Text style={{ flex: 1, fontSize: 15, fontWeight: '700', color: colors.textPrimary }}>{cat.name}</Text>
                <Tappable onPress={() => removeCategory(cat)} hitSlop={8} accessibilityLabel={`Remove ${cat.name}`}>
                  <Icon name="close" size={16} color={colors.textTertiary} strokeWidth={2.2} />
                </Tappable>
              </View>
              {subs.map((sub) => (
                <View key={sub.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8, marginLeft: 30 }}>
                  <Icon name="check" size={16} color={colors.primary} strokeWidth={2.2} />
                  <Text style={{ flex: 1, fontSize: 14, color: colors.textSecondary }}>{sub.name}</Text>
                  <Text style={{ fontSize: 12, color: colors.textTertiary }}>~{sub.durationMin} min</Text>
                </View>
              ))}
            </View>
          ))
        )}
        {count ? (
          <View style={{ backgroundColor: colors.primarySurface, paddingHorizontal: spacing.md, paddingVertical: 10 }}>
            <Text style={{ fontSize: 12, color: colors.primaryDark }}>Prices vary by shop · shown on the next step</Text>
          </View>
        ) : null}
      </View>

      <PrimaryButton
        label={count > 0 ? `Find shops · ${count} service${count !== 1 ? 's' : ''} →` : 'Select a service'}
        disabled={count === 0}
        onPress={onContinue}
      />
      <Text style={{ fontSize: 12, color: colors.textTertiary, textAlign: 'center', marginTop: spacing.sm }}>Next: pick a shop, then a date & time.</Text>
    </Screen>
  );
}
