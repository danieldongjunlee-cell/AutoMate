import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Tappable } from '../../components/Tappable';

import { Badge, Screen } from '../../components/ui';
import { HomeStackParamList } from '../../navigation/types';
import { CAR_PART_ROWS, PartCell } from '../../services/mock/data';
import { useAppStore } from '../../store/useAppStore';
import { palette, radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'CarDiagram'>;

const SIDE_W = 64;

/** One tappable car part (wireframe v15.10: single-select, ✔ on the picked cell). */
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

  const bg = selected ? palette.primaryDark : colors.surface;
  const fg = selected ? '#fff' : colors.textSecondary;

  return (
    <Tappable
      onPress={onPress}
      style={({ pressed }) => ({
        flex: vertical ? 1 : undefined,
        width: vertical ? SIDE_W : undefined,
        alignSelf: vertical ? undefined : 'stretch',
        backgroundColor: bg,
        borderRadius: radii.sm,
        borderWidth: selected ? 2 : 1.5,
        borderColor: selected ? palette.primary : colors.border,
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
          fontWeight: selected ? '700' : '600',
          color: fg,
          textAlign: 'center',
        }}
      >
        {selected ? `✔ ${cell.name}` : cell.name}
      </Text>
    </Tappable>
  );
}

/** Wireframe s-car-diagram: pick ONE part per pass (pickPart single-select). */
export function CarDiagramScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const draftPart = useAppStore((s) => s.draftPart);
  const pickPart = useAppStore((s) => s.pickPart);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Screen>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: spacing.sm,
            marginBottom: spacing.xs,
          }}
        >
          <Text style={{ flex: 1, fontSize: 14, color: colors.textTertiary }}>
            Tap one part — you'll add photos for each part separately
          </Text>
          {draftPart ? <Badge label={draftPart} variant="primarySoft" /> : null}
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
                        selected={draftPart === cell.name}
                        onPress={() => pickPart(cell.name)}
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
                  selected={draftPart === cell.name}
                  onPress={() => pickPart(cell.name)}
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
                  selected={draftPart === left.name}
                  onPress={() => pickPart(left.name)}
                />
                <View style={{ flex: 1 }}>
                  <PartTile
                    cell={mid}
                    selected={draftPart === mid.name}
                    onPress={() => pickPart(mid.name)}
                    minHeight={tall ? 76 : 52}
                  />
                </View>
                <PartTile
                  cell={right}
                  vertical
                  selected={draftPart === right.name}
                  onPress={() => pickPart(right.name)}
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
              {draftPart ? `${draftPart} selected` : 'Tap a part above to select'}
            </Text>
          </View>
          <Tappable
            disabled={!draftPart}
            onPress={() => navigation.navigate('Camera')}
            style={({ pressed }) => ({
              backgroundColor: palette.primaryDark,
              borderRadius: radii.sm,
              paddingHorizontal: spacing.md,
              paddingVertical: 10,
              opacity: !draftPart ? 0.4 : pressed ? 0.8 : 1,
            })}
          >
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>Continue →</Text>
          </Tappable>
        </View>
      </Screen>
    </View>
  );
}
