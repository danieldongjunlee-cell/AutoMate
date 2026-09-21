/**
 * Brand community generator.
 *
 * Every brand has exactly one community ("Honda Owners"); registering a car
 * makes its owner a member of that brand's community, no joining. The four
 * topic kinds below only flavour the mock posts (service, DIY, lounge, deals)
 * so a community's feed reads varied, the posts are then tagged by their
 * category (Question, Tip, ...), which is what the feed filters on.
 *
 * `brandChannels(brand)` keeps the four themed sub-feeds, with deterministic
 * (seeded) counts so nothing flickers between renders; `brandCommunity` folds
 * them into the one community the app shows.
 */

import { CommunityPost } from './data';

export interface BrandChannel {
  id: string;
  name: string;
  /** Single-letter avatar initial (brand's first character). */
  initial: string;
  /** Emoji that hints at the sub-community's topic. */
  emoji: string;
  /** Avatar background color. */
  color: string;
  members: number;
  newPosts: number;
}

/** Four sub-community archetypes every brand gets. */
const TEMPLATES: { suffix: string; emoji: string; color: string }[] = [
  { suffix: 'A/S & Service', emoji: 'wrench', color: '#2e6bff' },
  { suffix: 'Maintenance & DIY', emoji: 'wrench', color: '#16a34a' },
  { suffix: 'Owners Lounge', emoji: 'chat', color: '#f0b44e' },
  { suffix: 'Deals & Mods', emoji: 'tag', color: '#e24b4a' },
];

/** Cheap deterministic hash so counts stay constant for a given string. */
function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

/**
 * Build the active brand's sub-communities. Works for any brand name
 * ("Honda" → "Honda A/S & Service", etc.) with synthetic but stable counts.
 */
export function brandChannels(brand: string): BrandChannel[] {
  const safeBrand = brand.trim() || 'Your Car';
  const initial = safeBrand.charAt(0).toUpperCase();
  return TEMPLATES.map((tpl, index) => {
    const seed = hash(`${safeBrand}-${tpl.suffix}`);
    return {
      id: `${safeBrand.toLowerCase().replace(/\s+/g, '-')}-${index}`,
      name: `${safeBrand} ${tpl.suffix}`,
      initial,
      emoji: tpl.emoji,
      color: tpl.color,
      members: 800 + (seed % 9200),
      newPosts: seed % 40,
    };
  });
}

/** Topic kinds a sub-community feed can be themed around. */
export type ChannelKind = 'service' | 'maintenance' | 'lounge' | 'deals';

/**
 * Derive a topic kind from a sub-community title. Matches the four
 * `brandChannels` archetypes (A/S & Service, Maintenance & DIY, Owners Lounge,
 * Deals & Mods); falls back to 'lounge' for anything unrecognized.
 */
export function channelKind(title: string | undefined): ChannelKind {
  const t = (title ?? '').toLowerCase();
  if (t.includes('a/s') || t.includes('service')) return 'service';
  if (t.includes('maintenance') || t.includes('diy')) return 'maintenance';
  if (t.includes('lounge')) return 'lounge';
  if (t.includes('deals') || t.includes('mods')) return 'deals';
  return 'lounge';
}

interface PostSeed {
  author: string;
  initial: string;
  color: string;
  car: string;
  ago: string;
  category: CommunityPost['category'];
  body: string;
  replies: number;
  likes: number;
}

/** Per-kind themed templates. `{brand}` is substituted with the active brand. */
const POST_TEMPLATES: Record<ChannelKind, PostSeed[]> = {
  service: [
    {
      author: 'James K.', initial: 'J', color: '#7F77DD', car: 'A/S & Service',
      ago: '2h ago', category: 'Review',
      body: 'Booked a warranty repair at my local {brand} service center through AutoMate, they honored the claim with zero pushback and had a loaner ready. Smoothest dealer visit yet ',
      replies: 14, likes: 28,
    },
    {
      author: 'Priya N.', initial: 'P', color: '#378ADD', car: 'A/S & Service',
      ago: '6h ago', category: 'Warning',
      body: 'Heads up {brand} owners: there\'s an open recall on the fuel pump for some model years. Check your VIN, mine qualified and the fix was free at the {brand} dealer.',
      replies: 22, likes: 67,
    },
    {
      author: 'Diego R.', initial: 'D', color: '#16a34a', car: 'A/S & Service',
      ago: '1d ago', category: 'Question',
      body: 'My {brand} appointment got pushed back twice, is anyone else seeing long waits at {brand} service centers right now? Trying to figure out if I should try an independent shop.',
      replies: 11, likes: 19,
    },
    {
      author: 'Mei L.', initial: 'M', color: '#e24b4a', car: 'A/S & Service',
      ago: '2d ago', category: 'Tip',
      body: 'Pro tip: always ask the {brand} service advisor for the multi-point inspection sheet. Caught a leaking seal still under warranty that they almost let slide.',
      replies: 7, likes: 33,
    },
  ],
  maintenance: [
    {
      author: 'Sarah M.', initial: 'S', color: '#1D9E75', car: 'Maintenance & DIY',
      ago: '3h ago', category: 'DIY',
      body: 'Did my first DIY oil change on the {brand} this weekend, 30 mins, half the dealer price. The AutoMate guide had the exact filter part number, super handy ',
      replies: 18, likes: 52,
    },
    {
      author: 'Tom B.', initial: 'T', color: '#2e6bff', car: 'Maintenance & DIY',
      ago: '7h ago', category: 'Tip',
      body: 'Brake pad swap on the {brand} is easier than you\'d think. Torque the caliper bolts to spec and bed them in properly, squeal gone, saved ~$300 in labor.',
      replies: 9, likes: 40,
    },
    {
      author: 'Carla V.', initial: 'C', color: '#f0b44e', car: 'Maintenance & DIY',
      ago: '11h ago', category: 'Question',
      body: 'What tire pressure are you all running on your {brand}? The door sticker says one thing but I get better wear a couple PSI higher. Curious what works for others.',
      replies: 15, likes: 21,
    },
    {
      author: 'Owen P.', initial: 'O', color: '#7F77DD', car: 'Maintenance & DIY',
      ago: '1d ago', category: 'DIY',
      body: 'Rotated tires + swapped cabin air filter on the {brand} today. The filter was filthy, set a reminder, it makes a real difference for AC smell.',
      replies: 6, likes: 27,
    },
  ],
  lounge: [
    {
      author: 'Alex T.', initial: 'A', color: '#e24b4a', car: 'Owners Lounge',
      ago: '1h ago', category: 'Review',
      body: 'Just hit 100k miles on my {brand} and it still drives like new. Best car I\'ve owned. Anyone else here long-haul with theirs? ',
      replies: 31, likes: 88,
    },
    {
      author: 'Nina H.', initial: 'N', color: '#16a34a', car: 'Owners Lounge',
      ago: '4h ago', category: 'Tip',
      body: 'Took the {brand} on a 600-mile road trip and the fuel economy blew me away. Photos from the coast attached, what a machine ',
      replies: 12, likes: 45,
    },
    {
      author: 'Raj P.', initial: 'R', color: '#378ADD', car: 'Owners Lounge',
      ago: '9h ago', category: 'Question',
      body: 'New {brand} owner here What\'s the one thing you wish you knew when you first got yours? Trying to learn from the veterans in the lounge.',
      replies: 27, likes: 36,
    },
    {
      author: 'Lena F.', initial: 'L', color: '#f0b44e', car: 'Owners Lounge',
      ago: '1d ago', category: 'Review',
      body: 'Cleaned and detailed the {brand} this weekend and she\'s gleaming. Love this community, you all make ownership way more fun ',
      replies: 8, likes: 29,
    },
  ],
  deals: [
    {
      author: 'Chris D.', initial: 'C', color: '#2e6bff', car: 'Deals & Mods',
      ago: '2h ago', category: 'Tip',
      body: 'Scored OEM all-weather floor mats for my {brand} at 40% off, link in the thread. Best accessory deal I\'ve seen this year ',
      replies: 19, likes: 61,
    },
    {
      author: 'Bianca S.', initial: 'B', color: '#e24b4a', car: 'Deals & Mods',
      ago: '5h ago', category: 'Review',
      body: 'Installed a cat-back exhaust on the {brand}, sounds incredible and was a bolt-on job. Mod totally transformed the drive. Highly recommend ',
      replies: 14, likes: 48,
    },
    {
      author: 'Kev M.', initial: 'K', color: '#16a34a', car: 'Deals & Mods',
      ago: '10h ago', category: 'Quotes',
      body: 'Found a discount code stacking with the spring sale on {brand} accessories, got a roof rack + crossbars for under $200 shipped. Sharing before it expires!',
      replies: 23, likes: 70,
    },
    {
      author: 'Hana K.', initial: 'H', color: '#f0b44e', car: 'Deals & Mods',
      ago: '1d ago', category: 'Question',
      body: 'Looking to upgrade the wheels on my {brand}, any trusted shops or group-buy deals you\'d recommend? Want to mod without overpaying.',
      replies: 17, likes: 25,
    },
  ],
};

/**
 * Build a small themed feed for a given brand + topic kind. Returns ready-to-use
 * `CommunityPost` objects with the active brand woven into each body.
 */
export const CHANNEL_KINDS: ChannelKind[] = ['service', 'maintenance', 'lounge', 'deals'];

export function groupPosts(brand: string, kind: ChannelKind): CommunityPost[] {
  const safeBrand = brand.trim() || 'Your Car';
  return POST_TEMPLATES[kind].map((seed, index) => ({
    id: `${kind}-${index}`,
    author: seed.author,
    initial: seed.initial,
    color: seed.color,
    car: `${safeBrand} ${seed.car}`,
    ago: seed.ago,
    category: seed.category,
    body: seed.body.replace(/\{brand\}/g, safeBrand),
    replies: seed.replies,
    likes: seed.likes,
  }));
}

/** Brands with active communities, what a guest with no car browses. */
export const FEED_BRANDS = ['Honda', 'Toyota', 'Kia', 'Ford', 'BMW'];

/** The one community a brand has. */
export interface BrandCommunity {
  id: string;
  brand: string;
  name: string;
  members: number;
  newPosts: number;
}

export function brandCommunity(brand: string): BrandCommunity {
  const safeBrand = brand.trim() || 'Your Car';
  const parts = brandChannels(safeBrand);
  return {
    id: safeBrand.toLowerCase().replace(/\s+/g, '-'),
    brand: safeBrand,
    name: `${safeBrand} Owners`,
    members: parts.reduce((n, c) => n + c.members, 0),
    newPosts: parts.reduce((n, c) => n + c.newPosts, 0),
  };
}

/** A feed post plus the community it was posted in. */
export interface FeedPost extends CommunityPost {
  community: BrandCommunity;
  brand: string;
  /** Deterministic "minutes ago" for New sorting. */
  ageMin: number;
}

const AGE_MIN: Record<string, number> = { '1h ago': 60, '2h ago': 120, '3h ago': 180, '4h ago': 240, '5h ago': 300, '6h ago': 360, '7h ago': 420, '9h ago': 540, '10h ago': 600, '11h ago': 660, '1d ago': 1440, '2d ago': 2880 };

/**
 * Every post in a brand's community: the four themed sub-feeds folded into
 * one, ids made unique per brand so the read-state and the badge agree.
 */
export function brandPosts(brand: string): FeedPost[] {
  const community = brandCommunity(brand);
  return CHANNEL_KINDS.flatMap((kind, ki) =>
    groupPosts(community.brand, kind).map((post, i) => ({
      ...post,
      id: `${community.id}-${post.id}`,
      community,
      brand: community.brand,
      ageMin: (AGE_MIN[post.ago] ?? 720) + ki * 3 + i,
      hasPhoto: hash(`${community.brand}-${kind}-${i}`) % 3 === 0,
    })),
  );
}

/** The feed for a set of brands (the user's cars, or every brand for a guest), newest first. */
export function communityFeed(brands: string[]): FeedPost[] {
  const seen = new Set<string>();
  return brands
    .filter((b) => {
      const key = b.trim().toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .flatMap(brandPosts)
    .sort((a, b) => a.ageMin - b.ageMin);
}
