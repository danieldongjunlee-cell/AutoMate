import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { FilterButton, FilterSheet } from '../../components/FilterSheet';
import { Icon } from '../../components/Icon';
import { ProLockOverlay } from '../../components/ProLockOverlay';
import { Screen } from '../../components/ui';
import { MaintStackParamList } from '../../navigation/types';
import { DIY_GUIDES, DiyGuide } from '../../services/mock/diyGuides';
import { useAppStore } from '../../store/useAppStore';
import { palette, radii, spacing, useTheme } from '../../theme';
import { DiyGuideRow, DiyGuideSheet } from './DiyProScreens';

type Nav = NativeStackNavigationProp<MaintStackParamList, 'MaintDiy'>;

/** Guides grouped by subject (canvas "DIY guides"). Unlisted guides land in Routine upkeep. */
const DIY_SECTIONS: [string, string[]][] = [
  ['Routine upkeep', ['wiper-blades', 'engine-air-filter', 'cabin-air-filter', 'tire-pressure', 'washer-fluid', 'oil-level']],
  ['Battery & keys', ['key-fob-battery', 'jump-start']],
  ['Dents & scratches', ['boiling-water-dent', 'plunger-dent', 'scratch-buff', 'paint-touch-up', 'paint-chip']],
];
const DIFFICULTIES = ['Any difficulty', 'Easy', 'Medium'];
const DURATIONS = ['Any length', 'Under 15 min', 'Under 30 min'];

/**
 * DIY Repair Tips (canvas "DIY guides"): search bar under the header, guides
 * in sections. Non-Pro users see the header and a locked, blurred preview of
 * the whole list with one amber unlock button, no free samples.
 */
export function MaintDiyScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const isPro = useAppStore((s) => s.isPro);
  const [query, setQuery] = useState('');
  const [difficulty, setDifficulty] = useState(DIFFICULTIES[0]);
  const [duration, setDuration] = useState(DURATIONS[0]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selected, setSelected] = useState<DiyGuide | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DIY_GUIDES.filter((g) => {
      if (q && !`${g.title} ${g.tools.join(' ')} ${g.steps.join(' ')}`.toLowerCase().includes(q)) return false;
      if (difficulty !== DIFFICULTIES[0] && g.difficulty !== difficulty) return false;
      if (duration === 'Under 15 min' && g.minutes > 15) return false;
      if (duration === 'Under 30 min' && g.minutes > 30) return false;
      return true;
    });
  }, [query, difficulty, duration]);

  const sections = useMemo(() => {
    const placed = new Set<string>();
    const out: [string, DiyGuide[]][] = DIY_SECTIONS.map(([title, ids]) => {
      const rows = ids.map((id) => filtered.find((g) => g.id === id)).filter((g): g is DiyGuide => !!g);
      rows.forEach((g) => placed.add(g.id));
      return [title, rows];
    });
    const rest = filtered.filter((g) => !placed.has(g.id));
    if (rest.length) out[0] = [out[0][0], [...out[0][1], ...rest]];
    return out.filter(([, rows]) => rows.length > 0);
  }, [filtered]);

  const filterCount = (difficulty !== DIFFICULTIES[0] ? 1 : 0) + (duration !== DURATIONS[0] ? 1 : 0);
  const filterLabel = difficulty !== DIFFICULTIES[0] ? `Filter · ${difficulty}` : duration !== DURATIONS[0] ? `Filter · ${duration}` : 'Filter';

  const list = (
    <>
      {sections.map(([title, rows]) => (
        <View key={title} style={{ marginBottom: spacing.sm }}>
          <Text style={{ fontSize: 12, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase', color: colors.textTertiary, marginBottom: spacing.sm, marginTop: spacing.xs }}>{title}</Text>
          {rows.map((g) => (
            <DiyGuideRow key={g.id} guide={g} onPress={() => (isPro ? setSelected(g) : undefined)} />
          ))}
        </View>
      ))}
      {sections.length === 0 ? (
        <Text style={{ fontSize: 14, color: colors.textTertiary, textAlign: 'center', paddingVertical: spacing.lg }}>No guides match, try another search.</Text>
      ) : null}
    </>
  );

  return (
    <Screen>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md }}>
        <View style={{ width: 50, height: 50, borderRadius: 14, backgroundColor: colors.chip, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="wrench" size={28} color={palette.amber} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary }}>DIY Repair Guides</Text>
          <Text style={{ fontSize: 13, color: colors.textTertiary }}>
            {DIY_GUIDES.length} step-by-step guides · {isPro ? 'Pro unlocked' : 'Pro members only'}
          </Text>
        </View>
        {isPro ? (
          <View style={{ backgroundColor: colors.warningSurface, borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 4 }}>
            <Text style={{ fontSize: 12, fontWeight: '800', color: colors.warning }}>PRO</Text>
          </View>
        ) : null}
      </View>

      {/* Search */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.inputBg, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, height: 46, marginBottom: spacing.md }}>
        <Icon name="search" size={20} color={colors.textTertiary} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search guides (e.g. brakes, wiper)"
          placeholderTextColor={colors.textPlaceholder}
          accessibilityLabel="Search guides"
          style={{ flex: 1, fontSize: 15, color: colors.textPrimary, paddingVertical: 0 }}
        />
      </View>

      <FilterButton label={filterLabel} count={filterCount} onPress={() => setFilterOpen(true)} />
      <FilterSheet
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        groups={[
          { key: 'difficulty', title: 'Difficulty', options: DIFFICULTIES, value: difficulty },
          { key: 'duration', title: 'Time', options: DURATIONS, value: duration },
        ]}
        onApply={(v) => {
          setDifficulty(v.difficulty ?? DIFFICULTIES[0]);
          setDuration(v.duration ?? DURATIONS[0]);
        }}
      />

      {isPro ? (
        <>
          {list}
          {selected ? <DiyGuideSheet guide={selected} onClose={() => setSelected(null)} /> : null}
        </>
      ) : (
        <ProLockOverlay
          blur
          title="DIY guides are a Pro feature"
          subtitle={`${DIY_GUIDES.length} step-by-step guides · AI damage matching · new guides monthly`}
          cta="Unlock with Pro · $48/yr →"
          onUnlock={() => navigation.navigate('DiyUnlock', { returnTo: 'MaintDashboard' })}
        >
          {list}
        </ProLockOverlay>
      )}
    </Screen>
  );
}
