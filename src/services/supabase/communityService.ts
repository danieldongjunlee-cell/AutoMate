import { EARN_RULES } from '../../config/points';
import { supabase } from '../../lib/supabase';
import { useAppStore } from '../../store/useAppStore';
import {
  CommunityPost,
  PostCategory,
  PostComment,
} from '../mock/data';
import { communityService as mockCommunityService } from '../mock/communityService';

interface Row {
  id: string;
  author: string | null;
  car: string | null;
  category: string | null;
  body: string;
  has_photo: boolean | null;
  created_at: string;
}

interface CommentRow {
  id: string;
  author: string | null;
  body: string;
  created_at: string;
}

const COLS = 'id, author, car, category, body, has_photo, created_at';

const AVATAR_COLORS = ['#7F77DD', '#1e4fcc', '#16a34a', '#E24B4A', '#0F6E56', '#534AB7'];

function colorFor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function timeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const toPost = (r: Row): CommunityPost => {
  const author = r.author?.trim() || 'You';
  return {
    id: r.id,
    author,
    initial: author.charAt(0).toUpperCase(),
    color: colorFor(author + r.id),
    car: r.car ?? '',
    ago: timeAgo(r.created_at),
    category: (r.category as PostCategory) ?? 'Tip',
    body: r.body,
    replies: 0,
    likes: 0,
    likedByMe: false,
    hasPhoto: r.has_photo ?? false,
  };
};

const toComment = (r: CommentRow): PostComment => {
  const author = r.author?.trim() || 'You';
  return {
    id: r.id,
    author,
    initial: author.charAt(0).toUpperCase(),
    color: colorFor(author + r.id),
    car: '',
    likes: 0,
    body: r.body,
  };
};

function client() {
  if (!supabase) throw new Error('Supabase is not configured.');
  return supabase;
}

async function currentUserId(): Promise<string | undefined> {
  return (await client().auth.getUser()).data.user?.id;
}

/** Supabase-backed twin of the mock communityService (shared feed + social). */
export const communityService: typeof mockCommunityService = {
  getChannels: mockCommunityService.getChannels,

  async getFeed(_channelId: string): Promise<CommunityPost[]> {
    const c = client();
    const [postsRes, likesRes, commentsRes, userRes] = await Promise.all([
      c.from('posts').select(COLS).order('created_at', { ascending: false }),
      c.from('post_likes').select('post_id, user_id'),
      c.from('comments').select('post_id'),
      c.auth.getUser(),
    ]);
    if (postsRes.error) throw postsRes.error;
    const myId = userRes.data.user?.id;
    const likeCount: Record<string, number> = {};
    const mine = new Set<string>();
    for (const l of (likesRes.data ?? []) as { post_id: string; user_id: string }[]) {
      likeCount[l.post_id] = (likeCount[l.post_id] ?? 0) + 1;
      if (l.user_id === myId) mine.add(l.post_id);
    }
    const replyCount: Record<string, number> = {};
    for (const cm of (commentsRes.data ?? []) as { post_id: string }[]) {
      replyCount[cm.post_id] = (replyCount[cm.post_id] ?? 0) + 1;
    }
    return (postsRes.data as Row[]).map((r) => ({
      ...toPost(r),
      likes: likeCount[r.id] ?? 0,
      likedByMe: mine.has(r.id),
      replies: replyCount[r.id] ?? 0,
    }));
  },

  async getPost(postId: string): Promise<{ post: CommunityPost; comments: PostComment[] }> {
    const c = client();
    const { data: postRow, error } = await c.from('posts').select(COLS).eq('id', postId).maybeSingle();
    if (error) throw error;
    if (!postRow) {
      return { post: (await this.getFeed(''))[0], comments: [] };
    }
    const uid = await currentUserId();
    const [likeCountRes, mineRes, commentsRes] = await Promise.all([
      c.from('post_likes').select('*', { count: 'exact', head: true }).eq('post_id', postId),
      c.from('post_likes').select('id').eq('post_id', postId).eq('user_id', uid ?? '').maybeSingle(),
      c.from('comments').select('id, author, body, created_at').eq('post_id', postId).order('created_at', { ascending: true }),
    ]);
    const commentRows = (commentsRes.data ?? []) as CommentRow[];
    // Real like counts + my-like flag for each comment.
    const cLikeCount: Record<string, number> = {};
    const cMine = new Set<string>();
    if (commentRows.length) {
      const { data: cLikes } = await c
        .from('comment_likes')
        .select('comment_id, user_id')
        .in('comment_id', commentRows.map((r) => r.id));
      for (const l of (cLikes ?? []) as { comment_id: string; user_id: string }[]) {
        cLikeCount[l.comment_id] = (cLikeCount[l.comment_id] ?? 0) + 1;
        if (l.user_id === uid) cMine.add(l.comment_id);
      }
    }
    const comments = commentRows.map((r) => ({
      ...toComment(r),
      likes: cLikeCount[r.id] ?? 0,
      likedByMe: cMine.has(r.id),
    }));
    return {
      post: {
        ...toPost(postRow as Row),
        likes: likeCountRes.count ?? 0,
        likedByMe: !!mineRes.data,
        replies: comments.length,
      },
      comments,
    };
  },

  async createPost(body: string, category: PostCategory, photoCount: number) {
    const author = useAppStore.getState().user?.name ?? 'You';
    const { error } = await client()
      .from('posts')
      .insert({ author, car: '', category, body, has_photo: photoCount > 0 });
    if (error) throw error;
    return {
      ok: true,
      pointsEarned: (EARN_RULES.communityPost +
        (photoCount > 0 ? EARN_RULES.communityPhotoBonus : 0)) as number,
    };
  },

  async addComment(postId: string, body: string): Promise<{ ok: boolean }> {
    const author = useAppStore.getState().user?.name ?? 'You';
    const { error } = await client().from('comments').insert({ post_id: postId, author, body });
    if (error) throw error;
    return { ok: true };
  },

  async toggleLike(postId: string): Promise<{ liked: boolean; likes: number }> {
    const c = client();
    const uid = await currentUserId();
    const { data: existing } = await c
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', uid ?? '')
      .maybeSingle();
    let liked: boolean;
    if (existing) {
      await c.from('post_likes').delete().eq('id', (existing as { id: string }).id);
      liked = false;
    } else {
      await c.from('post_likes').insert({ post_id: postId });
      liked = true;
    }
    const { count } = await c.from('post_likes').select('*', { count: 'exact', head: true }).eq('post_id', postId);
    return { liked, likes: count ?? 0 };
  },

  async toggleCommentLike(commentId: string): Promise<{ liked: boolean; likes: number }> {
    const c = client();
    const uid = await currentUserId();
    const { data: existing } = await c
      .from('comment_likes')
      .select('id')
      .eq('comment_id', commentId)
      .eq('user_id', uid ?? '')
      .maybeSingle();
    let liked: boolean;
    if (existing) {
      await c.from('comment_likes').delete().eq('id', (existing as { id: string }).id);
      liked = false;
    } else {
      await c.from('comment_likes').insert({ comment_id: commentId });
      liked = true;
    }
    const { count } = await c
      .from('comment_likes')
      .select('*', { count: 'exact', head: true })
      .eq('comment_id', commentId);
    return { liked, likes: count ?? 0 };
  },
};
