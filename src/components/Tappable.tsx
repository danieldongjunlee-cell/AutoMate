import React, { useState } from 'react';
import { Platform, Pressable, PressableProps, StyleProp, View, ViewStyle } from 'react-native';

/** Shared feedback levels (every Tappable in the app uses these). */
export const HOVER_OPACITY = 0.72;
export const PRESSED_OPACITY = 0.55;

export interface TappableState {
  pressed: boolean;
  hovered: boolean;
}

interface Props extends Omit<PressableProps, 'style' | 'children'> {
  style?: StyleProp<ViewStyle> | ((state: TappableState) => StyleProp<ViewStyle>);
  children?: React.ReactNode | ((state: TappableState) => React.ReactNode);
  /** Skip the built-in hover/press feedback (caller draws its own). */
  noFeedback?: boolean;
  /** Underlying view ref (React 19 ref-as-prop; web: the DOM node). */
  ref?: React.Ref<View>;
}

/**
 * Pressable with universal interaction feedback (user-feedback pass 1):
 * - web: hover → dims to 72% + pointer cursor (onHoverIn/Out)
 * - all platforms: pressed → dims to 55% + scale 0.98
 * Props pass straight through; style/children callbacks receive
 * `{ pressed, hovered }` and are merged with the built-in feedback styles.
 */
export function Tappable({
  style,
  children,
  noFeedback,
  disabled,
  onHoverIn,
  onHoverOut,
  ...rest
}: Props) {
  const [hovered, setHovered] = useState(false);
  const active = !disabled;

  return (
    <Pressable
      {...rest}
      disabled={disabled}
      onHoverIn={(e) => {
        setHovered(true);
        onHoverIn?.(e);
      }}
      onHoverOut={(e) => {
        setHovered(false);
        onHoverOut?.(e);
      }}
      style={({ pressed }) => [
        typeof style === 'function' ? style({ pressed, hovered: hovered && active }) : style,
        Platform.OS === 'web' && active ? ({ cursor: 'pointer' } as ViewStyle) : null,
        // The one feedback everywhere: hover dims, press dims more and shrinks a touch.
        !noFeedback && active && hovered && !pressed ? { opacity: HOVER_OPACITY } : null,
        !noFeedback && active && pressed ? { opacity: PRESSED_OPACITY, transform: [{ scale: 0.98 }] } : null,
      ]}
    >
      {typeof children === 'function'
        ? ({ pressed }: { pressed: boolean }) => children({ pressed, hovered })
        : children}
    </Pressable>
  );
}
