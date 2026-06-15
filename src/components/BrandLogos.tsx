import React from 'react';
import { Path, Svg } from 'react-native-svg';

/**
 * Real brand logos for the social sign-in / linked-account UI.
 * Both use a 0 0 24 24 viewBox so `size` maps directly to width/height.
 */

/** Apple silhouette mark. Single fill — pass color="#fff" on dark buttons. */
export function AppleLogo({ size, color = '#000' }: { size: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        fill={color}
        d="M17.05 12.04c-.03-2.6 2.13-3.85 2.22-3.91-1.21-1.77-3.1-2.02-3.77-2.04-1.6-.16-3.13.94-3.94.94-.81 0-2.07-.92-3.4-.9-1.75.03-3.36 1.02-4.26 2.58-1.82 3.16-.47 7.84 1.3 10.41.86 1.26 1.89 2.67 3.24 2.62 1.3-.05 1.79-.84 3.36-.84 1.57 0 2.01.84 3.39.81 1.4-.02 2.29-1.28 3.15-2.55.99-1.46 1.4-2.87 1.42-2.95-.03-.01-2.72-1.04-2.75-4.13zM14.6 4.27c.72-.87 1.2-2.08 1.07-3.29-1.03.04-2.28.69-3.02 1.56-.66.77-1.24 2-1.08 3.18 1.15.09 2.32-.58 3.03-1.45z"
      />
    </Svg>
  );
}

/**
 * Google four-color "G" mark. The `color` prop is accepted for a consistent
 * API but ignored — the official mark is always its four brand colors.
 */
export function GoogleLogo({ size }: { size: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        fill="#4285F4"
        d="M23.5 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.55-5.17 3.55-8.87z"
      />
      <Path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.76-2.11-6.7-4.94H1.3v3.1A12 12 0 0 0 12 24z"
      />
      <Path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.3a12 12 0 0 0 0 10.8z" />
      <Path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42A11.5 11.5 0 0 0 12 0 12 12 0 0 0 1.3 6.6l4 3.1C6.24 6.86 8.88 4.75 12 4.75z"
      />
    </Svg>
  );
}
