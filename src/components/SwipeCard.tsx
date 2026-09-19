import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Text, View } from 'react-native';

import { Icon, IconName } from './Icon';
import { palette, radii, spacing, useTheme } from '../theme';

/**
 * Gradient panel that holds a swipeable deck of cards (My cars, My insurance):
 * the app's blue → teal ground with a caption, then the carousel.
 */
export function SwipeDeck({ caption, children }: { caption?: string; children: React.ReactNode }) {
  return (
    <LinearGradient
      colors={[palette.primary, '#1e4fcc', '#0f2a3d']}
      locations={[0, 0.55, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ borderRadius: 28, paddingHorizontal: spacing.md, paddingTop: spacing.lg, paddingBottom: spacing.md }}
    >
      {caption ? <Text style={{ fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginBottom: spacing.md }}>{caption}</Text> : null}
      {children}
    </LinearGradient>
  );
}

/** One card in the deck: title with a short accent underline, optional badge, then the body. */
export function SwipeCard({ title, subtitle, badge, dashed, children }: { title: string; subtitle?: string; badge?: string; dashed?: boolean; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: radii.tile,
        borderWidth: dashed ? 1.5 : 1,
        borderStyle: dashed ? 'dashed' : 'solid',
        borderColor: dashed ? colors.primaryLight : colors.border,
        padding: spacing.lg,
        marginHorizontal: 2,
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 10 },
        elevation: 6,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.sm }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 19, fontWeight: '800', color: colors.textPrimary }} numberOfLines={2}>
            {title}
          </Text>
          {subtitle ? <Text style={{ fontSize: 13, color: colors.textTertiary, marginTop: 2 }}>{subtitle}</Text> : null}
          <View style={{ width: 44, height: 3, borderRadius: 2, backgroundColor: colors.primary, marginTop: 8 }} />
        </View>
        {badge ? (
          <View style={{ backgroundColor: colors.primarySurface, borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 4 }}>
            <Text style={{ fontSize: 12, fontWeight: '800', color: colors.primaryDark }}>{badge}</Text>
          </View>
        ) : null}
      </View>
      {children}
    </View>
  );
}

/** Small square stat: icon, value, label (the four tiles under the photo). */
export function StatTile({ icon, color, value, label }: { icon: IconName; color: string; value: string; label: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center', backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingVertical: 10, paddingHorizontal: 4 }}>
      <Icon name={icon} size={24} color={color} strokeWidth={1.8} />
      <Text style={{ fontSize: 13, fontWeight: '800', color: colors.textPrimary, marginTop: 6 }} numberOfLines={1}>
        {value}
      </Text>
      <Text style={{ fontSize: 9, fontWeight: '700', letterSpacing: 0.2, textTransform: 'uppercase', color: colors.textTertiary, marginTop: 2 }} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}
