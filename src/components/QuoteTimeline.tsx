import React from 'react';
import { View } from 'react-native';

import { Text } from './Text';

import { Icon, IconName } from './Icon';
import { palette, radii, spacing } from '../theme';

export interface TimelineStep {
  icon: IconName;
  /** "11:48 PM" / "~10 AM" */
  time: string;
  /** "Sent" / "Quotes" */
  label: string;
  state: 'done' | 'next' | 'later';
}

/**
 * Three-step quote timeline drawn for the dark estimate card: a done step, the
 * next one and what follows, joined by a rule.
 */
export function QuoteTimeline({ steps, note }: { steps: TimelineStep[]; note?: string }) {
  const node = (s: TimelineStep) => {
    const tint = s.state === 'done' ? palette.mint : s.state === 'next' ? palette.amber : 'rgba(226,232,255,0.45)';
    return (
      <View key={s.label} style={{ alignItems: 'center', width: 76 }}>
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: s.state === 'later' ? 'rgba(255,255,255,0.08)' : `${tint}22`,
            borderWidth: 1,
            borderColor: s.state === 'later' ? 'rgba(255,255,255,0.18)' : `${tint}88`,
          }}
        >
          <Icon name={s.icon} size={16} color={tint} strokeWidth={2} />
        </View>
        <Text style={{ fontSize: 11, fontWeight: '800', color: '#ffffff', marginTop: 6 }} numberOfLines={1}>
          {s.time}
        </Text>
        <Text style={{ fontSize: 11, color: 'rgba(226,232,255,0.6)' }} numberOfLines={1}>
          {s.label}
        </Text>
      </View>
    );
  };
  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        {steps.map((s, i) => (
          <React.Fragment key={s.label}>
            {i > 0 ? <View style={{ flex: 1, height: 2, backgroundColor: 'rgba(255,255,255,0.14)', marginTop: 15 }} /> : null}
            {node(s)}
          </React.Fragment>
        ))}
      </View>
      {note ? (
        <View style={{ marginTop: spacing.md, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: radii.md, paddingHorizontal: spacing.md, paddingVertical: 10 }}>
          <Text style={{ fontSize: 12, fontWeight: '600', color: 'rgba(226,232,255,0.8)', lineHeight: 17 }}>{note}</Text>
        </View>
      ) : null}
    </View>
  );
}
