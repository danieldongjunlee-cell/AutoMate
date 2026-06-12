import { RouteProp, useRoute } from '@react-navigation/native';
import React from 'react';
import { Share, StyleSheet, Text, View } from 'react-native';

import { Tappable } from '../../components/Tappable';

import { DealerMap } from '../../components/DealerMap';
import { RatingLink } from '../../components/RatingLink';
import { AvatarCircle, Badge, Card } from '../../components/ui';
import { Screen } from '../../components/ui';
import { HomeStackParamList } from '../../navigation/types';
import { dealerById, USER_LOCATION } from '../../services/mock/data';
import { palette, radii, spacing, useTheme } from '../../theme';
import { openDirections } from '../../utils/links';

type Route = RouteProp<HomeStackParamList, 'DealerMap'>;

/**
 * Wireframe s-dealer-map, feedback pass 2: REAL tile map (Leaflet/OSM on web,
 * react-native-maps in Expo Go) centered on the dealer, with working
 * Get-directions (Google Maps) and tappable rating (Google reviews).
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

      {/* Real tile map: dealer pin + you-are-here dot */}
      <View
        style={{
          borderRadius: radii.lg,
          height: 320,
          marginBottom: spacing.md,
          overflow: 'hidden',
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: '#C8D5CC',
        }}
      >
        <DealerMap
          style={{ flex: 1 }}
          zoom={12}
          center={{ lat: dealer.lat, lng: dealer.lng }}
          userLocation={USER_LOCATION}
          markers={[
            {
              id: dealer.id,
              lat: dealer.lat,
              lng: dealer.lng,
              label: `🔧 ${dealer.name}`,
              color: palette.danger,
              selected: true,
            },
          ]}
        />

        {/* Distance chip */}
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            bottom: 10,
            right: 10,
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
      </View>

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
            <Text style={{ fontSize: 12, color: colors.textTertiary }}>{dealer.address}</Text>
          </View>
        </View>
        <View
          style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}
        >
          <Text style={{ fontSize: 13, color: colors.textTertiary }}>🕐 Hours</Text>
          <Text style={{ fontSize: 13, fontWeight: '500', color: colors.textPrimary }}>
            {dealer.hours}
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 6,
          }}
        >
          <Text style={{ fontSize: 13, color: colors.textTertiary }}>⭐ Rating</Text>
          <RatingLink
            dealer={dealer}
            label={`${dealer.rating} (${dealer.reviews} reviews)`}
            style={{ fontSize: 13, fontWeight: '500', color: colors.textPrimary }}
          />
        </View>
        <View
          style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}
        >
          <Text style={{ fontSize: 13, color: colors.textTertiary }}>📅 Your appointment</Text>
          <Text style={{ fontSize: 13, fontWeight: '600', color: colors.primaryDark }}>
            Thu, Apr 12 · 10:30 AM
          </Text>
        </View>
      </Card>

      {/* Actions */}
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <Tappable
          onPress={() => openDirections(dealer)}
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
        </Tappable>
        <Tappable
          onPress={() =>
            Share.share({ message: `${dealer.name} Service Center — ${dealer.address}` }).catch(
              () => {},
            )
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
        </Tappable>
      </View>
    </Screen>
  );
}
