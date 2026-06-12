import { RouteProp, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Alert, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { AvatarCircle, Badge, Card } from '../../components/ui';
import { Screen } from '../../components/ui';
import { HomeStackParamList } from '../../navigation/types';
import { dealerById } from '../../services/mock/data';
import { palette, radii, spacing, useTheme } from '../../theme';

type Route = RouteProp<HomeStackParamList, 'DealerMap'>;

const ADDRESS = '11020 Fairfax Blvd, Fairfax, VA 22030';
const HOURS = 'Mon–Fri 8AM–6PM · Sat 8AM–4PM';

/** Decorative zoom button on the stylized map. */
function ZoomButton({ label }: { label: string }) {
  return (
    <View
      style={{
        width: 32,
        height: 32,
        backgroundColor: '#fff',
        borderRadius: radii.sm,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 1 },
        elevation: 2,
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: '700', color: '#555' }}>{label}</Text>
    </View>
  );
}

/**
 * Wireframe s-dealer-map: dealer detail map (booking-confirm "View on map").
 * Same stylized gradient-map approach as AllQuotesMap — swappable for
 * react-native-maps once real dealer geodata exists.
 */
export function DealerMapScreen() {
  const route = useRoute<Route>();
  const { colors } = useTheme();
  const dealer = dealerById(route.params?.dealerId);

  const driveMin = Math.max(3, Math.round(dealer.distanceMi * 5));

  return (
    <Screen>
      {/* Open badge (wireframe header right) */}
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: spacing.sm }}>
        <Badge label={dealer.openStatus === 'Closed' ? 'Closed' : 'Open'} variant="success" />
      </View>

      {/* Stylized light map */}
      <LinearGradient
        colors={['#E9EFE6', '#DDE8E0']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.35, y: 1 }}
        style={{
          borderRadius: radii.lg,
          height: 320,
          marginBottom: spacing.md,
          overflow: 'hidden',
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: '#C8D5CC',
        }}
      >
        {/* Roads */}
        <View
          style={{
            position: 'absolute',
            top: -20,
            bottom: -20,
            left: '34%',
            width: 16,
            backgroundColor: '#FDE293',
            opacity: 0.9,
            transform: [{ rotate: '8deg' }],
            borderWidth: 1.5,
            borderColor: '#F5D060',
          }}
        />
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: '42%',
            height: 12,
            backgroundColor: '#fff',
            opacity: 0.9,
          }}
        />
        <View
          style={{
            position: 'absolute',
            left: -10,
            right: -10,
            top: '70%',
            height: 9,
            backgroundColor: '#fff',
            opacity: 0.75,
            transform: [{ rotate: '-3deg' }],
          }}
        />
        {/* Parks / blocks */}
        <View style={{ position: 'absolute', top: '8%', right: '6%', width: 86, height: 60, backgroundColor: '#D5E3D0', borderRadius: 12, opacity: 0.7 }} />
        <View style={{ position: 'absolute', bottom: '10%', left: '5%', width: 72, height: 48, backgroundColor: '#D5E3D0', borderRadius: 12, opacity: 0.7 }} />
        <View style={{ position: 'absolute', top: '14%', left: '10%', width: 54, height: 40, backgroundColor: '#E3E0D5', borderRadius: 10, opacity: 0.8 }} />

        {/* Dashed route user → dealer */}
        <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
          <Path
            d="M 105 245 Q 140 185 178 135"
            stroke={palette.info}
            strokeWidth={3}
            strokeDasharray="7 6"
            fill="none"
            opacity={0.8}
          />
        </Svg>

        {/* Dealership pin */}
        <View style={{ position: 'absolute', top: '36%', left: '50%', marginLeft: -24, marginTop: -48 }}>
          <View
            style={{
              width: 48,
              height: 48,
              backgroundColor: palette.danger,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              borderBottomRightRadius: 24,
              transform: [{ rotate: '-45deg' }],
              borderWidth: 3,
              borderColor: '#fff',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOpacity: 0.3,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 3 },
              elevation: 4,
            }}
          >
            <Text style={{ fontSize: 18, transform: [{ rotate: '45deg' }] }}>🔧</Text>
          </View>
        </View>
        <View
          style={{
            position: 'absolute',
            top: '38%',
            left: '50%',
            transform: [{ translateX: -50 }],
            backgroundColor: '#fff',
            borderRadius: radii.sm,
            paddingHorizontal: 12,
            paddingVertical: 6,
            shadowColor: '#000',
            shadowOpacity: 0.18,
            shadowRadius: 5,
            shadowOffset: { width: 0, height: 2 },
            elevation: 3,
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: '700', color: palette.textPrimary }}>
            {dealer.name}
          </Text>
        </View>

        {/* User location */}
        <View style={{ position: 'absolute', top: '74%', left: '28%' }}>
          <View
            style={{
              width: 18,
              height: 18,
              borderRadius: 9,
              backgroundColor: palette.info,
              borderWidth: 3,
              borderColor: '#fff',
              shadowColor: palette.info,
              shadowOpacity: 0.4,
              shadowRadius: 6,
              elevation: 3,
            }}
          />
        </View>

        {/* Zoom controls */}
        <View style={{ position: 'absolute', bottom: 10, right: 10, gap: 6 }}>
          <ZoomButton label="+" />
          <ZoomButton label="−" />
        </View>

        {/* Distance chip */}
        <View
          style={{
            position: 'absolute',
            bottom: 10,
            left: 10,
            backgroundColor: 'rgba(255,255,255,.92)',
            borderRadius: radii.sm,
            paddingHorizontal: 10,
            paddingVertical: 5,
          }}
        >
          <Text style={{ fontSize: 11, color: '#555', fontWeight: '600' }}>
            🛣️ {dealer.distanceMi} mi · ~{driveMin} min drive
          </Text>
        </View>
      </LinearGradient>

      {/* Dealer info card */}
      <Card style={{ padding: spacing.md, marginBottom: spacing.md }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
            paddingBottom: spacing.sm,
            marginBottom: spacing.xs,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: colors.divider,
          }}
        >
          <AvatarCircle initial={dealer.initial} color={dealer.color} size={44} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary }}>
              {dealer.name} Service Center
            </Text>
            <Text style={{ fontSize: 12, color: colors.textTertiary }}>{ADDRESS}</Text>
          </View>
        </View>
        {(
          [
            ['🕐 Hours', HOURS, false],
            ['⭐ Rating', `${dealer.rating} (${dealer.reviews} reviews)`, false],
            ['📅 Your appointment', 'Thu, Apr 12 · 10:30 AM', true],
          ] as const
        ).map(([label, value, accent]) => (
          <View
            key={label}
            style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}
          >
            <Text style={{ fontSize: 13, color: colors.textTertiary }}>{label}</Text>
            <Text
              style={{
                fontSize: 13,
                fontWeight: accent ? '600' : '500',
                color: accent ? colors.primaryDark : colors.textPrimary,
              }}
            >
              {value}
            </Text>
          </View>
        ))}
      </Card>

      {/* Actions */}
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <Pressable
          onPress={() =>
            Alert.alert('Get directions', `Turn-by-turn navigation to ${ADDRESS} opens in your maps app.`)
          }
          style={({ pressed }) => ({
            flex: 2,
            backgroundColor: colors.info,
            borderRadius: radii.sm,
            paddingVertical: 13,
            alignItems: 'center',
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>🧭 Get directions</Text>
        </Pressable>
        <Pressable
          onPress={() =>
            Share.share({ message: `${dealer.name} Service Center — ${ADDRESS}` }).catch(() => {})
          }
          style={({ pressed }) => ({
            flex: 1,
            backgroundColor: colors.surface,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.border,
            borderRadius: radii.sm,
            paddingVertical: 13,
            alignItems: 'center',
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={{ fontSize: 14, color: colors.textSecondary }}>Share</Text>
        </Pressable>
      </View>
    </Screen>
  );
}
