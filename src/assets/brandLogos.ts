/**
 * Bundled car-brand logos (from the supplied logo sheet) so the marks render
 * instantly and offline. Anything not here falls back to the web lookup.
 */
export const BRAND_LOGOS: Record<string, number> = {
  'acura': require('../../assets/brands/acura.png'),
  'alfa romeo': require('../../assets/brands/alfa-romeo.png'),
  'audi': require('../../assets/brands/audi.png'),
  'bentley': require('../../assets/brands/bentley.png'),
  'bmw': require('../../assets/brands/bmw.png'),
  'buick': require('../../assets/brands/buick.png'),
  'cadillac': require('../../assets/brands/cadillac.png'),
  'chevrolet': require('../../assets/brands/chevrolet.png'),
  'chrysler': require('../../assets/brands/chrysler.png'),
  'dodge': require('../../assets/brands/dodge.png'),
  'ferrari': require('../../assets/brands/ferrari.png'),
  'fiat': require('../../assets/brands/fiat.png'),
  'ford': require('../../assets/brands/ford.png'),
  'genesis': require('../../assets/brands/genesis.png'),
  'gmc': require('../../assets/brands/gmc.png'),
  'honda': require('../../assets/brands/honda.png'),
  'hyundai': require('../../assets/brands/hyundai.png'),
  'infiniti': require('../../assets/brands/infiniti.png'),
  'jaguar': require('../../assets/brands/jaguar.png'),
  'jeep': require('../../assets/brands/jeep.png'),
  'kia': require('../../assets/brands/kia.png'),
  'lamborghini': require('../../assets/brands/lamborghini.png'),
  'land rover': require('../../assets/brands/land-rover.png'),
  'lexus': require('../../assets/brands/lexus.png'),
  'lincoln': require('../../assets/brands/lincoln.png'),
  'maserati': require('../../assets/brands/maserati.png'),
  'mazda': require('../../assets/brands/mazda.png'),
  'mercedes': require('../../assets/brands/mercedes.png'),
  'mini': require('../../assets/brands/mini.png'),
  'mitsubishi': require('../../assets/brands/mitsubishi.png'),
  'nissan': require('../../assets/brands/nissan.png'),
  'peugeot': require('../../assets/brands/peugeot.png'),
  'polestar': require('../../assets/brands/polestar.png'),
  'porsche': require('../../assets/brands/porsche.png'),
  'ram': require('../../assets/brands/ram.png'),
  'rivian': require('../../assets/brands/rivian.png'),
  'skoda': require('../../assets/brands/skoda.png'),
  'subaru': require('../../assets/brands/subaru.png'),
  'suzuki': require('../../assets/brands/suzuki.png'),
  'tesla': require('../../assets/brands/tesla.png'),
  'toyota': require('../../assets/brands/toyota.png'),
  'volkswagen': require('../../assets/brands/volkswagen.png'),
  'volvo': require('../../assets/brands/volvo.png'),
};

/** The bundled logo for a brand name, if we ship one. */
export function bundledBrandLogo(brand: string): number | null {
  const key = brand.trim().toLowerCase();
  return BRAND_LOGOS[key] ?? BRAND_LOGOS[key.replace(/-benz$/, '')] ?? null;
}
