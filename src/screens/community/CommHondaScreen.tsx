import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import React, { useEffect } from 'react';
import { Text, View } from 'react-native';

import { Tappable } from '../../components/Tappable';

import { PostCard } from '../../components/PostCard';
import { SkeletonList } from '../../components/Skeleton';
import { Screen } from '../../components/ui';
import { CommunityStackParamList } from '../../navigation/types';
import { CHANNELS } from '../../services/mock/data';
import { communityService } from '../../services';
import { useActiveVehicle } from '../../hooks/useActiveVehicle';
import { radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<CommunityStackParamList, 'CommHonda'>;

/** Wireframe s-comm-honda: Honda Owners feed with + Post header action. */
export function CommHondaScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const { brand } = useActiveVehicle();
  const brandLc = brand.toLowerCase();
  const channel =
    CHANNELS.find((c) => c.name.toLowerCase().includes(brandLc)) ?? CHANNELS[0];
  const { data: posts, isLoading } = useQuery({
    queryKey: ['feed', channel.id],
    queryFn: () => communityService.getFeed(channel.id),
  });

  useEffect(() => {
    navigation.setOptions({
      // Header title follows the active car's brand (was hardcoded "Honda Owners").
      title: `${brand} Owners`,
      headerRight: () => (
        <Tappable
          onPress={() => navigation.navigate('CommCreate')}
          style={({ pressed }) => ({
            backgroundColor: colors.primary,
            borderRadius: radii.sm,
            paddingHorizontal: 12,
            paddingVertical: 6,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <Text style={{ fontSize: 13, fontWeight: '600', color: colors.onPrimary }}>+ Post</Text>
        </Tappable>
      ),
    });
  }, [navigation, colors, brand]);

  return (
    <Screen>
      <View style={{ flexDirection: 'row', gap: 6, marginBottom: spacing.md }}>
        <View
          style={{
            backgroundColor: colors.primarySurface,
            borderRadius: radii.pill,
            paddingHorizontal: 10,
            paddingVertical: 3,
          }}
        >
          <Text style={{ fontSize: 12, color: colors.primaryDark }}>
            {channel.members.toLocaleString()} members
          </Text>
        </View>
        <View
          style={{
            backgroundColor: colors.successSurface,
            borderRadius: radii.pill,
            paddingHorizontal: 10,
            paddingVertical: 3,
          }}
        >
          <Text style={{ fontSize: 12, color: colors.successDeep }}>
            {channel.newPosts} new posts
          </Text>
        </View>
      </View>

      {isLoading ? (
        <SkeletonList variant="card" count={3} tall />
      ) : (
        posts?.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onPress={() => navigation.navigate('CommPost', { postId: post.id })}
          />
        ))
      )}
    </Screen>
  );
}
