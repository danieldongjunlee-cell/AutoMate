import React, { useState } from 'react';
import { Image, Text, View } from 'react-native';

import { brandLogoUrl } from '../hooks/useActiveVehicle';

/**
 * Real car-brand logo (Clearbit). Always renders a brand mark — the brand's
 * initial in a circle if the logo can't load — never a generic car emoji.
 */
export function CarBrandLogo({
  brand,
  size = 22,
  bg = '#fff',
}: {
  brand: string;
  size?: number;
  bg?: string;
}) {
  const url = brandLogoUrl(brand);
  const [failed, setFailed] = useState(false);
  const showImg = !!url && !failed;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
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
        <Text style={{ fontSize: size * 0.5, fontWeight: '800', color: '#333' }}>
          {(brand.trim().charAt(0) || '?').toUpperCase()}
        </Text>
      )}
    </View>
  );
}
