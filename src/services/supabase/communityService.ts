import { EARN_RULES } from '../../config/points';
import { supabase } from '../../lib/supabase';
import { useAppStore } from '../../store/useAppStore';
import {
  CommunityPost,
  PostCategory,
  POST_COMMENTS,
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
    hasPhoto: r.has_photo ?? false,
  };
};

function client() {
  if (!supabase) throw new Error('Supabase is not configured.');
  return supabase;
}

/** Supabase-backed twin of the mock communityService (shared feed). */
export const communityService: typeof mockCommunityService = {
  // Channels are static config — reuse the mock.
  getChannels: mockCommunityService.getChannels,

  async getFeed(_channelId: string): Promise<CommunityPost[]> {
    const { data, error } = await client()
      .from('posts')
      .select(COLS)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as Row[]).map(toPost);
  },

  async getPost(postId: string) {
    const { data, error } = await client().from('posts').select(COLS).eq('id', postId).maybeSingle();
    if (error) throw error;
    const row = data as Row | null;
    // Comments aren't migrated yet — show the demo thread under the real post.
    return { post: row ? toPost(row) : (await this.getFeed(''))[0], comments: POST_COMMENTS };
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
};
