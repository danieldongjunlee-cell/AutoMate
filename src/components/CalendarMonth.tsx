import React from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

import { BOOKING_MONTH } from '../services/mock/data';
import { radii, spacing, useTheme } from '../theme';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

/**
 * Static booking month (April 2027 in the wireframe) with selectable days.
 * Becomes a real month navigator when the backend provides availability.
 */
export function CalendarMonth({
  selectedDay,
  onSelectDay,
}: {
  selectedDay: number | null;
  onSelectDay: (day: number) => void;
}) {
  const { colors } = useTheme();
  const { label, daysInMonth, firstWeekday, unavailable } = BOOKING_MONTH;

  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: radii.md,
        padding: spacing.md,
      }}
    >
      {/* Month header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: spacing.md,
        }}
      >
        <Pressable onPress={otherMonths} style={({ pressed }) => navBtn(colors.surfaceAlt, pressed)}>
          <Text style={{ fontSize: 16, color: colors.textTertiary }}>‹</Text>
        </Pressable>
        <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary }}>{label}</Text>
        <Pressable onPress={otherMonths} style={({ pressed }) => navBtn(colors.surfaceAlt, pressed)}>
          <Text style={{ fontSize: 16, color: colors.textTertiary }}>›</Text>
        </Pressable>
      </View>

      {/* Weekday header */}
      <View style={{ flexDirection: 'row', marginBottom: spacing.xs }}>
        {WEEKDAYS.map((d) => (
          <Text
            key={d}
            style={{
              flex: 1,
              textAlign: 'center',
              fontSize: 12,
              fontWeight: '600',
              color: colors.textTertiary,
            }}
          >
            {d}
          </Text>
        ))}
      </View>

      {/* Day grid */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {cells.map((day, i) => {
          if (day === null) return <View key={`b-${i}`} style={{ width: `${100 / 7}%`, height: 40 }} />;
          const disabled = unavailable.includes(day);
          const selected = day === selectedDay;
          return (
            <View
              key={day}
              style={{ width: `${100 / 7}%`, height: 40, alignItems: 'center', justifyContent: 'center' }}
            >
              <Pressable
                disabled={disabled}
                onPress={() => onSelectDay(day)}
                style={({ pressed }) => ({
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: selected ? colors.primary : 'transparent',
                  opacity: pressed ? 0.6 : 1,
                })}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: selected ? '700' : '400',
                    color: selected
                      ? colors.onPrimary
                      : disabled
                        ? colors.disabled
                        : colors.textPrimary,
                  }}
                >
                  {day}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}

/** Month nav: only the demo month has live availability until the backend serves more. */
const otherMonths = () =>
  Alert.alert('April 2027', 'Only April 2027 has open slots in the demo — more months arrive with live dealer availability.');

const navBtn = (bg: string, pressed?: boolean) =>
  ({
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: bg,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: pressed ? 0.6 : 1,
  }) as const;

/** Horizontal time-slot chips (single select). */
export function TimeSlots({
  slots,
  selected,
  onSelect,
}: {
  slots: string[];
  selected: string | null;
  onSelect: (slot: string) => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
      {slots.map((slot) => {
        const on = slot === selected;
        return (
          <Pressable
            key={slot}
            onPress={() => onSelect(slot)}
            style={({ pressed }) => ({
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: radii.sm,
              borderWidth: 1,
              borderColor: on ? colors.primary : colors.border,
              backgroundColor: on ? colors.primarySurface : colors.card,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: on ? '600' : '500',
                color: on ? colors.primaryDeep : colors.textSecondary,
              }}
            >
              {slot}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
