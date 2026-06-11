import { MainTabParamList } from '../../navigation/types';

export interface AppNotification {
  id: string;
  icon: string;
  title: string;
  ago: string;
  body: string;
  unread: boolean;
  /** Tinted card style for unread items (wireframe s-notifications). */
  tint: 'primary' | 'success' | 'gold' | 'neutral';
  /** Deep link: target route, plus the owning tab for cross-tab jumps. */
  target?: { screen: string; tab?: keyof MainTabParamList };
}

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

let notifications: AppNotification[] = [
  {
    id: 'n-quote-accepted',
    icon: '💰',
    title: 'Honda Fairfax accepted your quote',
    ago: '2 hours ago',
    body: 'Your rear bumper estimate ($320–$345) is ready. Tap to book your appointment.',
    unread: true,
    tint: 'primary',
    target: { screen: 'AcceptBooking' },
  },
  {
    id: 'n-oil-due',
    icon: '🔧',
    title: 'Oil change due soon',
    ago: 'Yesterday',
    body: 'Your 2019 Accord is ~800 miles from its next oil change. Schedule now with a partner dealer.',
    unread: true,
    tint: 'success',
    target: { screen: 'MaintSchedule', tab: 'MaintTab' },
  },
  {
    id: 'n-gold-tier',
    icon: '🏆',
    title: 'You reached Gold tier!',
    ago: '2 days ago',
    body: "Congrats — you've unlocked exclusive dealer discounts and early access to new features.",
    unread: true,
    tint: 'gold',
    target: { screen: 'ProfEarn', tab: 'ProfileTab' },
  },
  {
    id: 'n-shops-responded',
    icon: '📊',
    title: '8 shops responded to your request',
    ago: '3 days ago',
    body: 'AutoFix Pro quoted $295 — the lowest in your area. View all quotes.',
    unread: false,
    tint: 'neutral',
    target: { screen: 'DealerQuotes' },
  },
  {
    id: 'n-reply',
    icon: '💬',
    title: 'Sarah M. replied to your post',
    ago: '4 days ago',
    body: '"That DIY dent trick actually works — saved me $400 too!"',
    unread: false,
    tint: 'neutral',
    target: { screen: 'CommPost', tab: 'CommunityTab' },
  },
  {
    id: 'n-upcoming',
    icon: '📅',
    title: 'Upcoming: Honda Fairfax — Mon Apr 7',
    ago: '5 days ago',
    body: 'Oil change at 8:00 AM. Reminder will be sent the day before.',
    unread: false,
    tint: 'neutral',
    target: { screen: 'MaintScheduleConfirm', tab: 'MaintTab' },
  },
];

export const notificationService = {
  async getNotifications(): Promise<AppNotification[]> {
    await delay(300);
    return [...notifications];
  },

  async markAllRead() {
    await delay(200);
    notifications = notifications.map((n) => ({ ...n, unread: false }));
    return { ok: true };
  },

  async markRead(id: string) {
    await delay(100);
    notifications = notifications.map((n) => (n.id === id ? { ...n, unread: false } : n));
    return { ok: true };
  },
};
