import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Text, View } from 'react-native';

import { AppleLogo, GoogleLogo } from '../../components/BrandLogos';
import { LogoMark } from '../../components/Logo';
import { PrimaryButton } from '../../components/PrimaryButton';
import { LegalKind, LegalSheet } from '../../components/LegalSheet';
import { SocialSignInSheet, SocialProvider } from '../../components/SocialSignInSheet';
import { Tappable } from '../../components/Tappable';
import { AuthStackParamList } from '../../navigation/types';
import { useAppStore } from '../../store/useAppStore';
import { palette, radii, spacing } from '../../theme';
import { AuthScreenShell } from './AuthScreenShell';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Splash'>;

export function SplashScreen() {
  const navigation = useNavigation<Nav>();
  const signIn = useAppStore((s) => s.signIn);
  // Branded chooser sheet (user-feedback pass 1) instead of an inline spinner.
  const [sheetProvider, setSheetProvider] = useState<SocialProvider | null>(null);
  const [legal, setLegal] = useState<LegalKind>(null);

  return (
    <AuthScreenShell centered>
      {/* Hero card */}
      <LinearGradient
        colors={['#071326', palette.navy, palette.navyBright]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.7, y: 1 }}
        style={{
          borderRadius: radii.lg,
          paddingVertical: spacing.xxxl,
          paddingHorizontal: spacing.xl,
          alignItems: 'center',
          marginBottom: spacing.lg,
        }}
      >
        <LogoMark size={84} />
        <Text style={{ fontSize: 30, fontWeight: '800', color: '#fff', marginTop: spacing.md }}>
          Auto<Text style={{ color: palette.brandBlue }}>Mate</Text>
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: 'rgba(255,255,255,.7)',
            lineHeight: 22,
            textAlign: 'center',
            marginTop: spacing.lg,
          }}
        >
          Snap a photo. Compare real quotes.{'\n'}Book without paying upfront.
        </Text>
      </LinearGradient>

      <PrimaryButton
        label="Get started — it's free"
        variant="auth"
        onPress={() => navigation.navigate('SignUp')}
        style={{ marginBottom: spacing.sm }}
      />
      <Tappable
        onPress={() => navigation.navigate('LogIn')}
        style={{
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,.3)',
          borderRadius: radii.md,
          paddingVertical: 14,
          alignItems: 'center',
          marginBottom: spacing.lg,
        }}
      >
        <Text style={{ color: 'rgba(255,255,255,.85)', fontSize: 15 }}>
          I already have an account
        </Text>
      </Tappable>

      {/* Divider */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          marginBottom: spacing.md,
        }}
      >
        <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,.18)' }} />
        <Text style={{ fontSize: 13, color: 'rgba(255,255,255,.45)' }}>or continue with</Text>
        <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,.18)' }} />
      </View>

      {/* Social buttons → branded chooser sheets */}
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        {(
          [
            { provider: 'apple', label: 'Apple' },
            { provider: 'google', label: 'Google' },
          ] as const
        ).map(({ provider, label }) => (
          <Tappable
            key={provider}
            onPress={() => setSheetProvider(provider)}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: spacing.sm,
              backgroundColor: '#fff',
              borderRadius: radii.md,
              paddingVertical: 13,
            }}
          >
            {provider === 'apple' ? (
              <AppleLogo size={18} color={palette.textPrimary} />
            ) : (
              <GoogleLogo size={18} />
            )}
            <Text style={{ fontSize: 14, color: palette.textPrimary }}>{label}</Text>
          </Tappable>
        ))}
      </View>

      {/* ToS / Privacy disclaimer — light/translucent on the navy background. */}
      <Text
        style={{
          fontSize: 12,
          lineHeight: 18,
          color: 'rgba(255,255,255,.5)',
          textAlign: 'center',
          marginTop: spacing.lg,
        }}
      >
        By continuing, you agree to our{' '}
        <Text
          style={{ color: 'rgba(255,255,255,.8)', fontWeight: '600' }}
          onPress={() => setLegal('terms')}
        >
          Terms of Service
        </Text>
        {' & '}
        <Text
          style={{ color: 'rgba(255,255,255,.8)', fontWeight: '600' }}
          onPress={() => setLegal('privacy')}
        >
          Privacy Policy
        </Text>
        .
      </Text>

      <LegalSheet kind={legal} onClose={() => setLegal(null)} />

      <SocialSignInSheet
        provider={sheetProvider}
        onClose={() => setSheetProvider(null)}
        onSignedIn={() => {
          setSheetProvider(null);
          signIn(); // → Home
        }}
      />
    </AuthScreenShell>
  );
}
