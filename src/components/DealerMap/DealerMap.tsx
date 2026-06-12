import React, { useEffect, useRef } from 'react';
import { Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import { DEFAULT_ZOOM, DealerMapProps, MapMarker, isLightPin } from './types';

/**
 * Native map: react-native-maps (Apple Maps on iOS, Google Maps on Android —
 * both bundled with Expo Go, no config plugin needed). Same props as the
 * Leaflet web twin; pins are custom marker views styled like the web pills.
 */

/** Leaflet-style zoom level → region span in degrees. */
const zoomToDelta = (zoom: number) => 360 / Math.pow(2, zoom + 1.5);

function PinView({ marker }: { marker: MapMarker }) {
  const light = isLightPin(marker.color);
  const scale = marker.selected ? 1.2 : 1;
  return (
    <View style={{ alignItems: 'center', transform: [{ scale }] }}>
      <View
        style={{
          backgroundColor: marker.color,
          borderRadius: 999,
          borderWidth: marker.selected ? 2 : light ? 1 : 1.5,
          borderColor: marker.selected ? '#1A1A1A' : light ? '#ccc' : '#fff',
          paddingHorizontal: 10,
          paddingVertical: 5,
          shadowColor: '#000',
          shadowOpacity: 0.25,
          shadowRadius: 5,
          shadowOffset: { width: 0, height: 2 },
          elevation: 3,
        }}
      >
        <Text style={{ fontSize: 12, fontWeight: '800', color: light ? '#1A1A1A' : '#fff' }}>
          {marker.label}
        </Text>
      </View>
      {marker.tag ? (
        <Text
          style={{
            fontSize: 9,
            fontWeight: '700',
            marginTop: 2,
            color: marker.tagColor ?? '#534AB7',
            textShadowColor: '#fff',
            textShadowRadius: 3,
          }}
        >
          {marker.tag}
        </Text>
      ) : null}
    </View>
  );
}

export function DealerMap({
  markers,
  center,
  zoom = DEFAULT_ZOOM,
  userLocation,
  onSelect,
  style,
}: DealerMapProps) {
  const mapRef = useRef<MapView>(null);
  const delta = zoomToDelta(zoom);

  // Pan when the focus changes (e.g. a card/pin gets selected).
  useEffect(() => {
    mapRef.current?.animateToRegion(
      { latitude: center.lat, longitude: center.lng, latitudeDelta: delta, longitudeDelta: delta },
      350,
    );
  }, [center.lat, center.lng, delta]);

  return (
    <MapView
      ref={mapRef}
      style={style}
      initialRegion={{
        latitude: center.lat,
        longitude: center.lng,
        latitudeDelta: delta,
        longitudeDelta: delta,
      }}
    >
      {userLocation ? (
        <Marker
          coordinate={{ latitude: userLocation.lat, longitude: userLocation.lng }}
          anchor={{ x: 0.5, y: 0.5 }}
          tracksViewChanges={false}
        >
          <View
            style={{
              width: 18,
              height: 18,
              borderRadius: 9,
              backgroundColor: '#378ADD',
              borderWidth: 3,
              borderColor: '#fff',
              shadowColor: '#378ADD',
              shadowOpacity: 0.5,
              shadowRadius: 6,
              elevation: 3,
            }}
          />
        </Marker>
      ) : null}
      {markers.map((m) => (
        // Key includes selection so the custom view re-renders when it flips.
        <Marker
          key={`${m.id}-${m.selected ? 'sel' : 'idle'}`}
          coordinate={{ latitude: m.lat, longitude: m.lng }}
          anchor={{ x: 0.5, y: 0.5 }}
          zIndex={m.selected ? 10 : 1}
          onPress={() => onSelect?.(m.id)}
        >
          <PinView marker={m} />
        </Marker>
      ))}
    </MapView>
  );
}
