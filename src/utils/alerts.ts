import { Alert, Platform } from 'react-native';

/**
 * Cross-platform alert/confirm. RN-web's Alert.alert is a silent no-op, so
 * the browser build falls back to window.alert / window.confirm — required
 * for the profile CRUD confirm flows (user-feedback pass 1).
 */
export function showAlert(title: string, message?: string) {
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
  if (Platform.OS === 'web') {
    // eslint-disable-next-line no-alert
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: confirmLabel, style: 'destructive', onPress: onConfirm },
  ]);
}
