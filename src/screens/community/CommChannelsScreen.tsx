import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { Text, TextInput } from '../../components/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CarBrandLogo } from '../../components/CarBrandLogo';
import { FeedPostCard } from '../../components/FeedPostCard';
import { FilterSheet } from '../../components/FilterSheet';
import { GuestGate } from '../../components/GuestGate';
import { Icon } from '../../components/Icon';
import { Tappable } from '../../components/Tappable';
import { useMyBrands } from '../../hooks/useActiveVehicle';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { DOCK_HEIGHT, DOCK_INSET } from '../../navigation/Dock';
import { CommunityStackParamList } from '../../navigation/types';
import { brandCommunity, communityFeed, FEED_BRANDS, FeedPost } from '../../services/mock/communityChannels';
import { POST_TAGS } from '../../services/mock/data';
import { useAppStore } from '../../store/useAppStore';
import { radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<CommunityStackParamList, 'CommChannels'>;

const ALL = 'All';

/**
 * Community (Reddit-style): the filter funnel and the search bar on one row,
 * then one feed, newest first. Every brand has one community and registering
 * a car makes you a member of its brand's, so the feed holds the communities
 * of the cars in your garage; a guest is asked to join first. The funnel opens
 * the app's filter sheet: which community, when more than one brand is
 * registered, and which tag (Question, Tip, ...). The floating pencil writes
 * a post.
 */
export function CommChannelsScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const requireAuth = useRequireAuth();
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const { brands: myBrands, hasCar } = useMyBrands();
  const brands = hasCar ? myBrands : FEED_BRANDS;
  const brandsKey = brands.join('|');
  const communities = useMemo(() => brands.map(brandCommunity), [brandsKey]); // eslint-disable-line react-hooks/exhaustive-deps
  // More than one brand in the garage: the community filter appears.
  const multi = communities.length > 1;

  const [query, setQuery] = useState('');
  const [upvoted, setUpvoted] = useState<Record<string, boolean>>({});
  const [filterOpen, setFilterOpen] = useState(false);
  const [community, setCommunity] = useState(ALL);
  const [tag, setTag] = useState(ALL);

  // A community filter that no longer matches the garage falls back to all.
  useEffect(() => {
    if (community !== ALL && !brands.some((b) => b === community)) setCommunity(ALL);
  }, [brandsKey, community]); // eslint-disable-line react-hooks/exhaustive-deps

  // The feed: the posts of every community you belong to, minus blocked
  // authors; the filter, tabs and search narrow and reorder it.
  const blockedAuthors = useAppStore((s) => s.blockedAuthors);
  const feed = useMemo(() => communityFeed(brands).filter((p) => !blockedAuthors.includes(p.author)), [brandsKey, blockedAuthors]); // eslint-disable-line react-hooks/exhaustive-deps
  const q = query.trim().toLowerCase();
  const posts = useMemo(() => {
    let list = feed;
    if (community !== ALL) list = list.filter((p) => p.brand === community);
    if (tag !== ALL) list = list.filter((p) => p.category === tag);
    if (q) list = list.filter((p) => [p.body, p.author, p.community.name, p.category, p.car].some((t) => t.toLowerCase().includes(q)));
    return [...list].sort((a, b) => a.ageMin - b.ageMin);
  }, [feed, community, tag, q]);

  // Browsing the feed marks its posts read (drives the unread badge).
  const markPostsRead = useAppStore((s) => s.markPostsRead);
  useEffect(() => {
    markPostsRead(posts.map((p) => p.id));
  }, [posts, markPostsRead]);

  const openPost = (post: FeedPost) => navigation.navigate('CommPost', { postId: post.id, post });
  const openCommunity = (brand: string) => navigation.navigate('CommBrand', { brand });
  const write = () => requireAuth('createPost', () => navigation.navigate('CommCreate'));

  const filterCount = (community !== ALL ? 1 : 0) + (tag !== ALL ? 1 : 0);
  const filterCaption = [community !== ALL ? `${community} Owners` : null, tag !== ALL ? `${tag}s` : null].filter(Boolean).join(' · ');

  // Guests have no community yet: the way in, nothing else.
  if (!isAuthenticated) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top + spacing.lg, paddingHorizontal: spacing.screenH }}>
        <Text style={{ fontSize: 28, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.3, marginBottom: spacing.lg }}>Community</Text>
        <GuestGate icon="chat" title="Join your car's community" body="Register a car and you're in its owners' community: questions, tips, deals and warnings from people driving the same brand." intent="community" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: insets.top + spacing.lg, paddingBottom: spacing.screenBottom + 40 }} keyboardShouldPersistTaps="handled">
        <View style={{ paddingHorizontal: spacing.screenH }}>
          <Text style={{ fontSize: 28, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.3, marginBottom: spacing.md }}>Community</Text>

          {/* Filter funnel, then the search bar, on one row. */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md }}>
          <Tappable
            onPress={() => setFilterOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Filters"
            style={{ height: 46, minWidth: 46, paddingHorizontal: filterCount ? 12 : 0, borderRadius: 23, backgroundColor: filterCount ? colors.primarySurface : colors.inputBg, borderWidth: 1, borderColor: filterCount ? colors.primary : colors.border, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 }}
          >
            <Icon name="funnel" size={20} color={filterCount ? colors.primaryDark : colors.textPrimary} strokeWidth={1.8} />
            {filterCount ? <Text style={{ fontSize: 13, fontWeight: '700', color: colors.primaryDark }}>{filterCount}</Text> : null}
          </Tappable>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, height: 46, backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.border, borderRadius: radii.pill, paddingHorizontal: spacing.md }}>
            <Icon name="search" size={20} color={colors.textTertiary} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search posts and communities"
              placeholderTextColor={colors.textPlaceholder}
              accessibilityLabel="Search community"
              style={{ flex: 1, fontSize: 15, color: colors.textPrimary, padding: 0 }}
            />
            {query ? (
              <Tappable onPress={() => setQuery('')} hitSlop={8} accessibilityLabel="Clear search">
                <Icon name="close" size={18} color={colors.textTertiary} strokeWidth={2} />
              </Tappable>
            ) : null}
          </View>
          </View>
        </View>

        {/* Feed */}
        <View style={{ paddingHorizontal: spacing.screenH }}>
          {filterCaption ? (
            <Text style={{ fontSize: 13, color: colors.textTertiary, marginBottom: spacing.sm }}>Showing {filterCaption}</Text>
          ) : null}
          {posts.length === 0 ? (
            <Text style={{ fontSize: 14, color: colors.textTertiary, textAlign: 'center', paddingVertical: spacing.xl }}>
              {q ? `Nothing matches “${query.trim()}”` : filterCount ? 'No posts match these filters.' : 'No posts yet, be the first to write one.'}
            </Text>
          ) : (
            posts.map((post, i) => (
              <FeedPostCard
                key={post.id}
                post={post}
                index={i}
                upvoted={!!upvoted[post.id]}
                onUpvote={() => requireAuth('likePost', () => setUpvoted((u) => ({ ...u, [post.id]: !u[post.id] })))}
                onPress={() => openPost(post)}
                onCommunity={() => openCommunity(post.brand)}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Write a post · floats bottom right, above the dock. */}
      <Tappable
        onPress={write}
        accessibilityRole="button"
        accessibilityLabel="Write a post"
        style={{
          position: 'absolute',
          right: DOCK_INSET + 4,
          bottom: Math.max(insets.bottom, 0) + DOCK_INSET + DOCK_HEIGHT + 30,
          width: 58,
          height: 58,
          borderRadius: 29,
          backgroundColor: colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: colors.primary,
          shadowOpacity: 0.45,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 8 },
          elevation: 10,
        }}
      >
        <Icon name="pencil" size={26} color={colors.onPrimary} strokeWidth={2} />
      </Tappable>

      {/* The app's filter sheet: which community (with two or more brands), which tag. */}
      <FilterSheet
        visible={filterOpen}
        title="Filter posts"
        resultsLabel="Show posts"
        onClose={() => setFilterOpen(false)}
        groups={[
          {
            key: 'community',
            title: 'Community',
            options: [ALL, ...brands],
            value: community,
            hidden: !multi,
            optionIcon: (o) => (o === ALL ? null : <CarBrandLogo brand={o} size={22} bg="transparent" />),
          },
          { key: 'tag', title: 'Tags', options: [ALL, ...POST_TAGS], value: tag },
        ]}
        onApply={(v) => {
          setCommunity(v.community ?? ALL);
          setTag(v.tag ?? ALL);
        }}
      />
    </View>
  );
}
