import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Tappable } from '../../components/Tappable';

import { CommunityStackParamList } from '../../navigation/types';
import { CHANNELS } from '../../services/mock/data';
import { communityService } from '../../services';
import { Screen } from '../../components/ui';
import { radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<CommunityStackParamList, 'CommChannels'>;

/** Wireframe s-comm-channels: brand channels list + points banner. */
export function CommChannelsScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const { data: channels } = useQuery({
    queryKey: ['channels'],
    queryFn: communityService.getChannels,
  });

  return (
    <Screen>
      {/* Community title */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
        <Text style={{ flex: 1, fontSize: 22, fontWeight: '800', color: colors.textPrimary }}>
          Community
        </Text>
      </View>

      {/* Search bar (presentational) */}
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
        <Text style={{ fontSize: 13, color: colors.textTertiary }}>
          Search posts, channels, owners…
        </Text>
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: spacing.md,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary }}>
          Brand channels
        </Text>
        <View
          style={{
            backgroundColor: colors.primarySurface,
            borderRadius: radii.pill,
            paddingHorizontal: 11,
            paddingVertical: 4,
          }}
        >
          <Text style={{ fontSize: 13, color: colors.primaryDark }}>2.4k active</Text>
        </View>
      </View>

      {(channels ?? CHANNELS).map((channel) => (
        <Tappable
          key={channel.id}
          onPress={() =>
            channel.joined
              ? navigation.navigate('CommHonda')
              : Alert.alert('Join channel', `Joining ${channel.name} comes with the backend.`)
          }
          style={({ pressed }) => ({
            backgroundColor: channel.joined ? colors.primarySurface : colors.surface,
            borderRadius: radii.md,
            borderWidth: channel.joined ? 1.5 : StyleSheet.hairlineWidth,
            borderColor: channel.joined ? colors.primary : colors.border,
            padding: spacing.sm,
            marginBottom: spacing.sm,
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: radii.sm,
              backgroundColor: channel.color,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff' }}>{channel.initial}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 15,
                fontWeight: channel.joined ? '600' : '500',
                color: channel.joined ? colors.primaryDeep : colors.textPrimary,
              }}
            >
              {channel.name}
            </Text>
            <Text style={{ fontSize: 12, color: colors.textTertiary }}>
              {channel.members.toLocaleString()} members
              {channel.newPosts ? ` · ${channel.newPosts} new posts` : ''}
            </Text>
          </View>
          {!channel.joined && (
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: radii.sm,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: colors.border,
                paddingHorizontal: 12,
                paddingVertical: 5,
              }}
            >
              <Text style={{ fontSize: 13, color: colors.textTertiary }}>Join</Text>
            </View>
          )}
        </Tappable>
      ))}

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
        <Text style={{ fontSize: 13, fontWeight: '500', color: colors.primaryDark }}>
          Share tips, ask questions, help fellow owners
        </Text>
      </View>
    </Screen>
  );
}
