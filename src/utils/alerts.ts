import { Alert, Platform } from 'react-native';

import { translate } from '../i18n';
import { useAppStore } from '../store/useAppStore';

/** The chosen language, read at call time (alerts run outside React). */
const tr = (s: string) => translate(s, useAppStore.getState().language);

/**
 * Cross-platform alert/confirm. RN-web's Alert.alert is a silent no-op, so
 * the browser build falls back to window.alert / window.confirm, required
 * for the profile CRUD confirm flows (user-feedback pass 1).
 */
export function showAlert(title: string, message?: string) {
  title = tr(title);
  message = message ? tr(message) : message;
  if (Platform.OS === 'web') {
    // eslint-disable-next-line no-alert
    window.alert(message ? `${title}\n\n${message}` : title);
    return;
  }
  Alert.alert(title, message);
}

/** Destructive confirm: runs `onConfirm` only after the user accepts. */
export function confirmAction(
  title: string,
  message: string,
  onConfirm: () => void,
  confirmLabel = 'Remove',
) {
  title = tr(title);
  message = tr(message);
  confirmLabel = tr(confirmLabel);
  if (Platform.OS === 'web') {
    // eslint-disable-next-line no-alert
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: tr('Cancel'), style: 'cancel' },
    { text: confirmLabel, style: 'destructive', onPress: onConfirm },
  ]);
}
