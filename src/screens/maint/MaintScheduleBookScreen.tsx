import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { CalendarMonth, TimeSlots } from '../../components/CalendarMonth';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Tappable } from '../../components/Tappable';
import { Card, Screen, SectionLabel } from '../../components/ui';
import { useActiveVehicle, vehicleTypeOf } from '../../hooks/useActiveVehicle';
import { HomeStackParamList } from '../../navigation/types';
import {
  dealerById,
  MAINT_CATEGORIES,
  MAINT_TIME_SLOTS,
  MaintCategory,
  MaintSubService,
} from '../../services/mock/data';
import { cartTotals, discountedPrice, useAppStore } from '../../store/useAppStore';
import { radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'MaintScheduleBook'>;

/** Wireframe s-maint-schedule-book: 5 service categories + date/time → payment. */
export function MaintScheduleBookScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const cart = useAppStore((s) => s.cart);
  const toggleCartService = useAppStore((s) => s.toggleCartService);
  const setCartSlot = useAppStore((s) => s.setCartSlot);
  const { active } = useActiveVehicle();

  // Auto-pick the brake row that matches the active car's size (KIA Sportage → SUV).
  const recoType = active ? vehicleTypeOf(active.name) : null;

  const dealer = dealerById(cart.dealerId);
  const selectedDay = cart.date ? Number(cart.date.split('-')[2]) : null;
  // Every category starts collapsed.
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    navigation.setOptions({ title: dealer.name });
  }, [navigation, dealer.name]);

  // Pre-select the services that apply to the registered car (once). Today that's
  // the brake job sized to the car's type (e.g. KIA Sportage → SUV).
  const didPreselect = useRef(false);
  useEffect(() => {
    // Don't auto-add the brake reco when a bundle/deal seeded the cart — that
    // would inflate the claimed (discounted) price.
    if (didPreselect.current || !recoType || cart.promo) return;
    didPreselect.current = true;
    const brakes = MAINT_CATEGORIES.find((c) => c.id === 'brakes');
    const reco = brakes?.services.find((s) => s.vehicleType === recoType);
    if (reco && !cart.services.some((s) => s.id === reco.id)) {
      toggleCartService({
        id: reco.id,
        name: `Brakes — ${reco.name}`,
        price: reco.price,
        durationMin: reco.durationMin,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recoType]);

  const { total, totalMin, savings } = cartTotals(cart);
  const count = cart.services.length;
  const canContinue = count > 0 && !!cart.date && !!cart.time;

  // Claimed-deal discount for a category (0 when none).
  const pctFor = (categoryId: string) => cart.promo?.discounts[categoryId] ?? 0;

  const inCart = (id: string) => cart.services.some((s) => s.id === id);
  const toggle = (cat: MaintCategory, sub: MaintSubService) => {
    const pct = pctFor(cat.id);
    toggleCartService({
      id: sub.id,
      name: `${cat.name} — ${sub.name}`,
      price: discountedPrice(sub.price, pct),
      originalPrice: pct ? sub.price : undefined,
      durationMin: sub.durationMin,
    });
  };

  const toggleExpand = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const renderSub = (cat: MaintCategory, sub: MaintSubService) => {
    const selected = inCart(sub.id);
    const recommended = cat.byVehicleType && sub.vehicleType === recoType;
    const pct = pctFor(cat.id);
    const now = discountedPrice(sub.price, pct);
    return (
      <Tappable
        key={sub.id}
        onPress={() => toggle(cat, sub)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          paddingVertical: 10,
          paddingHorizontal: spacing.md,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.divider,
          backgroundColor: selected ? colors.primarySurface : 'transparent',
        }}
      >
        <View
          style={{
            width: 20,
            height: 20,
            borderRadius: 6,
            borderWidth: 1.5,
            borderColor: selected ? colors.primary : colors.border,
            backgroundColor: selected ? colors.primary : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {selected ? <Text style={{ color: '#fff', fontSize: 12 }}>✓</Text> : null}
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary }}>{sub.name}</Text>
            {recommended ? (
              <View style={{ backgroundColor: colors.successSurface, borderRadius: radii.pill, paddingHorizontal: 7, paddingVertical: 1 }}>
                <Text style={{ fontSize: 9, fontWeight: '800', color: colors.successDeep }}>★ RECOMMENDED</Text>
              </View>
            ) : null}
            {pct ? (
              <View style={{ backgroundColor: colors.success, borderRadius: radii.pill, paddingHorizontal: 7, paddingVertical: 1 }}>
                <Text style={{ fontSize: 9, fontWeight: '800', color: '#fff' }}>{pct}% OFF</Text>
              </View>
            ) : null}
          </View>
          <Text style={{ fontSize: 11, color: colors.textTertiary }}>~{sub.durationMin} min</Text>
        </View>
        {pct ? (
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 11, color: colors.textTertiary, textDecorationLine: 'line-through' }}>${sub.price}</Text>
            <Text style={{ fontSize: 14, fontWeight: '800', color: colors.successDeep }}>${now}</Text>
          </View>
        ) : (
          <Text style={{ fontSize: 14, fontWeight: '800', color: colors.textPrimary }}>${sub.price}</Text>
        )}
      </Tappable>
    );
  };

  return (
    <Screen>
      <SectionLabel>
        Maintenance services <Text style={{ textTransform: 'none' }}>(choose one or more)</Text>
      </SectionLabel>

      {/* Claimed bundle/discount → the discount applies to the matching services. */}
      {cart.promo ? (
        <View
          style={{
            backgroundColor: colors.successSurface,
            borderRadius: radii.sm,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.success,
            padding: spacing.sm,
            marginBottom: spacing.sm,
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: '800', color: colors.successDeep, marginBottom: 2 }}>
            🎉 {cart.promo.label} applied
          </Text>
          <Text style={{ fontSize: 11, color: colors.successDark }}>
            {Object.entries(cart.promo.discounts)
              .map(([cid, pct]) => `${MAINT_CATEGORIES.find((c) => c.id === cid)?.name ?? cid} ${pct}% off`)
              .join(' · ')}
          </Text>
        </View>
      ) : null}

      {recoType ? (
        <View
          style={{
            flexDirection: 'row',
            gap: spacing.sm,
            backgroundColor: colors.primarySurface,
            borderRadius: radii.sm,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.primaryLight,
            padding: spacing.sm,
            marginBottom: spacing.sm,
          }}
        >
          <Text style={{ fontSize: 14 }}>ℹ️</Text>
          <Text style={{ flex: 1, fontSize: 12, color: colors.primaryDeep, lineHeight: 17 }}>
            Some services are pre-selected for your{' '}
            <Text style={{ fontWeight: '800' }}>{active?.name ?? 'car'}</Text> — expand a category to
            review or change them.
          </Text>
        </View>
      ) : null}

      {MAINT_CATEGORIES.map((cat) => {
        const open = expanded.has(cat.id);
        const selectedCount = cat.services.filter((s) => inCart(s.id)).length;
        // Show the recommended option first for the by-vehicle category.
        const subs = cat.byVehicleType && recoType
          ? [...cat.services].sort((a, b) => (b.vehicleType === recoType ? 1 : 0) - (a.vehicleType === recoType ? 1 : 0))
          : cat.services;
        return (
          <Card key={cat.id} style={{ overflow: 'hidden', marginBottom: spacing.sm, padding: 0 }}>
            <Tappable
              onPress={() => toggleExpand(cat.id)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md }}
            >
              <Text style={{ fontSize: 20 }}>{cat.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textPrimary }}>{cat.name}</Text>
                <Text style={{ fontSize: 11, color: colors.textTertiary }}>
                  {cat.blurb}
                  {cat.byVehicleType && recoType ? ` · for your ${recoType}` : ''}
                </Text>
              </View>
              {selectedCount > 0 ? (
                <View style={{ backgroundColor: colors.primary, borderRadius: radii.pill, paddingHorizontal: 8, paddingVertical: 2 }}>
                  <Text style={{ fontSize: 11, fontWeight: '800', color: colors.onPrimary }}>{selectedCount}</Text>
                </View>
              ) : null}
              <Text style={{ fontSize: 16, color: colors.textTertiary }}>{open ? '⌃' : '⌄'}</Text>
            </Tappable>
            {open ? subs.map((sub) => renderSub(cat, sub)) : null}
          </Card>
        );
      })}

      {/* Price breakdown of selected services */}
      <View
        style={{
          backgroundColor: colors.primarySurface,
          borderRadius: radii.sm,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.primaryLight,
          padding: spacing.md,
          marginTop: spacing.sm,
          marginBottom: spacing.md,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: count ? spacing.sm : 0 }}>
          <Text style={{ fontSize: 13, fontWeight: '800', color: colors.primaryDeep }}>
            {count} service{count !== 1 ? 's' : ''} selected
          </Text>
          <Text style={{ fontSize: 12, color: colors.primaryDark }}>~{totalMin} min</Text>
        </View>

        {cart.services.map((s) => (
          <View key={s.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 3 }}>
            <Text style={{ flex: 1, fontSize: 12, color: colors.textSecondary }} numberOfLines={1}>
              {s.name}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              {s.originalPrice && s.originalPrice !== s.price ? (
                <Text style={{ fontSize: 11, color: colors.textTertiary, textDecorationLine: 'line-through' }}>
                  ${s.originalPrice}
                </Text>
              ) : null}
              <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textPrimary }}>${s.price}</Text>
            </View>
          </View>
        ))}

        {savings > 0 ? (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.primaryLight }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: colors.successDeep }}>Bundle savings</Text>
            <Text style={{ fontSize: 13, fontWeight: '800', color: colors.successDeep }}>− ${savings}</Text>
          </View>
        ) : null}

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: spacing.sm,
            paddingTop: spacing.sm,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: colors.primaryLight,
          }}
        >
          <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase', color: colors.primaryDark }}>
            Total
          </Text>
          <Text style={{ fontSize: 24, fontWeight: '800', color: colors.textPrimary }}>${total}</Text>
        </View>
      </View>

      <SectionLabel>Select date & time</SectionLabel>
      <View style={{ marginBottom: spacing.sm }}>
        <CalendarMonth
          selectedDay={selectedDay}
          onSelectDay={(day) =>
            setCartSlot(`2027-04-${String(day).padStart(2, '0')}`, cart.time ?? '8:00 AM')
          }
        />
      </View>
      <View style={{ marginBottom: spacing.lg }}>
        <TimeSlots
          slots={MAINT_TIME_SLOTS}
          selected={cart.time}
          onSelect={(time) => setCartSlot(cart.date ?? '2027-04-07', time)}
        />
      </View>

      <PrimaryButton
        label="Continue to booking →"
        disabled={!canContinue}
        onPress={() =>
          navigation.navigate('BookAgreement', {
            kind: 'maintenance',
            dealerId: cart.dealerId ?? undefined,
            next: 'MaintScheduleConfirm',
          })
        }
      />
    </Screen>
  );
}
