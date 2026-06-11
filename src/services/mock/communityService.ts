import {
  CHANNELS,
  CommunityPost,
  COMMUNITY_POSTS,
  PostCategory,
  POST_COMMENTS,
  USER,
} from './data';
import { delay } from './delay';

/** In-memory feed so created posts appear immediately. */
let posts: CommunityPost[] = [...COMMUNITY_POSTS];
let nextId = 1;

export const communityService = {
  async getChannels() {
    await delay(250);
    return CHANNELS;
  },

  async getFeed(_channelId: string): Promise<CommunityPost[]> {
    await delay(350);
    return [...posts];
  },

  async getPost(postId: string) {
    await delay(250);
    const post = posts.find((p) => p.id === postId) ?? posts[0];
    return { post, comments: POST_COMMENTS };
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
    return { ok: true, pointsEarned: 50 + (photoCount > 0 ? 10 : 0) };
  },
};
