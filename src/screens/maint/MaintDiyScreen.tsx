import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Text, View } from 'react-native';

import { Tappable } from '../../components/Tappable';

import { FilterChips } from '../../components/FilterChips';
import { DiyGuideRow, ProLockOverlay } from '../../components/ProLockOverlay';
import { Screen } from '../../components/ui';
import { MaintStackParamList } from '../../navigation/types';
import { DIY_CATEGORIES, DIY_GUIDES } from '../../services/mock/data';
import { DIY_GUIDES as DIY_READABLE_GUIDES, DiyGuide } from '../../services/mock/diyGuides';
import { useAppStore } from '../../store/useAppStore';
import { palette, radii, spacing } from '../../theme';
import { DiyGuideRow as ReadableGuideRow, DiyGuideSheet } from './DiyProScreens';

type Nav = NativeStackNavigationProp<MaintStackParamList, 'MaintDiy'>;

/** Wireframe s-maint-diy: guide hub — Pro-locked until `isPro` (diy-unlock chain). */
export function MaintDiyScreen() {
  const navigation = useNavigation<Nav>();
  const [category, setCategory] = useState(DIY_CATEGORIES[0]);
  const [selected, setSelected] = useState<DiyGuide | null>(null);
  const isPro = useAppStore((s) => s.isPro);
  const free = DIY_GUIDES.filter((g) => g.free);
  const locked = DIY_GUIDES.filter((g) => !g.free);

  const stats = [
    { value: '12', label: 'Guides', tint: 'rgba(29,158,117,.25)', color: palette.successLight },
    isPro
      ? { value: 'PRO', label: 'Unlocked', tint: 'rgba(239,159,39,.2)', color: '#F5B947' }
      : { value: '$10', label: 'Forever', tint: 'rgba(255,255,255,.07)', color: '#fff' },
    { value: '5 min', label: 'Avg read', tint: 'rgba(255,255,255,.07)', color: '#fff' },
  ];

  return (
    <Screen>
      {/* Header card */}
      <LinearGradient
        colors={[palette.navy, palette.navyMid]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: radii.md, padding: spacing.md, marginBottom: spacing.sm }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
          <Text style={{ fontSize: 24 }}>📚</Text>
          <View>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>DIY Repair Guides</Text>
            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,.5)' }}>
              {isPro
                ? '12 expert guides · Pro unlocked'
                : '12 expert guides · Free samples below · unlock all for $10 or with Pro'}
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {stats.map((s, i) => {
            const isPriceChip = !isPro && i === 1;
            const inner = (
              <>
                <Text style={{ fontSize: 18, fontWeight: '700', color: s.color }}>{s.value}</Text>
                <Text style={{ fontSize: 10, color: 'rgba(255,255,255,.45)' }}>{s.label}</Text>
              </>
            );
            return isPriceChip ? (
              <Tappable
                key={s.label}
                onPress={() => navigation.navigate('DiyUnlock')}
                style={({ pressed }) => ({
                  flex: 1,
                  backgroundColor: s.tint,
                  borderRadius: radii.sm,
                  borderWidth: 1,
                  borderColor: palette.warning,
                  paddingVertical: 8,
                  alignItems: 'center',
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                {inner}
              </Tappable>
            ) : (
              <View
                key={s.label}
                style={{
                  flex: 1,
                  backgroundColor: s.tint,
                  borderRadius: radii.sm,
                  paddingVertical: 8,
                  alignItems: 'center',
                }}
              >
                {inner}
              </View>
            );
          })}
        </View>
      </LinearGradient>

      <FilterChips options={DIY_CATEGORIES} selected={category} onSelect={setCategory} />

      {isPro ? (
        // Unlocked: the full library of readable, follow-along guides.
        <>
          {DIY_READABLE_GUIDES.map((g) => (
            <ReadableGuideRow key={g.id} guide={g} onPress={() => setSelected(g)} />
          ))}
          {selected ? (
            <DiyGuideSheet guide={selected} onClose={() => setSelected(null)} />
          ) : null}
        </>
      ) : (
        <>
          {free.map((g) => (
            <DiyGuideRow key={g.id} level={g.level} title={g.title} meta={g.meta} free showLink />
          ))}
          <View style={{ marginTop: spacing.xs }}>
            <ProLockOverlay
              title="+10 more guides with Pro"
              subtitle="All difficulty levels · AI recommendations · New guides weekly"
              cta="Unlock — $10 or with Pro →"
              onUnlock={() => navigation.navigate('DiyUnlock')}
            >
              {locked.map((g) => (
                <DiyGuideRow key={g.id} level={g.level} title={g.title} meta={g.meta} />
              ))}
            </ProLockOverlay>
          </View>
        </>
      )}
    </Screen>
  );
}
