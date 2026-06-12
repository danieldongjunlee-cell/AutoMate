import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { EARN_RULES, pointsToUsd } from '../../config/points';
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
        <Pressable
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
        </Pressable>
      ))}

      <View
        style={{
          backgroundColor: colors.warningSurface,
          borderRadius: radii.sm,
          padding: spacing.sm,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          marginTop: spacing.xs,
        }}
      >
        <Text style={{ fontSize: 17 }}>★</Text>
        <Text style={{ fontSize: 13, fontWeight: '500', color: colors.warningDeep }}>
          Post in any channel → earn +{EARN_RULES.communityPost} pts ·{' '}
          {pointsToUsd(EARN_RULES.communityPost)}
        </Text>
      </View>
    </Screen>
  );
}
