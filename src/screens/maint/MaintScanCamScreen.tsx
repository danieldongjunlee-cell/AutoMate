import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';

import { Tappable } from '../../components/Tappable';

import { LiveCamera } from '../../components/LiveCamera';
import { PointsBadge } from '../../components/FilterChips';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/ui';
import { EARN_RULES } from '../../config/points';
import { MaintStackParamList } from '../../navigation/types';
import { maintService } from '../../services';
import { pickFromGallery } from '../../services/photos';
import { radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<MaintStackParamList, 'MaintScanCam'>;

const BRACKETS = [
  { top: 12, left: 12, borderTopWidth: 2, borderLeftWidth: 2 },
  { top: 12, right: 12, borderTopWidth: 2, borderRightWidth: 2 },
  { bottom: 12, left: 12, borderBottomWidth: 2, borderLeftWidth: 2 },
  { bottom: 12, right: 12, borderBottomWidth: 2, borderRightWidth: 2 },
] as const;

const VIEWFINDER_H = 190;

/**
 * Receipt scanner with REAL capture (user-feedback pass 2): the camera /
 * gallery buttons use expo-image-picker and show the actual image in the
 * viewfinder. The OCR itself stays mocked — Review scan parses the canonical
 * receipt regardless of pixels.
 */
export function MaintScanCamScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const [scanning, setScanning] = useState(false);
  const [picking, setPicking] = useState(false);
  // Real capture: shows the photographed/imported receipt in the frame.
  const [captured, setCaptured] = useState<{ source: 'camera' | 'gallery'; uri: string } | null>(
    null,
  );

  /** Import the receipt image from the gallery (live camera handles capture). */
  const grabFromGallery = async () => {
    if (picking) return;
    setPicking(true);
    try {
      const photo = await pickFromGallery();
      if (photo) setCaptured({ source: 'gallery', uri: photo.uri });
    } finally {
      setPicking(false);
    }
  };

  // Scan-line sweep + shimmer, animated only while the OCR call is pending.
  const sweep = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!scanning) return;
    const loop = Animated.loop(
      Animated.timing(sweep, {
        toValue: 1,
        duration: 900,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => {
      loop.stop();
      sweep.setValue(0);
    };
  }, [scanning, sweep]);

  const onReview = async () => {
    setScanning(true);
    try {
      // Mock: canonical receipt after a delay. API: POST /maintenance/scan,
      // which forwards to the damage-ai /receipt OCR endpoint.
      const receipt = await maintService.scanReceipt();
      navigation.navigate('MaintScanRev', { receipt });
    } finally {
      setScanning(false);
    }
  };

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
        <View
          style={{
            backgroundColor: colors.primarySurface,
            borderRadius: radii.pill,
            paddingHorizontal: 12,
            paddingVertical: 5,
          }}
        >
          <Text style={{ fontSize: 13, color: colors.primaryDark }}>📷 Receipt scanner</Text>
        </View>
        <PointsBadge points={EARN_RULES.scanReceipt} usd />
      </View>

      {/* Viewfinder — live camera until a receipt is captured/scanning */}
      {!captured && !scanning ? (
        <LiveCamera
          height={VIEWFINDER_H}
          shutterLabel="Capture receipt"
          onCapture={(uri) => setCaptured({ source: 'camera', uri })}
          overlay={
            <View pointerEvents="none" style={StyleSheet.absoluteFill}>
              {BRACKETS.map((pos, i) => (
                <View
                  key={i}
                  style={{ position: 'absolute', width: 30, height: 30, borderColor: colors.primary, borderRadius: 2, ...pos }}
                />
              ))}
            </View>
          }
        />
      ) : (
      <View
        style={{
          backgroundColor: '#111',
          borderRadius: radii.md,
          height: VIEWFINDER_H,
          marginBottom: spacing.sm,
          overflow: 'hidden',
        }}
      >
        {captured ? (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              alignItems: 'center',
              justifyContent: 'flex-end',
            }}
          >
            {/* The real captured/imported image fills the viewfinder */}
            <Image
              source={{ uri: captured.uri }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
            <Text
              style={{
                fontSize: 12,
                color: '#fff',
                fontWeight: '600',
                backgroundColor: 'rgba(0,0,0,.55)',
                paddingHorizontal: 10,
                paddingVertical: 3,
                borderRadius: radii.pill,
                overflow: 'hidden',
                marginBottom: 34,
              }}
            >
              🧾 Receipt {captured.source === 'gallery' ? 'imported' : 'captured'} ✓
            </Text>
          </View>
        ) : null}
        {BRACKETS.map((pos, i) => (
          <View
            key={i}
            style={{
              position: 'absolute',
              width: 30,
              height: 30,
              borderColor: colors.primary,
              borderRadius: 2,
              ...pos,
            }}
          />
        ))}
        {scanning ? (
          // OCR pending: animated scan-line sweep + shimmer band
          <Animated.View
            style={{
              position: 'absolute',
              left: 12,
              right: 12,
              top: 0,
              transform: [
                {
                  translateY: sweep.interpolate({
                    inputRange: [0, 1],
                    outputRange: [16, VIEWFINDER_H - 24],
                  }),
                },
              ],
            }}
          >
            <View
              style={{
                height: 2,
                backgroundColor: colors.primary,
                shadowColor: colors.primary,
                shadowOpacity: 0.9,
                shadowRadius: 8,
                elevation: 4,
              }}
            />
            <View style={{ height: 14, backgroundColor: colors.primary, opacity: 0.18 }} />
          </Animated.View>
        ) : (
          <View
            style={{
              position: 'absolute',
              left: 20,
              right: 20,
              top: '40%',
              height: 2,
              backgroundColor: colors.primary,
              opacity: 0.8,
            }}
          />
        )}
        <View style={{ position: 'absolute', bottom: 10, left: 0, right: 0, alignItems: 'center' }}>
          <Text
            style={{
              fontSize: 11,
              color: colors.primaryLight,
              backgroundColor: 'rgba(0,0,0,.55)',
              paddingHorizontal: 12,
              paddingVertical: 3,
              borderRadius: radii.pill,
              overflow: 'hidden',
            }}
          >
            {scanning ? 'Reading receipt…' : captured ? 'Ready to review' : 'Scanning...'}
          </Text>
        </View>
      </View>
      )}

      {/* Tips */}
      <View
        style={{
          backgroundColor: colors.warningSurface,
          borderRadius: radii.sm,
          padding: spacing.sm,
          flexDirection: 'row',
          gap: spacing.sm,
          marginBottom: spacing.sm,
        }}
      >
        <Text style={{ fontSize: 16 }}>💡</Text>
        <View>
          <Text style={{ fontSize: 13, fontWeight: '500', color: colors.warningDeep, marginBottom: 2 }}>
            Tips
          </Text>
          <Text style={{ fontSize: 12, color: colors.warningDeep, opacity: 0.85 }}>
            Lay flat · Good lighting · Keep text visible
          </Text>
        </View>
      </View>

      <Tappable
        onPress={grabFromGallery}
        disabled={picking}
        style={({ pressed }) => ({
          backgroundColor: colors.surface,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          borderRadius: radii.sm,
          paddingVertical: 12,
          alignItems: 'center',
          marginBottom: spacing.md,
          opacity: pressed || picking ? 0.7 : 1,
        })}
      >
        <Text style={{ fontSize: 14, color: colors.textTertiary }}>
          {captured?.source === 'gallery' ? '✓ Imported from gallery — repick' : '🗂 Gallery instead'}
        </Text>
      </Tappable>

      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <Tappable
          onPress={() => (captured ? setCaptured(null) : navigation.goBack())}
          style={({ pressed }) => ({
            flex: 1,
            backgroundColor: colors.surface,
            borderRadius: radii.md,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.border,
            paddingVertical: 14,
            alignItems: 'center',
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={{ fontSize: 14, color: colors.textSecondary }}>← Retake</Text>
        </Tappable>
        <PrimaryButton label="Review scan →" loading={scanning} onPress={onReview} style={{ flex: 2 }} />
      </View>
    </Screen>
  );
}
