import type { Priority } from '../types';

// Order here is the display order of the grid. Icons live in lib/icons.ts under the same ids.
export const PRIORITIES: readonly Priority[] = [
  { id: 'security', label: { ht: 'Sekirite', fr: 'Sécurité', en: 'Security' } },
  { id: 'education', label: { ht: 'Lekòl ak edikasyon', fr: 'Écoles et éducation', en: 'Schools and education' } },
  { id: 'infrastructure', label: { ht: 'Wout ak enfrastrikti', fr: 'Routes et infrastructures', en: 'Roads and infrastructure' } },
  { id: 'economy', label: { ht: 'Travay ak ekonomi', fr: 'Emploi et économie', en: 'Jobs and the economy' } },
  { id: 'health', label: { ht: 'Lasante', fr: 'Santé', en: 'Health' } },
  { id: 'agriculture', label: { ht: 'Agrikilti ak manje', fr: 'Agriculture et alimentation', en: 'Agriculture and food' } },
  { id: 'justice', label: { ht: 'Jistis ak koripsyon', fr: 'Justice et corruption', en: 'Justice and corruption' } },
  { id: 'utilities', label: { ht: 'Kouran ak dlo', fr: 'Électricité et eau', en: 'Electricity and water' } },
  { id: 'diaspora', label: { ht: 'Dyaspora', fr: 'Diaspora', en: 'Diaspora' } },
  { id: 'environment', label: { ht: 'Anviwònman ak katastwòf', fr: 'Environnement et catastrophes', en: 'Environment and disasters' } },
  { id: 'institutions', label: { ht: 'Eleksyon ak enstitisyon', fr: 'Élections et institutions', en: 'Elections and institutions' } },
  { id: 'youth', label: { ht: 'Jèn yo', fr: 'La jeunesse', en: 'Youth' } },
];

export const MAX_PICKS = 3;
