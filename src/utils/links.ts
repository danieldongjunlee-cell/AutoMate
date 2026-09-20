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
    `Get directions to ${dealer.name} · ${dealer.address}.`,
    () => {
      Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${destination}`).catch(
        () => {},
      );
    },
    'Open',
  );
}

/** "Call" → the shop's front desk (tel: link; confirms first so a mis-tap never dials). */
export function callDealer(dealer: Dealer) {
  const phone = dealer.phone ?? '+1 (703) 555-0100';
  confirmAction(`Call ${dealer.name}?`, phone, () => {
    Linking.openURL(`tel:${phone.replace(/[^\d+]/g, '')}`).catch(() => {});
  }, 'Call');
}

/** "Website" → the shop's site (Google Business listing for the demo shops). */
export function openDealerWebsite(dealer: Dealer) {
  const query = encodeURIComponent(`${dealer.name} ${dealer.address}`);
  confirmAction(`Open ${dealer.name}'s website?`, 'Opens in your browser.', () => {
    Linking.openURL(`https://www.google.com/search?q=${query}`).catch(() => {});
  }, 'Open');
}

/** Rating tap → Google reviews for the dealer. */
export function openDealerReviews(dealer: Dealer) {
  const query = encodeURIComponent(`${dealer.name} Fairfax VA reviews`);
  confirmAction(
    'View Google reviews?',
    `${dealer.name} · ★ ${dealer.rating} (${dealer.reviews} reviews on Google).`,
    () => {
      Linking.openURL(`https://www.google.com/search?q=${query}`).catch(() => {});
    },
    'Open',
  );
}
