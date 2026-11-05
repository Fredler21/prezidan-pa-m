import type { L10n, PriorityId } from '../types';

/*
 * « Si m te prezidan »: eight decisions a president could face, four answers each. Every answer
 * adds weight to one or two of the site's twelve priorities (2 for the main one, 1 for the
 * second). The three heaviest priorities make the player's profile, and candidates are compared
 * on those three exactly like on the match page: by public record only, never a recommendation.
 * There is no right or wrong answer and no answer points to a candidate or a party.
 */

export interface GameChoice {
  /** Main priority: also gives the answer its icon. */
  main: PriorityId;
  title: L10n;
  sub: L10n;
  weights: Partial<Record<PriorityId, number>>;
}
export interface GameDecision { id: string; icon: PriorityId; prompt: L10n; choices: readonly GameChoice[] }
export interface Profile { title: L10n; line: L10n }

const c = (main: PriorityId, title: L10n, sub: L10n, second?: PriorityId): GameChoice =>
  ({ main, title, sub, weights: second ? { [main]: 2, [second]: 1 } : { [main]: 2 } });

export const DECISIONS: readonly GameDecision[] = [
  { id: 'day1', icon: 'institutions',
    prompt: { ht: 'Premye jou ou nan Palè Nasyonal la. Kisa ou fè anvan tout bagay?', fr: 'Premier jour au Palais national. Que faites-vous en premier ?', en: 'Your first day at the National Palace. What do you do first?' },
    choices: [
      c('security', { ht: 'Retabli sekirite', fr: 'Rétablir la sécurité', en: 'Restore security' }, { ht: 'Polis sou wout yo pou moun ka sikile lib', fr: 'La police sur les routes pour circuler librement', en: 'Police on the roads so people can move freely' }),
      c('justice', { ht: 'Netwaye leta a', fr: 'Assainir l’État', en: 'Clean up the state' }, { ht: 'Odit sou lajan piblik ak sanksyon pou koripsyon', fr: 'Audit des fonds publics et sanctions contre la corruption', en: 'Audit public money and punish corruption' }, 'institutions'),
      c('economy', { ht: 'Lanse gwo chantye', fr: 'Lancer de grands chantiers', en: 'Launch public works' }, { ht: 'Djòb pou plizyè milye moun touswit', fr: 'Des emplois pour des milliers de personnes tout de suite', en: 'Jobs for thousands of people right away' }, 'infrastructure'),
      c('health', { ht: 'Louvri lopital yo', fr: 'Rouvrir les hôpitaux', en: 'Reopen the hospitals' }, { ht: 'Doktè ak medikaman nan lopital piblik yo', fr: 'Médecins et médicaments dans les hôpitaux publics', en: 'Doctors and medicine in public hospitals' }),
    ] },
  { id: 'youth', icon: 'youth',
    prompt: { ht: 'Jèn yo ap kite peyi a. Kisa ou fè?', fr: 'Les jeunes quittent le pays. Que faites-vous ?', en: 'Young people are leaving the country. What do you do?' },
    choices: [
      c('education', { ht: 'Bous ak fòmasyon', fr: 'Bourses et formation', en: 'Scholarships and training' }, { ht: 'Plis jèn nan inivèsite ak nan lekòl metye', fr: 'Plus de jeunes à l’université et en formation professionnelle', en: 'More young people in university and trade school' }, 'youth'),
      c('economy', { ht: 'Kredi pou ti biznis', fr: 'Crédit pour petites entreprises', en: 'Small business loans' }, { ht: 'Ti prè pou jèn ki vle lanse yon biznis', fr: 'Des prêts pour les jeunes qui veulent se lancer', en: 'Loans for young people starting a business' }, 'youth'),
      c('youth', { ht: 'Espò ak kilti', fr: 'Sport et culture', en: 'Sports and culture' }, { ht: 'Yon sant pou jèn nan chak komin', fr: 'Un centre jeunesse dans chaque commune', en: 'A youth center in every commune' }),
      c('diaspora', { ht: 'Dyaspora a envesti', fr: 'La diaspora investit', en: 'The diaspora invests' }, { ht: 'Fasilite envestisman lakay', fr: 'Faciliter l’investissement au pays', en: 'Make it easier to invest back home' }, 'economy'),
    ] },
  { id: 'budget', icon: 'economy',
    prompt: { ht: 'Ou jwenn yon bidjè siplemantè. Ki kote lajan an ale?', fr: 'Vous obtenez un budget supplémentaire. Où va l’argent ?', en: 'You get extra budget. Where does the money go?' },
    choices: [
      c('infrastructure', { ht: 'Wout ak pon', fr: 'Routes et ponts', en: 'Roads and bridges' }, { ht: 'Konekte tout depatman yo', fr: 'Relier tous les départements', en: 'Connect every department' }),
      c('utilities', { ht: 'Kouran 24 sou 24', fr: 'Électricité 24 h sur 24', en: 'Power around the clock' }, { ht: 'Plis enèji solè ak yon rezo ki mache', fr: 'Plus de solaire et un réseau qui fonctionne', en: 'More solar and a grid that works' }),
      c('education', { ht: 'Lekòl piblik', fr: 'L’école publique', en: 'Public schools' }, { ht: 'Pi bon lekòl ak pwofesè ki byen peye', fr: 'De meilleures écoles et des enseignants bien payés', en: 'Better schools and well paid teachers' }),
      c('agriculture', { ht: 'Agrikilti', fr: 'L’agriculture', en: 'Farming' }, { ht: 'Zouti, semans ak irigasyon pou plantè yo', fr: 'Outils, semences et irrigation pour les paysans', en: 'Tools, seeds and irrigation for farmers' }),
    ] },
  { id: 'storm', icon: 'environment',
    prompt: { ht: 'Sezon siklòn nan ap rive. Kijan ou pwoteje peyi a?', fr: 'La saison cyclonique arrive. Comment protégez-vous le pays ?', en: 'Hurricane season is coming. How do you protect the country?' },
    choices: [
      c('environment', { ht: 'Plante pyebwa', fr: 'Reboiser', en: 'Plant trees' }, { ht: 'Rebwaze mòn yo pou rivyè yo pa debòde', fr: 'Reboiser les mornes pour que les rivières ne débordent plus', en: 'Reforest the hills so rivers stop flooding' }),
      c('infrastructure', { ht: 'Bati pi solid', fr: 'Construire plus solide', en: 'Build stronger' }, { ht: 'Kanal, abri ak kay ki kenbe', fr: 'Canaux, abris et maisons qui tiennent', en: 'Drains, shelters and homes that hold up' }, 'environment'),
      c('health', { ht: 'Ekip ijans', fr: 'Équipes d’urgence', en: 'Emergency teams' }, { ht: 'Swen ak sekou nan chak depatman', fr: 'Soins et secours dans chaque département', en: 'Care and rescue in every department' }, 'environment'),
      c('institutions', { ht: 'Sistèm alèt', fr: 'Système d’alerte', en: 'Early warning' }, { ht: 'Yon pwoteksyon sivil ki fò ak alèt sou telefòn', fr: 'Une protection civile forte et des alertes sur téléphone', en: 'Strong civil protection and phone alerts' }, 'environment'),
    ] },
  { id: 'food', icon: 'agriculture',
    prompt: { ht: 'Pri manje ap monte chak semèn. Kisa ou fè?', fr: 'Les prix alimentaires montent chaque semaine. Que faites-vous ?', en: 'Food prices rise every week. What do you do?' },
    choices: [
      c('agriculture', { ht: 'Pwodui lakay', fr: 'Produire chez nous', en: 'Grow it at home' }, { ht: 'Ede plantè yo pwodui plis diri, mayi ak pwa', fr: 'Aider les paysans à produire plus de riz, de maïs et de haricots', en: 'Help farmers grow more rice, corn and beans' }),
      c('economy', { ht: 'Ede ti machann yo', fr: 'Soutenir les petits commerçants', en: 'Back small vendors' }, { ht: 'Kredi ak mache ki byen òganize', fr: 'Du crédit et des marchés bien organisés', en: 'Credit and well run markets' }),
      c('infrastructure', { ht: 'Wout agrikòl', fr: 'Routes agricoles', en: 'Farm roads' }, { ht: 'Pou manje soti nan jaden rive nan mache', fr: 'Pour que les récoltes arrivent aux marchés', en: 'So harvests reach the markets' }, 'agriculture'),
      c('security', { ht: 'Libere wout yo', fr: 'Libérer les routes', en: 'Free the roads' }, { ht: 'Kamyon machandiz pase san yo pa peye gang', fr: 'Les camions passent sans payer les gangs', en: 'Trucks get through without paying gangs' }, 'economy'),
    ] },
  { id: 'trust', icon: 'justice',
    prompt: { ht: 'Pèp la pa fè leta konfyans. Kijan ou chanje sa?', fr: 'Le peuple ne fait pas confiance à l’État. Comment changer cela ?', en: 'People do not trust the state. How do you change that?' },
    choices: [
      c('justice', { ht: 'Jij endepandan', fr: 'Des juges indépendants', en: 'Independent judges' }, { ht: 'Yon jistis ki menm pou tout moun', fr: 'Une justice égale pour tous', en: 'Justice that is the same for everyone' }),
      c('institutions', { ht: 'Eleksyon onèt', fr: 'Des élections honnêtes', en: 'Honest elections' }, { ht: 'Yon CEP solid ak yon lis elektoral ajou', fr: 'Un CEP solide et une liste électorale à jour', en: 'A strong CEP and an up to date voter list' }),
      c('institutions', { ht: 'Transparans total', fr: 'Transparence totale', en: 'Full transparency' }, { ht: 'Tout depans leta yo piblik sou entènèt', fr: 'Toutes les dépenses publiques en ligne', en: 'Every public expense published online' }, 'justice'),
      c('diaspora', { ht: 'Vòt dyaspora a', fr: 'Le vote de la diaspora', en: 'The diaspora vote' }, { ht: 'Ayisyen lòt bò yo ka patisipe tou', fr: 'Les Haïtiens de l’étranger participent aussi', en: 'Haitians abroad take part too' }, 'institutions'),
    ] },
  { id: 'water', icon: 'utilities',
    prompt: { ht: 'Yon katye pa gen ni kouran ni dlo potab. Kisa ou fè?', fr: 'Un quartier n’a ni électricité ni eau potable. Que faites-vous ?', en: 'A neighborhood has no power and no clean water. What do you do?' },
    choices: [
      c('utilities', { ht: 'Enèji solè', fr: 'Énergie solaire', en: 'Solar power' }, { ht: 'Yon ti rezo solè pou katye a', fr: 'Un mini réseau solaire pour le quartier', en: 'A solar mini grid for the neighborhood' }, 'environment'),
      c('health', { ht: 'Dlo pwòp', fr: 'De l’eau propre', en: 'Clean water' }, { ht: 'Pwen dlo potab pou evite maladi tankou kolera', fr: 'Des points d’eau potable contre le choléra', en: 'Safe water points to prevent cholera' }, 'utilities'),
      c('infrastructure', { ht: 'Rebati rezo a', fr: 'Reconstruire le réseau', en: 'Rebuild the network' }, { ht: 'Fil kouran ak tiyo dlo pou tout zòn nan', fr: 'Lignes électriques et conduites d’eau pour toute la zone', en: 'Power lines and water pipes for the whole area' }, 'utilities'),
      c('economy', { ht: 'Envestisè prive', fr: 'Investisseurs privés', en: 'Private investors' }, { ht: 'Patenarya pou sèvis la rive pi vit', fr: 'Des partenariats pour un service plus rapide', en: 'Partnerships to deliver the service faster' }, 'utilities'),
    ] },
  { id: 'legacy', icon: 'youth',
    prompt: { ht: 'Apre 5 an, ki eritaj ou vle kite?', fr: 'Après 5 ans, quel héritage voulez-vous laisser ?', en: 'After 5 years, what legacy do you want to leave?' },
    choices: [
      c('security', { ht: 'Yon peyi ki an pè', fr: 'Un pays en paix', en: 'A country at peace' }, { ht: 'Fanmi yo dòmi san laperèz', fr: 'Les familles dorment sans peur', en: 'Families sleep without fear' }),
      c('education', { ht: 'Yon jenerasyon ki edike', fr: 'Une génération instruite', en: 'An educated generation' }, { ht: 'Chak timoun lekòl', fr: 'Chaque enfant à l’école', en: 'Every child in school' }, 'youth'),
      c('economy', { ht: 'Yon ekonomi ki kanpe', fr: 'Une économie debout', en: 'An economy on its feet' }, { ht: 'Travay ak pwodiksyon nasyonal', fr: 'Du travail et une production nationale', en: 'Jobs and national production' }, 'agriculture'),
      c('institutions', { ht: 'Enstitisyon solid', fr: 'Des institutions solides', en: 'Strong institutions' }, { ht: 'Eleksyon lib ak lalwa ki respekte', fr: 'Des élections libres et la loi respectée', en: 'Free elections and respect for the law' }, 'justice'),
    ] },
];

/** One profile per priority; French titles name the presidency so they fit every player. */
export const PROFILES: Record<PriorityId, Profile> = {
  security: { title: { ht: 'Prezidan lapè', fr: 'Une présidence de paix', en: 'The peacekeeper' }, line: { ht: 'Pou ou, anyen pa ka mache si moun pa an sekirite.', fr: 'Pour vous, rien ne marche tant que les gens ne sont pas en sécurité.', en: 'For you, nothing works until people are safe.' } },
  education: { title: { ht: 'Prezidan konesans', fr: 'Une présidence du savoir', en: 'The educator' }, line: { ht: 'Pou ou, tout bagay kòmanse lekòl la.', fr: 'Pour vous, tout commence à l’école.', en: 'For you, everything starts at school.' } },
  infrastructure: { title: { ht: 'Prezidan batisè', fr: 'Une présidence bâtisseuse', en: 'The builder' }, line: { ht: 'Ou wè yon peyi ki konekte: wout, pon ak pò.', fr: 'Vous voyez un pays relié : routes, ponts et ports.', en: 'You see a connected country: roads, bridges and ports.' } },
  economy: { title: { ht: 'Prezidan travay', fr: 'Une présidence du travail', en: 'The job creator' }, line: { ht: 'Pou ou, yon djòb se diyite.', fr: 'Pour vous, un emploi, c’est la dignité.', en: 'For you, a job means dignity.' } },
  health: { title: { ht: 'Prezidan swen', fr: 'Une présidence du soin', en: 'The caregiver' }, line: { ht: 'Pou ou, lasante moun yo vini anvan tout bagay.', fr: 'Pour vous, la santé passe avant tout.', en: 'For you, people’s health comes first.' } },
  agriculture: { title: { ht: 'Prezidan tè a', fr: 'Une présidence de la terre', en: 'The farmer’s president' }, line: { ht: 'Ou kwè Ayiti ka manje sa li plante.', fr: 'Vous croyez qu’Haïti peut se nourrir de ce qu’elle cultive.', en: 'You believe Haiti can eat what it grows.' } },
  justice: { title: { ht: 'Prezidan jistis', fr: 'Une présidence de justice', en: 'The guardian of justice' }, line: { ht: 'Pou ou, pèsonn pa anwo lalwa.', fr: 'Pour vous, personne n’est au-dessus de la loi.', en: 'For you, no one is above the law.' } },
  utilities: { title: { ht: 'Prezidan limyè', fr: 'Une présidence de la lumière', en: 'The power bringer' }, line: { ht: 'Kouran ak dlo nan chak kay: se baz la.', fr: 'L’électricité et l’eau dans chaque maison : c’est la base.', en: 'Power and water in every home: that is the foundation.' } },
  diaspora: { title: { ht: 'Prezidan pon', fr: 'Une présidence passerelle', en: 'The bridge builder' }, line: { ht: 'Ou wè dyaspora a kòm yon fòs pou rebati peyi a.', fr: 'Vous voyez la diaspora comme une force pour reconstruire.', en: 'You see the diaspora as a force to rebuild.' } },
  environment: { title: { ht: 'Prezidan lanati', fr: 'Une présidence verte', en: 'The guardian of nature' }, line: { ht: 'Pyebwa, rivyè ak pwoteksyon kont dezas: se avni an.', fr: 'Arbres, rivières et protection contre les catastrophes : c’est l’avenir.', en: 'Trees, rivers and disaster protection: that is the future.' } },
  institutions: { title: { ht: 'Prezidan leta', fr: 'Une présidence des institutions', en: 'The state builder' }, line: { ht: 'Pou ou, enstitisyon solid ak eleksyon onèt se fondasyon an.', fr: 'Pour vous, des institutions solides et des élections honnêtes sont la fondation.', en: 'For you, strong institutions and honest elections are the foundation.' } },
  youth: { title: { ht: 'Prezidan jenès', fr: 'Une présidence de la jeunesse', en: 'The youth champion' }, line: { ht: 'Ou mize sou jèn yo pou fè peyi a avanse.', fr: 'Vous misez sur les jeunes pour faire avancer le pays.', en: 'You bet on young people to move the country forward.' } },
};

/**
 * The three heaviest priorities for a set of answers (an index per decision, null = skipped).
 * Ties go to the priority the player reached first, so the order follows their own choices.
 */
export function topPriorities(answers: readonly (number | null)[], n = 3): PriorityId[] {
  const score = new Map<PriorityId, number>();
  const first = new Map<PriorityId, number>();
  let step = 0;
  answers.forEach((a, i) => {
    const choice = a === null ? undefined : DECISIONS[i]?.choices[a];
    if (!choice) return;
    for (const [id, w] of Object.entries(choice.weights) as [PriorityId, number][]) {
      score.set(id, (score.get(id) ?? 0) + w);
      if (!first.has(id)) first.set(id, step++);
    }
  });
  return [...score.keys()]
    .sort((a, b) => (score.get(b) ?? 0) - (score.get(a) ?? 0) || (first.get(a) ?? 0) - (first.get(b) ?? 0))
    .slice(0, n);
}
