import { CommonActions, useNavigation } from '@react-navigation/native';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { SCREEN_REGISTRY } from '../navigation/registry';
import { useAppStore } from '../store/useAppStore';
import { useTheme } from '../theme';

/**
 * Build-step-1 placeholder: shows the wireframe id/title and exposes every
 * navigation edge from the wireframe so the full graph is tappable before the
 * real screens land. Replaced screen-by-screen in steps 2–6.
 */
export function createPlaceholderScreen(routeName: string) {
  const meta = SCREEN_REGISTRY[routeName];

  return function PlaceholderScreen() {
    const navigation = useNavigation<any>();
    const theme = useTheme();
    const { colors, spacing, radii, typography } = theme;
    const signIn = useAppStore((s) => s.signIn);
    const signOut = useAppStore((s) => s.signOut);

    const onEdge = (edge: (typeof meta.edges)[number]) => {
      if (edge.action === 'back') {
        navigation.goBack();
        return;
      }
      if (edge.action === 'signIn') {
        signIn();
        return;
      }
      if (edge.action === 'signOut') {
        signOut();
        return;
      }
      if (edge.tab) {
        // Cross-tab jump: land on the target screen with the tab root beneath it.
        navigation.dispatch(
          CommonActions.navigate(edge.tab, { screen: edge.to, initial: false }),
        );
        return;
      }
      navigation.navigate(edge.to);
    };

    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={{ padding: spacing.screenH, paddingBottom: spacing.xxxl }}
      >
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radii.md,
              padding: spacing.lg,
              marginBottom: spacing.lg,
            },
          ]}
        >
          <Text style={[typography.label, { color: colors.textTertiary }]}>
            {meta.wireframeId}
          </Text>
          <Text
            style={[typography.headline, { color: colors.textPrimary, marginTop: spacing.xs }]}
          >
            {meta.title}
          </Text>
          <Text
            style={[typography.bodySmall, { color: colors.textSecondary, marginTop: spacing.xs }]}
          >
            Placeholder — real screen lands in a later build step.
          </Text>
        </View>

        {meta.edges.length > 0 && (
          <Text
            style={[typography.label, { color: colors.textTertiary, marginBottom: spacing.sm }]}
          >
            Wireframe actions
          </Text>
        )}
        {meta.edges.map((edge) => (
          <Pressable
            key={edge.label}
            onPress={() => onEdge(edge)}
            style={({ pressed }) => [
              styles.edgeBtn,
              {
                backgroundColor:
                  edge.action === 'signOut' ? colors.dangerSurface : colors.primarySurface,
                borderRadius: radii.md,
                padding: spacing.md,
                marginBottom: spacing.sm,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Text
              style={[
                typography.bodyMedium,
                { color: edge.action === 'signOut' ? colors.danger : colors.primaryDeep },
              ]}
            >
              {edge.label}
            </Text>
            {edge.tab ? (
              <Text style={[typography.caption, { color: colors.textTertiary }]}>
                cross-tab → {edge.tab}
              </Text>
            ) : null}
          </Pressable>
        ))}
      </ScrollView>
    );
  };
}

const styles = StyleSheet.create({
  card: { borderWidth: StyleSheet.hairlineWidth },
  edgeBtn: {},
});
