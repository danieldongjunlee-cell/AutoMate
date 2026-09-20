import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useMemo, useState } from 'react';
import { Modal, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FeedPostCard } from '../../components/FeedPostCard';
import { GuestBanner } from '../../components/GuestBanner';
import { Icon } from '../../components/Icon';
import { Tappable } from '../../components/Tappable';
import { AvatarCircle } from '../../components/ui';
import { useActiveVehicle } from '../../hooks/useActiveVehicle';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { DOCK_HEIGHT, DOCK_INSET } from '../../navigation/Dock';
import { CommunityStackParamList } from '../../navigation/types';
import { BrandChannel, brandChannels, channelKind, FEED_BRANDS, FeedPost, homeFeed } from '../../services/mock/communityChannels';
import { useAppStore } from '../../store/useAppStore';
import { radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<CommunityStackParamList, 'CommChannels'>;

type Tab = 'home' | 'new' | 'top';

/**
 * Community (Reddit-style): a search bar on top, Home · New · Top chips, then
 * one feed of posts from every community. Registering a car makes you a member of its brand's
 * communities automatically, no joining. The funnel opens a sheet where you
 * pick which communities show in the feed. Guests see every brand's lounge.
 * The floating pencil (bottom right, above the dock) writes a post.
 */
export function CommChannelsScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const requireAuth = useRequireAuth();
  const { active, brand } = useActiveVehicle();
  const hasCar = !!active;
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<Tab>('home');
  const [upvoted, setUpvoted] = useState<Record<string, boolean>>({});
  const [filterOpen, setFilterOpen] = useState(false);
  // Communities the user has deselected in the filter (everything shows by default).
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  // Filter sheet: only posts about the user's own car model.
  const [onlyMine, setOnlyMine] = useState(false);

  // Your communities: the registered car's brand communities; guests (no car)
  // get every brand's Owners Lounge so the tab is never empty.
  const myCommunities = useMemo<BrandChannel[]>(
    () => (hasCar ? brandChannels(brand) : FEED_BRANDS.map((b) => brandChannels(b).find((c) => channelKind(c.name) === 'lounge') ?? brandChannels(b)[0])),
    [hasCar, brand],
  );
  const feedBrand = hasCar ? brand : FEED_BRANDS[0];
  const toggleHidden = (id: string) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  // The feed: every brand's communities, minus blocked authors and deselected
  // communities; the user's brand first. Tabs + search narrow and reorder it.
  const blockedAuthors = useAppStore((s) => s.blockedAuthors);
  const feed = useMemo(() => homeFeed(feedBrand).filter((p) => !blockedAuthors.includes(p.author)), [feedBrand, blockedAuthors]);
  const activeModel = (active?.name ?? '').replace(/\b(19|20)\d{2}\b/, '').trim().toLowerCase();
  const q = query.trim().toLowerCase();
  const posts = useMemo(() => {
    let list = feed.filter((p) => !hidden.has(p.community.id));
    if (onlyMine && hasCar) list = list.filter((p) => p.brand.toLowerCase() === brand.toLowerCase() || (!!activeModel && p.car.toLowerCase().includes(activeModel)));
    if (q) list = list.filter((p) => [p.body, p.author, p.community.name, p.category, p.car].some((t) => t.toLowerCase().includes(q)));
    if (tab === 'new') list = [...list].sort((a, b) => a.ageMin - b.ageMin);
    if (tab === 'top') list = [...list].sort((a, b) => b.likes + b.replies - (a.likes + a.replies));
    return list;
  }, [feed, hidden, onlyMine, hasCar, tab, q, brand, activeModel]);

  // Browsing the feed marks its posts read (drives the unread badge).
  const markPostsRead = useAppStore((s) => s.markPostsRead);
  useEffect(() => {
    markPostsRead(posts.map((p) => p.id));
  }, [posts, markPostsRead]);

  const openPost = (post: FeedPost) => navigation.navigate('CommPost', { postId: post.id, post });
  const openCommunity = (c: BrandChannel) => navigation.navigate('CommHonda', { title: c.name, kind: channelKind(c.name) });
  const write = () => requireAuth('createPost', () => navigation.navigate('CommCreate'));

  const tabs: { key: Tab; label: string }[] = [
    { key: 'home', label: 'Home' },
    { key: 'new', label: 'New' },
    { key: 'top', label: 'Top' },
  ];
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
  const hiddenCount = myCommunities.filter((c) => hidden.has(c.id)).length;
  const filterCount = hiddenCount + (onlyMine && hasCar ? 1 : 0);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: Math.max(spacing.screenTop, insets.top + spacing.lg), paddingBottom: spacing.screenBottom + 40 }} keyboardShouldPersistTaps="handled">
        <View style={{ paddingHorizontal: spacing.screenH }}>
          <GuestBanner />

          <Text style={{ fontSize: 28, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.3, marginBottom: spacing.md }}>Community</Text>

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

        {/* Filter (which communities · only my car) · Home · New · Top */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={{ paddingHorizontal: spacing.screenH, gap: 8, paddingBottom: spacing.md }}>
          <Tappable
            onPress={() => setFilterOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Filter communities"
            style={{ height: 36, minWidth: 36, paddingHorizontal: filterCount ? 10 : 0, borderRadius: 18, backgroundColor: filterCount ? colors.primarySurface : colors.inputBg, borderWidth: 1, borderColor: filterCount ? colors.primary : colors.border, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 }}
          >
            <Icon name="funnel" size={18} color={filterCount ? colors.primaryDark : colors.textPrimary} strokeWidth={1.8} />
            {filterCount ? <Text style={{ fontSize: 13, fontWeight: '700', color: colors.primaryDark }}>{filterCount}</Text> : null}
          </Tappable>
          {tabs.map((t) => chip(t.label, tab === t.key, () => setTab(t.key)))}
        </ScrollView>

        {/* Feed */}
        <View style={{ paddingHorizontal: spacing.screenH }}>
          {onlyMine && active ? (
            <Text style={{ fontSize: 13, color: colors.textTertiary, marginBottom: spacing.sm }}>{`Posts from ${brand} communities and ${active.name} owners`}</Text>
          ) : null}
          {posts.length === 0 ? (
            <Text style={{ fontSize: 14, color: colors.textTertiary, textAlign: 'center', paddingVertical: spacing.xl }}>
              {q ? `Nothing matches “${query.trim()}”` : hiddenCount ? 'Every community is hidden, pick some in the filter.' : 'No posts yet, be the first to write one.'}
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
                onCommunity={() => openCommunity(post.community)}
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

      {/* Community filter: select / deselect which communities show in the feed. */}
      <Modal visible={filterOpen} transparent animationType="slide" onRequestClose={() => setFilterOpen(false)}>
        <Tappable noFeedback onPress={() => setFilterOpen(false)} style={{ flex: 1, backgroundColor: colors.backdrop, justifyContent: 'flex-end' }}>
          <Tappable
            noFeedback
            onPress={() => undefined}
            style={{ backgroundColor: colors.sheet, borderTopLeftRadius: radii.actionSheet, borderTopRightRadius: radii.actionSheet, borderWidth: 1, borderBottomWidth: 0, borderColor: colors.border, paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: Math.max(insets.bottom, spacing.lg) + spacing.sm }}
          >
            <View style={{ width: 40, height: 5, borderRadius: 3, backgroundColor: colors.disabled, alignSelf: 'center', marginBottom: spacing.md }} />
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm }}>
              <Text style={{ fontSize: 19, fontWeight: '800', color: colors.textPrimary }}>Communities</Text>
              <Tappable
                onPress={() => {
                  setHidden(new Set());
                  setOnlyMine(false);
                }}
                hitSlop={8}
              >
                <Text style={{ fontSize: 13, fontWeight: '700', color: colors.primaryDark }}>Show all</Text>
              </Tappable>
            </View>
            <Text style={{ fontSize: 13, color: colors.textTertiary, marginBottom: spacing.md }}>
              {hasCar ? `You're a member of your ${brand}'s communities. Choose which ones show in your feed.` : 'Choose which communities show in your feed.'}
            </Text>
            {myCommunities.map((c) => {
              const on = !hidden.has(c.id);
              return (
                <Tappable
                  key={c.id}
                  onPress={() => toggleHidden(c.id)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: on }}
                  accessibilityLabel={`Show ${c.name}`}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 12 }}
                >
                  <AvatarCircle initial={c.initial} color={c.color} size={36} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textPrimary }}>{c.name}</Text>
                    <Text style={{ fontSize: 12, color: colors.textTertiary }}>{c.members.toLocaleString()} members</Text>
                  </View>
                  <View style={{ width: 24, height: 24, borderRadius: 7, borderWidth: 1.5, borderColor: on ? colors.primary : colors.border, backgroundColor: on ? colors.primary : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                    {on ? <Icon name="check" size={15} color={colors.onPrimary} strokeWidth={2.4} /> : null}
                  </View>
                </Tappable>
              );
            })}
            {hasCar && active ? (
              <Tappable
                onPress={() => setOnlyMine((v) => !v)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: onlyMine }}
                accessibilityLabel="Only posts about my car"
                style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 12, marginTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border }}
              >
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primarySurface, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="car" size={20} color={colors.primaryDark} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textPrimary }}>Only my car</Text>
                  <Text style={{ fontSize: 12, color: colors.textTertiary }}>{`Posts from ${brand} owners and about the ${active.name}`}</Text>
                </View>
                <View style={{ width: 24, height: 24, borderRadius: 7, borderWidth: 1.5, borderColor: onlyMine ? colors.primary : colors.border, backgroundColor: onlyMine ? colors.primary : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                  {onlyMine ? <Icon name="check" size={15} color={colors.onPrimary} strokeWidth={2.4} /> : null}
                </View>
              </Tappable>
            ) : null}
            <Tappable onPress={() => setFilterOpen(false)} accessibilityLabel="Apply community filter" style={{ marginTop: spacing.md, height: 50, borderRadius: radii.pill, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: colors.onPrimary }}>Show {myCommunities.length - hiddenCount} of {myCommunities.length}</Text>
            </Tappable>
          </Tappable>
        </Tappable>
      </Modal>
    </View>
  );
}
