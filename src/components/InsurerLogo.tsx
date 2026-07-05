import React, { useState } from 'react';
import { Image, Text, View } from 'react-native';

/** Insurance carrier → primary web domain (drives the Clearbit logo lookup). */
const CARRIER_DOMAIN: Record<string, string> = {
  'state farm': 'statefarm.com',
  geico: 'geico.com',
  progressive: 'progressive.com',
  usaa: 'usaa.com',
  allstate: 'allstate.com',
  liberty: 'libertymutual.com',
  'liberty mutual': 'libertymutual.com',
  nationwide: 'nationwide.com',
  farmers: 'farmers.com',
  travelers: 'travelers.com',
  'american family': 'amfam.com',
  amfam: 'amfam.com',
  esurance: 'esurance.com',
  'the general': 'thegeneral.com',
  mercury: 'mercuryinsurance.com',
  'auto-owners': 'auto-owners.com',
  erie: 'erieinsurance.com',
};

/** Real carrier logo via the Clearbit logo CDN (null if the carrier is unknown). */
export function carrierLogoUrl(carrier: string): string | null {
  const key = carrier.trim().toLowerCase();
  // Try an exact match first, then a loose "contains" so "State Farm Mutual" still maps.
  const domain =
    CARRIER_DOMAIN[key] ??
    Object.entries(CARRIER_DOMAIN).find(([name]) => key.includes(name))?.[1];
  return domain ? `https://logo.clearbit.com/${domain}` : null;
}

/**
 * Real insurance-carrier logo (Clearbit). Always renders a mark — the carrier's
 * initial in a rounded tile if the logo can't load — never a generic shield emoji.
 */
export function InsurerLogo({
  carrier,
  size = 44,
  bg = '#fff',
}: {
  carrier: string;
  size?: number;
  bg?: string;
}) {
  const url = carrierLogoUrl(carrier);
  const [failed, setFailed] = useState(false);
  const showImg = !!url && !failed;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.22,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {showImg ? (
        <Image
          source={{ uri: url! }}
          style={{ width: size * 0.82, height: size * 0.82 }}
          resizeMode="contain"
          onError={() => setFailed(true)}
        />
      ) : (
        <Text style={{ fontSize: size * 0.42, fontWeight: '800', color: '#333' }}>
          {(carrier.trim().charAt(0) || '?').toUpperCase()}
        </Text>
      )}
    </View>
  );
}
