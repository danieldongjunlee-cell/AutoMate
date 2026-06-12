import { Router } from 'express';

import { EARN_RULES } from '../config';
import { awardPoints, prisma } from '../db';
import { agoLabel, CHANNELS } from '../staticData';

export const communityRouter = Router();

const toApiPost = (p: {
  id: string;
  authorName: string;
  initial: string;
  color: string;
  car: string;
  agoLabel: string | null;
  createdAt: Date;
  category: string;
  body: string;
  replies: number;
  likes: number;
  hasPhoto: boolean;
}) => ({
  id: p.id,
  author: p.authorName,
  initial: p.initial,
  color: p.color,
  car: p.car,
  ago: p.agoLabel ?? agoLabel(p.createdAt),
  category: p.category,
  body: p.body,
  replies: p.replies,
  likes: p.likes,
  ...(p.hasPhoto ? { hasPhoto: true } : {}),
});

// GET /community/channels
communityRouter.get('/channels', async (_req, res) => {
  return res.json(CHANNELS);
});

// GET /community/feed?channelId=honda
communityRouter.get('/feed', async (req, res) => {
  const channelId = String(req.query.channelId ?? 'honda');
  const posts = await prisma.communityPost.findMany({
    where: { channelId },
    orderBy: { createdAt: 'desc' },
  });
  return res.json(posts.map(toApiPost));
});

// GET /community/posts/:id → { post, comments }
communityRouter.get('/posts/:id', async (req, res) => {
  const post = await prisma.communityPost.findUnique({
    where: { id: req.params.id },
    include: { comments: { orderBy: { createdAt: 'asc' } } },
  });
  if (!post) return res.status(404).json({ error: 'Post not found' });
  return res.json({
    post: toApiPost(post),
    comments: post.comments.map((c) => ({
      id: c.id,
      author: c.authorName,
      initial: c.initial,
      color: c.color,
      car: c.car,
      likes: c.likes,
      body: c.body,
    })),
  });
});

// POST /community/posts { body, category, photoCount, channelId? } (+50 pts, +10 with photo)
communityRouter.post('/posts', async (req, res) => {
  const { body, category, photoCount, channelId } = req.body ?? {};
  if (!body || !category) return res.status(400).json({ error: 'body and category are required' });

  const vehicle = await prisma.vehicle.findFirst({
    where: { userId: req.user!.id },
    orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
  });
  await prisma.communityPost.create({
    data: {
      channelId: String(channelId ?? 'honda'),
      authorId: req.user!.id,
      authorName: req.user!.name,
      initial: req.user!.name.trim().charAt(0).toUpperCase() || 'U',
      color: '#7F77DD',
      car: vehicle?.name.replace(/^\d{4}\s/, (y) => y) ?? 'AutoMate member',
      category: String(category),
      body: String(body),
      hasPhoto: Number(photoCount ?? 0) > 0,
    },
  });
  const pointsEarned =
    EARN_RULES.communityPost + (Number(photoCount ?? 0) > 0 ? EARN_RULES.communityPhotoBonus : 0);
  await awardPoints(req.user!.id, pointsEarned, 'Post in community');
  return res.json({ ok: true, pointsEarned });
});
