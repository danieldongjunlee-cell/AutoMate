import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, StyleSheet, View } from 'react-native';

import { CarBrandLogo } from './CarBrandLogo';
import { Text } from './Text';
import { brandOf, useActiveVehicle } from '../hooks/useActiveVehicle';
import { useAppStore } from '../store/useAppStore';

import { palette, radii, spacing } from '../theme';

/** The card keeps the site's dark navy panel in both appearances. */
const CARD_TOP = '#141b38';
const CARD_BOTTOM = '#1b2350';
const CARD_LINE = 'rgba(126,155,255,0.28)';
const LABEL_BLUE = '#8fa7ff';
const BODY = 'rgba(226,232,255,0.72)';

/** A slow sheen that sweeps across the card, like the estimate panel on the site. */
function Gloss({ width }: { width: number }) {
  const x = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!width) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(x, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.quad), useNativeDriver: Platform.OS !== 'web' }),
        Animated.delay(2600),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [x, width]);
  if (!width) return null;
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: -40,
        bottom: -40,
        width: 120,
        transform: [
          { translateX: x.interpolate({ inputRange: [0, 1], outputRange: [-140, width + 60] }) },
          { rotate: '18deg' },
        ],
      }}
    >
      <LinearGradient
        colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.14)', 'rgba(255,255,255,0)']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
}

/**
 * The AI estimate panel from automate-technology.com: the car and the
 * damaged parts on top, "AI ESTIMATED TOTAL" over the whole estimated range,
 * how it was generated, then the AutoMate AI analysis with the range drawn as
 * a bar from its low to its high end and the average marked on it. A sheen
 * sweeps across it.
 */
export function AiEstimateCard({
  priceLow,
  priceHigh,
  /** How many damage points the analysis found (photos submitted). */
  points,
  /** Seconds the analysis took. */
  seconds = 1.8,
  footer,
  style,
}: {
  priceLow: number;
  priceHigh: number;
  points?: number;
  seconds?: number;
  /** Rendered inside the same card, under a divider (submission timeline …). */
  footer?: React.ReactNode;
  style?: object;
}) {
  const [w, setW] = React.useState(0);
  const { active } = useActiveVehicle();
  const damageParts = useAppStore((s) => s.damageParts);
  const carName = active?.name;
  const partsLabel = damageParts.map((p) => p.part).join(', ');
  const avg = Math.round((priceLow + priceHigh) / 2);
  const span = Math.max(1, priceHigh - priceLow);
  const markerPct = Math.max(6, Math.min(94, ((avg - priceLow) / span) * 100));
  const money = (n: number) => `$${n.toLocaleString(undefined, { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;

  return (
    <View onLayout={(e) => setW(Math.round(e.nativeEvent.layout.width))} style={[{ borderRadius: radii.tile, overflow: 'hidden' }, style]}>
      <LinearGradient colors={[CARD_TOP, CARD_BOTTOM]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ padding: spacing.lg, borderRadius: radii.tile, borderWidth: 1, borderColor: CARD_LINE }}>
        {/* The car this estimate is for, and the parts that were photographed. */}
        {carName ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingBottom: spacing.md, marginBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: 'rgba(126,155,255,0.2)' }}>
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center' }}>
              <CarBrandLogo brand={brandOf(carName)} size={28} bg="transparent" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '800', color: '#ffffff' }} numberOfLines={1}>{carName}</Text>
              {partsLabel ? <Text style={{ fontSize: 12, fontWeight: '600', color: BODY, marginTop: 1 }} numberOfLines={1}>{partsLabel}</Text> : null}
            </View>
          </View>
        ) : null}

        {/* Headline: the whole estimated range */}
        <Text style={{ fontSize: 11, fontWeight: '800', letterSpacing: 1.1, textTransform: 'uppercase', color: LABEL_BLUE }}>AI estimated total</Text>
        <Text style={{ fontSize: 34, fontWeight: '800', color: '#ffffff', letterSpacing: -0.6, marginTop: 4 }} numberOfLines={1} adjustsFontSizeToFit>
          {priceLow === priceHigh ? money(priceLow) : `${money(priceLow)} – ${money(priceHigh)}`}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 6 }}>
          <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: palette.mint }} />
          <Text style={{ flex: 1, fontSize: 12, fontWeight: '600', color: BODY }} numberOfLines={1}>
            {points ? `Generated in ${seconds}s from ${points} detected damage point${points === 1 ? '' : 's'}` : `Generated in ${seconds}s`}
          </Text>
        </View>

        {/* AutoMate AI analysis · the market range for this repair */}
        <View style={{ marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: 'rgba(126,155,255,0.2)' }}>
          <Text style={{ fontSize: 11, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase', color: palette.amber }}>✦ AutoMate AI analysis</Text>
          <Text style={{ fontSize: 13, fontWeight: '600', color: BODY, marginTop: 6, marginBottom: 8 }}>Market range for this repair</Text>
          <View style={{ height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.12)', overflow: 'visible', justifyContent: 'center' }}>
            <LinearGradient colors={[palette.mint, '#2bd07f', '#1f9e75']} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={{ position: 'absolute', left: 0, right: 0, height: 8, borderRadius: 4 }} />
            {/* The average, marked on the range. */}
            <View style={{ position: 'absolute', left: `${markerPct}%`, marginLeft: -3, width: 6, height: 18, borderRadius: 3, backgroundColor: '#ffffff' }} />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: BODY }}>{`Low ${money(priceLow)}`}</Text>
            <Text style={{ fontSize: 12, fontWeight: '800', color: '#ffffff' }}>{`Avg ${money(avg)}`}</Text>
            <Text style={{ fontSize: 12, fontWeight: '600', color: BODY }}>{`High ${money(priceHigh)}`}</Text>
          </View>
        </View>

        {footer ? (
          <View style={{ marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: 'rgba(126,155,255,0.2)' }}>{footer}</View>
        ) : null}

        <Gloss width={w} />
      </LinearGradient>
    </View>
  );
}
