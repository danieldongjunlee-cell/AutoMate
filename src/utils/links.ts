import { Linking } from 'react-native';

import { Dealer } from '../services/mock/data';
import { confirmAction } from './alerts';

/**
 * External dealer links (user-feedback pass 2). Both confirm first
 * (web-safe via confirmAction), then hand off to Google Maps / Search.
 */

/** "Get directions" → Google Maps turn-by-turn to the dealer address. */
export function openDirections(dealer: Dealer) {
  const destination = encodeURIComponent(`${dealer.name}, ${dealer.address}`);
  confirmAction(
    'Open Google Maps?',
    `Get directions to ${dealer.name} — ${dealer.address}.`,
    () => {
      Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${destination}`).catch(
        () => {},
      );
    },
    'Open',
  );
}

/** Rating tap → Google reviews for the dealer. */
export function openDealerReviews(dealer: Dealer) {
  const query = encodeURIComponent(`${dealer.name} Fairfax VA reviews`);
  confirmAction(
    'View Google reviews?',
    `${dealer.name} — ★ ${dealer.rating} (${dealer.reviews} reviews on Google).`,
    () => {
      Linking.openURL(`https://www.google.com/search?q=${query}`).catch(() => {});
    },
    'Open',
  );
}
