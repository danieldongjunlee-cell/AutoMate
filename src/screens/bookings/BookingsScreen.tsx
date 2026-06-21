import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { CarSwitchChip } from '../../components/CarSwitchChip';
import { FilterChips } from '../../components/FilterChips';
import { Tappable } from '../../components/Tappable';
import { Badge, Card, Screen, SectionLabel } from '../../components/ui';
import { useActiveVehicle } from '../../hooks/useActiveVehicle';
import { navigateCrossTab } from '../../navigation/crossTab';
import { BookingsStackParamList } from '../../navigation/types';
import { AppBooking, useAppStore } from '../../store/useAppStore';
import { radii, spacing, useTheme } from '../../theme';
import { useT } from '../../i18n';
import { showAlert } from '../../utils/alerts';

type Nav = NativeStackNavigationProp<BookingsStackParamList, 'Bookings'>;

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Status filters for the scheduled-services list. */
const STATUS_FILTERS = ['All', 'Confirmed', 'New time proposed', 'Completed', 'Cancelled'];

/** Wireframe s-bookings: scheduled services + pending quotes (new bottom tab). */
export function BookingsScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const t = useT();
  const { brand } = useActiveVehicle();
  const allBookings = useAppStore((s) => s.bookings);
  const setBookingsViewed = useAppStore((s) => s.setBookingsViewed);
  const markBookingCompleted = useAppStore((s) => s.markBookingCompleted);
  // Opening the Bookings tab clears its badge.
  useEffect(() => setBookingsViewed(true), [setBookingsViewed]);
  // Only the active car's bookings (switching cars shows a different list).
  const bookings = allBookings.filter((b) => b.brand === brand);

  // Status filter for the scheduled-services list.
  const [statusFilter, setStatusFilter] = useState('All');
  const matchesStatus = (b: AppBooking) => {
    switch (statusFilter) {
      case 'Confirmed':
        return b.status === 'confirmed' || b.status === 'paid';
      case 'New time proposed':
        return b.status === 'reschedule_proposed';
      case 'Completed':
        return b.status === 'completed';
      case 'Cancelled':
        return b.status === 'cancelled';
      default:
        return true;
    }
  };
  const visibleBookings = bookings.filter(matchesStatus);

  // Interactive calendar: starts on the real current month, navigable across
  // months and years.
  const today = new Date();
  const [view, setView] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const stepMonth = (delta: number) =>
    setView((v) => {
      const m = v.month + delta;
      return { year: v.year + Math.floor(m / 12), month: ((m % 12) + 12) % 12 };
    });
  const stepYear = (delta: number) => setView((v) => ({ ...v, year: v.year + delta }));

  const openBooking = (b: AppBooking) => {
    if (b.status === 'cancelled') {
      // Shop cancelled → show the reason why.
      showAlert(
        'Booking cancelled by the shop',
        b.reason ?? 'This booking was cancelled by the shop.',
      );
      return;
    }
    if (b.status === 'completed') {
      // Completed → go to the shop's reviews (where the verified review unlocks).
      navigateCrossTab(navigation, 'HomeTab', 'Reviews', { dealerId: b.dealerId });
      return;
    }
    if (b.status === 'reschedule_proposed') {
      // Shop proposed a new time → open reschedule (shows the reason) to accept or pick another.
      navigateCrossTab(navigation, 'HomeTab', 'Reschedule', { kind: b.kind, bookingId: b.id });
      return;
    }
    if (b.kind === 'maintenance') {
      navigateCrossTab(navigation, 'HomeTab', 'MaintScheduleConfirm');
    } else {
      navigateCrossTab(navigation, 'HomeTab', 'BookingConfirm', {
        dealerId: b.dealerId,
        dateLabel: b.dateLabel,
        time: b.time,
        priceLabel: b.priceLabel,
        bookingId: b.id,
      });
    }
  };

  // Repair vs maintenance differentiated by color (no icons).
  const REPAIR = { surface: colors.warningSurface, deep: colors.warningDeep, accent: colors.warning };
  const MAINT = { surface: colors.primarySurface, deep: colors.primaryDeep, accent: colors.primary };
  const kindStyle = (b: AppBooking) => (b.kind === 'repair' ? REPAIR : MAINT);

  // Days with a scheduled booking in the displayed month → mark color by kind.
  const markedDays = new Map<number, string>();
  bookings.forEach((b) => {
    if (b.status === 'cancelled' || b.status === 'completed') return; // only upcoming on the calendar
    if (b.mon !== MONTH_ABBR[view.month]) return; // only the month in view
    const d = parseInt(b.day, 10);
    if (!Number.isNaN(d)) markedDays.set(d, b.kind === 'repair' ? colors.warning : colors.primary);
  });

  // Grid geometry for the displayed month.
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const leadingBlanks = new Date(view.year, view.month, 1).getDay(); // 0=Sun
  const isThisMonth = view.year === today.getFullYear() && view.month === today.getMonth();
  const todayDate = isThisMonth ? today.getDate() : -1;

  const dateBadge = (b: AppBooking) => {
    const k = kindStyle(b);
    return (
      <View
        style={{
          width: 58,
          borderRadius: 9,
          backgroundColor: k.surface,
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 6,
        }}
      >
        <Text style={{ fontSize: 8, fontWeight: '700', color: k.deep, textTransform: 'uppercase' }}>
          {b.mon}
        </Text>
        <Text style={{ fontSize: 17, fontWeight: '800', color: k.deep, lineHeight: 19 }}>{b.day}</Text>
        <View style={{ height: 1, alignSelf: 'stretch', backgroundColor: k.deep, opacity: 0.18, marginVertical: 3 }} />
        <Text style={{ fontSize: 9, fontWeight: '800', color: k.deep }}>{b.time}</Text>
      </View>
    );
  };

  return (
    <Screen safeTop>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: spacing.sm,
          marginBottom: spacing.md,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 20, fontWeight: '800', color: colors.textPrimary }}>{t('Bookings')}</Text>
        </View>
        <Tappable
          onPress={() => navigateCrossTab(navigation, 'HomeTab', 'MaintSchedule')}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            backgroundColor: colors.primary,
            borderRadius: radii.pill,
            paddingHorizontal: 12,
            paddingVertical: 6,
          }}
        >
          <Text style={{ fontSize: 14, color: colors.onPrimary }}>＋</Text>
          <Text style={{ fontSize: 13, fontWeight: '700', color: colors.onPrimary }}>Book</Text>
        </Tappable>
        <CarSwitchChip />
      </View>

      <View>
        <SectionLabel>{t('Calendar')}</SectionLabel>
      </View>
      <Card style={{ padding: spacing.md, marginBottom: spacing.md }}>
        {/* Month/year nav: «=year ‹=month  title  ›=month »=year */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
          <CalNav label="«" onPress={() => stepYear(-1)} />
          <CalNav label="‹" onPress={() => stepMonth(-1)} />
          <Tappable
            onPress={() => setView({ year: today.getFullYear(), month: today.getMonth() })}
            style={{ flex: 1, alignItems: 'center' }}
          >
            <Text style={{ fontSize: 14, fontWeight: '800', color: colors.textPrimary }}>
              {MONTH_NAMES[view.month]} {view.year}
            </Text>
          </Tappable>
          <CalNav label="›" onPress={() => stepMonth(1)} />
          <CalNav label="»" onPress={() => stepYear(1)} />
        </View>
        <View style={{ flexDirection: 'row', marginBottom: 4 }}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <Text
              key={`h${i}`}
              style={{ flex: 1, textAlign: 'center', fontSize: 10, fontWeight: '700', color: colors.textTertiary }}
            >
              {d}
            </Text>
          ))}
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {Array.from({ length: leadingBlanks }, (_, i) => (
            <View key={`b${i}`} style={{ width: `${100 / 7}%`, paddingVertical: 3 }} />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
            const mark = markedDays.get(day);
            const isToday = day === todayDate;
            return (
              <View
                key={`d${day}`}
                style={{ width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 3 }}
              >
                <View
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 13,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: mark ?? 'transparent',
                    borderWidth: isToday && !mark ? 1.5 : 0,
                    borderColor: colors.primary,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: mark || isToday ? '800' : '500',
                      color: mark ? colors.onPrimary : isToday ? colors.primary : colors.textSecondary,
                    }}
                  >
                    {day}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
        <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: colors.warning }} />
            <Text style={{ fontSize: 11, color: colors.textTertiary }}>{t('Repair')}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: colors.primary }} />
            <Text style={{ fontSize: 11, color: colors.textTertiary }}>{t('Maintenance')}</Text>
          </View>
        </View>
      </Card>

      <SectionLabel>{t('Scheduled services')}</SectionLabel>
      <FilterChips options={STATUS_FILTERS} selected={statusFilter} onSelect={setStatusFilter} />
      <View style={{ marginTop: spacing.sm }} />
      {bookings.length === 0 ? (
        <Card style={{ padding: spacing.xl, alignItems: 'center', marginBottom: spacing.md }}>
          <Text style={{ fontSize: 28, marginBottom: 6 }}>📅</Text>
          <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary }}>
            {t('No bookings yet')}
          </Text>
          <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2, textAlign: 'center' }}>
            Book a repair or schedule a service and it will show up here.
          </Text>
        </Card>
      ) : visibleBookings.length === 0 ? (
        <Text style={{ fontSize: 13, color: colors.textTertiary, textAlign: 'center', paddingVertical: spacing.lg }}>
          No {statusFilter.toLowerCase()} bookings.
        </Text>
      ) : (
        visibleBookings.map((b) => {
          const completed = b.status === 'completed';
          const cancelled = b.status === 'cancelled';
          // Only confirmed bookings can be marked completed (not paid/proposed).
          const canComplete = b.status === 'confirmed';
          // Completed → greyed out; cancelled → light-red box.
          const accent = completed ? colors.disabled : cancelled ? colors.danger : kindStyle(b).accent;
          const boxBg = completed ? colors.surfaceAlt : cancelled ? colors.dangerSurface : colors.surface;
          const boxBorder = cancelled ? colors.dangerBorder : colors.border;
          const titleColor = completed ? colors.textTertiary : colors.textPrimary;
          const hasAction = completed || canComplete;
          return (
            // Card + its action read as one connected unit (rounded, clipped).
            <View
              key={b.id}
              style={{
                marginBottom: spacing.sm,
                backgroundColor: boxBg,
                borderColor: boxBorder,
                borderWidth: 1,
                borderLeftWidth: 4,
                borderLeftColor: accent,
                borderRadius: radii.md,
                overflow: 'hidden',
              }}
            >
              <Tappable
                onPress={() => openBooking(b)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm }}
              >
                {dateBadge(b)}
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: titleColor }}>
                    {b.title}
                  </Text>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: completed ? colors.textTertiary : kindStyle(b).accent, textTransform: 'uppercase', letterSpacing: 0.4, marginTop: 2 }}>
                    {b.kind === 'repair' ? 'Repair' : 'Maintenance'}
                  </Text>
                  {(b.status === 'reschedule_proposed' || cancelled) && b.reason ? (
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: '700',
                        color: cancelled ? colors.danger : colors.warningDeep,
                        marginTop: 2,
                      }}
                    >
                      ⓘ Tap to see why
                    </Text>
                  ) : null}
                </View>
                <View style={{ alignItems: 'flex-end', gap: 3 }}>
                  <Text style={{ fontSize: 14, fontWeight: '800', color: titleColor }}>
                    {b.priceLabel}
                  </Text>
                  {b.status === 'reschedule_proposed' ? (
                    <Badge label="New time proposed" variant="warning" />
                  ) : cancelled ? (
                    <Badge label="Cancelled" variant="danger" />
                  ) : completed ? (
                    <Badge label="Completed" variant="neutral" />
                  ) : (
                    <Badge
                      label={b.status === 'paid' ? 'Paid' : 'Confirmed'}
                      variant={b.status === 'paid' ? 'success' : 'primarySoft'}
                    />
                  )}
                </View>
              </Tappable>

              {/* Attached action bar: confirmed → mark completed; completed → review. */}
              {hasAction ? (
                <Tappable
                  onPress={() =>
                    completed
                      ? navigateCrossTab(navigation, 'HomeTab', 'WriteReview', { dealerId: b.dealerId })
                      : markBookingCompleted(b.id)
                  }
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    paddingVertical: 10,
                    borderTopWidth: StyleSheet.hairlineWidth,
                    borderTopColor: colors.border,
                    backgroundColor: completed ? colors.primarySurface : colors.surfaceAlt,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '700',
                      color: completed ? colors.primary : colors.textSecondary,
                    }}
                  >
                    {completed ? '★ Leave a review' : '✓ Mark service completed'}
                  </Text>
                  <Text style={{ fontSize: 13, color: completed ? colors.primary : colors.textTertiary }}>›</Text>
                </Tappable>
              ) : null}
            </View>
          );
        })
      )}
    </Screen>
  );
}

/** Small round month/year nav button for the bookings calendar. */
function CalNav({ label, onPress }: { label: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Tappable
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => ({
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surfaceAlt,
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <Text style={{ fontSize: 16, fontWeight: '800', color: colors.textSecondary }}>{label}</Text>
    </Tappable>
  );
}
