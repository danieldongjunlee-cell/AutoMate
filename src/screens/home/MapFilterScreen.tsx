import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { AvatarCircle } from '../../components/ui';
import { HomeStackParamList } from '../../navigation/types';
import { dealerById, Quote, QUOTE_REQUEST } from '../../services/mock/data';
import { quoteService } from '../../services/mock/quoteService';
import { radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'MapFilter'>;

/** Wireframe s-map: light "satnav" map background. */
const MAP_BG = '#DDE0D5';
const MAP_ROAD = '#CCCAB8';

type Filter = 'all' | 'brand' | 'under350';

const FILTERS: { id: Filter; label: (n: number) => string }[] = [
  { id: 'all', label: (n) => `All (${n})` },
  { id: 'brand', label: () => 'Brand ▼' },
  { id: 'under350', label: () => 'Under $350' },
];

/** Price-range cluster pills positioned like the wireframe's s-map. */
const CLUSTERS = [
  { label: '$320 – $345', top: '38%', left: '48%', dark: true },
  { label: '$280 – $310', top: '10%', left: '22%', dark: false },
  { label: '$350 – $375', top: '70%', left: '70%', dark: false },
] as const;

/**
 * Wireframe s-map — filterable map variant of All Quotes Map, with the
 * selected dealer card (Accept quote / Call) pinned below the map.
 */
export function MapFilterScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const { data: quotes } = useQuery({ queryKey: ['quotes'], queryFn: quoteService.getQuotes });
  const [filter, setFilter] = useState<Filter>('all');
  const [selectedId, setSelectedId] = useState('q-honda');

  const visible: Quote[] = (quotes ?? []).filter((q) => {
    if (filter === 'under350') return q.price < 350;
    if (filter === 'brand') return dealerById(q.dealerId).name.includes('Honda');
    return true;
  });
  const selected = visible.find((q) => q.id === selectedId) ?? visible[0];
  const dealer = selected ? dealerById(selected.dealerId) : null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: spacing.screenH }}>
      {/* Filter chips */}
      <View style={{ flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.sm }}>
        {FILTERS.map(({ id, label }) => {
          const on = id === filter;
          return (
            <Pressable
              key={id}
              onPress={() => setFilter(id)}
              style={({ pressed }) => ({
                backgroundColor: on ? colors.textPrimary : colors.surface,
                borderWidth: on ? 0 : StyleSheet.hairlineWidth,
                borderColor: colors.border,
                borderRadius: radii.pill,
                paddingHorizontal: 14,
                paddingVertical: 6,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '500',
                  color: on ? colors.background : colors.textSecondary,
                }}
              >
                {label(visible.length)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Light map with road cross + clusters */}
      <View
        style={{
          backgroundColor: MAP_BG,
          borderRadius: radii.lg,
          height: 260,
          overflow: 'hidden',
          marginBottom: spacing.md,
        }}
      >
        <View
          style={{ position: 'absolute', top: '44%', left: 0, right: 0, height: 6, backgroundColor: MAP_ROAD }}
        />
        <View
          style={{ position: 'absolute', left: '46%', top: 0, bottom: 0, width: 6, backgroundColor: MAP_ROAD }}
        />
        {/* You-are-here */}
        <View
          style={{
            position: 'absolute',
            top: '48%',
            left: '48%',
            width: 18,
            height: 18,
            borderRadius: 9,
            backgroundColor: colors.primary,
            borderWidth: 2,
            borderColor: '#fff',
          }}
        />
        {CLUSTERS.map((c) => (
          <View
            key={c.label}
            style={{
              position: 'absolute',
              top: c.top,
              left: c.left,
              transform: [{ translateX: -36 }],
              backgroundColor: c.dark ? '#1A1A1A' : '#fff',
              borderRadius: radii.pill,
              paddingHorizontal: 10,
              paddingVertical: 5,
              shadowColor: '#000',
              shadowOpacity: 0.22,
              shadowRadius: 4,
              shadowOffset: { width: 0, height: 1 },
              elevation: 2,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: '700', color: c.dark ? '#fff' : '#1A1A1A' }}>
              {c.label}
            </Text>
          </View>
        ))}
        <View
          style={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            backgroundColor: 'rgba(0,0,0,.35)',
            borderRadius: radii.sm,
            paddingHorizontal: 8,
            paddingVertical: 3,
          }}
        >
          <Text style={{ fontSize: 11, color: '#fff' }}>{QUOTE_REQUEST.city}</Text>
        </View>
      </View>

      {/* Selected dealer card */}
      {selected && dealer && (
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: radii.md,
            borderWidth: 1.5,
            borderColor: colors.primary,
            padding: spacing.md,
          }}
        >
          <View
            style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}
          >
            <AvatarCircle initial={dealer.initial} color={dealer.color} size={36} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '500', color: colors.textPrimary }}>
                {dealer.name}
              </Text>
              <Text style={{ fontSize: 13, color: colors.textTertiary }}>
                ★ {dealer.rating} · {dealer.distanceMi} mi
              </Text>
            </View>
            <Text style={{ fontSize: 22, fontWeight: '700', color: colors.successDark }}>
              ${selected.price}{' '}
              <Text style={{ fontSize: 12, fontWeight: '400', color: colors.textTertiary }}>
                ± insp.
              </Text>
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: spacing.xs }}>
            <Pressable
              onPress={() => navigation.navigate('AcceptBooking', { dealerId: dealer.id })}
              style={({ pressed }) => ({
                flex: 1,
                backgroundColor: colors.primary,
                borderRadius: radii.sm,
                paddingVertical: 10,
                alignItems: 'center',
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Text style={{ fontSize: 14, fontWeight: '500', color: colors.onPrimary }}>
                Accept quote
              </Text>
            </Pressable>
            <Pressable
              onPress={() =>
                Alert.alert('Call dealer', `${dealer.name}\nCalling will be wired to the device dialer.`)
              }
              style={({ pressed }) => ({
                backgroundColor: colors.successSurface,
                borderWidth: 1,
                borderColor: colors.success,
                borderRadius: radii.sm,
                paddingHorizontal: 16,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text style={{ fontSize: 16 }}>📞</Text>
              <Text style={{ fontSize: 14, fontWeight: '500', color: colors.successDeep }}>Call</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}
