import { useAppStore } from './store/useAppStore';

/** Display name (stored in the app) → language code. */
const LANG_CODE: Record<string, 'en' | 'ko' | 'es' | 'zh'> = {
  English: 'en',
  한국어: 'ko',
  Español: 'es',
  中文: 'zh',
};

import ko from './i18n/ko.json';
import es from './i18n/es.json';
import zh from './i18n/zh.json';

/**
 * Dictionaries: every string the app shows, keyed by the English. Unknown
 * strings fall back to English, so server content passes through untouched.
 */
const DICT: Record<'ko' | 'es' | 'zh', Record<string, string>> = { ko, es, zh };

/** Trailing arrows and punctuation kept outside the lookup. */
const TRAIL = /(\s*(→|›|\.\.\.|…|:|\?|!))+$/;

/** Dictionary keys with {n} holes, compiled once per language into matchers. */
const templateCache = new WeakMap<Record<string, string>, { re: RegExp; value: string }[]>();
function templatesOf(dict: Record<string, string>) {
  let list = templateCache.get(dict);
  if (!list) {
    list = Object.keys(dict)
      .filter((k) => k.includes('{n}'))
      // The most specific template wins: "Show all {n} brands" before "Show all {n}".
      .sort((a, b) => b.replace(/\{n\}/g, '').length - a.replace(/\{n\}/g, '').length)
      .map((k) => ({
        re: new RegExp('^' + k.replace(/[.*+?^$()|[\]\\]/g, '\\$&').replace(/\{n\}/g, '(.*?)') + '$'),
        value: dict[k],
      }));
    templateCache.set(dict, list);
  }
  return list;
}

function lookup(dict: Record<string, string>, en: string): string | undefined {
  const hit = dict[en];
  if (hit) return hit;
  // "8 shops responded" → "{n} shops responded", "Honda Owners" → "{n} Owners":
  // the holes are put back into the translation in order.
  for (const t of templatesOf(dict)) {
    const m = en.match(t.re);
    if (m) {
      // The holes translate on their own where they can ("1 day before",
      // "Aftermarket"); names and numbers pass through.
      // {n} takes the holes in order; {1}, {2}, ... pick one by position, for
      // languages that put them in another order.
      let i = 1;
      const fill = (hole: string) => dict[hole] ?? hole;
      return t.value.replace(/\{(n|\d)\}/g, (_, which: string) => fill((which === 'n' ? m[i++] : m[Number(which)]) ?? ''));
    }
  }
  return undefined;
}

/** One phrase: exact, then without its trailing arrow / punctuation. */
function phrase(dict: Record<string, string>, en: string): string {
  const trimmed = en.trim();
  if (!trimmed) return en;
  const direct = lookup(dict, trimmed);
  if (direct) return en.replace(trimmed, direct);
  const tail = trimmed.match(TRAIL);
  if (tail) {
    const core = trimmed.slice(0, -tail[0].length);
    const hit = lookup(dict, core);
    if (hit) return en.replace(trimmed, hit + tail[0]);
  }
  return en;
}

export function translate(en: string, languageName: string): string {
  const code = LANG_CODE[languageName] ?? 'en';
  if (code === 'en' || !en) return en;
  const dict = DICT[code];
  const whole = phrase(dict, en);
  if (whole !== en) return whole;
  // Composed strings: translate each " · " / " / " separated piece on its own.
  if (/ · | \/ /.test(en)) {
    return en
      .split(/( · | \/ )/)
      .map((piece, i) => (i % 2 ? piece : phrase(dict, piece)))
      .join('');
  }
  return en;
}

/** Hook: `t('Home')` translates per the current Settings → Language selection. */
export function useT() {
  const language = useAppStore((s) => s.language);
  return (en: string) => translate(en, language);
}

/** Hook: distance formatter honoring Settings → Distance units (mi ↔ km). */
export function useDistance() {
  const unit = useAppStore((s) => s.distanceUnit);
  return {
    unit,
    /** Format a value given in miles into the user's chosen unit. */
    format: (mi: number, opts?: { decimals?: number }) =>
      unit === 'km'
        ? `${(mi * 1.60934).toFixed(opts?.decimals ?? 1)} km`
        : `${mi} mi`,
  };
}
