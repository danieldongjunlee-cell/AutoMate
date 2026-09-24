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
      body: 'Took my {brand} to the AutoMate-quoted dealer for a rear bumper repair. They matched the quote to the dollar, showed me the damaged bracket before fixing it and had the car washed at pickup. That is how you treat a customer.',
      replies: 14, likes: 28,
    },
    {
      author: 'Priya N.', initial: 'P', color: '#378ADD', car: 'A/S & Service',
      ago: '6h ago', category: 'Warning',
      body: 'Heads up {brand} owners: one shop I tried added a $90 \'shop supplies\' fee that was not on the quote and got annoyed when I asked about it. Walked out. Ask for the out-the-door price before they start.',
      replies: 22, likes: 67,
    },
    {
      author: 'Diego R.', initial: 'D', color: '#16a34a', car: 'A/S & Service',
      ago: '1d ago', category: 'Question',
      body: 'Any body shops near Fairfax you trust with a {brand}? My last one kept the car three days longer than promised and never called once. Looking for somewhere that actually communicates.',
      replies: 11, likes: 19,
    },
    {
      author: 'Mei L.', initial: 'M', color: '#e24b4a', car: 'A/S & Service',
      ago: '2d ago', category: 'Review',
      body: 'Shout out to the service advisor at my {brand} dealer: texted photos of the worn pads, explained what could wait and what could not, and never pushed the extras. Booking there again.',
      replies: 7, likes: 33,
    },
  ],
  maintenance: [
    {
      author: 'Sarah M.', initial: 'S', color: '#1D9E75', car: 'Maintenance & DIY',
      ago: '3h ago', category: 'Review',
      body: 'Quick oil change on the {brand} at an independent shop through AutoMate. In and out in 35 minutes, the tech walked me through the inspection sheet and even reset the service light. Friendly crew, fair price.',
      replies: 18, likes: 52,
    },
    {
      author: 'Tom B.', initial: 'T', color: '#2e6bff', car: 'Maintenance & DIY',
      ago: '7h ago', category: 'Tip',
      body: 'Tip from a bad experience: a shop told me my {brand} needed a $600 brake job. Got a second quote on AutoMate and the next shop said the pads had 40% left. Always compare before you say yes.',
      replies: 9, likes: 40,
    },
    {
      author: 'Carla V.', initial: 'C', color: '#f0b44e', car: 'Maintenance & DIY',
      ago: '11h ago', category: 'Question',
      body: 'How long should a tire rotation on a {brand} take? The shop had my car two hours for a 30-minute job and blamed a backlog they never mentioned when I booked. Is that normal?',
      replies: 15, likes: 21,
    },
    {
      author: 'Owen P.', initial: 'O', color: '#7F77DD', car: 'Maintenance & DIY',
      ago: '1d ago', category: 'Review',
      body: 'The body shop that did my {brand} fender sent progress photos every day, finished early and the paint match is perfect. Staff were polite from drop-off to pickup. Five stars.',
      replies: 6, likes: 27,
    },
  ],
  lounge: [
    {
      author: 'Alex T.', initial: 'A', color: '#e24b4a', car: 'Owners Lounge',
      ago: '1h ago', category: 'Review',
      body: 'Two years of servicing my {brand} at the same shop and they still remember my name and the car\'s history. Never an upsell, always straight answers. Worth driving a bit further for.',
      replies: 31, likes: 88,
    },
    {
      author: 'Nina H.', initial: 'N', color: '#16a34a', car: 'Owners Lounge',
      ago: '4h ago', category: 'Warning',
      body: 'Careful with walk-in quick-lube places: mine overfilled the oil on my {brand} and argued when I pointed it out. The shop I booked on AutoMate fixed it for free and apologised for the other place.',
      replies: 12, likes: 45,
    },
    {
      author: 'Raj P.', initial: 'R', color: '#378ADD', car: 'Owners Lounge',
      ago: '9h ago', category: 'Question',
      body: 'New {brand} owner here. What made you stick with your body shop? Trying to find one that is honest about what needs fixing and treats first-timers with patience.',
      replies: 27, likes: 36,
    },
    {
      author: 'Lena F.', initial: 'L', color: '#f0b44e', car: 'Owners Lounge',
      ago: '1d ago', category: 'Review',
      body: 'Had a dent repaired on my {brand} and the shop owner came out to show me the before and after himself. Honest price, loaner ready, and they followed up a week later. Rare service these days.',
      replies: 8, likes: 29,
    },
  ],
  deals: [
    {
      author: 'Chris D.', initial: 'C', color: '#2e6bff', car: 'Deals & Mods',
      ago: '2h ago', category: 'Tip',
      body: 'The partner shop gave me the AutoMate bundle price without me having to ask, then pointed out a coupon I did not know about for my {brand}\'s next oil change. Honest shops do exist.',
      replies: 19, likes: 61,
    },
    {
      author: 'Bianca S.', initial: 'B', color: '#e24b4a', car: 'Deals & Mods',
      ago: '5h ago', category: 'Review',
      body: 'Booked a {brand} paint touch-up at a shop running an AutoMate deal. Expected a rushed job for the discount, got careful work and a free wash. They treated me like a full-price customer.',
      replies: 14, likes: 48,
    },
    {
      author: 'Kev M.', initial: 'K', color: '#16a34a', car: 'Deals & Mods',
      ago: '10h ago', category: 'Warning',
      body: 'Watch out for shops that advertise a cheap {brand} brake special and then insist on rotors every time. Mine tried it; the second shop measured them and they were fine. Get it in writing.',
      replies: 23, likes: 70,
    },
    {
      author: 'Hana K.', initial: 'H', color: '#f0b44e', car: 'Deals & Mods',
      ago: '1d ago', category: 'Question',
      body: 'Which shops near you honour the AutoMate quote without surprises on your {brand}? Mine did, but a friend\'s added labour at the counter. Want to know who to recommend.',
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
