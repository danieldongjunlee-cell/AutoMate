/**
 * Brand-scoped community generator.
 *
 * The Community tab shows communities only for the user's active car brand.
 * `brandChannels(brand)` synthesizes four sub-communities for ANY brand name,
 * with deterministic (seeded) member/post counts so the list is stable per
 * brand instead of flickering on every render.
 */

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
