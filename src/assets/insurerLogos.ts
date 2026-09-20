/**
 * Bundled insurance-carrier logos (from the supplied carrier sheet) so the
 * marks render instantly and offline. Unknown carriers fall back to the web
 * lookup, then to a lettered tile.
 */
export const INSURER_LOGOS: Record<string, number> = {
  allstate: require('../../assets/insurers/allstate.png'),
  'american family': require('../../assets/insurers/american-family.png'),
  amfam: require('../../assets/insurers/american-family.png'),
  farmers: require('../../assets/insurers/farmers.png'),
  geico: require('../../assets/insurers/geico.png'),
  liberty: require('../../assets/insurers/liberty-mutual.png'),
  'liberty mutual': require('../../assets/insurers/liberty-mutual.png'),
  nationwide: require('../../assets/insurers/nationwide.png'),
  progressive: require('../../assets/insurers/progressive.png'),
  'state farm': require('../../assets/insurers/statefarm.png'),
  statefarm: require('../../assets/insurers/statefarm.png'),
  travelers: require('../../assets/insurers/travelers.png'),
  usaa: require('../../assets/insurers/usaa.png'),
};

/** The bundled logo for a carrier, if we ship one. */
export function bundledInsurerLogo(carrier: string): number | null {
  const key = carrier.trim().toLowerCase();
  return INSURER_LOGOS[key] ?? Object.entries(INSURER_LOGOS).find(([name]) => key.includes(name))?.[1] ?? null;
}
