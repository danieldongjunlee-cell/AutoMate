import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { PrimaryButton } from '../../components/PrimaryButton';
import { Card, Screen } from '../../components/ui';
import { USER } from '../../services/mock/data';
import { palette, spacing, useTheme } from '../../theme';

/** Wireframe s-prof-edit-profile: avatar + name/username/bio form. */
export function ProfEditProfileScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [name, setName] = useState(USER.name);
  const [username, setUsername] = useState(USER.username);
  const [bio, setBio] = useState('');

  const field = (
    label: string,
    value: string,
    onChange: (t: string) => void,
    placeholder?: string,
    last?: boolean,
  ) => (
    <View
      style={{
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth,
        borderBottomColor: colors.divider,
      }}
    >
      <Text
        style={{
          fontSize: 11,
          fontWeight: '600',
          color: colors.textTertiary,
          textTransform: 'uppercase',
          marginBottom: 3,
        }}
      >
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.textPlaceholder}
        style={{ fontSize: 16, color: colors.textPrimary, paddingVertical: 2 }}
      />
    </View>
  );

  return (
    <Screen>
      <View style={{ alignItems: 'center', marginBottom: spacing.lg }}>
        <LinearGradient
          colors={[palette.primary, palette.primaryDark]}
          style={{
            width: 84,
            height: 84,
            borderRadius: 42,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: spacing.sm,
          }}
        >
          <Text style={{ fontSize: 34, fontWeight: '700', color: '#fff' }}>{USER.initial}</Text>
        </LinearGradient>
        <Pressable hitSlop={8}>
          <Text style={{ fontSize: 13, color: colors.primaryDark }}>Change photo</Text>
        </Pressable>
      </View>

      <Card style={{ overflow: 'hidden', marginBottom: spacing.md }}>
        {field('Full name', name, setName)}
        {field('Username', username, setUsername)}
        {field('Bio', bio, setBio, 'Add a short bio...', true)}
      </Card>

      <PrimaryButton label="Save changes" onPress={() => navigation.goBack()} />
    </Screen>
  );
}
