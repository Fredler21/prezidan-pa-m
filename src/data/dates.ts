import type { KeyDate, Source } from '../types';

/** CEP "Calendrier électoral 2026–2027", updated version published Oct 28, 2026.
 *  Dates have changed several times; verify against cephaiti.ht before publishing. */
export const DATES_UPDATED = '2026-10-28';
export const CONTENT_UPDATED = '2026-10-30';

export const DATES: readonly KeyDate[] = [
  { date: '2026-11-15', label: { ht: 'Fèmti enskripsyon kandida an liy', fr: 'Clôture de l’inscription en ligne des candidats', en: 'Online candidate registration closes' } },
  { date: '2026-12-15', label: { ht: 'Lis preliminè kandida yo (kontestasyon 15–31 desanm)', fr: 'Liste préliminaire des candidats (contestations 15–31 décembre)', en: 'Preliminary candidate list (challenges Dec 15–31)' } },
  { date: '2027-01-11', label: { ht: 'Lis final kandida yo', fr: 'Liste définitive des candidats', en: 'Final candidate list' } },
  { date: '2027-04-15', label: { ht: 'Kanpay elektoral la kòmanse', fr: 'Ouverture de la campagne électorale', en: 'Electoral campaign opens' } },
  { date: '2027-05-20', label: { ht: 'Fèmti lis elektoral la', fr: 'Clôture du registre électoral', en: 'Voter register closes' } },
  { date: '2027-07-18', label: { ht: 'Premye tou', fr: 'Premier tour', en: 'First round' } },
  { date: '2027-08-09', label: { ht: 'Rezilta final premye tou', fr: 'Résultats définitifs du premier tour', en: 'Final first-round results' } },
  { date: '2027-10-04', label: { ht: 'Dezyèm tou', fr: 'Second tour', en: 'Second round' } },
  { date: '2027-10-20', label: { ht: 'Rezilta final dezyèm tou', fr: 'Résultats définitifs du second tour', en: 'Final second-round results' } },
];

export const GENERAL_SOURCES: readonly Source[] = [
  { label: 'Haiti Policy House — Haiti election tracker', url: 'https://www.haitipolicyhouse.org/haiti-election-tracker', date: '2026-10-30' },
  { label: 'Haiti Policy House — October 2026 situation brief', url: 'https://www.haitipolicyhouse.org/briefing-room/oct-2026-lu2621nt', date: '2026-10-30' },
  { label: 'CEP — Calendrier électoral actualisé 2026–2027 (PDF)', url: 'https://cephaiti.ht/wp-content/uploads/2026/10/CALENDRIER-ACTUALISE-2026-2027.pdf', date: '2026-10-30' },
  { label: 'CEP — Registre des candidatures (tableau)', url: 'https://tableau.cephaiti.ht/', date: '2026-10-30' },
  { label: 'CEP — Liste définitive des structures politiques agréées (14 août 2026)', url: 'https://www.haitipolicyhouse.org/s/Liste-definitive-des-structures-politiques-agreees-cep-1-2.pdf', date: '2026-10-30' },
  { label: 'BINUH — United Nations Integrated Office in Haiti', url: 'https://binuh.unmissions.org/', date: '2026-10-30' },
];
