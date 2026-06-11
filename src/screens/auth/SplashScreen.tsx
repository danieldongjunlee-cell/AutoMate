import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { LogoMark } from '../../components/Logo';
import { PrimaryButton } from '../../components/PrimaryButton';
import { AuthStackParamList } from '../../navigation/types';
import { authService } from '../../services/mock/authService';
import { useAppStore } from '../../store/useAppStore';
import { palette, radii, spacing } from '../../theme';
import { AuthScreenShell } from './AuthScreenShell';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Splash'>;

export function SplashScreen() {
  const navigation = useNavigation<Nav>();
  const signIn = useAppStore((s) => s.signIn);
  const [socialLoading, setSocialLoading] = useState<'apple' | 'google' | null>(null);

  const onSocial = async (provider: 'apple' | 'google') => {
    setSocialLoading(provider);
    const { ok } = await authService.socialLogIn(provider);
    setSocialLoading(null);
    if (ok) signIn();
  };

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
            fontSize: 12,
            color: 'rgba(255,255,255,.45)',
            letterSpacing: 1.6,
            marginTop: spacing.sm,
          }}
        >
          YOUR CAR. YOUR RIGHTS. YOUR SAVINGS.
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
          Submit photos · Get real dealer quotes{'\n'}Book instantly or call directly
        </Text>
      </LinearGradient>

      <PrimaryButton
        label="Get started →"
        variant="auth"
        onPress={() => navigation.navigate('SignUp')}
        style={{ marginBottom: spacing.sm }}
      />
      <Pressable
        onPress={() => navigation.navigate('LogIn')}
        style={({ pressed }) => ({
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,.3)',
          borderRadius: radii.md,
          paddingVertical: 14,
          alignItems: 'center',
          marginBottom: spacing.lg,
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Text style={{ color: 'rgba(255,255,255,.85)', fontSize: 15 }}>
          I already have an account
        </Text>
      </Pressable>

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

      {/* Social buttons */}
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        {(
          [
            { provider: 'apple', icon: '', label: 'Apple' },
            { provider: 'google', icon: 'G', label: 'Google' },
          ] as const
        ).map(({ provider, icon, label }) => (
          <Pressable
            key={provider}
            onPress={() => onSocial(provider)}
            disabled={socialLoading !== null}
            style={({ pressed }) => ({
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: spacing.sm,
              backgroundColor: '#fff',
              borderRadius: radii.md,
              paddingVertical: 13,
              opacity: pressed || socialLoading === provider ? 0.6 : 1,
            })}
          >
            <Text style={{ fontSize: 16, fontWeight: '700', color: palette.textPrimary }}>
              {icon}
            </Text>
            <Text style={{ fontSize: 14, color: palette.textPrimary }}>{label}</Text>
          </Pressable>
        ))}
      </View>
    </AuthScreenShell>
  );
}
