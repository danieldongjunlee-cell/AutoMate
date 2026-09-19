import React from 'react';
import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';

/**
 * Thin outline icon set (24 grid, 1.7 stroke, round caps) — the reference set
 * drawn on the redesign canvas. Every former emoji glyph maps to one of these.
 *
 * Shapes are stored as compact tuples so the whole set stays data:
 *   ['p', d]                  path
 *   ['c', cx, cy, r]          circle
 *   ['r', x, y, w, h, rx]     rect
 *   ['e', cx, cy, rx, ry]     ellipse
 */
type Shape =
  | ['p', string]
  | ['c', number, number, number]
  | ['r', number, number, number, number, number]
  | ['e', number, number, number, number];

const ICONS = {
  camera: [["p", "M4 8.5h3.2l1.6-2.5h6.4l1.6 2.5H20v10.5H4Z"], ["c", 12.0, 13.2, 3.4]],
  wrench: [["p", "M14.7 5.3a4.2 4.2 0 0 0 5 5.6l-8.4 8.4a2.1 2.1 0 0 1-3-3l8.4-8.4a4.2 4.2 0 0 0-2-2.6Z"], ["p", "M15.5 9.5l-1-1"]],
  chat: [["p", "M5 5.5h14a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 19 16.5h-8l-4 3.2v-3.2H5A1.5 1.5 0 0 1 3.5 15V7A1.5 1.5 0 0 1 5 5.5Z"], ["p", "M8 10h8M8 13h5"]],
  car: [["p", "M5 13l1.6-4.2A1.5 1.5 0 0 1 8 7.8h8a1.5 1.5 0 0 1 1.4 1L19 13"], ["p", "M4 13h16v4.5H4Z"], ["c", 7.5, 17.5, 1.7], ["c", 16.5, 17.5, 1.7], ["p", "M4 13h16"]],
  phone: [["r", 7.0, 3.5, 10.0, 17.0, 2.2], ["p", "M10.5 6.5h3M11 17.5h2"]],
  calendar: [["r", 3.5, 5.0, 17.0, 15.5, 2.0], ["p", "M3.5 9.5h17M8 3.5v3.5M16 3.5v3.5"]],
  calcheck: [["r", 3.5, 5.0, 17.0, 15.5, 2.0], ["p", "M3.5 9.5h17M8 3.5v3.5M16 3.5v3.5"], ["p", "M9 14.5l2 2 4-4"]],
  dollar: [["c", 12.0, 12.0, 8.5], ["p", "M12 7v10M14.5 9.3c-.5-.9-1.4-1.3-2.5-1.3-1.5 0-2.5.8-2.5 1.9 0 2.5 5 1.4 5 4 0 1.2-1.1 2.1-2.5 2.1-1.2 0-2.2-.5-2.6-1.5"]],
  shield: [["p", "M12 3.5l7 2.6v5.4c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6.1Z"], ["p", "M9 12l2 2 4-4"]],
  star: [["p", "M12 3.8l2.5 5.2 5.7.8-4.1 4 1 5.7L12 16.8l-5.1 2.7 1-5.7-4.1-4 5.7-.8Z"]],
  tag: [["p", "M3.5 12.5V4.5h8l8.5 8.5-8 8L3.5 12.5Z"], ["c", 8.0, 9.0, 1.6]],
  gift: [["r", 3.5, 9.0, 17.0, 4.0, 1.0], ["p", "M5 13v7h14v-7M12 9v11M12 9c-1.5-2.5-4.5-3-5-1.5S9 9 12 9Zm0 0c1.5-2.5 4.5-3 5-1.5S15 9 12 9Z"]],
  glass: [["p", "M5 19.5l2.2-13h9.6l2.2 13Z"], ["p", "M12.5 9l1.5-2.5M12.5 9l2.4.5M12.5 9l-.5 2.4M12.5 9l-2.2-.8"]],
  check: [["c", 12.0, 12.0, 8.5], ["p", "M8 12.2l2.7 2.7 5.3-5.6"]],
  lock: [["r", 5.5, 10.5, 13.0, 10.0, 2.0], ["p", "M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"], ["c", 12.0, 15.5, 1.1]],
  unlock: [["r", 5.5, 10.5, 13.0, 10.0, 2.0], ["p", "M8.5 10.5V8a3.5 3.5 0 0 1 6.8-1.2"], ["c", 12.0, 15.5, 1.1]],
  user: [["c", 12.0, 8.0, 3.5], ["p", "M4.5 20c.8-3.6 3.8-5.5 7.5-5.5s6.7 1.9 7.5 5.5"]],
  file: [["p", "M6 3.5h9l4 4V20.5H6Z"], ["p", "M14.5 3.5v4h4M9 12h6M9 15.5h6"]],
  pin: [["p", "M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z"], ["c", 12.0, 10.0, 2.3]],
  bell: [["p", "M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15L6 16Z"], ["p", "M10 20a2 2 0 0 0 4 0"]],
  trophy: [["p", "M7 4.5h10v4a5 5 0 0 1-10 0Z"], ["p", "M7 6H4.5a2.5 2.5 0 0 0 2.5 3M17 6h2.5A2.5 2.5 0 0 1 17 9M12 13.5V17M8.5 20h7M9.5 17h5"]],
  chart: [["p", "M4 20h16M7 16v-5M12 16V7M17 16v-8"]],
  alert: [["p", "M12 4l8.5 15h-17Z"], ["p", "M12 10v4M12 16.5v.5"]],
  flame: [["p", "M12 3.5c1 3 4.5 4.5 4.5 9a4.5 4.5 0 0 1-9 0c0-2 1-3 1.5-3.5.2 1.2.8 2 1.8 2.3C11.5 9.5 10.5 6.5 12 3.5Z"]],
  pencil: [["p", "M4 20l4-1 10.5-10.5-3-3L5 16Z"], ["p", "M13.5 7.5l3 3"]],
  wallet: [["r", 3.5, 6.5, 17.0, 13.0, 2.0], ["p", "M3.5 10.5h17M15 14.5h2.5"]],
  mail: [["r", 3.5, 5.5, 17.0, 13.0, 2.0], ["p", "M3.5 8l8.5 5.5L20.5 8"]],
  search: [["c", 11.0, 11.0, 6.5], ["p", "M16 16l4.5 4.5"]],
  gear: [["c", 12.0, 12.0, 3.0], ["p", "M12 3.5v2.3M12 18.2v2.3M3.5 12h2.3M18.2 12h2.3M6 6l1.6 1.6M16.4 16.4 18 18M6 18l1.6-1.6M16.4 7.6 18 6"]],
  globe: [["c", 12.0, 12.0, 8.5], ["p", "M3.5 12h17M12 3.5c2.5 2.5 2.5 14.5 0 17M12 3.5c-2.5 2.5-2.5 14.5 0 17"]],
  clock: [["c", 12.0, 12.0, 8.5], ["p", "M12 7.5V12l3 2"]],
  bolt: [["p", "M13 3.5 5.5 13.5H12l-1 7 7.5-10H12Z"]],
  gauge: [["p", "M4.5 16.5a8 8 0 1 1 15 0"], ["p", "M12 15.5l3.5-5"], ["c", 12.0, 15.5, 1.2]],
  fuel: [["p", "M5 20.5V5a1.5 1.5 0 0 1 1.5-1.5h6A1.5 1.5 0 0 1 14 5v15.5"], ["p", "M4 20.5h11M6.5 6.5h5v4h-5ZM14 9h2l2.5 2.5v6a1.5 1.5 0 0 1-3 0V13"]],
  sparkle: [["p", "M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6Z"], ["p", "M18.5 16l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7Z"]],
  box: [["p", "M12 3.5l8 4.5v8l-8 4.5-8-4.5V8Z"], ["p", "M4 8l8 4.5 8-4.5M12 12.5v8"]],
  dot: [["c", 12.0, 12.0, 8.5], ["c", 12.0, 12.0, 2.0]],
  brake: [["c", 12.0, 12.0, 8.5], ["c", 12.0, 12.0, 4.0], ["p", "M12 3.5v3M12 17.5v3M3.5 12h3M17.5 12h3"]],
  filter: [["r", 4.0, 6.0, 16.0, 12.0, 2.0], ["p", "M7.5 6v12M10.5 6v12M13.5 6v12M16.5 6v12"]],
  oil: [["p", "M8 8.5h5l2-2.5h2.5"], ["p", "M6 8.5h9l4 4v6H6a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2Z"], ["c", 10.0, 14.0, 1.5]],
  snowflake: [["p", "M12 3.5v17M4.6 7.75l14.8 8.5M4.6 16.25l14.8-8.5M12 3.5l-2 2M12 3.5l2 2M12 20.5l-2-2M12 20.5l2-2"]],
  wiper: [["p", "M4 18c2.5-5 5.5-8 8-9M12 9l8 9"], ["p", "M8.5 15.5l7-4"], ["c", 12.0, 18.0, 1.5]],
  tire: [["c", 12.0, 12.0, 8.5], ["c", 12.0, 12.0, 3.5], ["p", "M12 3.5v5M12 15.5v5M3.5 12h5M15.5 12h5"]],
  battery: [["r", 3.5, 8.0, 15.0, 9.0, 1.5], ["p", "M18.5 10.5h2v4h-2M7 12.5h3M8.5 11v3M13 12.5h3"]],
  key: [["c", 8.0, 12.0, 3.5], ["p", "M11.5 12h9M17.5 12v3M14.5 12v2.5"]],
  droplet: [["p", "M12 3.5c3 4 6 7 6 10.5a6 6 0 0 1-12 0c0-3.5 3-6.5 6-10.5Z"]],
  plunger: [["p", "M12 3.5v9"], ["p", "M5.5 16.5c0-2.5 3-4 6.5-4s6.5 1.5 6.5 4Z"], ["p", "M5.5 16.5v2h13v-2"]],
  sponge: [["r", 4.0, 8.0, 16.0, 9.0, 2.0], ["p", "M4 12h16M8.5 8v9M15.5 8v9"]],
  kettle: [["p", "M6 10h10l1 9H7Z"], ["p", "M16 12h2.5a1.5 1.5 0 0 1 0 3H17M8 10c0-3 2-4 4-4s4 1 4 4M9 4.5l1 1.5M13 4.5l-1 1.5"]],
  brush: [["p", "M4 20c0-3 1-4.5 3.5-4.5S11 17 11 20"], ["p", "M9.5 15.5L18.5 4.5l1.5 1.5-9 11"]],
  bulb: [["p", "M9 18h6M10 21h4"], ["p", "M8.5 14.5A6 6 0 1 1 15.5 14.5c-.8.8-1.5 1.7-1.5 3.5h-4c0-1.8-.7-2.7-1.5-3.5Z"]],
  magnet: [["p", "M6 4v8a6 6 0 0 0 12 0V4"], ["p", "M6 4h4v8a2 2 0 0 0 4 0V4h4M6 8h4M14 8h4"]],
  fog: [["p", "M4 9h12M6 13h14M4 17h10"], ["p", "M17 13c2-1.5 3 0 3 0"]],
  palette: [["p", "M12 3.5a8.5 8.5 0 1 0 0 17c1.5 0 2-1 1.5-2s0-2 1.5-2h1.5a3 3 0 0 0 3-3c0-5-3.5-10-7.5-10Z"], ["c", 8.0, 10.0, 1.0], ["c", 12.0, 7.5, 1.0], ["c", 16.0, 10.0, 1.0]],
  coins: [["e", 10.0, 7.5, 6.5, 2.8], ["p", "M3.5 7.5v4c0 1.5 3 2.8 6.5 2.8s6.5-1.3 6.5-2.8v-4"], ["p", "M8 14.8c.6 1.4 3.2 2.4 6.5 2.4 3.6 0 6.5-1.3 6.5-2.8"], ["p", "M8 13v3.5c0 1.5 3 2.8 6.5 2.8s6.5-1.3 6.5-2.8v-4"]],
  seat: [["p", "M7 4.5h6l1.5 8H8.5Z"], ["p", "M6 12.5h11l1 5H5Z"], ["p", "M5 17.5v3M18 17.5v3"]],
  home: [["p", "M4 11.5 12 4l8 7.5"], ["p", "M6 10.5V20h12v-9.5"], ["p", "M10 20v-5h4v5"]],
  plus: [["p", "M12 5v14M5 12h14"]],
  dots: [["c", 5.5, 12, 1.2], ["c", 12, 12, 1.2], ["c", 18.5, 12, 1.2]],
  heart: [["p", "M12 20s-7-4.4-7-9.5A3.8 3.8 0 0 1 12 8a3.8 3.8 0 0 1 7 2.5C19 15.6 12 20 12 20Z"]],
  chevron: [["p", "M9 6l6 6-6 6"]],
  back: [["p", "M15 6l-6 6 6 6"]],
  close: [["p", "M6 6l12 12M18 6 6 18"]],
  eye: [["p", "M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z"], ["c", 12, 12, 2.6]],
  eyeoff: [["p", "M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z"], ["c", 12, 12, 2.6], ["p", "M5 5l14 14"]],
  funnel: [["p", "M4 5h16l-6.5 7.5V19l-3-1.5v-5Z"]],
  arrow: [["p", "M5 12h14M13 6l6 6-6 6"]],
  trash: [["p", "M5 7h14M9.5 7V4.5h5V7M7 7l.8 13h8.4L17 7"], ["p", "M10 11v6M14 11v6"]],
  swap: [["p", "M7 4v16M7 20l-3-3M7 20l3-3M17 20V4M17 4l-3 3M17 4l3 3"]],
  moon: [["p", "M14.5 3.8a8 8 0 1 0 5.7 11.7A7 7 0 0 1 14.5 3.8Z"]],
  sun: [["c", 12.0, 12.0, 4.0], ["p", "M12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M5.6 18.4l1.6-1.6M16.8 7.2l1.6-1.6"]],
  list: [["p", "M8 6.5h12M8 12h12M8 17.5h12"], ["c", 4.5, 6.5, 1.1], ["c", 4.5, 12.0, 1.1], ["c", 4.5, 17.5, 1.1]],
  map: [["p", "M3.5 6.5 9 4l6 2.5 5.5-2.5v14L15 20.5 9 18l-5.5 2.5Z"], ["p", "M9 4v14M15 6.5v14"]],
  history: [["p", "M4.5 12a7.5 7.5 0 1 0 2.2-5.3"], ["p", "M4 4v4.5h4.5M12 8v4.5l3 1.8"]],
} satisfies Record<string, Shape[]>;

export type IconName = keyof typeof ICONS;

export const ICON_NAMES = Object.keys(ICONS) as IconName[];

export function isIconName(name: string): name is IconName {
  return name in ICONS;
}

export interface IconProps {
  name: IconName;
  /** Glyph box in px (default 24). */
  size?: number;
  color?: string;
  /** Stroke width in 24-grid units (default 1.7). */
  strokeWidth?: number;
  /** Fill the shapes instead of stroking them (used for the dock's active glyph). */
  filled?: boolean;
}

export function Icon({ name, size = 24, color = '#e8edf5', strokeWidth = 1.7, filled }: IconProps) {
  const shapes: Shape[] = ICONS[name] ?? ICONS.dot;
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? color : 'none'}
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {shapes.map((s, i) => {
        switch (s[0]) {
          case 'p':
            return <Path key={i} d={s[1]} />;
          case 'c':
            return <Circle key={i} cx={s[1]} cy={s[2]} r={s[3]} />;
          case 'r':
            return <Rect key={i} x={s[1]} y={s[2]} width={s[3]} height={s[4]} rx={s[5]} />;
          case 'e':
            return <Ellipse key={i} cx={s[1]} cy={s[2]} rx={s[3]} ry={s[4]} />;
          default:
            return null;
        }
      })}
    </Svg>
  );
}

/**
 * Legacy emoji glyph → outline icon. Data carries short icon keys (or, for
 * anything not yet migrated, the old emoji); `Glyph` renders either as an
 * outline icon so no emoji ever reaches the screen.
 */
export const EMOJI_ICON: Record<string, IconName> = {
  '🎉': 'sparkle', '🥳': 'sparkle', '🤝': 'user', '✅': 'check', '☑️': 'check', '✔️': 'check', '✔': 'check', '✓': 'check',
  '🌙': 'clock', '🔒': 'lock', '🔐': 'lock', '🔓': 'unlock', '📱': 'phone', '⭐': 'star', '🌟': 'star',
  '🚗': 'car', '🚙': 'car', '🚘': 'car', '🔧': 'wrench', '🛠️': 'wrench', '🛠': 'wrench', '🧰': 'wrench', '🔩': 'gear',
  '📅': 'calendar', '📆': 'calendar', '🗓️': 'calendar', '🗓': 'calendar', '📷': 'camera', '📸': 'camera', '🖼️': 'camera',
  '💬': 'chat', '🛡️': 'shield', '🛡': 'shield', '💵': 'dollar', '💰': 'dollar', '💸': 'dollar', '💲': 'dollar', '⚖️': 'dollar',
  '💳': 'wallet', '🏆': 'trophy', '📊': 'chart', '📈': 'chart', '📏': 'gauge', '⚠️': 'alert', '⚠': 'alert', '🚫': 'alert', '🚩': 'alert', '❓': 'alert',
  '🔥': 'flame', '🎁': 'gift', '🏷️': 'tag', '🏷': 'tag', '👤': 'user', '👥': 'user', '👋': 'user', '📄': 'file', '📋': 'file', '🧾': 'file',
  '📑': 'file', '🗂️': 'file', '🗂': 'file', '📚': 'file', '📍': 'pin', '🛣️': 'pin', '🧭': 'pin', '🔔': 'bell', '✏️': 'pencil', '✒️': 'pencil',
  '📝': 'pencil', '✍️': 'pencil', '✎': 'pencil', '📧': 'mail', '✉️': 'mail', '🔍': 'search', '🔎': 'search', '🕵️': 'search', '⚙️': 'gear',
  '🌐': 'globe', '🔗': 'globe', '⏰': 'clock', '🕐': 'clock', '⚡': 'bolt', '📡': 'bolt', '🚀': 'bolt', '⛽': 'fuel', '🪟': 'glass',
  '📦': 'box', '🛞': 'tire', '↺': 'tire', '🛢️': 'oil', '🛢': 'oil', '🛑': 'brake', '🔊': 'brake', '🌬️': 'filter', '🍃': 'filter',
  '😮‍💨': 'filter', '🔌': 'filter', '💧': 'droplet', '💦': 'droplet', '🧴': 'droplet', '🌧️': 'wiper', '🔋': 'battery', '🔑': 'key',
  '♨️': 'kettle', '🪠': 'plunger', '🧽': 'sponge', '🧤': 'sponge', '🧼': 'sponge', '🖌️': 'brush', '🎨': 'palette', '💡': 'bulb',
  '☀️': 'bulb', '🧲': 'magnet', '🌫️': 'fog', '❄️': 'snowflake', '✨': 'sparkle', '🤖': 'sparkle', '♾️': 'sparkle', '🧪': 'sparkle',
  '❤️': 'heart', '🤍': 'heart', '💚': 'heart', '👍': 'check', '🗑️': 'trash', '🔁': 'swap', '➕': 'plus', '✕': 'close', '➤': 'arrow',
  '📞': 'phone', '☎️': 'phone', '🎯': 'dot', '🏁': 'dot', '🏠': 'home', '🪑': 'seat',
};

/** Accent colour per maintenance / DIY subject (oil amber, tire blue, filter teal, fluids cyan, brakes red, inspection lavender). */
export const SUBJECT_COLOR: Partial<Record<IconName, string>> = {
  oil: '#F0B44E', tire: '#6fa0ff', wiper: '#6fa0ff', filter: '#4FE3C1', fog: '#4FE3C1', sponge: '#4FE3C1', seat: '#4FE3C1',
  droplet: '#5BD1F5', glass: '#5BD1F5', snowflake: '#5BD1F5', brake: '#f0726e', kettle: '#f0726e', flame: '#f0726e',
  search: '#B7B1F2', plunger: '#B7B1F2', magnet: '#B7B1F2', palette: '#B7B1F2', battery: '#2EE87E', key: '#F0B44E',
  brush: '#F0B44E', bulb: '#F0B44E', star: '#F0B44E', gauge: '#6fa0ff', wrench: '#b8c3d3', car: '#4FE3C1',
};
export function subjectColor(glyph: string | undefined | null, fallback = '#b8c3d3'): string {
  return SUBJECT_COLOR[iconForGlyph(glyph)] ?? fallback;
}

/** Resolve an icon key or legacy emoji to an icon name (falls back to a dot). */
export function iconForGlyph(glyph: string | undefined | null): IconName {
  if (!glyph) return 'dot';
  const g = glyph.trim();
  if (isIconName(g)) return g;
  return EMOJI_ICON[g] ?? EMOJI_ICON[g.replace(/\uFE0F/g, '')] ?? 'dot';
}

/** Outline icon for an icon key or legacy emoji string (drop-in for a `<Text>{emoji}</Text>`). */
export function Glyph({ glyph, size = 22, color = '#e8edf5', strokeWidth }: { glyph: string | undefined | null; size?: number; color?: string; strokeWidth?: number }) {
  return <Icon name={iconForGlyph(glyph)} size={size} color={color} strokeWidth={strokeWidth} />;
}
