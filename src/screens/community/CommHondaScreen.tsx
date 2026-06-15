import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useMemo } from 'react';
import { Text, View } from 'react-native';

import { Tappable } from '../../components/Tappable';

import { PostCard } from '../../components/PostCard';
import { Screen } from '../../components/ui';
import { CommunityStackParamList } from '../../navigation/types';
import { CHANNELS } from '../../services/mock/data';
import { channelKind, groupPosts } from '../../services/mock/communityChannels';
import { useActiveVehicle } from '../../hooks/useActiveVehicle';
import { radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<CommunityStackParamList, 'CommHonda'>;
type Rt = RouteProp<CommunityStackParamList, 'CommHonda'>;

/** Wireframe s-comm-honda: a sub-community feed, themed by the tapped group. */
export function CommHondaScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Rt>();
  const { colors } = useTheme();
  const { brand } = useActiveVehicle();

  // Topic + title come from the tapped group card; fall back to the brand's
  // generic Owners feed when the screen is reached without params.
  const title = route.params?.title ?? `${brand} Owners`;
  const kind = route.params?.kind ?? channelKind(route.params?.title);

  const brandLc = brand.toLowerCase();
  const channel =
    CHANNELS.find((c) => c.name.toLowerCase().includes(brandLc)) ?? CHANNELS[0];

  // Themed mock feed for this (brand, kind). Memoized so it stays stable.
  const posts = useMemo(() => groupPosts(brand, kind), [brand, kind]);

  useEffect(() => {
    navigation.setOptions({
      // Header title is the tapped group's title (fallback "<Brand> Owners").
      title,
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
  }, [navigation, colors, title]);

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

      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onPress={() => navigation.navigate('CommPost', { postId: post.id })}
        />
      ))}
    </Screen>
  );
}
