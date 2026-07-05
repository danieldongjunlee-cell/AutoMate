/**
 * Brand-scoped community generator.
 *
 * The Community tab shows communities only for the user's active car brand.
 * `brandChannels(brand)` synthesizes four sub-communities for ANY brand name,
 * with deterministic (seeded) member/post counts so the list is stable per
 * brand instead of flickering on every render.
 *
 * `channelKind(title)` maps a sub-community title to a topic kind, and
 * `groupPosts(brand, kind)` generates a themed, brand-flavored mock feed so
 * each group's detail screen reads on-topic instead of a generic feed.
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
  { suffix: 'A/S & Service', emoji: '🔧', color: '#2e6bff' },
  { suffix: 'Maintenance & DIY', emoji: '🛠️', color: '#16a34a' },
  { suffix: 'Owners Lounge', emoji: '💬', color: '#f0b44e' },
  { suffix: 'Deals & Mods', emoji: '🏷️', color: '#e24b4a' },
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
      body: 'Booked a warranty repair at my local {brand} service center through AutoMate — they honored the claim with zero pushback and had a loaner ready. Smoothest dealer visit yet 👍',
      replies: 14, likes: 28,
    },
    {
      author: 'Priya N.', initial: 'P', color: '#378ADD', car: 'A/S & Service',
      ago: '6h ago', category: 'Warning',
      body: 'Heads up {brand} owners: there\'s an open recall on the fuel pump for some model years. Check your VIN — mine qualified and the fix was free at the {brand} dealer.',
      replies: 22, likes: 67,
    },
    {
      author: 'Diego R.', initial: 'D', color: '#16a34a', car: 'A/S & Service',
      ago: '1d ago', category: 'Question',
      body: 'My {brand} appointment got pushed back twice — is anyone else seeing long waits at {brand} service centers right now? Trying to figure out if I should try an independent shop.',
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
      body: 'Did my first DIY oil change on the {brand} this weekend — 30 mins, half the dealer price. The AutoMate guide had the exact filter part number, super handy 🛠️',
      replies: 18, likes: 52,
    },
    {
      author: 'Tom B.', initial: 'T', color: '#2e6bff', car: 'Maintenance & DIY',
      ago: '7h ago', category: 'Tip',
      body: 'Brake pad swap on the {brand} is easier than you\'d think. Torque the caliper bolts to spec and bed them in properly — squeal gone, saved ~$300 in labor.',
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
      body: 'Rotated tires + swapped cabin air filter on the {brand} today. The filter was filthy 😷 — set a reminder, it makes a real difference for AC smell.',
      replies: 6, likes: 27,
    },
  ],
  lounge: [
    {
      author: 'Alex T.', initial: 'A', color: '#e24b4a', car: 'Owners Lounge',
      ago: '1h ago', category: 'Review',
      body: 'Just hit 100k miles on my {brand} and it still drives like new. Best car I\'ve owned. Anyone else here long-haul with theirs? 🚗',
      replies: 31, likes: 88,
    },
    {
      author: 'Nina H.', initial: 'N', color: '#16a34a', car: 'Owners Lounge',
      ago: '4h ago', category: 'Tip',
      body: 'Took the {brand} on a 600-mile road trip and the fuel economy blew me away. Photos from the coast attached — what a machine 📸',
      replies: 12, likes: 45,
    },
    {
      author: 'Raj P.', initial: 'R', color: '#378ADD', car: 'Owners Lounge',
      ago: '9h ago', category: 'Question',
      body: 'New {brand} owner here 👋 What\'s the one thing you wish you knew when you first got yours? Trying to learn from the veterans in the lounge.',
      replies: 27, likes: 36,
    },
    {
      author: 'Lena F.', initial: 'L', color: '#f0b44e', car: 'Owners Lounge',
      ago: '1d ago', category: 'Review',
      body: 'Cleaned and detailed the {brand} this weekend and she\'s gleaming. Love this community — you all make ownership way more fun ❤️',
      replies: 8, likes: 29,
    },
  ],
  deals: [
    {
      author: 'Chris D.', initial: 'C', color: '#2e6bff', car: 'Deals & Mods',
      ago: '2h ago', category: 'Tip',
      body: 'Scored OEM all-weather floor mats for my {brand} at 40% off — link in the thread. Best accessory deal I\'ve seen this year 🏷️',
      replies: 19, likes: 61,
    },
    {
      author: 'Bianca S.', initial: 'B', color: '#e24b4a', car: 'Deals & Mods',
      ago: '5h ago', category: 'Review',
      body: 'Installed a cat-back exhaust on the {brand} — sounds incredible and was a bolt-on job. Mod totally transformed the drive. Highly recommend 🔧',
      replies: 14, likes: 48,
    },
    {
      author: 'Kev M.', initial: 'K', color: '#16a34a', car: 'Deals & Mods',
      ago: '10h ago', category: 'Quotes',
      body: 'Found a discount code stacking with the spring sale on {brand} accessories — got a roof rack + crossbars for under $200 shipped. Sharing before it expires!',
      replies: 23, likes: 70,
    },
    {
      author: 'Hana K.', initial: 'H', color: '#f0b44e', car: 'Deals & Mods',
      ago: '1d ago', category: 'Question',
      body: 'Looking to upgrade the wheels on my {brand} — any trusted shops or group-buy deals you\'d recommend? Want to mod without overpaying.',
      replies: 17, likes: 25,
    },
  ],
};

/**
 * Build a small themed feed for a given brand + topic kind. Returns ready-to-use
 * `CommunityPost` objects with the active brand woven into each body.
 */
export const CHANNEL_KINDS: ChannelKind[] = ['service', 'maintenance', 'lounge', 'deals'];

/** Every post across all of a brand's communities (used for the unread badge). */
export function allBrandPosts(brand: string): CommunityPost[] {
  return CHANNEL_KINDS.flatMap((kind) => groupPosts(brand, kind));
}

/**
 * Posts only from the communities the user has actually JOINED (within the
 * active brand). New users join nothing, so this is empty and the Community tab
 * shows no notification badge until they join a community.
 */
export function joinedBrandPosts(brand: string, joinedIds: string[]): CommunityPost[] {
  const joined = new Set(joinedIds);
  return brandChannels(brand)
    .filter((channel) => joined.has(channel.id))
    .flatMap((channel) => groupPosts(brand, channelKind(channel.name)));
}

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
