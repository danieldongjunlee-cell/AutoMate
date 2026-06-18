import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';

import { DealerCard } from '../../components/DealerCard';
import { FilterChips } from '../../components/FilterChips';
import { Tappable } from '../../components/Tappable';
import { Screen, SectionLabel } from '../../components/ui';
import { MaintStackParamList } from '../../navigation/types';
import {
  DEALER_SERVICE_CHIPS,
  DEALERS,
  SCHEDULE_SERVICE_FILTERS,
  SERVICE_AREAS,
  SERVICE_FILTER_KEY,
} from '../../services/mock/data';
import { useAppStore } from '../../store/useAppStore';
import { radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<MaintStackParamList, 'MaintSchedule'>;

/** Wireframe s-maint-schedule: service-type filter + partner dealer cards. */
export function MaintScheduleScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const startBooking = useAppStore((s) => s.startBooking);
  const [filter, setFilter] = useState(SCHEDULE_SERVICE_FILTERS[0]);
  const [location, setLocation] = useState(SERVICE_AREAS[0]);
  const [pickerOpen, setPickerOpen] = useState(false);

  const town = location.split(',')[0].trim();

  // Every partner offers all 5 service types; the filter narrows by type and
  // switching location surfaces the shops in that town first.
  const dealers = DEALERS.filter((d) => {
    const chips = DEALER_SERVICE_CHIPS[d.id];
    if (!chips) return false;
    if (filter === 'All') return true;
    const key = SERVICE_FILTER_KEY[filter] ?? filter;
    return chips.some((c) => c.startsWith(key));
  }).sort((a, b) => {
    const am = a.address.includes(town) ? 0 : 1;
    const bm = b.address.includes(town) ? 0 : 1;
    return am - bm || a.distanceMi - b.distanceMi;
  });

  return (
    <Screen>
      <FilterChips options={SCHEDULE_SERVICE_FILTERS} selected={filter} onSelect={setFilter} />
      <View
        style={{
          marginTop: spacing.xs,
          flexDirection: 'row',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <SectionLabel style={{ marginBottom: 0 }}>Partner dealerships near </SectionLabel>
        <Tappable
          onPress={() => setPickerOpen(true)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 3,
            backgroundColor: colors.primarySurface,
            borderRadius: radii.pill,
            paddingHorizontal: 10,
            paddingVertical: 3,
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: '700', color: colors.primaryDark }}>
            📍 {location}
          </Text>
          <Text style={{ fontSize: 11, color: colors.primaryDark }}>▾</Text>
        </Tappable>
      </View>

      <View style={{ marginTop: spacing.sm }} />
      {dealers.map((dealer) => (
        <DealerCard
          key={dealer.id}
          dealer={dealer}
          serviceChips={DEALER_SERVICE_CHIPS[dealer.id]}
          onPress={() => {
            startBooking(dealer.id);
            navigation.navigate('MaintScheduleBook');
          }}
        />
      ))}

      {/* Location picker */}
      <Modal
        visible={pickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerOpen(false)}
      >
        <Tappable
          noFeedback
          onPress={() => setPickerOpen(false)}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,.45)', justifyContent: 'center', padding: spacing.xl }}
        >
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: radii.md,
              overflow: 'hidden',
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: colors.border,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: '700',
                letterSpacing: 0.6,
                textTransform: 'uppercase',
                color: colors.textTertiary,
                paddingHorizontal: spacing.md,
                paddingTop: spacing.md,
                paddingBottom: spacing.xs,
              }}
            >
              Choose a service area
            </Text>
            {SERVICE_AREAS.map((area, i) => {
              const on = area === location;
              return (
                <Tappable
                  key={area}
                  onPress={() => {
                    setLocation(area);
                    setPickerOpen(false);
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: spacing.md,
                    paddingVertical: 13,
                    backgroundColor: on ? colors.primarySurface : 'transparent',
                    borderBottomWidth: i < SERVICE_AREAS.length - 1 ? StyleSheet.hairlineWidth : 0,
                    borderBottomColor: colors.divider,
                  }}
                >
                  <Text
                    style={{
                      flex: 1,
                      fontSize: 15,
                      fontWeight: on ? '600' : '400',
                      color: on ? colors.primaryDeep : colors.textPrimary,
                    }}
                  >
                    📍 {area}
                  </Text>
                  {on ? <Text style={{ fontSize: 16, color: colors.primary }}>✔</Text> : null}
                </Tappable>
              );
            })}
          </View>
        </Tappable>
      </Modal>
    </Screen>
  );
}
