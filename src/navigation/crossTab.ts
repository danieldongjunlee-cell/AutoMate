import { CommonActions, NavigationProp } from '@react-navigation/native';

import { MainTabParamList } from './types';

/**
 * Jump to a screen on another tab, leaving that tab's root beneath it so the
 * back button lands on the tab root (wireframe ⤴ edges + notification deep
 * links). Single owner of the dispatch shape — use this instead of
 * hand-rolling CommonActions/getParent at call sites.
 */
export function navigateCrossTab(
  navigation: Pick<NavigationProp<Record<string, unknown>>, 'dispatch'>,
  tab: keyof MainTabParamList,
  screen: string,
  params?: object,
) {
  navigation.dispatch(CommonActions.navigate(tab, { screen, params, initial: false }));
}
