import type { Department } from '../types';

export const DEPARTMENTS: readonly Department[] = [
  { id: 'ouest', label: { ht: 'Lwès', fr: 'Ouest', en: 'Ouest' } },
  { id: 'sud-est', label: { ht: 'Sidès', fr: 'Sud-Est', en: 'Sud-Est' } },
  { id: 'nord', label: { ht: 'Nò', fr: 'Nord', en: 'Nord' } },
  { id: 'nord-est', label: { ht: 'Nòdès', fr: 'Nord-Est', en: 'Nord-Est' } },
  { id: 'artibonite', label: { ht: 'Latibonit', fr: 'Artibonite', en: 'Artibonite' } },
  { id: 'centre', label: { ht: 'Sant', fr: 'Centre', en: 'Centre' } },
  { id: 'sud', label: { ht: 'Sid', fr: 'Sud', en: 'Sud' } },
  { id: 'grand-anse', label: { ht: 'Grandans', fr: 'Grand’Anse', en: 'Grand’Anse' } },
  { id: 'nord-ouest', label: { ht: 'Nòdwès', fr: 'Nord-Ouest', en: 'Nord-Ouest' } },
  { id: 'nippes', label: { ht: 'Nip', fr: 'Nippes', en: 'Nippes' } },
  { id: 'dyaspora', label: { ht: 'Dyaspora', fr: 'Diaspora', en: 'Diaspora' } },
  { id: 'na', label: { ht: 'Mwen pito pa di', fr: 'Je préfère ne pas dire', en: 'Prefer not to say' } },
];
