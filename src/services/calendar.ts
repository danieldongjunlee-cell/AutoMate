import { Linking, Platform } from 'react-native';

import { confirmAction, showAlert } from '../utils/alerts';

/**
 * "Add to calendar" (user-feedback pass 2):
 * - Web: confirm → opens a pre-filled Google Calendar event template.
 * - Native: expo-calendar (legacy API — the only one available inside Expo Go)
 *   inserts the event into the default writable device calendar.
 *
 * expo-calendar is lazy-required on native only so the web bundle never pulls
 * the native module in.
 */
export interface CalendarEventInput {
  title: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  notes?: string;
}

const pad = (n: number) => `${n}`.padStart(2, '0');

/** Floating local timestamp (no Z) — Google Calendar reads it in the user's zone. */
const gcalStamp = (d: Date) =>
  `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(
    d.getMinutes(),
  )}00`;

/** calendar.google.com/calendar/render?action=TEMPLATE event link. */
export function googleCalendarUrl(evt: CalendarEventInput): string {
  const params = [
    'action=TEMPLATE',
    `text=${encodeURIComponent(evt.title)}`,
    `dates=${gcalStamp(evt.startDate)}/${gcalStamp(evt.endDate)}`,
    evt.location ? `location=${encodeURIComponent(evt.location)}` : '',
    evt.notes ? `details=${encodeURIComponent(evt.notes)}` : '',
  ]
    .filter(Boolean)
    .join('&');
  return `https://calendar.google.com/calendar/render?${params}`;
}

/** Parse "10:30 AM" → a Date on the given (1-based month) day. */
export function dateAtTime(year: number, month1: number, day: number, timeLabel: string): Date {
  const m = /(\d+):(\d+)\s*(AM|PM)?/i.exec(timeLabel);
  let hours = m ? parseInt(m[1], 10) : 9;
  const minutes = m ? parseInt(m[2], 10) : 0;
  const meridiem = m?.[3]?.toUpperCase();
  if (meridiem === 'PM' && hours < 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;
  return new Date(year, month1 - 1, day, hours, minutes, 0, 0);
}

/** Find the default (iOS) or first writable (Android) device calendar id. */
async function defaultCalendarId(
  Calendar: typeof import('expo-calendar/legacy'),
): Promise<string | null> {
  if (Platform.OS === 'ios') {
    try {
      const def = await Calendar.getDefaultCalendarAsync();
      if (def?.id) return def.id;
    } catch {
      // fall through to the writable-calendar scan
    }
  }
  const all = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  return all.find((c) => c.allowsModifications)?.id ?? null;
}

/** Export a booking to the user's calendar (never rejects — alerts instead). */
export async function addToCalendar(evt: CalendarEventInput): Promise<void> {
  if (Platform.OS === 'web') {
    confirmAction(
      'Add to Google Calendar?',
      `"${evt.title}" opens pre-filled on calendar.google.com.`,
      () => {
        Linking.openURL(googleCalendarUrl(evt)).catch(() => {});
      },
      'Open',
    );
    return;
  }

  try {
    // Lazy native-only require: keeps expo-calendar out of the web bundle.
    const Calendar = require('expo-calendar/legacy') as typeof import('expo-calendar/legacy');
    const perm = await Calendar.requestCalendarPermissionsAsync();
    if (!perm.granted) {
      showAlert('Calendar access needed', 'Enable calendar access in Settings to add events.');
      return;
    }
    const calendarId = await defaultCalendarId(Calendar);
    if (!calendarId) {
      showAlert('No calendar found', 'Could not find a writable calendar on this device.');
      return;
    }
    await Calendar.createEventAsync(calendarId, {
      title: evt.title,
      startDate: evt.startDate,
      endDate: evt.endDate,
      location: evt.location,
      notes: evt.notes,
    });
    showAlert('Added to calendar 📅', `"${evt.title}" is on your calendar.`);
  } catch (e) {
    showAlert('Calendar error', e instanceof Error ? e.message : 'Could not add the event.');
  }
}
