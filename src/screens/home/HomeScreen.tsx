import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LogoRow } from '../../components/Logo';
import { Badge, Screen, SectionLabel } from '../../components/ui';
import { navigateCrossTab } from '../../navigation/crossTab';
import { HomeStackParamList } from '../../navigation/types';
import { notificationService, quoteService } from '../../services';
import { useAppStore } from '../../store/useAppStore';
import { palette, radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'Home'>;

const STREAK_DAYS = 5;
const STREAK_TOTAL = 7;

/** One "Scheduled services" row (wireframe v15.10 home: Apr 7 / Apr 12). */
function ScheduledServiceCard({
  month,
  day,
  title,
  sub,
  price,
  status,
  statusVariant,
  onPress,
}: {
  month: string;
  day: string;
  title: string;
  sub: string;
  price: string;
  status: string;
  statusVariant: 'paid' | 'confirmed';
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const paid = statusVariant === 'paid';
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: colors.surface,
        borderRadius: radii.md,
        borderWidth: 0.5,
        borderColor: colors.border,
        padding: spacing.md,
        marginBottom: spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      {/* Calendar tile */}
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: radii.sm,
          backgroundColor: paid ? colors.primarySurface : colors.warningSurface,
          borderWidth: 0.5,
          borderColor: paid ? colors.primaryLight : palette.warningBorder,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            fontSize: 10,
            fontWeight: '700',
            textTransform: 'uppercase',
            color: paid ? colors.primaryDark : palette.warningMid,
          }}
        >
          {month}
        </Text>
        <Text
          style={{
            fontSize: 17,
            fontWeight: '800',
            lineHeight: 19,
            color: paid ? colors.primaryDeep : colors.warningDeep,
          }}
        >
          {day}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: 2 }}>
          {title}
        </Text>
        <Text style={{ fontSize: 12, color: colors.textTertiary }}>{sub}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: '700',
            color: paid ? colors.successDark : colors.textPrimary,
          }}
        >
          {price}
        </Text>
        <View
          style={{
            backgroundColor: paid ? colors.successSurface : colors.warningSurface,
            borderRadius: radii.pill,
            paddingHorizontal: 8,
            paddingVertical: 2,
            marginTop: 3,
          }}
        >
          <Text
            style={{
              fontSize: 11,
              fontWeight: '600',
              color: paid ? colors.successDeep : colors.warningDeep,
            }}
          >
            {status}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const resetDamageFlow = useAppStore((s) => s.resetDamageFlow);

  const { data: request } = useQuery({
    queryKey: ['quoteRequest'],
    queryFn: quoteService.getQuoteRequest,
  });
  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationService.getNotifications,
  });
  const hasUnread = notifications?.some((n) => n.unread) ?? false;

  return (
    <Screen style={{ paddingTop: insets.top + spacing.sm }}>
      {/* Header: logo + notification bell */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: spacing.md,
        }}
      >
        <LogoRow markSize={32} textSize={18} />
        <Pressable
          onPress={() => navigation.navigate('Notifications')}
          style={({ pressed }) => ({
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: colors.primarySurface,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.7 : 1,
          })}
          hitSlop={6}
        >
          <Text style={{ fontSize: 18 }}>🔔</Text>
          {hasUnread ? (
            <View
              style={{
                position: 'absolute',
                top: 2,
                right: 2,
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: colors.danger,
                borderWidth: 1.5,
                borderColor: colors.background,
              }}
            />
          ) : null}
        </Pressable>
      </View>

      {/* Streak banner → How you earn */}
      <Pressable onPress={() => navigateCrossTab(navigation, 'ProfileTab', 'ProfEarn')}>
        <LinearGradient
          colors={[palette.primary, palette.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: radii.sm,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
            marginBottom: spacing.sm,
          }}
        >
          <Text style={{ fontSize: 20 }}>🔥</Text>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 5 }}>
              <Text style={{ fontSize: 13, fontWeight: '500', color: '#fff' }}>
                Day {STREAK_DAYS} streak
              </Text>
              <Text style={{ fontSize: 13, fontWeight: '700', color: palette.warning }}>
                +10 pts
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 4 }}>
              {Array.from({ length: STREAK_TOTAL }).map((_, i) => (
                <View
                  key={i}
                  style={{
                    flex: 1,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: i < STREAK_DAYS ? 'rgba(255,255,255,.85)' : 'rgba(255,255,255,.2)',
                  }}
                />
              ))}
            </View>
          </View>
        </LinearGradient>
      </Pressable>

      {/* Hero: Get a Repair Estimate */}
      <Pressable
        onPress={() => {
          // A new estimate always starts clean (wireframe: "0 selected").
          resetDamageFlow();
          navigation.navigate('CarDiagram');
        }}
      >
        <LinearGradient
          colors={[palette.primary, palette.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: radii.lg,
            paddingVertical: spacing.xxl,
            paddingHorizontal: spacing.lg,
            alignItems: 'center',
            marginBottom: spacing.sm,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              position: 'absolute',
              top: -20,
              right: -20,
              width: 90,
              height: 90,
              borderRadius: 45,
              backgroundColor: 'rgba(255,255,255,.1)',
            }}
          />
          <Text style={{ fontSize: 44, marginBottom: spacing.sm }}>📷</Text>
          <Text style={{ fontSize: 19, fontWeight: '600', color: '#fff', marginBottom: 5 }}>
            Get a Repair Estimate
          </Text>
          <Text style={{ fontSize: 13, color: 'rgba(255,255,255,.78)' }}>
            Take photos · Dealers quote you · Book or call
          </Text>
        </LinearGradient>
      </Pressable>

      {/* Bundle deal teaser */}
      <LinearGradient
        colors={[palette.dark, palette.darkAlt]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: radii.md,
          padding: spacing.md,
          marginBottom: spacing.md,
        }}
      >
        <Badge label="LIMITED" variant="warning" style={{ backgroundColor: palette.warning, marginBottom: 6 }} />
        <Text style={{ fontSize: 15, fontWeight: '500', color: '#fff', marginBottom: spacing.sm }}>
          Honda Fairfax Summer Bundle
        </Text>
        <Pressable
          onPress={() => navigation.navigate('BundleDeals')}
          style={({ pressed }) => ({
            backgroundColor: palette.warning,
            borderRadius: radii.sm,
            paddingHorizontal: spacing.md,
            paddingVertical: 7,
            alignSelf: 'flex-start',
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <Text style={{ fontSize: 13, fontWeight: '600', color: palette.dark }}>
            Claim deal →
          </Text>
        </Pressable>
      </LinearGradient>

      {/* Pending quotes */}
      <SectionLabel>Pending quotes</SectionLabel>
      <Pressable
        onPress={() => navigation.navigate('DealerQuotes')}
        style={({ pressed }) => ({
          backgroundColor: colors.primarySurface,
          borderRadius: radii.sm,
          padding: spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: radii.sm,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 17 }}>🚗</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: '500', color: colors.textPrimary }}>
            {request?.title ?? 'Rear bumper dent'}
          </Text>
          <Text style={{ fontSize: 12, color: colors.primaryDark }}>
            3 of {request?.quotesReceived ?? 8} dealers quoted
          </Text>
        </View>
        <Badge
          label={`${request?.newQuotes ?? 3} new`}
          variant="warning"
          style={{ backgroundColor: palette.warning }}
        />
      </Pressable>

      {/* Scheduled services (wireframe v15.10) */}
      <SectionLabel style={{ marginTop: spacing.lg }}>Scheduled services</SectionLabel>
      <ScheduledServiceCard
        month="Apr"
        day="7"
        title="🛢️ Oil change"
        sub="Honda Fairfax · Mon 8:00 AM · ~45 min"
        price="$49"
        status="Paid"
        statusVariant="paid"
        onPress={() => navigateCrossTab(navigation, 'MaintTab', 'MaintScheduleConfirm')}
      />
      <ScheduledServiceCard
        month="Apr"
        day="12"
        title="🚗 Rear bumper repair"
        sub="Honda Fairfax · Thu 10:30 AM · Self drop-off"
        price="$320–345"
        status="Confirmed"
        statusVariant="confirmed"
        onPress={() => navigation.navigate('BookingConfirm')}
      />
    </Screen>
  );
}
