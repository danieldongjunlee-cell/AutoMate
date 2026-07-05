/**
 * Server-owned reference data that has no table yet (mirrors the mock
 * services' constants). Will move to real scheduling/community-membership
 * tables in later phases.
 */

export const UPCOMING_SERVICES = [
  { id: 'up-oil', name: 'Oil change', due: 'Due ~800 mi', icon: '🛢️', status: 'Soon' },
  { id: 'up-tires', name: 'Tire rotation', due: 'Due ~2,500 mi', icon: '↺', status: 'Upcoming' },
  {
    id: 'up-insp',
    name: 'Multi-point inspection',
    due: 'Due Nov 2025',
    icon: '🔍',
    status: 'Scheduled',
  },
];

export const CHANNELS = [
  {
    id: 'honda',
    name: 'Honda Owners',
    initial: 'H',
    color: '#7F77DD',
    members: 1240,
    newPosts: 12,
    joined: true,
  },
  { id: 'toyota', name: 'Toyota Owners', initial: 'T', color: '#1A1A1A', members: 890, joined: false },
  { id: 'gm', name: 'GM Owners', initial: 'G', color: '#D0021B', members: 530, joined: false },
];

export const DEALER_NAMES: Record<string, string> = {
  'honda-fairfax': 'Honda Fairfax',
  'autofix-pro': 'AutoFix Pro',
  'vienna-auto': 'Vienna Auto Care',
  'fairfax-collision': 'Fairfax Collision',
  'chantilly-body': 'Chantilly Auto Body',
  'nova-dent': 'NoVa Dent Works',
  'arlington-spa': 'Arlington Auto Spa',
  'premier-body': 'Premier Body Shop',
  'city-body': 'City Body Shop',
};

/** Business-hours rule for after-hours routing (mirrors the mock). */
export const isAfterHours = (d = new Date()) => d.getHours() >= 21 || d.getHours() < 7;

/** Relative "2h ago" label for feed/notification items created via the API. */
export function agoLabel(date: Date, now = new Date()): string {
  const mins = Math.max(0, Math.round((now.getTime() - date.getTime()) / 60000));
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}
