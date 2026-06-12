import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, Screen } from '../../components/ui';
import { ProfileStackParamList } from '../../navigation/types';
import { radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<ProfileStackParamList>;

interface Step {
  title: string;
  body: string;
}

/** Shared help-article layout (s-help-*): hero card, numbered steps, support CTA. */
function HelpArticle({
  icon,
  title,
  steps,
  hideContactCta,
  children,
}: {
  icon: string;
  title: string;
  steps: Step[];
  hideContactCta?: boolean;
  children?: React.ReactNode;
}) {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  return (
    <Screen>
      {/* Hero */}
      <View
        style={{
          backgroundColor: colors.primarySurface,
          borderRadius: radii.md,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.primaryLight,
          padding: spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.md,
          marginBottom: spacing.md,
        }}
      >
        <Text style={{ fontSize: 32 }}>{icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.primaryDeep }}>{title}</Text>
          <Text style={{ fontSize: 12, color: colors.primaryDark }}>Help article · 2 min read</Text>
        </View>
      </View>

      {/* Numbered steps */}
      {steps.map((step, i) => (
        <Card key={step.title} style={{ padding: spacing.md, marginBottom: spacing.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: 6 }}>
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: colors.onPrimary }}>{i + 1}</Text>
            </View>
            <Text style={{ flex: 1, fontSize: 15, fontWeight: '700', color: colors.textPrimary }}>
              {step.title}
            </Text>
          </View>
          <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 21 }}>
            {step.body}
          </Text>
        </Card>
      ))}

      {children}

      {hideContactCta ? null : (
        <Pressable
          onPress={() => navigation.navigate('HelpContact')}
          style={({ pressed }) => ({
            backgroundColor: colors.surface,
            borderRadius: radii.sm,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.border,
            paddingVertical: 13,
            alignItems: 'center',
            marginTop: spacing.xs,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.primaryDark }}>
            Still need help? Contact support →
          </Text>
        </Pressable>
      )}
    </Screen>
  );
}

/** Wireframe s-help-photos. */
export function HelpPhotosScreen() {
  return (
    <HelpArticle
      icon="📷"
      title="How to submit damage photos"
      steps={[
        {
          title: 'Select the damaged part',
          body:
            'Open the Home tab, tap "Get a Repair Estimate," and pick one part on the car diagram. Submit each damaged part separately for the most accurate quotes.',
        },
        {
          title: 'Follow the photo guide',
          body:
            'Shoot in daylight or bright shade, stand 3–5 feet away, and capture at least 3 angles: straight-on, left 45°, and right 45°. Avoid flash — glare hides dent depth.',
        },
        {
          title: 'Pick the damage type',
          body:
            'On the camera screen, tag the damage as Dent, Scratch, Crack, or Paint so our AI routes your request to the right specialists.',
        },
        {
          title: 'Review and submit',
          body:
            'Check your parts list on the Confirm Damage screen, then submit. 12 nearby shops are notified instantly — quotes usually arrive in 1–3 hours.',
        },
      ]}
    />
  );
}

/** Wireframe s-help-quotes. */
export function HelpQuotesScreen() {
  return (
    <HelpArticle
      icon="💰"
      title="Understanding quotes & pricing"
      steps={[
        {
          title: 'Photo-based estimates',
          body:
            'Every quote is based on your submitted photos. The AI confidence score (e.g. 87%) shows how certain the estimate range is — higher confidence means less variance after inspection.',
        },
        {
          title: 'Why prices vary',
          body:
            'The same dent can range $285–$480 across shops based on labor rates, parts (OEM vs aftermarket), and technique (PDR vs traditional bodywork).',
        },
        {
          title: 'The RECOMMENDED tag',
          body:
            'Our AI balances price, distance, rating, and parts quality — not just the lowest number. A mid-priced shop with OEM parts and 4.9★ often beats the cheapest quote.',
        },
        {
          title: 'Final price protection',
          body:
            'Shops commit to their quoted range. If in-person inspection reveals hidden damage, you approve any change before work begins — no surprise charges.',
        },
      ]}
    />
  );
}

/** Wireframe s-help-bookings. */
export function HelpBookingsScreen() {
  return (
    <HelpArticle
      icon="📅"
      title="Managing bookings"
      steps={[
        {
          title: 'View your bookings',
          body:
            'All upcoming appointments appear on the Maintenance tab dashboard and in Notifications. Tap any booking to see details, directions, and shop hours.',
        },
        {
          title: 'Reschedule or cancel',
          body:
            "Open the booking and tap Edit. Free rescheduling up to 24 hours before your appointment; same-day changes depend on the shop's policy.",
        },
        {
          title: 'Reminders',
          body:
            'We automatically remind you 1 day before every appointment. Manage reminder settings in Profile → Settings → Notifications.',
        },
        {
          title: 'After your visit',
          body:
            "Payment is charged only after service completion. Your service record is added to Maintenance History automatically — boosting your car's documented resale value.",
        },
      ]}
    />
  );
}

/** Wireframe s-help-contact: chat / email / phone + action stubs. */
export function HelpContactScreen() {
  const { colors } = useTheme();
  return (
    <HelpArticle
      icon="📞"
      title="Contact support"
      hideContactCta
      steps={[
        {
          title: 'Chat with us',
          body: 'Fastest option — average reply under 5 minutes, 7AM–10PM ET daily.',
        },
        {
          title: 'Email',
          body: 'support@automate.app — we respond within 24 hours, usually much faster.',
        },
        {
          title: 'Phone',
          body: '(703) 555-0123 · Mon–Fri 8AM–8PM ET. Have your booking ID ready for fastest service.',
        },
      ]}
    >
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs }}>
        <Pressable
          onPress={() => Alert.alert('Start chat', 'Live chat connects to support with the backend.')}
          style={({ pressed }) => ({
            flex: 1,
            backgroundColor: colors.primary,
            borderRadius: radii.sm,
            paddingVertical: 13,
            alignItems: 'center',
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <Text style={{ fontSize: 14, fontWeight: '700', color: colors.onPrimary }}>
            💬 Start chat
          </Text>
        </Pressable>
        <Pressable
          onPress={() =>
            Alert.alert('Email us', 'Opens a draft to support@automate.app with the backend.')
          }
          style={({ pressed }) => ({
            flex: 1,
            backgroundColor: colors.surface,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.border,
            borderRadius: radii.sm,
            paddingVertical: 13,
            alignItems: 'center',
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={{ fontSize: 14, color: colors.textSecondary }}>✉️ Email us</Text>
        </Pressable>
      </View>
    </HelpArticle>
  );
}
