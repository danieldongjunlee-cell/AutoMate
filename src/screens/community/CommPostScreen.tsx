import { RouteProp, useRoute } from '@react-navigation/native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { Share, StyleSheet, Text, TextInput, View } from 'react-native';

import { Tappable } from '../../components/Tappable';

import { CategoryBadge } from '../../components/PostCard';
import { SkeletonCard, SkeletonList } from '../../components/Skeleton';
import { AvatarCircle, Screen, SectionLabel } from '../../components/ui';
import { CommunityStackParamList } from '../../navigation/types';
import { communityService } from '../../services';
import { USER } from '../../services/mock/data';
import { useAppStore } from '../../store/useAppStore';
import { palette, radii, spacing, useTheme } from '../../theme';

/** Wireframe s-comm-post: post detail + comments + composer. */
export function CommPostScreen() {
  const route = useRoute<RouteProp<CommunityStackParamList, 'CommPost'>>();
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  const postId = route.params?.postId ?? 'post-james';
  const { data } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => communityService.getPost(postId),
  });

  // Post like: persisted via the service; seeded from the loaded post.
  const [postLiked, setPostLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  // Comment likes: per-comment overrides ({liked,count}) layered over server data.
  const [commentLikes, setCommentLikes] = useState<Record<string, { liked: boolean; count: number }>>({});
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const composerRef = useRef<TextInput>(null);

  // Prefer the post handed over by the feed so the screen renders instantly
  // (the feed is mock-generated; its ids aren't real Supabase rows).
  const post = route.params?.post ?? data?.post;
  const comments = data?.comments ?? [];
  const markPostsRead = useAppStore((s) => s.markPostsRead);
  useEffect(() => markPostsRead([postId]), [postId, markPostsRead]);

  // Sync the like button with the post (real likedByMe + count).
  useEffect(() => {
    if (post) {
      setPostLiked(!!post.likedByMe);
      setLikeCount(post.likes);
    }
  }, [post]);

  if (!post) {
    return (
      <Screen>
        <SkeletonCard tall />
        <SectionLabel style={{ marginTop: spacing.sm }}>Comments</SectionLabel>
        <SkeletonList variant="row" count={3} />
      </Screen>
    );
  }
  const allComments = comments;
  const replyCount = comments.length;

  const toggleCommentLike = async (c: { id: string; likes: number; likedByMe?: boolean }) => {
    const cur = commentLikes[c.id] ?? { liked: !!c.likedByMe, count: c.likes };
    // Optimistic flip, then reconcile with the persisted count.
    setCommentLikes((m) => ({
      ...m,
      [c.id]: { liked: !cur.liked, count: cur.count + (cur.liked ? -1 : 1) },
    }));
    try {
      const res = await communityService.toggleCommentLike(c.id);
      setCommentLikes((m) => ({ ...m, [c.id]: { liked: res.liked, count: res.likes } }));
    } catch {
      setCommentLikes((m) => ({ ...m, [c.id]: cur }));
    }
  };

  const togglePostLike = async () => {
    // Optimistic flip, then reconcile with the persisted count.
    setPostLiked((l) => !l);
    setLikeCount((n) => n + (postLiked ? -1 : 1));
    try {
      const res = await communityService.toggleLike(postId);
      setPostLiked(res.liked);
      setLikeCount(res.likes);
    } catch {
      // revert on failure
      setPostLiked((l) => !l);
    }
  };

  const startReply = (author: string) => {
    setDraft((d) => (d.startsWith(`@${author}`) ? d : `@${author} ${d}`));
    composerRef.current?.focus();
  };

  const sendComment = async () => {
    const body = draft.trim();
    if (!body || sending) {
      composerRef.current?.focus();
      return;
    }
    setSending(true);
    setDraft('');
    try {
      await communityService.addComment(postId, body);
      await queryClient.invalidateQueries({ queryKey: ['post', postId] });
    } finally {
      setSending(false);
    }
  };

  const sharePost = () =>
    Share.share({ message: `${post.author} on AutoMate: "${post.body}"` }).catch(() => {});

  return (
    <Screen>
      {/* Post */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: radii.md,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          padding: spacing.md,
          marginBottom: spacing.md,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
          <AvatarCircle initial={post.initial} color={post.color} size={34} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary }}>
              {post.author}
            </Text>
            <Text style={{ fontSize: 13, color: colors.textTertiary }}>
              {post.car} · Honda Owners · {post.ago}
            </Text>
          </View>
          <CategoryBadge category={post.category} />
        </View>
        <Text style={{ fontSize: 14, color: colors.textPrimary, lineHeight: 22, marginBottom: spacing.sm }}>
          {post.body}
        </Text>
        {post.hasPhoto ? (
          <LinearGradient
            colors={[palette.navy, '#1B3A5C']}
            style={{
              borderRadius: radii.sm,
              height: 84,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: spacing.sm,
            }}
          >
            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,.4)' }}>📸 Photo attached</Text>
          </LinearGradient>
        ) : null}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.md,
            paddingTop: spacing.sm,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: colors.divider,
          }}
        >
          <Tappable onPress={togglePostLike} hitSlop={6}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: postLiked ? '700' : '400',
                color: postLiked ? colors.danger : colors.textTertiary,
              }}
            >
              {postLiked ? '❤️' : '🤍'} {likeCount}
            </Text>
          </Tappable>
          <Text style={{ fontSize: 14, fontWeight: '500', color: colors.primary }}>
            💬 {replyCount} replies
          </Text>
          <View style={{ flex: 1 }} />
          <Tappable onPress={sharePost} hitSlop={6}>
            <Text style={{ fontSize: 14, color: colors.textTertiary }}>Share</Text>
          </Tappable>
        </View>
      </View>

      <SectionLabel>{replyCount} Comments</SectionLabel>
      {allComments.map((c) => {
        const cl = commentLikes[c.id] ?? { liked: !!c.likedByMe, count: c.likes };
        const liked = cl.liked;
        return (
          <View
            key={c.id}
            style={{
              backgroundColor: colors.surface,
              borderRadius: radii.sm,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: colors.divider,
              padding: spacing.sm,
              marginBottom: spacing.xs,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: 4 }}>
              <AvatarCircle initial={c.initial} color={c.color} size={28} />
              <Text style={{ flex: 1, fontSize: 14 }}>
                <Text style={{ fontWeight: '600', color: colors.textPrimary }}>{c.author}</Text>
                <Text style={{ color: colors.textTertiary }}> {c.car}</Text>
              </Text>
              <Tappable onPress={() => toggleCommentLike(c)} hitSlop={6}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: liked ? '700' : '400',
                    color: liked ? colors.danger : colors.textTertiary,
                  }}
                >
                  {liked ? '❤️' : '🤍'} {cl.count}
                </Text>
              </Tappable>
            </View>
            <Text
              style={{ fontSize: 14, color: colors.textPrimary, lineHeight: 19, marginLeft: 36 }}
            >
              {c.body}
            </Text>
            <Tappable
              onPress={() => startReply(c.author)}
              style={{ marginLeft: 36, marginTop: 4 }}
              hitSlop={6}
            >
              <Text style={{ fontSize: 13, color: colors.primary }}>Reply</Text>
            </Tappable>
          </View>
        );
      })}

      {/* Composer */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          backgroundColor: colors.surface,
          borderRadius: radii.pill,
          borderWidth: 1,
          borderColor: colors.border,
          paddingHorizontal: spacing.sm,
          paddingVertical: 8,
          marginTop: spacing.sm,
        }}
      >
        <AvatarCircle initial={USER.initial} color={colors.primary} size={28} />
        <TextInput
          ref={composerRef}
          value={draft}
          onChangeText={setDraft}
          placeholder="Write a comment..."
          placeholderTextColor={colors.textPlaceholder}
          onSubmitEditing={sendComment}
          returnKeyType="send"
          style={{ flex: 1, fontSize: 14, color: colors.textPrimary, paddingVertical: 0 }}
        />
        <Tappable onPress={sendComment} hitSlop={8} disabled={sending}>
          <Text style={{ fontSize: 18, color: draft.trim() && !sending ? colors.primary : colors.disabled }}>
            ➤
          </Text>
        </Tappable>
      </View>
    </Screen>
  );
}
