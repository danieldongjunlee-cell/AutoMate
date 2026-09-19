import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CarSwitchChip } from '../../components/CarSwitchChip';
import { FeedPostCard } from '../../components/FeedPostCard';
import { GuestBanner } from '../../components/GuestBanner';
import { Icon } from '../../components/Icon';
import { Tappable } from '../../components/Tappable';
import { AvatarCircle } from '../../components/ui';
import { useActiveVehicle } from '../../hooks/useActiveVehicle';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { DOCK_HEIGHT, DOCK_INSET } from '../../navigation/Dock';
import { CommunityStackParamList } from '../../navigation/types';
import { brandChannels, channelKind, FeedPost, homeFeed } from '../../services/mock/communityChannels';
import { useAppStore } from '../../store/useAppStore';
import { radii, spacing, useTheme } from '../../theme';
import { confirmAction } from '../../utils/alerts';

type Nav = NativeStackNavigationProp<CommunityStackParamList, 'CommChannels'>;

type Tab = 'home' | 'mine' | 'new' | 'top';
const TABS: { key: Tab; label: (brand: string) => string }[] = [
  { key: 'home', label: () => 'Home' },
  { key: 'mine', label: (brand) => `My ${brand}` },
  { key: 'new', label: () => 'New' },
  { key: 'top', label: () => 'Top' },
];

/**
 * Community (Reddit-style): a search bar on top, Home · My {brand} · New · Top
 * tabs, a strip of your brand's communities to join, then one feed of posts
 * from every community. "My {brand}" narrows the feed to the user's own car.
 * The floating pencil (bottom right, above the dock) writes a post.
 */
export function CommChannelsScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const requireAuth = useRequireAuth();
  const { active, brand } = useActiveVehicle();
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<Tab>('home');
  const [upvoted, setUpvoted] = useState<Record<string, boolean>>({});

  // Your brand's communities (join/leave lives in the store so the tab badge
  // can scope notifications to joined ones).
  const channels = useMemo(() => brandChannels(brand), [brand]);
  const joinedCommunityIds = useAppStore((s) => s.joinedCommunityIds);
  const joinCommunity = useAppStore((s) => s.joinCommunity);
  const leaveCommunity = useAppStore((s) => s.leaveCommunity);
  const joined = useMemo(() => new Set(joinedCommunityIds), [joinedCommunityIds]);
  const toggleJoin = (id: string, name: string) =>
    joined.has(id)
      ? confirmAction(`Leave ${name}?`, `You'll stop seeing this community's posts in your feed. You can rejoin anytime.`, () => leaveCommunity(id), 'Leave')
      : confirmAction(`Join ${name}?`, `You'll join this community and see its posts in your feed.`, () => joinCommunity(id), 'Join');

  // The feed: every brand's communities, minus blocked authors; the active
  // brand's posts first. Tabs + search narrow and reorder it.
  const blockedAuthors = useAppStore((s) => s.blockedAuthors);
  const feed = useMemo(() => homeFeed(brand).filter((p) => !blockedAuthors.includes(p.author)), [brand, blockedAuthors]);
  const activeModel = (active?.name ?? '').replace(/\b(19|20)\d{2}\b/, '').trim().toLowerCase();
  const q = query.trim().toLowerCase();
  const posts = useMemo(() => {
    let list = feed;
    if (tab === 'mine') list = list.filter((p) => p.brand.toLowerCase() === brand.toLowerCase() || (!!activeModel && p.car.toLowerCase().includes(activeModel)));
    if (q) list = list.filter((p) => [p.body, p.author, p.community.name, p.category, p.car].some((t) => t.toLowerCase().includes(q)));
    if (tab === 'new') list = [...list].sort((a, b) => a.ageMin - b.ageMin);
    if (tab === 'top') list = [...list].sort((a, b) => b.likes + b.replies - (a.likes + a.replies));
    return list;
  }, [feed, tab, q, brand, activeModel]);

  // Browsing the feed marks its posts read (drives the unread badge).
  const markPostsRead = useAppStore((s) => s.markPostsRead);
  useEffect(() => {
    markPostsRead(posts.map((p) => p.id));
  }, [posts, markPostsRead]);

  const openPost = (post: FeedPost) => navigation.navigate('CommPost', { postId: post.id, post });
  const openCommunity = (post: FeedPost) => navigation.navigate('CommHonda', { title: post.community.name, kind: channelKind(post.community.name) });
  const write = () => requireAuth('createPost', () => navigation.navigate('CommCreate'));

  const chip = (label: string, on: boolean, onPress: () => void) => (
    <Tappable
      key={label}
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: on }}
      accessibilityLabel={label}
      style={{ height: 36, paddingHorizontal: 16, borderRadius: radii.pill, backgroundColor: on ? colors.primary : colors.inputBg, borderWidth: 1, borderColor: on ? colors.primary : colors.border, justifyContent: 'center' }}
    >
      <Text style={{ fontSize: 14, fontWeight: '700', color: on ? colors.onPrimary : colors.textSecondary }}>{label}</Text>
    </Tappable>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: Math.max(spacing.screenTop, insets.top + spacing.lg), paddingBottom: spacing.screenBottom + 40 }} keyboardShouldPersistTaps="handled">
        <View style={{ paddingHorizontal: spacing.screenH }}>
          <GuestBanner />

          {/* Title + car switch */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md }}>
            <Text style={{ flex: 1, fontSize: 28, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.3 }}>Community</Text>
            <CarSwitchChip />
          </View>

          {/* Search */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, height: 46, backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.border, borderRadius: radii.pill, paddingHorizontal: spacing.md, marginBottom: spacing.md }}>
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

        {/* Home · My {brand} · New · Top */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={{ paddingHorizontal: spacing.screenH, gap: 8, paddingBottom: spacing.md }}>
          <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="funnel" size={18} color={colors.textPrimary} strokeWidth={1.8} />
          </View>
          {TABS.map((t) => chip(t.label(brand), tab === t.key, () => setTab(t.key)))}
        </ScrollView>

        {/* Your brand's communities — tap to open, Join to follow. */}
        {active ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={{ paddingHorizontal: spacing.screenH, gap: 10, paddingBottom: spacing.lg }}>
            {channels.map((c) => {
              const on = joined.has(c.id);
              return (
                <View key={c.id} style={{ width: 150, backgroundColor: colors.surface, borderWidth: 1, borderColor: on ? colors.primary : colors.border, borderRadius: radii.lg, padding: spacing.sm, gap: 6 }}>
                  <Tappable onPress={() => navigation.navigate('CommHonda', { title: c.name, kind: channelKind(c.name) })} accessibilityLabel={c.name} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <AvatarCircle initial={c.initial} color={c.color} size={30} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textPrimary }} numberOfLines={1}>
                        {c.name.replace(`${brand} `, '')}
                      </Text>
                      <Text style={{ fontSize: 11, color: colors.textTertiary }} numberOfLines={1}>
                        {c.members.toLocaleString()} members
                      </Text>
                    </View>
                  </Tappable>
                  <Tappable
                    onPress={() => requireAuth('joinCommunity', () => toggleJoin(c.id, c.name))}
                    accessibilityLabel={`${on ? 'Leave' : 'Join'} ${c.name}`}
                    style={{ height: 28, borderRadius: radii.pill, backgroundColor: on ? colors.primarySurface : colors.primary, alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '700', color: on ? colors.primaryDark : colors.onPrimary }}>{on ? 'Joined' : 'Join'}</Text>
                  </Tappable>
                </View>
              );
            })}
          </ScrollView>
        ) : null}

        {/* Feed */}
        <View style={{ paddingHorizontal: spacing.screenH }}>
          {tab === 'mine' ? (
            <Text style={{ fontSize: 13, color: colors.textTertiary, marginBottom: spacing.sm }}>
              {active ? `Posts from ${brand} communities and ${active.name} owners` : 'Register a car to see posts for your model'}
            </Text>
          ) : null}
          {posts.length === 0 ? (
            <Text style={{ fontSize: 14, color: colors.textTertiary, textAlign: 'center', paddingVertical: spacing.xl }}>
              {q ? `Nothing matches “${query.trim()}”` : 'No posts yet — be the first to write one.'}
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
                onCommunity={() => openCommunity(post)}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Write a post — floats bottom right, above the dock. */}
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
    </View>
  );
}
