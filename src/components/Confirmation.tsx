import React, { useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';

import { Tappable } from './Tappable';

import { REMINDER_OPTIONS, ReminderPref, useAppStore } from '../store/useAppStore';
import { radii, spacing, useTheme } from '../theme';

/**
 * Shared pieces of the two "Booking confirmed" screens (wireframe
 * s-booking-confirm and s-maint-schedule-confirm — one pattern, two routes).
 */

/** ✅ circle + headline + subtitle. */
export function SuccessHeader({ title, subtitle }: { title: string; subtitle: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ alignItems: 'center', paddingVertical: spacing.lg }}>
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: colors.successSurface,
          borderWidth: 2.5,
          borderColor: colors.success,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: spacing.sm,
        }}
      >
        <Text style={{ fontSize: 36 }}>✅</Text>
      </View>
      <Text style={{ fontSize: 24, fontWeight: '700', color: colors.successDeep, marginBottom: 2 }}>
        {title}
      </Text>
      <Text style={{ fontSize: 14, color: colors.textTertiary }}>{subtitle}</Text>
    </View>
  );
}

/** Two-column label/value cell in the booking summary grid. */
export function SummaryCell({
  label,
  value,
  sub,
  subColor,
  emphasizeSub,
}: {
  label: string;
  value: string;
  sub?: string;
  subColor?: string;
  /** Render the sub line larger/bolder than the value (used for the time). */
  emphasizeSub?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View style={{ width: '50%', paddingVertical: spacing.xs }}>
      <Text
        style={{
          fontSize: 12,
          fontWeight: '600',
          color: colors.textTertiary,
          textTransform: 'uppercase',
          marginBottom: 2,
        }}
      >
        {label}
      </Text>
      <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary }}>{value}</Text>
      {sub ? (
        <Text
          style={{
            fontSize: emphasizeSub ? 18 : 13,
            fontWeight: emphasizeSub ? '800' : '400',
            color: subColor ?? colors.textTertiary,
            marginTop: emphasizeSub ? 1 : 0,
          }}
        >
          {sub}
        </Text>
      ) : null}
    </View>
  );
}

/** Stable confirmation code (e.g. "AM-3F9K2") derived from a booking seed. */
export function confirmationCode(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const base = (h.toString(36).toUpperCase() + '00000').replace(/[^A-Z0-9]/g, '').slice(0, 5);
  return `AM-${base}`;
}

/**
 * Confirmation-number card the customer shows the shop at check-in (replaces the
 * old "AutoMate app for check-in QR"). Big, legible code on a tinted card.
 */
export function ConfirmationNumber({ code }: { code: string }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        backgroundColor: colors.primarySurface,
        borderRadius: radii.md,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.primaryLight,
        padding: spacing.md,
        marginBottom: spacing.sm,
        alignItems: 'center',
      }}
    >
      <Text
        style={{
          fontSize: 12,
          fontWeight: '700',
          letterSpacing: 0.6,
          textTransform: 'uppercase',
          color: colors.primaryDark,
          marginBottom: 4,
        }}
      >
        Confirmation number
      </Text>
      <Text style={{ fontSize: 28, fontWeight: '800', letterSpacing: 3, color: colors.primaryDeep }}>
        {code}
      </Text>
      <Text style={{ fontSize: 12, color: colors.textTertiary, marginTop: 4, textAlign: 'center' }}>
        Show this to the shop when you arrive
      </Text>
    </View>
  );
}

/** Row copy per reminder timing (the row updates live as the pref changes). */
export const REMINDER_COPY: Record<ReminderPref, string> = {
  '1 day before': '1 day before at 9:00 AM',
  '2 days before': '2 days before at 9:00 AM',
  '2 hours before': '2 hours before your appointment',
  'Morning of': 'Morning of at 8:00 AM',
};

/**
 * 🔔 tinted reminder row. Edit opens a timing modal (1 day / 2 days /
 * 2 hours before / morning of) saved to the store (user-feedback pass 2).
 */
export function ReminderRow() {
  const { colors } = useTheme();
  const pref = useAppStore((s) => s.reminderPref);
  const setPref = useAppStore((s) => s.setReminderPref);
  const [open, setOpen] = useState(false);

  return (
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
        marginBottom: spacing.sm,
      }}
    >
      <Text style={{ fontSize: 20 }}>🔔</Text>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: '500', color: colors.primaryDeep }}>
          Reminder set
        </Text>
        <Text style={{ fontSize: 13, color: colors.textTertiary }}>{REMINDER_COPY[pref]}</Text>
      </View>
      <Tappable onPress={() => setOpen(true)} hitSlop={6}>
        <Text style={{ fontSize: 14, color: colors.primary }}>Edit</Text>
      </Tappable>

      {/* Timing picker modal */}
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Tappable
          noFeedback
          onPress={() => setOpen(false)}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,.45)',
            justifyContent: 'center',
            padding: spacing.xl,
          }}
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
                fontSize: 13,
                fontWeight: '700',
                letterSpacing: 0.6,
                textTransform: 'uppercase',
                color: colors.textTertiary,
                paddingHorizontal: spacing.md,
                paddingTop: spacing.md,
                paddingBottom: spacing.xs,
              }}
            >
              🔔 Remind me
            </Text>
            {REMINDER_OPTIONS.map((option, i) => {
              const on = option === pref;
              return (
                <Tappable
                  key={option}
                  onPress={() => {
                    setPref(option);
                    setOpen(false);
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: spacing.md,
                    paddingVertical: 13,
                    backgroundColor: on ? colors.primarySurface : 'transparent',
                    borderBottomWidth:
                      i < REMINDER_OPTIONS.length - 1 ? StyleSheet.hairlineWidth : 0,
                    borderBottomColor: colors.divider,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: on ? '600' : '400',
                        color: on ? colors.primaryDeep : colors.textPrimary,
                      }}
                    >
                      {option}
                    </Text>
                    <Text style={{ fontSize: 13, color: colors.textTertiary }}>
                      {REMINDER_COPY[option]}
                    </Text>
                  </View>
                  {on ? <Text style={{ fontSize: 16, color: colors.primary }}>✔</Text> : null}
                </Tappable>
              );
            })}
          </View>
        </Tappable>
      </Modal>
    </View>
  );
}
