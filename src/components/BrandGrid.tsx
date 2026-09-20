import React from 'react';
import { Text, View } from 'react-native';

import { CarBrandLogo } from './CarBrandLogo';
import { Icon } from './Icon';
import { Tappable } from './Tappable';
import { radii, spacing, useTheme } from '../theme';

/**
 * Two-column picker card. Selected cards get a blue tint, a blue border and a
 * solid blue logo tile — the brand-chooser pattern from the design.
 */
function GridCard({
  label,
  selected,
  onPress,
  logo,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  /** Rendered in the tile on the left (a brand logo, or a letter chip). */
  logo?: React.ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <Tappable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      style={{
        width: '47.8%',
        flexGrow: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        minHeight: 62,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: radii.lg,
        backgroundColor: selected ? colors.primarySurface : colors.surface,
        borderWidth: selected ? 2 : 1,
        borderColor: selected ? colors.primary : colors.border,
      }}
    >
      {logo ? <View style={{ width: 38, alignItems: 'center', justifyContent: 'center' }}>{logo}</View> : null}
      <Text style={{ flex: 1, fontSize: 14, fontWeight: '700', color: selected ? colors.primaryDeep : colors.textPrimary }} numberOfLines={2}>
        {label}
      </Text>
      {selected ? <Icon name="check" size={16} color={colors.primary} strokeWidth={2.6} /> : null}
    </Tappable>
  );
}

/** Grid of car brands, each with its real logo. Single select. */
export function BrandGrid({
  brands,
  value,
  onChange,
  /** Show only the first N until "Show all" is tapped. */
  initialCount = 8,
}: {
  brands: string[];
  value: string;
  onChange: (brand: string) => void;
  initialCount?: number;
}) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = React.useState(false);
  // Always keep the chosen brand visible, even when it sits past the fold.
  const head = brands.slice(0, initialCount);
  const visible = expanded || !value || head.includes(value) ? (expanded ? brands : head) : [...head.slice(0, initialCount - 1), value];
  return (
    <View accessibilityRole="radiogroup">
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {visible.map((b) => (
          <GridCard
            key={b}
            label={b}
            selected={b === value}
            onPress={() => onChange(b)}
            logo={<CarBrandLogo brand={b} size={32} bg="transparent" />}
          />
        ))}
      </View>
      {brands.length > initialCount ? (
        <Tappable onPress={() => setExpanded((v) => !v)} hitSlop={8} style={{ alignSelf: 'center', paddingVertical: spacing.sm }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: colors.primaryDark }}>
            {expanded ? 'Show fewer brands' : `Show all ${brands.length} brands`}
          </Text>
        </Tappable>
      ) : null}
    </View>
  );
}

/** Grid of plain options (models, trims, colours). Single select. */
export function OptionGrid({
  options,
  value,
  onChange,
  initialCount,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  initialCount?: number;
}) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = React.useState(false);
  const limit = initialCount ?? options.length;
  const head = options.slice(0, limit);
  const visible = expanded || !value || head.includes(value) ? (expanded ? options : head) : [...head.slice(0, limit - 1), value];
  return (
    <View accessibilityRole="radiogroup">
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {visible.map((o) => (
          <GridCard key={o} label={o} selected={o === value} onPress={() => onChange(o)} />
        ))}
      </View>
      {options.length > limit ? (
        <Tappable onPress={() => setExpanded((v) => !v)} hitSlop={8} style={{ alignSelf: 'center', paddingVertical: spacing.sm }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: colors.primaryDark }}>{expanded ? 'Show fewer' : `Show all ${options.length}`}</Text>
        </Tappable>
      ) : null}
    </View>
  );
}
