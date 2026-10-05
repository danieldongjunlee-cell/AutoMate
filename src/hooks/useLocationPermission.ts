import * as Location from 'expo-location';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { useAppStore } from '../store/useAppStore';

/**
 * Ask for location once at launch through the platform's own prompt: the
 * iOS "Allow AutoMate to use your location?" sheet (purpose string in
 * app.json → expo-location plugin), the Android runtime dialog, or the
 * browser's geolocation bar on web. Nothing is drawn by the app itself.
 * On grant the position is kept in the store for the shop maps; a denial
 * leaves it null and the maps fall back to the default area.
 */
export function useLocationPermission() {
  const setUserLocation = useAppStore((s) => s.setUserLocation);
  useEffect(() => {
    // The screenshot/E2E export runs headless, where the prompt can't be answered.
    if (process.env.EXPO_PUBLIC_E2E === '1') return;
    let cancelled = false;

    if (Platform.OS === 'web') {
      if (typeof navigator === 'undefined' || !navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (!cancelled) setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {},
        { maximumAge: 5 * 60 * 1000, timeout: 15000 },
      );
      return () => {
        cancelled = true;
      };
    }

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted' || cancelled) return;
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        if (!cancelled) setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      } catch {
        // Location services off or unavailable: stay on the default area.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [setUserLocation]);
}
