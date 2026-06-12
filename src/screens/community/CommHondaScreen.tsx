import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import React, { useEffect } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { PostCard } from '../../components/PostCard';
import { Screen } from '../../components/ui';
import { CommunityStackParamList } from '../../navigation/types';
import { CHANNELS } from '../../services/mock/data';
import { communityService } from '../../services';
import { radii, spacing, useTheme } from '../../theme';

type Nav = NativeStackNavigationProp<CommunityStackParamList, 'CommHonda'>;

/** Wireframe s-comm-honda: Honda Owners feed with + Post header action. */
export function CommHondaScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const channel = CHANNELS[0];
  const { data: posts, isLoading } = useQuery({
    queryKey: ['feed', channel.id],
    queryFn: () => communityService.getFeed(channel.id),
  });

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => navigation.navigate('CommCreate')}
          style={({ pressed }) => ({
            backgroundColor: colors.primary,
            borderRadius: radii.sm,
            paddingHorizontal: 12,
            paddingVertical: 6,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <Text style={{ fontSize: 13, fontWeight: '600', color: colors.onPrimary }}>+ Post</Text>
          <Text style={{ fontSize: 11, color: 'rgba(255,255,255,.6)' }}>+50 pts</Text>
        </Pressable>
      ),
    });
  }, [navigation, colors]);

  return (
    <Screen>
      <View style={{ flexDirection: 'row', gap: 6, marginBottom: spacing.md }}>
        <View
          style={{
            backgroundColor: colors.primarySurface,
            borderRadius: radii.pill,
            paddingHorizontal: 10,
            paddingVertical: 3,
          }}
        >
          <Text style={{ fontSize: 12, color: colors.primaryDark }}>
            {channel.members.toLocaleString()} members
          </Text>
        </View>
        <View
          style={{
            backgroundColor: colors.successSurface,
            borderRadius: radii.pill,
            paddingHorizontal: 10,
            paddingVertical: 3,
          }}
        >
          <Text style={{ fontSize: 12, color: colors.successDeep }}>
            {channel.newPosts} new posts
          </Text>
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.xxl }} />
      ) : (
        posts?.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onPress={() => navigation.navigate('CommPost', { postId: post.id })}
          />
        ))
      )}
    </Screen>
  );
}
