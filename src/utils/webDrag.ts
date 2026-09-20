import { Platform } from 'react-native';

/**
 * Dragging on web.
 *
 * React Native Web never delivers responder moves for a mouse drag, and a
 * touch that starts on a pressable does not reliably become one either, so
 * PanResponder is skipped on web and both pointer kinds are followed on
 * window listeners instead. Phones run the web build, so a handle that only
 * listened for the mouse could not be dragged with a finger at all.
 */

export interface WebDrag {
  /** Offset from the press, in CSS pixels, on every move. */
  onMove: (dx: number, dy: number) => void;
  /** Final offset, once on release. Not called if the drag was abandoned. */
  onEnd: (dx: number, dy: number) => void;
}

/** The few fields we read off a mouse or touch event, native or synthetic. */
type PointerLike = {
  pageX?: number;
  pageY?: number;
  touches?: ArrayLike<{ pageX: number; pageY: number }>;
  changedTouches?: ArrayLike<{ pageX: number; pageY: number }>;
  nativeEvent?: PointerLike;
  cancelable?: boolean;
  preventDefault?: () => void;
};

/** Where the pointer is, whichever shape of event this is. */
function pointOf(ev: PointerLike | undefined): { x: number; y: number } | null {
  if (!ev) return null;
  const touch = ev.touches?.[0] ?? ev.changedTouches?.[0];
  if (touch) return { x: touch.pageX, y: touch.pageY };
  if (typeof ev.pageX === 'number' && typeof ev.pageY === 'number') return { x: ev.pageX, y: ev.pageY };
  return pointOf(ev.nativeEvent);
}

/** How far the pointer must travel before we decide what the gesture is. */
const SLOP = 6;

/**
 * View props that let a node be dragged on web with a mouse or a finger.
 * `start` runs on press and returns the handlers (or null to ignore it).
 *
 * With `axis`, the first movement decides: a gesture along that axis is taken
 * and the browser's own scrolling is suppressed for it, a gesture across it is
 * abandoned so the page keeps scrolling normally under the finger.
 */
export function webDragProps(start: () => WebDrag | null, axis?: 'x' | 'y'): object {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return {};

  const begin = (ev: PointerLike, touch: boolean) => {
    const from = pointOf(ev);
    if (!from) return;
    const handlers = start();
    if (!handlers) return;

    let last = from;
    let decided = !axis;
    const moveEvent = touch ? 'touchmove' : 'mousemove';
    const endEvent = touch ? 'touchend' : 'mouseup';

    const stop = () => {
      window.removeEventListener(moveEvent, move as EventListener);
      window.removeEventListener(endEvent, end as EventListener);
      if (touch) window.removeEventListener('touchcancel', end as EventListener);
    };
    const move = (e: PointerLike) => {
      const p = pointOf(e);
      if (!p) return;
      const dx = p.x - from.x;
      const dy = p.y - from.y;
      if (!decided) {
        if (Math.abs(dx) < SLOP && Math.abs(dy) < SLOP) return;
        // Crossways gesture: let go of it so the page can scroll.
        if (axis === 'x' ? Math.abs(dx) <= Math.abs(dy) : Math.abs(dy) <= Math.abs(dx)) {
          stop();
          return;
        }
        decided = true;
      }
      last = p;
      if (touch && e.cancelable !== false) e.preventDefault?.();
      handlers.onMove(dx, dy);
    };
    const end = () => {
      stop();
      handlers.onEnd(last.x - from.x, last.y - from.y);
    };

    window.addEventListener(moveEvent, move as EventListener, touch ? { passive: false } : undefined);
    window.addEventListener(endEvent, end as EventListener);
    if (touch) window.addEventListener('touchcancel', end as EventListener);
  };

  return {
    onMouseDown: (e: PointerLike) => begin(e, false),
    onTouchStart: (e: PointerLike) => begin(e, true),
  };
}

/** Keep vertical page scrolling alive over a node that handles sideways drags. */
export const panYStyle = Platform.OS === 'web' ? ({ touchAction: 'pan-y' } as object) : null;
