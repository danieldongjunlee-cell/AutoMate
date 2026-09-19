import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { Glyph, Icon, subjectColor } from '../../components/Icon';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Tappable } from '../../components/Tappable';
import { Screen } from '../../components/ui';
import { useActiveVehicle, vehicleTypeOf } from '../../hooks/useActiveVehicle';
import { MaintStackParamList } from '../../navigation/types';
import { MAINT_CATEGORIES, MaintCategory } from '../../services/mock/data';
import { useAppStore } from '../../store/useAppStore';
import { palette, radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<MaintStackParamList, 'MaintServiceType'>;

/**
 * First step of booking maintenance (dock → Book maintenance): pick the
 * services you need. "Your services" builds up live as you tap — each chosen
 * category shows its options (oil type, rotation vs alignment, …) and the
 * running total — then "Find shops" lists the partner shops that offer all of
 * them, and the shop's screen is only date & time.
 */
export function MaintServiceTypeScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const { active } = useActiveVehicle();
  const recoType = active ? vehicleTypeOf(active.name) : null;
  const setServiceTypePick = useAppStore((s) => s.setServiceTypePick);
  const setServiceSubPick = useAppStore((s) => s.setServiceSubPick);
  // category id → chosen sub-service id, in the order they were picked
  const [picks, setPicks] = useState<{ catId: string; subId: string }[]>([]);

  const defaultSub = (cat: MaintCategory) =>
    (cat.byVehicleType && cat.services.find((s) => s.vehicleType === recoType)) || cat.services[0];

  const toggle = (cat: MaintCategory) =>
    setPicks((prev) => (prev.some((p) => p.catId === cat.id) ? prev.filter((p) => p.catId !== cat.id) : [...prev, { catId: cat.id, subId: defaultSub(cat).id }]));
  const choose = (catId: string, subId: string) => setPicks((prev) => prev.map((p) => (p.catId === catId ? { ...p, subId } : p)));

  const chosen = useMemo(
    () =>
      picks
        .map((p) => {
          const cat = MAINT_CATEGORIES.find((c) => c.id === p.catId);
          const sub = cat?.services.find((s) => s.id === p.subId);
          return cat && sub ? { cat, sub } : null;
        })
        .filter((x): x is { cat: MaintCategory; sub: MaintCategory['services'][number] } => !!x),
    [picks],
  );
  const total = chosen.reduce((sum, c) => sum + c.sub.price, 0);
  const totalMin = chosen.reduce((sum, c) => sum + c.sub.durationMin, 0);
  const count = chosen.length;

  const onContinue = () => {
    setServiceTypePick(chosen.map((c) => c.cat.id));
    setServiceSubPick(Object.fromEntries(chosen.map((c) => [c.cat.id, c.sub.id])));
    navigation.navigate('MaintSchedule');
  };

  return (
    <Screen>
      <Text style={{ fontSize: 22, fontWeight: '800', color: colors.textPrimary, marginBottom: 2 }}>What service do you need?</Text>
      <Text style={{ fontSize: 14, color: colors.textTertiary, marginBottom: spacing.lg }}>
        Select all that apply — we&apos;ll find shops that offer them.
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.section }}>
        {MAINT_CATEGORIES.map((cat) => {
          const on = picks.some((p) => p.catId === cat.id);
          return (
            <Tappable
              key={cat.id}
              onPress={() => toggle(cat)}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
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
                <Glyph glyph={cat.icon} size={30} color={subjectColor(cat.icon)} />
                {on ? (
                  <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="check" size={13} color={colors.onPrimary} strokeWidth={2.4} />
                  </View>
                ) : null}
              </View>
              <Text style={{ fontSize: 15, fontWeight: '800', color: on ? colors.primaryDeep : colors.textPrimary, marginTop: 8 }}>{cat.name}</Text>
              <Text style={{ fontSize: 12, color: on ? colors.primaryDark : colors.textTertiary, marginTop: 1 }}>{cat.blurb}</Text>
            </Tappable>
          );
        })}
      </View>

      {/* Your services — fills in as categories are tapped; each shows its options. */}
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
            Tap a service above to add it here.
          </Text>
        ) : (
          chosen.map(({ cat, sub }, i) => (
            <View key={cat.id} style={{ padding: spacing.md, borderTopWidth: i ? 1 : 0, borderTopColor: colors.border }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
                <Glyph glyph={cat.icon} size={22} color={subjectColor(cat.icon)} />
                <Text style={{ flex: 1, fontSize: 15, fontWeight: '700', color: colors.textPrimary }}>{cat.name}</Text>
                <Text style={{ fontSize: 15, fontWeight: '800', color: colors.textPrimary }}>${sub.price}</Text>
                <Tappable onPress={() => toggle(cat)} hitSlop={8} accessibilityLabel={`Remove ${cat.name}`} style={{ marginLeft: 4 }}>
                  <Icon name="close" size={16} color={colors.textTertiary} strokeWidth={2.2} />
                </Tappable>
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {cat.services.map((opt) => {
                  const on = opt.id === sub.id;
                  const reco = cat.byVehicleType && opt.vehicleType === recoType;
                  return (
                    <Tappable
                      key={opt.id}
                      onPress={() => choose(cat.id, opt.id)}
                      style={{
                        backgroundColor: on ? colors.primary : colors.inputBg,
                        borderWidth: 1,
                        borderColor: on ? colors.primary : colors.border,
                        borderRadius: radii.pill,
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                      }}
                    >
                      <Text style={{ fontSize: 13, fontWeight: on ? '700' : '500', color: on ? '#fff' : colors.textSecondary }}>
                        {opt.name} · ${opt.price}
                        {reco ? ' · for your car' : ''}
                      </Text>
                    </Tappable>
                  );
                })}
              </View>
            </View>
          ))
        )}
        {count ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.primarySurface, paddingHorizontal: spacing.md, paddingVertical: 12 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase', color: colors.primaryDark }}>Total · pay at shop</Text>
            <Text style={{ fontSize: 20, fontWeight: '800', color: colors.textPrimary }}>${total}</Text>
          </View>
        ) : null}
      </View>

      <PrimaryButton
        label={count > 0 ? `Find shops — ${count} service${count !== 1 ? 's' : ''} · $${total} →` : 'Select a service'}
        disabled={count === 0}
        onPress={onContinue}
      />
      <Text style={{ fontSize: 12, color: palette.textTertiary, textAlign: 'center', marginTop: spacing.sm }}>Next: pick a shop, then a date & time.</Text>
    </Screen>
  );
}
