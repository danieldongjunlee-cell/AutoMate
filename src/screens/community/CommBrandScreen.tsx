import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';

import { Text } from '../../components/Text';

import { CarBrandLogo } from '../../components/CarBrandLogo';
import { FeedPostCard } from '../../components/FeedPostCard';
import { Tappable } from '../../components/Tappable';
import { Screen } from '../../components/ui';
import { useActiveVehicle } from '../../hooks/useActiveVehicle';
import { CommunityStackParamList } from '../../navigation/types';
import { brandCommunity, brandPosts } from '../../services/mock/communityChannels';
import { useAppStore } from '../../store/useAppStore';
import { radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<CommunityStackParamList, 'CommBrand'>;
type Rt = RouteProp<CommunityStackParamList, 'CommBrand'>;

/** One brand's community: its badge and counts, then every post in it. */
export function CommBrandScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Rt>();
  const { colors } = useTheme();
  const { brand: activeBrand } = useActiveVehicle();
  const brand = route.params?.brand ?? activeBrand;
  const community = useMemo(() => brandCommunity(brand), [brand]);

  // The community's feed, minus blocked authors (App Store 1.2).
  const blockedAuthors = useAppStore((s) => s.blockedAuthors);
  const posts = useMemo(() => brandPosts(brand).filter((p) => !blockedAuthors.includes(p.author)), [brand, blockedAuthors]);
  const [upvoted, setUpvoted] = useState<Record<string, boolean>>({});
  const markPostsRead = useAppStore((s) => s.markPostsRead);
  // Browsing a community marks its posts read (drives the unread-posts badge).
  useEffect(() => {
    markPostsRead(posts.map((p) => p.id));
  }, [posts, markPostsRead]);

  useEffect(() => {
    navigation.setOptions({
      title: community.name,
      headerRight: () => (
        <Tappable
          onPress={() => navigation.navigate('CommCreate')}
          style={{ backgroundColor: colors.primary, borderRadius: radii.sm, paddingHorizontal: 12, paddingVertical: 6 }}
        >
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.onPrimary }}>+ Post</Text>
        </Tappable>
      ),
    });
  }, [navigation, colors, community.name]);

  return (
    <Screen>
      {/* The community's badge is its brand logo. */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg }}>
        <CarBrandLogo brand={brand} size={56} bg="transparent" />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 20, fontWeight: '800', color: colors.textPrimary }}>{community.name}</Text>
          <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
            <View style={{ backgroundColor: colors.primarySurface, borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 3 }}>
              <Text style={{ fontSize: 13, color: colors.primaryDark }}>{community.members.toLocaleString()} members</Text>
            </View>
            <View style={{ backgroundColor: colors.successSurface, borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 3 }}>
              <Text style={{ fontSize: 13, color: colors.successDeep }}>{community.newPosts} new posts</Text>
            </View>
          </View>
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
