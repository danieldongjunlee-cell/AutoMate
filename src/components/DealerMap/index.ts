/**
 * Platform-split real map. Metro resolves ./DealerMap to DealerMap.web.tsx
 * (Leaflet + OSM tiles) on web and DealerMap.tsx (react-native-maps) on
 * native — same props either way (./types).
 */
export { DealerMap } from './DealerMap';
export type { DealerMapProps, LatLng, MapMarker } from './types';
