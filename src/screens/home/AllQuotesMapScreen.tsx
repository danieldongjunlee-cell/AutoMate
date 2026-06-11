import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AvatarCircle, SectionLabel, Screen } from '../../components/ui';
import { HomeStackParamList } from '../../navigation/types';
import { dealerById, QUOTE_REQUEST } from '../../services/mock/data';
import { quoteService } from '../../services/mock/quoteService';
import { palette, radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'AllQuotesMap'>;

const TIER_COLORS: Record<string, string> = {
  lowest: palette.primary,
  good: palette.success,
  fair: palette.warning,
  higher: palette.danger,
};

/**
 * Stylized dark map with price pins — faithful to the wireframe's mock map.
 * Swappable for react-native-maps once real dealer geodata exists.
 */
export function AllQuotesMapScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const { data: quotes } = useQuery({ queryKey: ['quotes'], queryFn: quoteService.getQuotes });

  return (
    <Screen>
      {/* Map */}
      <LinearGradient
        colors={[palette.navyMid, palette.navy]}
        style={{
          borderRadius: radii.lg,
          height: 240,
          marginBottom: spacing.md,
          overflow: 'hidden',
          borderWidth: 0.5,
          borderColor: '#2A3A52',
        }}
      >
        {/* Street grid */}
        {[1, 2, 3].map((i) => (
          <View
            key={`gv${i}`}
            style={{
              position: 'absolute',
              left: `${i * 25}%`,
              top: 0,
              bottom: 0,
              width: StyleSheet.hairlineWidth,
              backgroundColor: 'rgba(74,106,138,.45)',
            }}
          />
        ))}
        {[1, 2].map((i) => (
          <View
            key={`gh${i}`}
            style={{
              position: 'absolute',
              top: `${i * 33}%`,
              left: 0,
              right: 0,
              height: StyleSheet.hairlineWidth,
              backgroundColor: 'rgba(74,106,138,.45)',
            }}
          />
        ))}

        {/* Quote pins */}
        {quotes?.map((q) => (
          <Pressable
            key={q.id}
            onPress={() => navigation.navigate('AcceptBooking', { dealerId: q.dealerId })}
            style={{
              position: 'absolute',
              top: `${q.pin.top}%`,
              left: `${q.pin.left}%`,
              transform: [{ translateX: -22 }, { translateY: -22 }],
              backgroundColor: TIER_COLORS[q.tier],
              borderRadius: radii.pill,
              borderWidth: 2,
              borderColor: '#fff',
              paddingHorizontal: 8,
              paddingVertical: 4,
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: '700', color: q.tier === 'fair' ? palette.dark : '#fff' }}>
              ${q.price}
            </Text>
          </Pressable>
        ))}

        {/* You-are-here */}
        <View
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: [{ translateX: -10 }, { translateY: -10 }],
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: '#fff',
            borderWidth: 4,
            borderColor: palette.primary,
          }}
        />
        <View
          style={{
            position: 'absolute',
            bottom: 10,
            right: 10,
            backgroundColor: 'rgba(255,255,255,.15)',
            borderRadius: radii.sm,
            paddingHorizontal: 9,
            paddingVertical: 4,
          }}
        >
          <Text style={{ fontSize: 11, color: '#fff', fontWeight: '500' }}>
            {QUOTE_REQUEST.city}
          </Text>
        </View>
      </LinearGradient>

      {/* Legend */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          gap: spacing.md,
          marginBottom: spacing.md,
        }}
      >
        {(
          [
            ['lowest', 'Lowest'],
            ['good', 'Good'],
            ['fair', 'Fair'],
            ['higher', 'Higher'],
          ] as const
        ).map(([tier, label]) => (
          <View key={tier} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <View style={{ width: 11, height: 11, borderRadius: 6, backgroundColor: TIER_COLORS[tier] }} />
            <Text style={{ fontSize: 12, color: colors.textTertiary }}>{label}</Text>
          </View>
        ))}
      </View>

      <SectionLabel>Quotes — tap to select</SectionLabel>
      {quotes?.slice(0, 3).map((q, i) => {
        const dealer = dealerById(q.dealerId);
        return (
          <Pressable
            key={q.id}
            onPress={() => navigation.navigate('AcceptBooking', { dealerId: q.dealerId })}
            style={({ pressed }) => ({
              backgroundColor: i === 0 ? colors.primarySurface : colors.surface,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: i === 0 ? colors.primaryLight : colors.border,
              borderRadius: radii.md,
              padding: spacing.md,
              marginBottom: spacing.sm,
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.sm,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <AvatarCircle initial={dealer.initial} color={dealer.color} size={36} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary }}>
                {dealer.name}
              </Text>
              <Text style={{ fontSize: 12, color: colors.textTertiary }}>
                {dealer.distanceMi} mi · ★ {dealer.rating}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '700',
                  color: q.tier === 'fair' ? colors.warning : colors.successDark,
                }}
              >
                ${q.price}
              </Text>
              <Text style={{ fontSize: 11, color: colors.textTertiary }}>est.</Text>
            </View>
          </Pressable>
        );
      })}

      {/* Filters view (wireframe s-map) */}
      <Pressable
        onPress={() => navigation.navigate('MapFilter')}
        style={({ pressed }) => ({ alignItems: 'center', marginTop: spacing.xs, marginBottom: spacing.sm, opacity: pressed ? 0.6 : 1 })}
      >
        <Text style={{ fontSize: 13, color: colors.primaryDark }}>Filter quotes on map →</Text>
      </Pressable>
      <Pressable
        onPress={() => navigation.goBack()}
        style={({ pressed }) => ({ alignItems: 'center', opacity: pressed ? 0.6 : 1 })}
      >
        <Text style={{ fontSize: 13, color: colors.primaryDark }}>← Back to quotes list</Text>
      </Pressable>
    </Screen>
  );
}
