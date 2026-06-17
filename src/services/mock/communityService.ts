import { palette } from '../../theme';
import { EARN_RULES } from '../../config/points';
import {
  CHANNELS,
  CommunityPost,
  COMMUNITY_POSTS,
  PostCategory,
  PostComment,
  POST_COMMENTS,
  USER,
} from './data';
import { delay } from './delay';

/** In-memory feed so created posts appear immediately. */
let posts: CommunityPost[] = [...COMMUNITY_POSTS];
let nextId = 1;
/** In-memory social state so comments/likes persist within a session. */
const extraComments: Record<string, PostComment[]> = {};
const likedPosts = new Set<string>();
let nextCid = 1;

export const communityService = {
  async getChannels() {
    await delay(250);
    return CHANNELS;
  },

  async getFeed(_channelId: string): Promise<CommunityPost[]> {
    await delay(350);
    return [...posts];
  },

  async getPost(postId: string): Promise<{ post: CommunityPost; comments: PostComment[] }> {
    await delay(250);
    const base = posts.find((p) => p.id === postId) ?? posts[0];
    const liked = likedPosts.has(base.id);
    const comments = [...POST_COMMENTS, ...(extraComments[base.id] ?? [])];
    return {
      post: { ...base, likedByMe: liked, likes: base.likes + (liked ? 1 : 0), replies: comments.length },
      comments,
    };
  },

  /** Add a comment to a post (session-persistent in mock mode). */
  async addComment(postId: string, body: string): Promise<{ ok: boolean }> {
    await delay(250);
    const comment: PostComment = {
      id: `c-me-${nextCid++}`,
      author: USER.name,
      initial: USER.initial,
      color: palette.primary,
      car: '',
      likes: 0,
      body,
    };
    extraComments[postId] = [...(extraComments[postId] ?? []), comment];
    return { ok: true };
  },

  /** Toggle the current user's like on a post; returns the new state + count. */
  async toggleLike(postId: string): Promise<{ liked: boolean; likes: number }> {
    await delay(150);
    const liked = !likedPosts.has(postId);
    if (liked) likedPosts.add(postId);
    else likedPosts.delete(postId);
    const base = posts.find((p) => p.id === postId);
    return { liked, likes: (base?.likes ?? 0) + (liked ? 1 : 0) };
  },

  /** Publish a post; +50 pts, +10 with photos (wireframe s-comm-create). */
  async createPost(body: string, category: PostCategory, photoCount: number) {
    await delay(500);
    posts = [
      {
        id: `post-new-${nextId++}`,
        author: USER.name,
        initial: USER.initial,
        color: '#7F77DD',
        car: '2019 Accord EX-L',
        ago: 'Just now',
        category,
        body,
        replies: 0,
        likes: 0,
        hasPhoto: photoCount > 0,
      },
      ...posts,
    ];
    return {
      ok: true,
      pointsEarned: (EARN_RULES.communityPost +
        (photoCount > 0 ? EARN_RULES.communityPhotoBonus : 0)) as number,
    };
  },
};
