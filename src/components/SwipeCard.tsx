import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Text, View } from 'react-native';

import { Icon, IconName } from './Icon';
import { Tappable } from './Tappable';
import { palette, radii, spacing } from '../theme';

/** Type colours on the blue deck — white, with two softer tints. */
export const DECK_TEXT = '#ffffff';
export const DECK_TEXT_SOFT = 'rgba(255,255,255,0.78)';
export const DECK_TEXT_MUTED = 'rgba(255,255,255,0.6)';
const DECK_FILL = 'rgba(255,255,255,0.12)';
const DECK_LINE = 'rgba(255,255,255,0.28)';

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
      {caption ? <Text style={{ fontSize: 13, fontWeight: '600', color: DECK_TEXT_SOFT, textAlign: 'center', marginBottom: spacing.md }}>{caption}</Text> : null}
      {children}
    </LinearGradient>
  );
}

/**
 * One card in the deck: no solid background — the blue ground shows through a
 * faint frosted fill — with the title, a short accent underline, an optional
 * badge, then the body in white type.
 */
export function SwipeCard({ title, subtitle, badge, dashed, children }: { title: string; subtitle?: string; badge?: string; dashed?: boolean; children: React.ReactNode }) {
  return (
    <View
      style={{
        // No inner panel: the card sits straight on the gradient.
        borderRadius: radii.tile,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        marginHorizontal: 2,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.sm }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 19, fontWeight: '800', color: DECK_TEXT }} numberOfLines={2}>
            {title}
          </Text>
          {subtitle ? <Text style={{ fontSize: 13, color: DECK_TEXT_SOFT, marginTop: 2 }}>{subtitle}</Text> : null}
          <View style={{ width: 44, height: 3, borderRadius: 2, backgroundColor: palette.teal, marginTop: 8 }} />
        </View>
        {badge ? (
          <View style={{ backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 4 }}>
            <Text style={{ fontSize: 12, fontWeight: '800', color: DECK_TEXT }}>{badge}</Text>
          </View>
        ) : null}
      </View>
      {children}
    </View>
  );
}

/** Small square stat: icon, value, label (the four tiles under the photo). */
export function StatTile({ icon, color, value, label }: { icon: IconName; color: string; value: string; label: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', backgroundColor: DECK_FILL, borderWidth: 1, borderColor: DECK_LINE, borderRadius: 14, paddingVertical: 10, paddingHorizontal: 4 }}>
      <Icon name={icon} size={24} color={color} strokeWidth={1.8} />
      <Text style={{ fontSize: 13, fontWeight: '800', color: DECK_TEXT, marginTop: 6 }} numberOfLines={1}>
        {value}
      </Text>
      <Text style={{ fontSize: 9, fontWeight: '700', letterSpacing: 0.2, textTransform: 'uppercase', color: DECK_TEXT_MUTED, marginTop: 2 }} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

/** The card's main action: a white pill (or a frosted outline when secondary / done). */
export function DeckButton({ label, onPress, secondary, disabled }: { label: string; onPress: () => void; secondary?: boolean; disabled?: boolean }) {
  return (
    <Tappable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={{
        height: 50,
        borderRadius: radii.pill,
        backgroundColor: secondary ? DECK_FILL : '#ffffff',
        borderWidth: secondary ? 1 : 0,
        borderColor: DECK_LINE,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled ? 0.85 : 1,
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: '800', color: secondary ? DECK_TEXT : palette.primaryDark }}>{label}</Text>
    </Tappable>
  );
}
