/**
 * In-app (verified AutoMate booking) reviews per shop. Distinct, brand- and
 * shop-appropriate review sets keyed by dealer id; falls back to a small
 * generic positive set (using the dealer's resolved name) for unknown ids.
 */
import { dealerById } from './data';

export interface ShopReview {
  initial: string;
  color: string;
  name: string;
  meta: string;
  stars: number;
  helpful: number;
  body: string;
}

export interface ShopReviews {
  name: string;
  ratingAvg: number;
  ratingCount: number;
  distribution: { five: number; four: number; three: number };
  reviews: ShopReview[];
}

interface ReviewSet {
  ratingAvg: number;
  ratingCount: number;
  distribution: { five: number; four: number; three: number };
  reviews: ShopReview[];
}

const REVIEW_SETS: Record<string, ReviewSet> = {
  'honda-fairfax': {
    ratingAvg: 4.9,
    ratingCount: 312,
    distribution: { five: 88, four: 9, three: 3 },
    reviews: [
      {
        initial: 'MK',
        color: '#1F49B8',
        name: 'Maria K.',
        meta: 'Rear bumper · Apr 2027',
        stars: 5,
        helpful: 24,
        body:
          "Quoted $330 on AutoMate and that's exactly what I paid — no surprises. OEM paint match on my Accord is flawless and they finished a day early.",
      },
      {
        initial: 'DT',
        color: '#16a34a',
        name: 'Derek T.',
        meta: 'Oil change · Mar 2027',
        stars: 5,
        helpful: 18,
        body:
          'Genuine Honda parts and a 27-point inspection thrown in. Service advisor walked me through everything. Trustworthy dealer service.',
      },
      {
        initial: 'PL',
        color: '#7F77DD',
        name: 'Priya L.',
        meta: 'Brake service · Feb 2027',
        stars: 4,
        helpful: 9,
        body:
          'Solid work on the front pads and rotors. Waiting room was busy so it ran a bit long, but the loaner made it painless.',
      },
    ],
  },
  'autofix-pro': {
    ratingAvg: 4.7,
    ratingCount: 204,
    distribution: { five: 80, four: 14, three: 4 },
    reviews: [
      {
        initial: 'RG',
        color: '#1D9E75',
        name: 'Ramon G.',
        meta: 'Door ding · Apr 2027',
        stars: 5,
        helpful: 16,
        body:
          'Fastest turnaround in town — dropped off at 8, picked up by lunch. Aftermarket parts but you genuinely cannot tell. Saved me $60 vs the dealer.',
      },
      {
        initial: 'SC',
        color: '#F5B84E',
        name: 'Steph C.',
        meta: 'Oil change · Mar 2027',
        stars: 4,
        helpful: 7,
        body:
          '$39 oil change, in and out in 30 minutes. Upsold me on a cabin filter but never pushy about it. Will come back.',
      },
    ],
  },
  'vienna-auto': {
    ratingAvg: 4.8,
    ratingCount: 156,
    distribution: { five: 84, four: 12, three: 3 },
    reviews: [
      {
        initial: 'JW',
        color: '#378ADD',
        name: 'Jordan W.',
        meta: 'Bumper repair · Apr 2027',
        stars: 5,
        helpful: 21,
        body:
          'They threw in free paint protection after the repair, exactly as the quote promised. Friendly small-shop feel right on Maple Ave.',
      },
      {
        initial: 'AN',
        color: '#534AB7',
        name: 'Aisha N.',
        meta: 'Tire rotation · Feb 2027',
        stars: 5,
        helpful: 10,
        body:
          'Honest crew — they checked my tread and said the rotation could wait, then did it for $79 anyway when I asked. Rare to find that.',
      },
      {
        initial: 'TM',
        color: '#0F6E56',
        name: 'Tom M.',
        meta: 'Brake service · Jan 2027',
        stars: 4,
        helpful: 6,
        body:
          'Good brake job at a fair $129. Parking is tight near the shop but the work and the communication were both excellent.',
      },
    ],
  },
  'fairfax-collision': {
    ratingAvg: 4.6,
    ratingCount: 142,
    distribution: { five: 76, four: 16, three: 5 },
    reviews: [
      {
        initial: 'BC',
        color: '#E24B4A',
        name: 'Brandon C.',
        meta: 'Collision repair · Apr 2027',
        stars: 5,
        helpful: 19,
        body:
          'Certified body shop and it shows — frame pull and OEM panel replacement after a fender bender. Lifetime warranty on the repair sealed it.',
      },
      {
        initial: 'KH',
        color: '#1F49B8',
        name: 'Kelly H.',
        meta: 'Insurance claim · Mar 2027',
        stars: 4,
        helpful: 12,
        body:
          'Handled my State Farm claim directly so I barely lifted a finger. Took a few days longer than quoted but the paint match was perfect.',
      },
    ],
  },
};

const fallbackSet = (name: string): ReviewSet => ({
  ratingAvg: 4.5,
  ratingCount: 48,
  distribution: { five: 72, four: 18, three: 6 },
  reviews: [
    {
      initial: 'AM',
      color: '#1D9E75',
      name: 'Avery M.',
      meta: 'Service · Mar 2027',
      stars: 5,
      helpful: 8,
      body: `Booked through AutoMate and ${name} delivered exactly what was quoted. Clean work and friendly staff.`,
    },
    {
      initial: 'JR',
      color: '#378ADD',
      name: 'Jamie R.',
      meta: 'Service · Feb 2027',
      stars: 4,
      helpful: 4,
      body: 'Fair price and no upsell pressure. Would book here again for routine work.',
    },
  ],
});

/** Resolve the verified in-app reviews for a shop (by dealer id). */
export function shopReviews(dealerId?: string): ShopReviews {
  const name = dealerById(dealerId).name;
  const set = (dealerId && REVIEW_SETS[dealerId]) || fallbackSet(name);
  return { name, ...set };
}
