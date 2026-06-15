import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { CalendarMonth, TimeSlots } from '../../components/CalendarMonth';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ServiceSelectRow } from '../../components/ServiceSelectRow';
import { Card, Screen, SectionLabel } from '../../components/ui';
import { HomeStackParamList } from '../../navigation/types';
import {
  BOOKABLE_SERVICES,
  dealerById,
  MAINT_TIME_SLOTS,
} from '../../services/mock/data';
import { cartTotals, useAppStore } from '../../store/useAppStore';
import { radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'MaintScheduleBook'>;

/** Wireframe s-maint-schedule-book: multi-service select + date/time → payment. */
export function MaintScheduleBookScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const cart = useAppStore((s) => s.cart);
  const toggleCartService = useAppStore((s) => s.toggleCartService);
  const setCartSlot = useAppStore((s) => s.setCartSlot);

  // Cart defaults (oil change · Apr 7 · 8:00 AM) are seeded by startBooking()
  // at every entry point (MaintSchedule dealer cards, BundleDeals claims).
  const dealer = dealerById(cart.dealerId);
  const selectedDay = cart.date ? Number(cart.date.split('-')[2]) : null;

  useEffect(() => {
    navigation.setOptions({ title: dealer.name });
  }, [navigation, dealer.name]);

  const { total, totalMin } = cartTotals(cart);
  const count = cart.services.length;
  const canContinue = count > 0 && !!cart.date && !!cart.time;

  return (
    <Screen>
      <SectionLabel>
        Select services <Text style={{ textTransform: 'none' }}>(choose one or more)</Text>
      </SectionLabel>
      <Card style={{ overflow: 'hidden', marginBottom: spacing.sm }}>
        {BOOKABLE_SERVICES.map((service, i) => (
          <ServiceSelectRow
            key={service.id}
            service={service}
            selected={cart.services.some((s) => s.id === service.id)}
            last={i === BOOKABLE_SERVICES.length - 1}
            onToggle={() =>
              toggleCartService({
                id: service.id,
                name: service.name,
                price: service.price,
                durationMin: service.durationMin,
              })
            }
          />
        ))}
      </Card>

      {/* Running total — explicit, right-aligned emphasized amount (feedback pass 1) */}
      <View
        style={{
          backgroundColor: colors.primarySurface,
          borderRadius: radii.sm,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.primaryLight,
          padding: spacing.sm,
          paddingHorizontal: spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: spacing.sm,
          marginBottom: spacing.md,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <Text style={{ fontSize: 16 }}>💰</Text>
          <View>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.primaryDeep }}>
              {count} service{count !== 1 ? 's' : ''} selected
            </Text>
            <Text style={{ fontSize: 12, color: colors.primaryDark }}>~{totalMin} min</Text>
          </View>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text
            style={{
              fontSize: 11,
              fontWeight: '700',
              letterSpacing: 0.6,
              textTransform: 'uppercase',
              color: colors.primaryDark,
            }}
          >
            Total
          </Text>
          <Text style={{ fontSize: 24, fontWeight: '800', color: colors.textPrimary }}>
            ${total}
          </Text>
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
        label="Continue →"
        disabled={!canContinue}
        onPress={() =>
          navigation.navigate('BookAgreement', {
            kind: 'maintenance',
            dealerId: cart.dealerId ?? undefined,
            next: 'MaintPayment',
          })
        }
      />
    </Screen>
  );
}
