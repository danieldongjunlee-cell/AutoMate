import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Tappable } from './Tappable';

import { AppNotification } from '../services';
import { radii, spacing, useTheme } from '../theme';

/** Gold-tier card colors from the wireframe (#FFF8E8 / #F0C050 / #7A5500). */
const GOLD = { bg: '#FFF8E8', border: '#F0C050', title: '#7A5500', body: '#633806', dot: '#EF9F27' };

/** Notification card from s-notifications: tinted while unread, neutral after. */
export function NotificationCard({
  notification,
  onPress,
}: {
  notification: AppNotification;
  onPress: () => void;
}) {
  const { colors, dark } = useTheme();
  const n = notification;

  const tint =
    !n.unread || n.tint === 'neutral'
      ? { bg: colors.surface, border: colors.border, title: colors.textPrimary, body: colors.textSecondary, dot: colors.primary }
      : n.tint === 'primary'
        ? { bg: colors.primarySurface, border: colors.primaryLight, title: colors.primaryDeep, body: colors.primaryDark, dot: colors.primary }
        : n.tint === 'success'
          ? { bg: colors.successSurface, border: colors.success, title: colors.successDeep, body: colors.successDark, dot: colors.success }
          : dark
            ? { bg: colors.warningSurface, border: colors.warning, title: colors.warningDeep, body: colors.warningDeep, dot: colors.warning }
            : GOLD;

  return (
    <Tappable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: tint.bg,
        borderRadius: radii.md,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: tint.border,
        padding: spacing.md,
        marginBottom: spacing.sm,
        opacity: pressed ? 0.75 : 1,
      })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: 5 }}>
        <Text style={{ fontSize: 24 }}>{n.icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: n.unread ? '700' : '600', color: tint.title }}>
            {n.title}
          </Text>
          <Text style={{ fontSize: 13, color: colors.textTertiary, marginTop: 2 }}>{n.ago}</Text>
        </View>
        {n.unread ? (
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: tint.dot }} />
        ) : null}
      </View>
      <Text style={{ fontSize: 14, color: tint.body, lineHeight: 20 }}>{n.body}</Text>
    </Tappable>
  );
}
