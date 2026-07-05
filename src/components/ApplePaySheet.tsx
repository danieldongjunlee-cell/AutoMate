import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Modal, Text, View } from 'react-native';

import { radii, spacing } from '../theme';
import { Tappable } from './Tappable';

type Stage = 'confirm' | 'processing' | 'done';

/**
 * Simulated Apple Pay bottom sheet (user-feedback pass 1). Dark sheet with
 * the  Pay header, card row, optional total line (payment contexts) and the
 * "Confirm with Side Button" affordance → animated processing → ✓ Done.
 * In payment contexts `onConfirmed` completes the payment path (same onPay).
 */
export function ApplePaySheet({
  visible,
  onClose,
  onConfirmed,
  totalLabel,
  cardLabel = 'Visa •••• 4242',
  merchant = 'AutoMate',
}: {
  visible: boolean;
  onClose: () => void;
  /** Called after the ✓ Done beat — wire the real payment handler here. */
  onConfirmed?: () => void;
  /** e.g. "$49.00" — when set the sheet shows a "Pay Total" line. */
  totalLabel?: string;
  cardLabel?: string;
  merchant?: string;
}) {
  const [stage, setStage] = useState<Stage>('confirm');
  const checkScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setStage('confirm');
      checkScale.setValue(0);
    }
  }, [visible, checkScale]);

  useEffect(() => {
    if (stage === 'processing') {
      const t = setTimeout(() => setStage('done'), 1400);
      return () => clearTimeout(t);
    }
    if (stage === 'done') {
      Animated.spring(checkScale, { toValue: 1, useNativeDriver: true, friction: 5 }).start();
      const t = setTimeout(() => {
        onClose();
        onConfirmed?.();
      }, 1000);
      return () => clearTimeout(t);
    }
  }, [stage, checkScale, onClose, onConfirmed]);

  const busy = stage !== 'confirm';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Tappable
        noFeedback
        onPress={busy ? undefined : onClose}
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,.55)', justifyContent: 'flex-end' }}
      >
        <View
          onStartShouldSetResponder={() => true}
          style={{
            backgroundColor: '#1C1C1E',
            borderTopLeftRadius: radii.sheet,
            borderTopRightRadius: radii.sheet,
            padding: spacing.xl,
            paddingBottom: spacing.xxxl,
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: spacing.lg,
            }}
          >
            <Text style={{ fontSize: 19, fontWeight: '700', color: '#fff' }}> Pay</Text>
            {!busy ? (
              <Tappable onPress={onClose} hitSlop={8}>
                <Text style={{ fontSize: 14, color: '#0A84FF' }}>Cancel</Text>
              </Tappable>
            ) : null}
          </View>

          {/* Card row */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.sm,
              backgroundColor: '#2C2C2E',
              borderRadius: radii.md,
              padding: spacing.md,
              marginBottom: spacing.sm,
            }}
          >
            <View
              style={{
                width: 42,
                height: 28,
                borderRadius: 5,
                backgroundColor: '#0A84FF',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: '800', color: '#fff' }}>VISA</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#fff' }}>{cardLabel}</Text>
              <Text style={{ fontSize: 13, color: 'rgba(255,255,255,.55)' }}>{merchant}</Text>
            </View>
            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,.4)' }}>›</Text>
          </View>

          {/* Total (payment contexts only) */}
          {totalLabel ? (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: spacing.xs,
                marginBottom: spacing.lg,
              }}
            >
              <Text style={{ fontSize: 14, color: 'rgba(255,255,255,.6)' }}>
                Pay {merchant} · Total
              </Text>
              <Text style={{ fontSize: 22, fontWeight: '800', color: '#fff' }}>{totalLabel}</Text>
            </View>
          ) : (
            <View style={{ marginBottom: spacing.lg }} />
          )}

          {/* Confirm area */}
          <View style={{ alignItems: 'center', minHeight: 96, justifyContent: 'center' }}>
            {stage === 'confirm' ? (
              <Tappable onPress={() => setStage('processing')} style={{ alignItems: 'center' }}>
                <View
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: 27,
                    borderWidth: 2,
                    borderColor: '#0A84FF',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: spacing.sm,
                  }}
                >
                  <Text style={{ fontSize: 24, color: '#0A84FF' }}>⏻</Text>
                </View>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#fff' }}>
                  Confirm with Side Button
                </Text>
                <Text style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', marginTop: 2 }}>
                  Double-click to {totalLabel ? 'pay' : 'continue'}
                </Text>
              </Tappable>
            ) : stage === 'processing' ? (
              <View style={{ alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={{ fontSize: 14, color: 'rgba(255,255,255,.7)', marginTop: spacing.sm }}>
                  Processing…
                </Text>
              </View>
            ) : (
              <Animated.View style={{ alignItems: 'center', transform: [{ scale: checkScale }] }}>
                <View
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: 27,
                    backgroundColor: '#30D158',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: spacing.sm,
                  }}
                >
                  <Text style={{ fontSize: 26, fontWeight: '700', color: '#fff' }}>✓</Text>
                </View>
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff' }}>Done</Text>
              </Animated.View>
            )}
          </View>
        </View>
      </Tappable>
    </Modal>
  );
}
