import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Badge, Screen } from '../../components/ui';
import { HomeStackParamList } from '../../navigation/types';
import { CAR_PART_ROWS, PartCell } from '../../services/mock/data';
import { useAppStore } from '../../store/useAppStore';
import { palette, radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'CarDiagram'>;

const SIDE_W = 64;

/** One tappable car part. Colors follow the wireframe legend:
 *  bumpers primary, fenders orange, doors light-purple, panels neutral. */
function PartTile({
  cell,
  selected,
  vertical,
  onPress,
  minHeight,
}: {
  cell: PartCell;
  selected: boolean;
  vertical?: boolean;
  onPress: () => void;
  minHeight?: number;
}) {
  const { colors } = useTheme();
  const base = {
    bumper: { bg: palette.primary, fg: '#fff', border: 'transparent' },
    fender: { bg: palette.warning, fg: '#fff', border: 'transparent' },
    door: { bg: palette.primaryLight, fg: '#fff', border: 'transparent' },
    panel: { bg: colors.surface, fg: colors.textSecondary, border: colors.border },
  }[cell.kind];

  const bg = selected ? palette.primaryDark : base.bg;
  const fg = selected ? '#fff' : base.fg;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flex: vertical ? 1 : undefined,
        width: vertical ? SIDE_W : undefined,
        alignSelf: vertical ? undefined : 'stretch',
        backgroundColor: bg,
        borderRadius: radii.sm,
        borderWidth: selected ? 2 : cell.kind === 'panel' ? 1 : 0,
        borderColor: selected ? palette.primary : base.border,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: vertical ? spacing.sm : 12,
        paddingHorizontal: 4,
        minHeight,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Text
        style={{
          fontSize: vertical ? 11 : 14,
          fontWeight: cell.kind === 'panel' && !selected ? '500' : '700',
          color: fg,
          textAlign: 'center',
        }}
      >
        {cell.name}
      </Text>
    </Pressable>
  );
}

export function CarDiagramScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const selectedParts = useAppStore((s) => s.selectedParts);
  const togglePart = useAppStore((s) => s.togglePart);

  const count = selectedParts.length;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Screen>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: spacing.xs,
          }}
        >
          <Text style={{ fontSize: 14, color: colors.textTertiary }}>
            Tap any part — multiple parts supported
          </Text>
          <Badge label={`${count} selected`} variant="primarySoft" />
        </View>

        {/* Top-down car grid */}
        <View
          style={{
            backgroundColor: colors.surfaceAlt,
            borderRadius: radii.lg,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.border,
            padding: spacing.sm,
            marginTop: spacing.sm,
            marginBottom: spacing.md,
            gap: 6,
          }}
        >
          {CAR_PART_ROWS.map((row, i) => {
            if (row.length === 1) {
              const cell = row[0];
              // Rear window row keeps the side gutters empty.
              if (cell.name === 'Rear window') {
                return (
                  <View key={i} style={{ flexDirection: 'row', gap: 6 }}>
                    <View style={{ width: SIDE_W }} />
                    <View style={{ flex: 1 }}>
                      <PartTile
                        cell={cell}
                        selected={selectedParts.includes(cell.name)}
                        onPress={() => togglePart(cell.name)}
                      />
                    </View>
                    <View style={{ width: SIDE_W }} />
                  </View>
                );
              }
              return (
                <PartTile
                  key={i}
                  cell={cell}
                  selected={selectedParts.includes(cell.name)}
                  onPress={() => togglePart(cell.name)}
                />
              );
            }
            const [left, mid, right] = row;
            const tall = mid.name === 'Roof';
            return (
              <View key={i} style={{ flexDirection: 'row', gap: 6, alignItems: 'stretch' }}>
                <PartTile
                  cell={left}
                  vertical
                  selected={selectedParts.includes(left.name)}
                  onPress={() => togglePart(left.name)}
                />
                <View style={{ flex: 1 }}>
                  <PartTile
                    cell={mid}
                    selected={selectedParts.includes(mid.name)}
                    onPress={() => togglePart(mid.name)}
                    minHeight={tall ? 76 : 52}
                  />
                </View>
                <PartTile
                  cell={right}
                  vertical
                  selected={selectedParts.includes(right.name)}
                  onPress={() => togglePart(right.name)}
                />
              </View>
            );
          })}
        </View>

        {/* AI Estimate bar */}
        <View
          style={{
            backgroundColor: palette.aiPanel,
            borderRadius: radii.md,
            padding: spacing.md,
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.md,
          }}
        >
          <View
            style={{
              width: 46,
              height: 46,
              borderRadius: radii.md,
              backgroundColor: palette.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 22 }}>🤖</Text>
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 2 }}>
              Get AI Estimate
            </Text>
            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,.55)' }} numberOfLines={1}>
              {count === 0 ? 'Tap parts above to select' : selectedParts.join(' · ')}
            </Text>
          </View>
          <Pressable
            disabled={count === 0}
            onPress={() => navigation.navigate('PhotoExample')}
            style={({ pressed }) => ({
              backgroundColor: palette.primaryDark,
              borderRadius: radii.sm,
              paddingHorizontal: spacing.md,
              paddingVertical: 10,
              opacity: count === 0 ? 0.4 : pressed ? 0.8 : 1,
            })}
          >
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>
              {count} part{count !== 1 ? 's' : ''} →
            </Text>
          </Pressable>
        </View>
      </Screen>
    </View>
  );
}
