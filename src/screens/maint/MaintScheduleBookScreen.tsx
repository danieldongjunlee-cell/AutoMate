import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { CalendarMonth, TimeSlots } from '../../components/CalendarMonth';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ServiceSelectRow } from '../../components/ServiceSelectRow';
import { Card, Screen, SectionLabel } from '../../components/ui';
import { MaintStackParamList } from '../../navigation/types';
import {
  BOOKABLE_SERVICES,
  dealerById,
  MAINT_TIME_SLOTS,
} from '../../services/mock/data';
import { useAppStore } from '../../store/useAppStore';
import { radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<MaintStackParamList, 'MaintScheduleBook'>;

/** Wireframe s-maint-schedule-book: multi-service select + date/time → payment. */
export function MaintScheduleBookScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const cart = useAppStore((s) => s.cart);
  const toggleCartService = useAppStore((s) => s.toggleCartService);
  const setCartSlot = useAppStore((s) => s.setCartSlot);

  const dealer = dealerById(cart.dealerId);
  const selectedDay = cart.date ? Number(cart.date.split('-')[2]) : null;

  useEffect(() => {
    navigation.setOptions({ title: dealer.name });
  }, [navigation, dealer.name]);

  // Wireframe default: oil change pre-selected, Apr 7 · 8:00 AM.
  useEffect(() => {
    const state = useAppStore.getState();
    if (state.cart.services.length === 0) {
      const oil = BOOKABLE_SERVICES[0];
      state.toggleCartService({
        id: oil.id,
        name: oil.name,
        price: oil.price,
        durationMin: oil.durationMin,
      });
    }
    if (!state.cart.date) state.setCartSlot('2027-04-07', '8:00 AM');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const total = cart.services.reduce((sum, s) => sum + s.price, 0);
  const totalMin = cart.services.reduce((sum, s) => sum + s.durationMin, 0);
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

      {/* Running total */}
      <View
        style={{
          backgroundColor: colors.primarySurface,
          borderRadius: radii.sm,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.primaryLight,
          padding: spacing.sm,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          marginBottom: spacing.md,
        }}
      >
        <Text style={{ fontSize: 16 }}>💰</Text>
        <View>
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.primaryDeep }}>
            {count} service{count !== 1 ? 's' : ''} selected
          </Text>
          <Text style={{ fontSize: 12, color: colors.primaryDark }}>
            Total: ${total} · ~{totalMin} min
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
        label="Continue to payment →"
        disabled={!canContinue}
        onPress={() => navigation.navigate('MaintPayment')}
      />
    </Screen>
  );
}
