import React, { useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';

import { Glyph, Icon, IconName } from './Icon';
import { Tappable } from './Tappable';

import { REMINDER_OPTIONS, ReminderPref, useAppStore } from '../store/useAppStore';
import { radii, spacing, useTheme } from '../theme';

/**
 * Shared pieces of the two "Booking confirmed" screens (wireframe
 * s-booking-confirm and s-maint-schedule-confirm, one pattern, two routes).
 */

/** Stable confirmation code (e.g. "AM-3F9K2") derived from a booking seed. */
export function confirmationCode(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const base = (h.toString(36).toUpperCase() + '00000').replace(/[^A-Z0-9]/g, '').slice(0, 5);
  return `AM-${base}`;
}

/** Row copy per reminder timing. */
export const REMINDER_COPY: Record<ReminderPref, string> = {
  '1 day before': '1 day before at 9:00 AM',
  '2 days before': '2 days before at 9:00 AM',
  '2 hours before': '2 hours before your appointment',
  'Morning of': 'Morning of at 8:00 AM',
};

/** Card shell shared by the two confirmation pop-ups. */
function PopoverCard({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
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
        {title}
      </Text>
      {children}
    </View>
  );
}

/** Timing picker (1 day / 2 days / 2 hours before / morning of), saved to the store. */
export function ReminderPickerModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { colors } = useTheme();
  const pref = useAppStore((s) => s.reminderPref);
  const setPref = useAppStore((s) => s.setReminderPref);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Tappable
        noFeedback
        onPress={onClose}
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,.45)', justifyContent: 'center', padding: spacing.xl }}
      >
        <PopoverCard title="Remind me">
          {REMINDER_OPTIONS.map((option, i) => {
            const on = option === pref;
            return (
              <Tappable
                key={option}
                onPress={() => {
                  setPref(option);
                  onClose();
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: spacing.md,
                  paddingVertical: 13,
                  backgroundColor: on ? colors.primarySurface : 'transparent',
                  borderBottomWidth: i < REMINDER_OPTIONS.length - 1 ? StyleSheet.hairlineWidth : 0,
                  borderBottomColor: colors.divider,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: on ? '600' : '400', color: on ? colors.primaryDeep : colors.textPrimary }}>
                    {option}
                  </Text>
                  <Text style={{ fontSize: 13, color: colors.textTertiary }}>{REMINDER_COPY[option]}</Text>
                </View>
                {on ? <Icon name="check" size={16} color={colors.primary} strokeWidth={2.4} /> : null}
              </Tappable>
            );
          })}
        </PopoverCard>
      </Tappable>
    </Modal>
  );
}

export interface BringItem {
  icon: string;
  label: string;
}

/** What to bring to the appointment, opened from the confirmation's icon row. */
function BringModal({ visible, items, onClose }: { visible: boolean; items: BringItem[]; onClose: () => void }) {
  const { colors } = useTheme();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Tappable
        noFeedback
        onPress={onClose}
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,.45)', justifyContent: 'center', padding: spacing.xl }}
      >
        <PopoverCard title="What to bring">
          {items.map(({ icon, label }, i) => (
            <View
              key={label}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.sm,
                paddingHorizontal: spacing.md,
                paddingVertical: 13,
                borderBottomWidth: i < items.length - 1 ? StyleSheet.hairlineWidth : 0,
                borderBottomColor: colors.divider,
              }}
            >
              <Glyph glyph={icon} size={20} color={colors.textSecondary} />
              <Text style={{ flex: 1, fontSize: 15, color: colors.textPrimary }}>{label}</Text>
            </View>
          ))}
          <Text style={{ fontSize: 13, color: colors.textTertiary, padding: spacing.md, paddingTop: spacing.sm }}>
            Your confirmation code is on this screen, the shop can look the booking up with it.
          </Text>
        </PopoverCard>
      </Tappable>
    </Modal>
  );
}

/** One square in the confirmation's action row. */
function ActionTile({
  icon,
  label,
  caption,
  onPress,
}: {
  icon: IconName;
  label: string;
  caption?: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Tappable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={{
        flex: 1,
        backgroundColor: colors.surface,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
        borderRadius: radii.md,
        paddingVertical: spacing.sm,
        paddingHorizontal: 4,
        alignItems: 'center',
        gap: 6,
      }}
    >
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: 19,
          backgroundColor: colors.primarySurface,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name={icon} size={20} color={colors.primaryDark} />
      </View>
      <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textPrimary, textAlign: 'center' }} numberOfLines={2}>
        {label}
      </Text>
      {caption ? (
        <Text style={{ fontSize: 10, color: colors.textTertiary, textAlign: 'center' }} numberOfLines={1}>
          {caption}
        </Text>
      ) : null}
    </Tappable>
  );
}

/**
 * The four things a confirmed booking offers, as icons rather than stacked
 * cards: what to bring, the reminder, the calendar export and the map.
 */
export function ConfirmActions({
  bring,
  onAddToCalendar,
  onViewMap,
}: {
  bring: BringItem[];
  onAddToCalendar: () => void;
  onViewMap: () => void;
}) {
  const pref = useAppStore((s) => s.reminderPref);
  const [bringOpen, setBringOpen] = useState(false);
  const [reminderOpen, setReminderOpen] = useState(false);

  return (
    <View style={{ flexDirection: 'row', gap: spacing.sm }}>
      <ActionTile icon="box" label="What to bring" onPress={() => setBringOpen(true)} />
      <ActionTile icon="bell" label="Reminder" caption={pref.replace(' before', '')} onPress={() => setReminderOpen(true)} />
      <ActionTile icon="calendar" label="Add to calendar" onPress={onAddToCalendar} />
      <ActionTile icon="map" label="View on map" onPress={onViewMap} />

      <BringModal visible={bringOpen} items={bring} onClose={() => setBringOpen(false)} />
      <ReminderPickerModal visible={reminderOpen} onClose={() => setReminderOpen(false)} />
    </View>
  );
}
