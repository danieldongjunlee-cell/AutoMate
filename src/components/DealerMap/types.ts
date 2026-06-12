import type { StyleProp, ViewStyle } from 'react-native';

/** Shared props for the platform-split real map (Leaflet web / RN-maps native). */

export interface LatLng {
  lat: number;
  lng: number;
}

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  /** Pin pill text, e.g. "$285" or a dealer name. */
  label: string;
  /** Pill background. "#fff" renders dark text + a light border automatically. */
  color: string;
  /** Caption under the pill (BEST PRICE / RECOMMENDED). */
  tag?: string;
  tagColor?: string;
  /** Selected pin enlarges + outlines + sorts above its neighbors. */
  selected?: boolean;
}

export interface DealerMapProps {
  markers: MapMarker[];
  /** Map focus — changing it pans the map (e.g. to the selected pin). */
  center: LatLng;
  /** Leaflet-style zoom level (native converts to region deltas). */
  zoom?: number;
  /** Blue "you are here" dot. */
  userLocation?: LatLng;
  onSelect?: (id: string) => void;
  style?: StyleProp<ViewStyle>;
}

export const DEFAULT_ZOOM = 12;

/** True for white pins ("Other quotes") that need dark text + a border. */
export const isLightPin = (color: string) => color.toLowerCase() === '#fff' || color.toLowerCase() === '#ffffff';
