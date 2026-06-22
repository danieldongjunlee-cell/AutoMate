import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TextInput, View } from 'react-native';

import { Tappable } from '../../components/Tappable';

import { PrimaryButton } from '../../components/PrimaryButton';
import { Card, Screen } from '../../components/ui';
import { isSupabaseConfigured } from '../../lib/supabase';
import { updateMyProfile } from '../../lib/profiles';
import { USER } from '../../services/mock/data';
import { pickFromGallery } from '../../services/photos';
import { useAppStore } from '../../store/useAppStore';
import { palette, spacing, useTheme } from '../../theme';
import { showAlert } from '../../utils/alerts';

/** Wireframe s-prof-edit-profile: avatar + name/username/bio form. */
export function ProfEditProfileScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const authedUser = useAppStore((s) => s.user);
  const patchUser = useAppStore((s) => s.patchUser);
  const [name, setName] = useState(authedUser?.name ?? USER.name);
  // Username starts blank until the user sets their own (no mock placeholder).
  const [username, setUsername] = useState(authedUser?.username ?? '');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState<string | undefined>(authedUser?.avatarUri);
  const [saving, setSaving] = useState(false);

  const changePhoto = async () => {
    const photo = await pickFromGallery();
    if (photo) {
      setAvatar(photo.uri);
      patchUser({ avatarUri: photo.uri }); // reflect immediately in the More tab
    }
  };

  const onSave = async () => {
    setSaving(true);
    try {
      // Persist to Supabase when configured so it survives relaunch + lives in the DB.
      if (isSupabaseConfigured) {
        await updateMyProfile({ full_name: name.trim(), username: username.trim() });
      }
      // Reflect immediately in the More-tab header (top-left name + @username).
      patchUser({ name: name.trim(), username: username.trim() });
      navigation.goBack();
    } catch (err) {
      showAlert('Save failed', err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

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
          fontSize: 12,
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
        {avatar ? (
          <Image
            source={{ uri: avatar }}
            style={{ width: 84, height: 84, borderRadius: 42, marginBottom: spacing.sm }}
          />
        ) : (
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
            <Text style={{ fontSize: 34, fontWeight: '700', color: '#fff' }}>
              {(name.trim().charAt(0) || USER.initial).toUpperCase()}
            </Text>
          </LinearGradient>
        )}
        <Tappable onPress={changePhoto} hitSlop={8}>
          <Text style={{ fontSize: 14, color: colors.primaryDark }}>Change photo</Text>
        </Tappable>
      </View>

      <Card style={{ overflow: 'hidden', marginBottom: spacing.md }}>
        {field('Full name', name, setName)}
        {field('Username', username, setUsername)}
        {field('Bio', bio, setBio, 'Add a short bio...', true)}
      </Card>

      <PrimaryButton label="Save changes" onPress={onSave} loading={saving} />
    </Screen>
  );
}
