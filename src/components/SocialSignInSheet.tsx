import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, View } from 'react-native';

import { authService } from '../services';
import { palette, radii, spacing } from '../theme';
import { showAlert } from '../utils/alerts';
import { AppleLogo, GoogleLogo } from './BrandLogos';
import { Tappable } from './Tappable';

export type SocialProvider = 'google' | 'apple';

const DEMO_ACCOUNT = { name: 'Demo User', email: 'demo@automate.app' };

/**
 * Branded provider chooser (user-feedback pass 1: auth like a real app).
 * Google → white rounded account-chooser card; Apple → dark Apple ID sheet.
 * Picking the demo account runs authService.socialSignIn(provider) with an
 * inline spinner, then fires onSignedIn. Reused by Splash and
 * ProfLinkedAccounts ("Connect").
 */
export function SocialSignInSheet({
  provider,
  onClose,
  onSignedIn,
}: {
  /** Which sheet to show; null hides the modal. */
  provider: SocialProvider | null;
  onClose: () => void;
  onSignedIn: (provider: SocialProvider) => void;
}) {
  const [loading, setLoading] = useState(false);

  // Fresh state every time the sheet opens.
  useEffect(() => {
    if (provider) setLoading(false);
  }, [provider]);

  const signIn = async (p: SocialProvider) => {
    if (loading) return;
    setLoading(true);
    const { ok } = await authService.socialSignIn(p);
    setLoading(false);
    if (ok) onSignedIn(p);
  };

  return (
    <Modal visible={provider !== null} transparent animationType="fade" onRequestClose={onClose}>
      <Tappable
        noFeedback
        onPress={loading ? undefined : onClose}
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,.55)',
          justifyContent: provider === 'apple' ? 'flex-end' : 'center',
          padding: provider === 'apple' ? 0 : spacing.xl,
        }}
      >
        {provider === 'google' ? (
          <GoogleChooser loading={loading} onPick={() => signIn('google')} onClose={onClose} />
        ) : provider === 'apple' ? (
          <AppleSheet loading={loading} onContinue={() => signIn('apple')} onClose={onClose} />
        ) : null}
      </Tappable>
    </Modal>
  );
}

/** White rounded Google account-chooser card. */
function GoogleChooser({
  loading,
  onPick,
  onClose,
}: {
  loading: boolean;
  onPick: () => void;
  onClose: () => void;
}) {
  return (
    <View
      // Swallow taps so the backdrop close doesn't fire.
      onStartShouldSetResponder={() => true}
      style={{
        backgroundColor: '#fff',
        borderRadius: radii.lg,
        paddingVertical: spacing.xl,
        overflow: 'hidden',
      }}
    >
      <View style={{ alignItems: 'center', marginBottom: spacing.lg, paddingHorizontal: spacing.xl }}>
        {/* Real four-color Google "G" mark */}
        <View style={{ marginBottom: spacing.sm }}>
          <GoogleLogo size={30} />
        </View>
        <Text style={{ fontSize: 17, fontWeight: '500', color: '#202124' }}>
          Sign in with Google
        </Text>
        <Text style={{ fontSize: 13, color: '#5F6368', marginTop: 3 }}>
          to continue to AutoMate
        </Text>
      </View>

      <Tappable
        onPress={onPick}
        disabled={loading}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          paddingHorizontal: spacing.xl,
          paddingVertical: 13,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderColor: '#DADCE0',
        }}
      >
        <View
          style={{
            width: 34,
            height: 34,
            borderRadius: 17,
            backgroundColor: '#4285F4',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff' }}>D</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#202124' }}>
            {DEMO_ACCOUNT.name}
          </Text>
          <Text style={{ fontSize: 12, color: '#5F6368' }}>{DEMO_ACCOUNT.email}</Text>
        </View>
        {loading ? <ActivityIndicator size="small" color="#4285F4" /> : null}
      </Tappable>

      <Tappable
        onPress={() =>
          showAlert('Use another account', 'Demo build — only the demo Google account is available.')
        }
        disabled={loading}
        style={{
          paddingHorizontal: spacing.xl,
          paddingVertical: 13,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderColor: '#DADCE0',
        }}
      >
        <Text style={{ fontSize: 14, fontWeight: '500', color: '#1A73E8' }}>
          Use another account
        </Text>
      </Tappable>

      <Tappable onPress={onClose} disabled={loading} style={{ paddingTop: spacing.md, alignItems: 'center' }}>
        <Text style={{ fontSize: 13, color: '#5F6368' }}>Cancel</Text>
      </Tappable>
    </View>
  );
}

/** Dark Apple ID bottom sheet. */
function AppleSheet({
  loading,
  onContinue,
  onClose,
}: {
  loading: boolean;
  onContinue: () => void;
  onClose: () => void;
}) {
  return (
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
      <View
        style={{
          width: 36,
          height: 5,
          borderRadius: 3,
          backgroundColor: 'rgba(255,255,255,.3)',
          alignSelf: 'center',
          marginBottom: spacing.lg,
        }}
      />
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.sm,
          marginBottom: 4,
        }}
      >
        <AppleLogo size={20} color="#fff" />
        <Text
          style={{
            fontSize: 19,
            fontWeight: '700',
            color: '#fff',
            textAlign: 'center',
          }}
        >
          Sign in with Apple
        </Text>
      </View>
      <Text
        style={{
          fontSize: 13,
          color: 'rgba(255,255,255,.55)',
          textAlign: 'center',
          marginBottom: spacing.lg,
        }}
      >
        Use your Apple ID to continue to AutoMate
      </Text>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          backgroundColor: '#2C2C2E',
          borderRadius: radii.md,
          padding: spacing.md,
          marginBottom: spacing.lg,
        }}
      >
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: '#48484A',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff' }}>D</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#fff' }}>
            {DEMO_ACCOUNT.name}
          </Text>
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,.55)' }}>
            Apple ID · {DEMO_ACCOUNT.email}
          </Text>
        </View>
      </View>

      <Tappable
        onPress={onContinue}
        disabled={loading}
        style={{
          backgroundColor: '#fff',
          borderRadius: radii.md,
          paddingVertical: 14,
          alignItems: 'center',
          marginBottom: spacing.sm,
        }}
      >
        {loading ? (
          <ActivityIndicator size="small" color={palette.dark} />
        ) : (
          <Text style={{ fontSize: 15, fontWeight: '700', color: '#000' }}>Continue</Text>
        )}
      </Tappable>
      <Tappable onPress={onClose} disabled={loading} style={{ paddingVertical: 10, alignItems: 'center' }}>
        <Text style={{ fontSize: 14, color: 'rgba(255,255,255,.7)' }}>Cancel</Text>
      </Tappable>
    </View>
  );
}
