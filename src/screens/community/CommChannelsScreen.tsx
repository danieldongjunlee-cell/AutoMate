import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Tappable } from '../../components/Tappable';
import { CarSwitchChip } from '../../components/CarSwitchChip';

import { CommunityStackParamList } from '../../navigation/types';
import { brandChannels, channelKind } from '../../services/mock/communityChannels';
import { AvatarCircle, Badge, Card, Screen, SectionLabel } from '../../components/ui';
import { useActiveVehicle } from '../../hooks/useActiveVehicle';
import { useAppStore } from '../../store/useAppStore';
import { radii, spacing, useTheme } from '../../theme';
import { confirmAction } from '../../utils/alerts';

type Nav = NativeStackNavigationProp<CommunityStackParamList, 'CommChannels'>;

/** Wireframe s-comm-channels: communities for the user's active car brand only. */
export function CommChannelsScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const { active, brand } = useActiveVehicle();
  const [query, setQuery] = useState('');

  // Sub-communities are derived purely from the active brand, so switching cars
  // (Honda ↔ Toyota ↔ Kia) swaps the entire list to that brand's communities.
  const channels = useMemo(() => brandChannels(brand), [brand]);

  // Joined state lives in the store so the Community tab badge can scope
  // notifications to joined communities. New users join NOTHING — registering a
  // car only makes its brand's communities appear; the user joins manually.
  const joinedCommunityIds = useAppStore((s) => s.joinedCommunityIds);
  const joinCommunity = useAppStore((s) => s.joinCommunity);
  const leaveCommunity = useAppStore((s) => s.leaveCommunity);
  const joinedIds = useMemo(() => new Set(joinedCommunityIds), [joinedCommunityIds]);

  /** Both joining and leaving ask for confirmation first. */
  const onJoinPress = (id: string, name: string) => {
    if (joinedIds.has(id)) {
      confirmAction(
        `Leave ${name}?`,
        `You'll stop seeing this community's posts in your feed. You can rejoin anytime.`,
        () => leaveCommunity(id),
        'Leave',
      );
      return;
    }
    confirmAction(
      `Join ${name}?`,
      `You'll join this community and see its posts in your feed.`,
      () => joinCommunity(id),
      'Join',
    );
  };

  const q = query.trim().toLowerCase();
  const filteredChannels = q
    ? channels.filter((channel) => channel.name.toLowerCase().includes(q))
    : channels;

  return (
    <Screen safeTop>
      {/* Community title + active-car switch (chip pinned top-right) */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.md }}>
        <Text style={{ flex: 1, fontSize: 27, fontWeight: '800', color: colors.textPrimary }}>
          Community
        </Text>
        <CarSwitchChip />
      </View>

      {/* No registered car → nothing to show. Communities are unlocked by the
          car's brand, so we prompt the user to register one first. */}
      {!active ? (
        <Card tinted style={{ padding: spacing.lg, alignItems: 'center', marginTop: spacing.sm }}>
          <Text style={{ fontSize: 30, marginBottom: spacing.sm }}>🚗</Text>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '700',
              color: colors.textPrimary,
              textAlign: 'center',
              marginBottom: 4,
            }}
          >
            No communities yet
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: colors.textTertiary,
              textAlign: 'center',
              lineHeight: 19,
            }}
          >
            Register your car and its brand community will appear here automatically — no joining
            required.
          </Text>
        </Card>
      ) : (
        renderCommunities()
      )}
    </Screen>
  );

  function renderCommunities() {
    return (
      <>
      {/* Search bar */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          borderRadius: radii.md,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          marginBottom: spacing.md,
        }}
      >
        <Text style={{ fontSize: 15, color: colors.textTertiary }}>🔍</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={`Search ${brand} communities…`}
          placeholderTextColor={colors.textTertiary}
          style={{ flex: 1, fontSize: 14, color: colors.textPrimary, padding: 0 }}
        />
      </View>

      {/* Explanatory banner — scopes the list to the active brand. */}
      <Card tinted style={{ padding: spacing.md, marginBottom: spacing.md }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: colors.primaryDeep }}>
          These are communities for your {brand}.
        </Text>
        <Text style={{ fontSize: 13, color: colors.primaryDark, marginTop: 2 }}>
          You can join communities for your registered car&apos;s brand — switch cars to see another
          brand&apos;s communities.
        </Text>
      </Card>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: spacing.sm,
        }}
      >
        <SectionLabel style={{ marginBottom: 0 }}>{brand} communities</SectionLabel>
        <Badge label={`${filteredChannels.length} channels`} variant="primarySoft" />
      </View>

      {filteredChannels.length === 0 ? (
        <Text style={{ fontSize: 14, color: colors.textTertiary, marginBottom: spacing.md }}>
          No {brand} communities match “{query.trim()}”
        </Text>
      ) : null}

      {filteredChannels.map((channel) => {
        const joined = joinedIds.has(channel.id);
        return (
          <Tappable
            key={channel.id}
            onPress={() =>
              joined
                ? navigation.navigate('CommHonda', {
                    title: channel.name,
                    kind: channelKind(channel.name),
                  })
                : onJoinPress(channel.id, channel.name)
            }
            style={({ pressed }) => ({
              backgroundColor: joined ? colors.primarySurface : colors.surface,
              borderRadius: radii.md,
              borderWidth: joined ? 1.5 : StyleSheet.hairlineWidth,
              borderColor: joined ? colors.primary : colors.border,
              padding: spacing.sm,
              marginBottom: spacing.sm,
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.sm,
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <AvatarCircle initial={channel.initial} color={channel.color} size={40} />
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: joined ? '600' : '500',
                  color: joined ? colors.primaryDeep : colors.textPrimary,
                }}
              >
                {channel.emoji} {channel.name}
              </Text>
              <Text style={{ fontSize: 13, color: colors.textTertiary }}>
                {channel.members.toLocaleString()} members
                {channel.newPosts ? ` · ${channel.newPosts} new posts` : ''}
              </Text>
            </View>
            <Tappable
              onPress={() => onJoinPress(channel.id, channel.name)}
              style={{
                backgroundColor: joined ? colors.primary : colors.surface,
                borderRadius: radii.sm,
                borderWidth: joined ? 0 : StyleSheet.hairlineWidth,
                borderColor: colors.border,
                paddingHorizontal: 12,
                paddingVertical: 5,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: joined ? colors.onPrimary : colors.textTertiary,
                }}
              >
                {joined ? 'Joined' : 'Join'}
              </Text>
            </Tappable>
          </Tappable>
        );
      })}

      <View
        style={{
          backgroundColor: colors.primarySurface,
          borderRadius: radii.sm,
          padding: spacing.sm,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          marginTop: spacing.xs,
        }}
      >
        <Text style={{ fontSize: 17 }}>💬</Text>
        <Text style={{ fontSize: 14, fontWeight: '500', color: colors.primaryDark }}>
          Share tips, ask questions, help fellow {brand} owners
        </Text>
      </View>
      </>
    );
  }
}
