/*
 * Site imagery served from public/img (WebP, resized from free-licensed originals).
 * Credits are shown on the « Kijan sa mache » page (strings.images in src/i18n/strings.ts).
 *  - Flag of Haiti: Wikimedia Commons, public domain (File:Flag_of_Haiti.svg).
 *  - Citadelle Laferrière, Milot: SPC Gibran Torres, United States Army, public domain
 *    (File:Citadelle_Laferrière_Aerial_View.jpg and the CC0 Wikivoyage banner cropped from it).
 */
export const IMG = {
  flag: { src: '/img/flag-haiti-240.webp', srcset: '/img/flag-haiti-240.webp 240w, /img/flag-haiti-480.webp 480w' },
  /** Wide crop (7:1) for the home page band on desktop. */
  band: { src800: '/img/citadelle-band-800.webp', src1400: '/img/citadelle-band-1400.webp' },
  /** 3:2 aerial view for phones and the About us page. */
  citadelle: { src640: '/img/citadelle-640.webp', src1200: '/img/citadelle-1200.webp' },
} as const;
