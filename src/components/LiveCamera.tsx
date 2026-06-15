import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Tappable } from './Tappable';
import { palette, radii, spacing, useTheme } from '../theme';

/**
 * Live in-app camera (expo-camera CameraView) — real device camera on native,
 * the browser webcam (getUserMedia) on web. Renders a live preview inside a
 * framed viewfinder with a shutter button; `onCapture` receives the photo uri.
 * Handles the permission prompt inline and shows an "Enable camera" CTA until
 * access is granted. `overlay` draws framing guides (brackets/grid) over the feed.
 */
export function LiveCamera({
  height = 210,
  onCapture,
  shutterLabel,
  overlay,
}: {
  height?: number;
  onCapture: (uri: string) => void;
  /** Optional caption under the shutter (e.g. "Capture receipt"). */
  shutterLabel?: string;
  overlay?: React.ReactNode;
}) {
  const [permission, requestPermission] = useCameraPermissions();
  const ref = useRef<CameraView>(null);
  const [busy, setBusy] = useState(false);

  const shoot = async () => {
    if (!ref.current || busy) return;
    setBusy(true);
    try {
      const pic = await ref.current.takePictureAsync({ quality: 0.6 });
      if (pic?.uri) onCapture(pic.uri);
    } finally {
      setBusy(false);
    }
  };

  const frame = (inner: React.ReactNode) => (
    <View
      style={{
        height,
        borderRadius: radii.lg,
        overflow: 'hidden',
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: '#333',
        backgroundColor: '#111',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {inner}
      {overlay}
    </View>
  );

  if (!permission) {
    return frame(<ActivityIndicator color={palette.primaryLight} />);
  }

  if (!permission.granted) {
    return frame(
      <View style={{ alignItems: 'center', padding: spacing.lg }}>
        <Text style={{ fontSize: 40, marginBottom: 6 }}>📷</Text>
        <Text style={{ color: 'rgba(255,255,255,.8)', fontSize: 13, textAlign: 'center', marginBottom: spacing.sm }}>
          Allow camera access to take photos
        </Text>
        <Tappable
          onPress={requestPermission}
          style={{ backgroundColor: palette.primary, borderRadius: radii.pill, paddingHorizontal: 18, paddingVertical: 9 }}
        >
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>Enable camera</Text>
        </Tappable>
      </View>,
    );
  }

  return frame(
    <>
      <CameraView ref={ref} style={StyleSheet.absoluteFill} facing="back" />
      <View style={{ position: 'absolute', bottom: 12, alignItems: 'center', alignSelf: 'center' }}>
        <Tappable
          onPress={shoot}
          disabled={busy}
          style={{
            width: 58,
            height: 58,
            borderRadius: 29,
            backgroundColor: 'rgba(255,255,255,.92)',
            borderWidth: 3,
            borderColor: palette.primary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {busy ? (
            <ActivityIndicator color={palette.primary} />
          ) : (
            <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: '#fff' }} />
          )}
        </Tappable>
        {shutterLabel ? (
          <Text style={{ marginTop: 4, fontSize: 11, color: 'rgba(255,255,255,.85)', fontWeight: '600' }}>
            {busy ? 'Capturing…' : shutterLabel}
          </Text>
        ) : null}
      </View>
    </>,
  );
}
