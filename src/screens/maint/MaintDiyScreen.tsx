import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Alert, Text, View } from 'react-native';

import { FilterChips } from '../../components/FilterChips';
import { DiyGuideRow, ProLockOverlay } from '../../components/ProLockOverlay';
import { Screen } from '../../components/ui';
import { DIY_CATEGORIES, DIY_GUIDES } from '../../services/mock/data';
import { palette, radii, spacing } from '../../theme';

const STATS = [
  { value: '12', label: 'Guides', tint: 'rgba(29,158,117,.25)', color: palette.successLight },
  { value: '$10', label: 'Forever', tint: 'rgba(255,255,255,.07)', color: '#fff' },
  { value: '5 min', label: 'Avg read', tint: 'rgba(255,255,255,.07)', color: '#fff' },
];

/** Wireframe s-maint-diy: guide hub with free rows + Pro-locked remainder. */
export function MaintDiyScreen() {
  const [category, setCategory] = useState(DIY_CATEGORIES[0]);
  const free = DIY_GUIDES.filter((g) => g.free);
  const locked = DIY_GUIDES.filter((g) => !g.free);

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
              Step-by-step text instructions
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {STATS.map((s) => (
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
              <Text style={{ fontSize: 18, fontWeight: '700', color: s.color }}>{s.value}</Text>
              <Text style={{ fontSize: 10, color: 'rgba(255,255,255,.45)' }}>{s.label}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      <FilterChips options={DIY_CATEGORIES} selected={category} onSelect={setCategory} />

      {free.map((g) => (
        <DiyGuideRow key={g.id} level={g.level} title={g.title} meta={g.meta} free showLink />
      ))}

      <View style={{ marginTop: spacing.xs }}>
        <ProLockOverlay
          title="+10 more guides with Pro"
          subtitle="All difficulty levels · AI recommendations · New guides weekly"
          cta="Unlock Pro · $10 forever"
          onUnlock={() => Alert.alert('AutoMate Pro', 'Purchases will be wired to the app stores.')}
        >
          {locked.map((g) => (
            <DiyGuideRow key={g.id} level={g.level} title={g.title} meta={g.meta} />
          ))}
        </ProLockOverlay>
      </View>
    </Screen>
  );
}
