/** Real community service (server/) — mirrors services/mock/communityService. */
import { Channel, CommunityPost, PostCategory, PostComment } from '../mock/data';
import { request } from './client';

export const communityService = {
  async getChannels() {
    return request<Channel[]>('/community/channels');
  },

  async getFeed(channelId: string): Promise<CommunityPost[]> {
    return request<CommunityPost[]>(
      `/community/feed?channelId=${encodeURIComponent(channelId || 'honda')}`,
    );
  },

  async getPost(postId: string) {
    return request<{ post: CommunityPost; comments: PostComment[] }>(
      `/community/posts/${encodeURIComponent(postId)}`,
    );
  },

  async createPost(body: string, category: PostCategory, photoCount: number) {
    return request<{ ok: boolean; pointsEarned: number }>('/community/posts', {
      body: { body, category, photoCount },
    });
  },

  async addComment(postId: string, body: string) {
    return request<{ ok: boolean }>(
      `/community/posts/${encodeURIComponent(postId)}/comments`,
      { body: { body } },
    );
  },

  async toggleLike(postId: string) {
    return request<{ liked: boolean; likes: number }>(
      `/community/posts/${encodeURIComponent(postId)}/like`,
      { method: 'POST' },
    );
  },

  async toggleCommentLike(commentId: string) {
    return request<{ liked: boolean; likes: number }>(
      `/community/comments/${encodeURIComponent(commentId)}/like`,
      { method: 'POST' },
    );
  },

  async reportPost(postId: string, reason?: string) {
    return request<{ ok: boolean }>(`/community/posts/${encodeURIComponent(postId)}/report`, {
      body: { reason },
    });
  },
};
