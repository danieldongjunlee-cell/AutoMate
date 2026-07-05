import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

import { showAlert } from '../utils/alerts';

/**
 * Device camera + gallery access (user-feedback pass 2, expo-image-picker).
 *
 * - Native (Expo Go): real camera / photo-library pickers behind the standard
 *   permission prompts.
 * - Web: `launchCameraAsync` renders an `<input type="file" capture>` — mobile
 *   browsers open the camera, desktop browsers fall back to the file picker
 *   (and any thrown "camera unsupported" error falls back to the gallery).
 *
 * Both resolve `{ uri }` on success and `null` on cancel/permission-denied,
 * so callers never need their own platform switches.
 */
export interface PickedPhoto {
  uri: string;
}

const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: 'images',
  quality: 0.8,
};

const firstUri = (result: ImagePicker.ImagePickerResult): PickedPhoto | null => {
  const uri = !result.canceled ? result.assets?.[0]?.uri : undefined;
  return uri ? { uri } : null;
};

/** Take a photo with the device camera (web: file picker w/ capture hint). */
export async function capturePhoto(): Promise<PickedPhoto | null> {
  if (Platform.OS !== 'web') {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      showAlert('Camera access needed', 'Enable camera access in Settings to take photos.');
      return null;
    }
  }
  try {
    return firstUri(await ImagePicker.launchCameraAsync(PICKER_OPTIONS));
  } catch {
    // Browsers without camera support → plain file picker.
    return pickFromGallery();
  }
}

/** Pick an existing image from the gallery (web: file picker). */
export async function pickFromGallery(): Promise<PickedPhoto | null> {
  if (Platform.OS !== 'web') {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      showAlert('Photos access needed', 'Enable photo-library access in Settings to upload photos.');
      return null;
    }
  }
  try {
    return firstUri(await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS));
  } catch {
    return null;
  }
}
