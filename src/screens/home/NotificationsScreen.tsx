import { useNavigation } from '@react-navigation/native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useEffect } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { NotificationCard } from '../../components/NotificationCard';
import { Screen, SectionLabel } from '../../components/ui';
import { navigateCrossTab } from '../../navigation/crossTab';
import {
  AppNotification,
  notificationService,
} from '../../services/mock/notificationService';
import { spacing, useTheme } from '../../theme';

/** Wireframe s-notifications: unread/earlier groups with deep links. */
export function NotificationsScreen() {
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const { colors } = useTheme();
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationService.getNotifications,
  });

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={async () => {
            await notificationService.markAllRead();
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
          }}
          hitSlop={8}
        >
          <Text style={{ fontSize: 13, color: colors.primaryDark }}>Mark all read</Text>
        </Pressable>
      ),
    });
  }, [navigation, colors, queryClient]);

  const open = (n: AppNotification) => {
    if (n.unread) {
      // Fire-and-forget so the deep link opens on the same tap.
      notificationService
        .markRead(n.id)
        .then(() => queryClient.invalidateQueries({ queryKey: ['notifications'] }));
    }
    if (!n.target) return;
    if (n.target.tab) {
      navigateCrossTab(navigation, n.target.tab, n.target.screen, n.target.params);
    } else {
      navigation.navigate(n.target.screen, n.target.params);
    }
  };

  if (isLoading || !notifications) {
    return (
      <Screen>
        <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.xxl }} />
      </Screen>
    );
  }

  const unread = notifications.filter((n) => n.unread);
  const earlier = notifications.filter((n) => !n.unread);

  return (
    <Screen>
      {unread.length > 0 && (
        <>
          <SectionLabel>Unread</SectionLabel>
          {unread.map((n) => (
            <NotificationCard key={n.id} notification={n} onPress={() => open(n)} />
          ))}
          <View style={{ height: spacing.sm }} />
        </>
      )}
      <SectionLabel>Earlier</SectionLabel>
      {earlier.map((n) => (
        <NotificationCard key={n.id} notification={n} onPress={() => open(n)} />
      ))}
    </Screen>
  );
}
