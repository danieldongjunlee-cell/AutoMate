import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { Tappable } from '../../components/Tappable';

import { FeedPostCard } from '../../components/FeedPostCard';
import { Screen } from '../../components/ui';
import { CommunityStackParamList } from '../../navigation/types';
import { CHANNELS } from '../../services/mock/data';
import { brandChannels, channelKind, FeedPost, groupPosts } from '../../services/mock/communityChannels';
import { useActiveVehicle } from '../../hooks/useActiveVehicle';
import { useAppStore } from '../../store/useAppStore';
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

  // Themed mock feed for this (brand, kind), minus blocked authors
  // (App Store 1.2). Memoized so it stays stable.
  const blockedAuthors = useAppStore((s) => s.blockedAuthors);
  const community = useMemo(() => brandChannels(brand).find((c) => channelKind(c.name) === kind) ?? brandChannels(brand)[0], [brand, kind]);
  const posts = useMemo<FeedPost[]>(
    () => groupPosts(brand, kind).filter((p) => !blockedAuthors.includes(p.author)).map((p, i) => ({ ...p, community, brand, ageMin: i, hasPhoto: i % 3 === 0 })),
    [brand, kind, blockedAuthors, community],
  );
  const [upvoted, setUpvoted] = useState<Record<string, boolean>>({});
  const markPostsRead = useAppStore((s) => s.markPostsRead);
  // Browsing a community marks its posts read (drives the unread-posts badge).
  useEffect(() => {
    markPostsRead(posts.map((p) => p.id));
  }, [posts, markPostsRead]);

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
          })}
        >
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.onPrimary }}>+ Post</Text>
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
          <Text style={{ fontSize: 13, color: colors.primaryDark }}>
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
          <Text style={{ fontSize: 13, color: colors.successDeep }}>
            {channel.newPosts} new posts
          </Text>
        </View>
      </View>

      {posts.map((post, i) => (
        <FeedPostCard
          key={post.id}
          post={post}
          index={i}
          upvoted={!!upvoted[post.id]}
          onUpvote={() => setUpvoted((u) => ({ ...u, [post.id]: !u[post.id] }))}
          onCommunity={() => undefined}
          onPress={() => navigation.navigate('CommPost', { postId: post.id, post })}
        />
      ))}
    </Screen>
  );
}
