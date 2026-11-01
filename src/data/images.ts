/*
 * Site imagery served from public/img (WebP, resized from free-licensed originals).
 * Credits are shown on the « Kijan sa mache » page (strings.images in src/i18n/strings.ts).
 *  - Flag of Haiti: Wikimedia Commons, public domain (File:Flag_of_Haiti.svg).
 *  - Citadelle Laferrière, Milot: Alex Proimos, CC BY 2.0
 *    (File:The_Citadelle_Laferrière,_Haiti_(7761638618).jpg).
 *  - Bassin Bleu, Jacmel: Intellect'Art, CC BY-SA 4.0 (File:Bassin_bleu_(Jacmel).jpg).
 *  - The 3D map's department outlines: geoBoundaries HTI ADM1, CC BY 4.0 (src/data/haiti-geo.ts).
 */
export const IMG = {
  flag: { src: '/img/flag-haiti-240.webp', srcset: '/img/flag-haiti-240.webp 240w, /img/flag-haiti-480.webp 480w' },
  /** Wide crop (3.5:1) of the Citadelle for the home page band on desktop. */
  band: { src800: '/img/citadelle-band-800.webp', src1400: '/img/citadelle-band-1400.webp' },
  /** 3:2 Citadelle for phones. */
  citadelle: { src640: '/img/citadelle-640.webp', src1200: '/img/citadelle-1200.webp' },
  /** 3:2 Bassin Bleu for the About us page. */
  bassin: { src640: '/img/bassin-bleu-640.webp', src1200: '/img/bassin-bleu-1200.webp' },
} as const;
