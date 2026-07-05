import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/native';
import { useCallback, useEffect, useRef } from 'react';

import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';

/**
 * Guest-first auth gate. Returns `requireAuth(intent, onReady?)`:
 * - already signed in → runs `onReady()` immediately and returns true.
 * - guest → records the pending intent, opens the Auth modal, returns false.
 *
 * The calling screen typically does `if (!requireAuth('submitEstimate')) return;`
 * and resumes via a `useResumeAfterAuth(intent, fn)` effect once signed in.
 */
export function useRequireAuth() {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const setPendingAuth = useAppStore((s) => s.setPendingAuth);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return useCallback(
    (intent: string, onReady?: () => void): boolean => {
      if (isAuthenticated) {
        onReady?.();
        return true;
      }
      setPendingAuth(intent);
      navigation.navigate('Auth', { intent });
      return false;
    },
    [isAuthenticated, navigation, setPendingAuth],
  );
}

/**
 * Resume a gated action once the guest finishes signing in/up. Fires `fn` when
 * `isAuthenticated` is true and the stored intent matches, then clears it.
 */
export function useResumeAfterAuth(intent: string, fn: () => void): void {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const pendingAuth = useAppStore((s) => s.pendingAuth);
  const setPendingAuth = useAppStore((s) => s.setPendingAuth);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    if (isAuthenticated && pendingAuth === intent) {
      setPendingAuth(null);
      fnRef.current();
    }
  }, [isAuthenticated, pendingAuth, intent, setPendingAuth]);
}
