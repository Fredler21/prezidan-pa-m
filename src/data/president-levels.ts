import type { L10n, PriorityId } from '../types';

/*
 * « Si m te prezidan » v4: a five year term played as five levels, one per year, three decisions each.
 * This file holds the frame of the game (stats, levels, advisers, delayed events, badges, profiles and the
 * map of Haiti); the decisions themselves are in president-decisions.ts and the rules in
 * lib/president-rules.ts. Every scenario and number is invented to make the player think: no real
 * candidate or party appears, and the game is not a forecast.
 */

export type StatId = 'security' | 'economy' | 'social' | 'trust' | 'treasury';
export type Stats = Record<StatId, number>;
export type Effects = Partial<Record<StatId, number>>;
export type AdviserId = 'kom' | 'vik' | 'mir' | 'tij';
export type SceneId = 'sec' | 'eko' | 'lek' | 'stm' | 'vot';
export type CityId = 'pap' | 'okp' | 'gon' | 'hin' | 'oka' | 'jer' | 'jak' | 'pdp';
export type ProfileId = 'security' | 'economy' | 'social' | 'trust';
export type BadgeId = 'first' | 'road' | 'build' | 'teach' | 'people' | 'thrift' | 'star3' | 'storm' | 'remit' | 'full' | 'streak';

/** A dossier on the presidential desk. */
export interface GameOption {
  t: L10n;
  /** One line under the title. */
  d: L10n;
  /** What it costs the treasury (0 = free). */
  cost: number;
  e: Effects;
  /** The headline of « Jounal Pèp la ». */
  h: L10n;
  /** The adviser's explanation. */
  w: L10n;
  /** Sets a flag that a delayed event may read at the start of a later year. */
  flag?: string;
  /** The site priority this choice speaks to (main, then second), for the candidate comparison at the end. */
  p?: PriorityId;
  p2?: PriorityId;
}
export interface GameDecision { id: string; adv: AdviserId; q: L10n; hint: L10n; o: readonly GameOption[] }

export interface Level {
  id: string;
  name: L10n;
  theme: L10n;
  city: CityId;
  scene: SceneId;
  adv: AdviserId;
  line: L10n;
  /** Three slots; each run draws one decision id per slot, never the same id twice in a level. */
  slots: readonly (readonly string[])[];
}

/** A consequence that lands at the start of year index `year` when `flag` was set earlier. */
export interface DelayedEvent { year: number; flag: string; title: L10n; text: L10n; e: Effects }
export interface Badge { id: BadgeId; name: L10n; rule: L10n }
export interface Profile { title: L10n; line: L10n }

const T = (ht: string, fr: string, en: string): L10n => ({ ht, fr, en });

export const STATS: readonly { id: StatId; label: L10n }[] = [
  { id: 'security', label: T('Sekirite', 'Sécurité', 'Security') },
  { id: 'economy', label: T('Ekonomi', 'Économie', 'Economy') },
  { id: 'social', label: T('Lekòl ak lasante', 'École et santé', 'Schools and health') },
  { id: 'trust', label: T('Konfyans pèp la', 'Confiance du peuple', 'Public trust') },
  { id: 'treasury', label: T('Kès leta', 'Caisses de l’État', 'Treasury') },
];
/** The four stats that make the country's state (the treasury is the budget, not a goal). */
export const COUNTRY: readonly ProfileId[] = ['security', 'economy', 'social', 'trust'];
/** A hard start on purpose: the player earns every point. */
export const START: Readonly<Stats> = { security: 25, economy: 30, social: 30, trust: 35, treasury: 40 };
export const DECISIONS_PER_YEAR = 3;
export const YEARS = 5;
/** Trust lost when the cheapest dossier has to be signed on credit. */
export const CREDIT_TRUST = -3;

/** Invented characters; their names stay the same in every language. */
export const ADVISERS: Record<AdviserId, { name: string; role: L10n }> = {
  kom: { name: 'Komisè Renòl', role: T('Sekirite', 'Sécurité', 'Security') },
  vik: { name: 'Madan Viktwa', role: T('Finans', 'Finances', 'Finance') },
  mir: { name: 'Doktè Mirèy', role: T('Lekòl ak lasante', 'École et santé', 'Schools and health') },
  tij: { name: 'Ti Jan', role: T('Vwa pèp la', 'La voix du peuple', 'Voice of the people') },
};

export const LEVELS: readonly Level[] = [
  { id: 'security', name: T('Sekirite', 'Sécurité', 'Security'), theme: T('Wout yo bloke', 'Les routes bloquées', 'The roads are blocked'),
    city: 'pap', scene: 'sec', adv: 'kom',
    line: T('Prezidan, peyi a ap tann premye siy ou. Ann kòmanse ak wout yo.', 'Le pays attend votre premier geste. Commençons par les routes.', 'The country is waiting for your first move. Let us start with the roads.'),
    slots: [['palace'], ['youthwork', 'prison', 'force', 'weapons', 'recruitment', 'airport', 'displaced'], ['youthwork', 'prison', 'force', 'weapons', 'recruitment', 'airport', 'displaced']] },
  { id: 'economy', name: T('Ekonomi', 'Économie', 'Economy'), theme: T('Travay ak lajan', 'Travail et argent', 'Jobs and money'),
    city: 'okp', scene: 'eko', adv: 'vik',
    line: T('Kès la pa gwo. Chak goud dwe travay de fwa.', 'Les caisses sont minces. Chaque gourde doit travailler deux fois.', 'The treasury is thin. Every gourde has to work twice.'),
    slots: [['rice', 'customs', 'diaspora', 'money', 'fuel', 'deportations'], ['rice', 'customs', 'diaspora', 'money', 'fuel', 'deportations'], ['rice', 'customs', 'diaspora', 'money', 'fuel', 'deportations']] },
  { id: 'social', name: T('Lekòl ak lasante', 'École et santé', 'Schools and health'), theme: T('Timoun yo anvan', 'Les enfants d’abord', 'Children first'),
    city: 'hin', scene: 'lek', adv: 'mir',
    line: T('Yon peyi vo sa lekòl li ak lopital li vo.', 'Un pays vaut ce que valent ses écoles et ses hôpitaux.', 'A country is worth what its schools and hospitals are worth.'),
    slots: [['canteen', 'cholera', 'teachers', 'schools', 'youth'], ['canteen', 'cholera', 'teachers', 'schools', 'youth'], ['canteen', 'cholera', 'teachers', 'schools', 'youth']] },
  { id: 'storm', name: T('Siklòn', 'Ouragan', 'Hurricane'), theme: T('Sezon siklòn nan', 'La saison cyclonique', 'Hurricane season'),
    city: 'oka', scene: 'stm', adv: 'tij',
    line: T('Syèl la ap chanje sou Sid la. Pèp la ap gade w.', 'Le ciel change sur le Sud. La population vous regarde.', 'The sky is changing over the South. The people are watching you.'),
    slots: [['hurricane', 'season'], ['relief'], ['rebuild', 'power']] },
  { id: 'election', name: T('Eleksyon', 'Élections', 'Elections'), theme: T('Remèt pouvwa a', 'Rendre le pouvoir', 'Handing over power'),
    city: 'gon', scene: 'vot', adv: 'tij',
    line: T('Dènye ane a. Se kounye a istwa ap jije w.', 'La dernière année. C’est maintenant que l’histoire vous juge.', 'The final year. This is when history judges you.'),
    slots: [['election'], ['minister'], ['handover']] },
];

export const EVENTS: readonly DelayedEvent[] = [
  { year: 1, flag: 'nego', e: { security: -8, trust: -2 },
    title: T('Gang yo kase akò a', 'Les gangs rompent l’accord', 'The gangs break the deal'),
    text: T('Akò ou te fè Ane 1 an pa kenbe. Wout yo bloke ankò.', 'L’accord conclu en année 1 n’a pas tenu. Les routes sont de nouveau bloquées.', 'The deal you made in year 1 did not hold. The roads are blocked again.') },
  { year: 1, flag: 'force', e: { trust: -5, security: -2 },
    title: T('Yon operasyon fè viktim sivil', 'Une opération fait des victimes civiles', 'An operation kills civilians'),
    text: T('Kòlè monte kont fòs etranje a: pèp la mande kiyès ki reponsab li.', 'La colère monte contre la force étrangère : la population demande qui en répond.', 'Anger grows against the foreign force: people ask who answers for it.') },
  { year: 1, flag: 'disarm', e: { security: 4, economy: 2 },
    title: T('Plizyè santèn jèn depoze zam', 'Des centaines de jeunes rendent les armes', 'Hundreds of young members hand in their guns'),
    text: T('Pwogram dezameman an bay fwi: yo antre nan fòmasyon.', 'Le programme de désarmement porte ses fruits : ils entrent en formation.', 'The disarmament program pays off: they start training.') },
  { year: 1, flag: 'harsh', e: { security: -5, social: -2 },
    title: T('Gang yo rekrite anndan prizon yo', 'Les gangs recrutent dans les prisons', 'Gangs recruit inside the prisons'),
    text: T('Prizon yo debòde ak jèn ou te fè fèmen yo.', 'Les prisons débordent des jeunes que vous avez fait enfermer.', 'The prisons overflow with the young people you locked up.') },
  { year: 1, flag: 'amnesty', e: { security: -3, trust: -3 },
    title: T('Kèk ansyen manm retounen nan gang yo', 'D’anciens membres retournent dans les gangs', 'Some former members go back to the gangs'),
    text: T('Viktim yo fache: amnisti a pa t gen ase swivi.', 'Les victimes s’indignent : l’amnistie n’a pas été assez suivie.', 'Victims are angry: the amnesty had too little follow-up.') },
  { year: 1, flag: 'airport', e: { security: -4 },
    title: T('Gang yo pran lòt katye', 'Les gangs prennent d’autres quartiers', 'Gangs take other neighborhoods'),
    text: T('Pandan polis la t ap veye ayewopò a, lòt katye rete san pwoteksyon.', 'Pendant que la police gardait l’aéroport, d’autres quartiers sont restés sans protection.', 'While the police guarded the airport, other neighborhoods were left unprotected.') },
  { year: 1, flag: 'contract', e: { trust: -6 },
    title: T('Kontra sekirite a te twò chè', 'Le contrat de sécurité était surpayé', 'The security contract was overpriced'),
    text: T('Yon ankèt montre kontra a te siyen san kontwòl.', 'Une enquête montre que le contrat a été signé sans contrôle.', 'An investigation shows the contract was signed with no oversight.') },
  { year: 1, flag: 'camps', e: { social: -5, trust: -3 },
    title: T('Kan pwovizwa yo vin pèmanan', 'Les camps provisoires deviennent permanents', 'The temporary camps become permanent'),
    text: T('Lekòl yo toujou okipe e fanmi yo pa wè lè pou yo rantre.', 'Les écoles restent occupées et les familles ne voient pas quand rentrer.', 'Schools stay occupied and families see no date to go home.') },
  { year: 1, flag: 'sendhome', e: { security: -6, social: -6, trust: -4 },
    title: T('Gang yo atake katye kote fanmi yo te retounen', 'Les gangs attaquent les quartiers où les familles étaient rentrées', 'Gangs attack the neighborhoods families went back to'),
    text: T('Fanmi yo te retounen twò bonè: katye yo pa t an sekirite.', 'Les familles sont rentrées trop tôt : les quartiers n’étaient pas sûrs.', 'Families went back too early: the neighborhoods were not safe.') },
  { year: 2, flag: 'clean', e: { security: 6, trust: 2 },
    title: T('Polis pwòp la bay rezilta', 'La police assainie donne des résultats', 'The clean police force delivers'),
    text: T('Polisye ou te kenbe yo arete plizyè chèf gang.', 'Les policiers que vous avez gardés arrêtent plusieurs chefs de gang.', 'The officers you kept arrest several gang leaders.') },
  { year: 2, flag: 'army', e: { security: 8 },
    title: T('Premye batayon yo antre an aksyon', 'Les premiers bataillons entrent en action', 'The first battalions go into action'),
    text: T('Sòlda ou te fòme yo fin pare e yo pran pòs yo.', 'Les soldats que vous avez formés sont prêts et prennent position.', 'The soldiers you trained are ready and take up their posts.') },
  { year: 2, flag: 'guns', e: { security: 3 },
    title: T('Kèk peyi sere kontwòl zam yo', 'Des pays durcissent le contrôle des armes', 'Some countries tighten gun controls'),
    text: T('Diskou ou te fè nan Nasyonzini an fè chemen l.', 'Votre discours à l’ONU a fait son chemin.', 'Your speech at the UN made its way.') },
  { year: 2, flag: 'customs', e: { treasury: 12 },
    title: T('Ladwàn nan rapòte plis', 'La douane rapporte plus', 'Customs brings in more'),
    text: T('Sistèm enfòmatik la fè lajan an rive nan kès la.', 'Le système informatique fait arriver l’argent dans les caisses.', 'The computer system gets the money into the treasury.') },
  { year: 2, flag: 'loan', e: { treasury: -12, economy: -2 },
    title: T('Premye gwo peman dèt la rive', 'La première grosse échéance de la dette tombe', 'The first big debt payment is due'),
    text: T('Prè etranje a dwe remèt: kès la peye.', 'Le prêt étranger doit être remboursé : les caisses paient.', 'The foreign loan has to be repaid: the treasury pays.') },
  { year: 2, flag: 'print', e: { economy: -8, social: -4, trust: -4 },
    title: T('Enflasyon: pri manje ak gaz ap monte', 'Inflation : nourriture et carburant flambent', 'Inflation: food and fuel prices soar'),
    text: T('Goud ou te enprime yo pèdi valè yo.', 'Les gourdes imprimées ont perdu leur valeur.', 'The gourdes you printed lost their value.') },
  { year: 2, flag: 'subsidy', e: { trust: -8, economy: -4, security: -2 },
    title: T('Pri gaz la double', 'Le prix de l’essence double', 'Fuel prices double'),
    text: T('Grèv ak barikad nan tout peyi a apre sibvansyon an fin retire.', 'Grèves et barricades dans tout le pays après la fin de la subvention.', 'Strikes and roadblocks across the country after the subsidy ends.') },
  { year: 2, flag: 'migration', e: { social: 4, trust: 3 },
    title: T('Akò migrasyon an siyen', 'L’accord migratoire est signé', 'The migration deal is signed'),
    text: T('Depòtasyon yo ralanti e travayè yo jwenn papye.', 'Les expulsions ralentissent et les travailleurs obtiennent des papiers.', 'Deportations slow down and workers get papers.') },
  { year: 3, flag: 'farm', e: { economy: 2, trust: 5 },
    title: T('Rekòt Latibonit la rive', 'La récolte de l’Artibonite arrive', 'The Artibonite harvest comes in'),
    text: T('Diri lokal la ap nouri Sid la anvan siklòn nan.', 'Le riz local nourrit le Sud avant l’ouragan.', 'Local rice feeds the South before the hurricane.') },
  { year: 4, flag: 'half', e: { social: -6, trust: -3 },
    title: T('Pwofesè yo tounen nan lari', 'Les enseignants retournent dans la rue', 'Teachers are back in the streets'),
    text: T('Rès salè ou te pwomèt la pa janm peye.', 'Le reste du salaire promis n’a jamais été payé.', 'The rest of the pay you promised was never paid.') },
  { year: 4, flag: 'scholar', e: { economy: 5, social: 3 },
    title: T('Premye bousye yo fin etidye', 'Les premiers boursiers sont diplômés', 'The first scholarship students graduate'),
    text: T('Yo rete travay nan peyi a.', 'Ils restent travailler au pays.', 'They stay to work at home.') },
  { year: 4, flag: 'trees', e: { social: 6, economy: 4 },
    title: T('Gwo lapli: pyebwa yo kenbe tè a', 'Fortes pluies : les arbres retiennent la terre', 'Heavy rain: the trees hold the soil'),
    text: T('Pyebwa ou te plante yo diminye inondasyon yo.', 'Les arbres que vous avez plantés réduisent les inondations.', 'The trees you planted reduce the flooding.') },
];

export const BADGES: readonly Badge[] = [
  { id: 'first', name: T('Premye siyati', 'Première signature', 'First signature'), rule: T('Siyen premye dekrè w', 'Signer votre premier décret', 'Sign your first decree') },
  { id: 'road', name: T('Wout lib', 'Routes libres', 'Open roads'), rule: T('Sekirite rive 55', 'Sécurité à 55', 'Security reaches 55') },
  { id: 'build', name: T('Batisè', 'Grands chantiers', 'Builder'), rule: T('Ekonomi rive 55', 'Économie à 55', 'Economy reaches 55') },
  { id: 'teach', name: T('Lekòl pou tout moun', 'L’école pour tous', 'School for all'), rule: T('Lekòl ak lasante rive 55', 'École et santé à 55', 'Schools and health reach 55') },
  { id: 'people', name: T('Vwa pèp la', 'La voix du peuple', 'Voice of the people'), rule: T('Konfyans rive 70', 'Confiance à 70', 'Trust reaches 70') },
  { id: 'thrift', name: T('Kès byen jere', 'Caisses bien gérées', 'Sound finances'), rule: T('Fini yon ane ak 25 nan kès la', 'Finir une année avec 25 en caisse', 'End a year with 25 in the treasury') },
  { id: 'star3', name: T('Twa zetwal', 'Trois étoiles', 'Three stars'), rule: T('Jwenn 3 zetwal nan yon ane', 'Obtenir 3 étoiles en une année', 'Earn 3 stars in one year') },
  { id: 'storm', name: T('Kanpe apre siklòn nan', 'Debout après l’ouragan', 'Standing after the storm'), rule: T('2 zetwal oswa plis nan Ane 4', '2 étoiles ou plus en année 4', '2 stars or more in year 4') },
  { id: 'remit', name: T('Demokrat', 'Démocrate', 'Democrat'), rule: T('Remèt pouvwa a nan dat la', 'Remettre le pouvoir à la date prévue', 'Hand over power on time') },
  { id: 'full', name: T('Manda konplè', 'Mandat complet', 'Full term'), rule: T('Fini 5 an yo', 'Terminer les 5 ans', 'Finish all 5 years') },
  { id: 'streak', name: T('Fidèl', 'Fidèle', 'Loyal'), rule: T('Jwe 3 jou youn dèyè lòt', 'Jouer 3 jours de suite', 'Play 3 days in a row') },
];

/** The president profile at the end follows the strongest of the four country stats. */
export const PROFILES: Record<ProfileId, Profile> = {
  security: { title: T('Prezidan Lòd', 'Présidence de l’ordre', 'The order president'), line: T('Ou te mete sekirite anvan tout bagay.', 'Vous avez mis la sécurité avant tout.', 'You put security before everything.') },
  economy: { title: T('Prezidan Batisè', 'Présidence bâtisseuse', 'The builder president'), line: T('Ou te mize sou travay ak ekonomi.', 'Vous avez misé sur le travail et l’économie.', 'You bet on jobs and the economy.') },
  social: { title: T('Prezidan Pwofesè', 'Présidence du savoir', 'The teacher president'), line: T('Ou te envesti nan lekòl ak lasante.', 'Vous avez investi dans l’école et la santé.', 'You invested in schools and health.') },
  trust: { title: T('Prezidan Pèp la', 'Présidence du peuple', 'The people’s president'), line: T('Ou te koute pèp la epi kenbe pawòl ou.', 'Vous avez écouté la population et tenu parole.', 'You listened to the people and kept your word.') },
};

// ---- the map of Haiti (simplified outline, longitude/latitude) ----
export const CITIES: Record<CityId, { lon: number; lat: number; name: L10n }> = {
  pap: { lon: -72.29, lat: 18.58, name: T('Pòtoprens', 'Port-au-Prince', 'Port-au-Prince') },
  okp: { lon: -72.2, lat: 19.72, name: T('Okap', 'Cap-Haïtien', 'Cap-Haïtien') },
  gon: { lon: -72.62, lat: 19.44, name: T('Gonayiv', 'Gonaïves', 'Gonaïves') },
  hin: { lon: -72.01, lat: 19.15, name: T('Hinche', 'Hinche', 'Hinche') },
  oka: { lon: -73.75, lat: 18.22, name: T('Okay', 'Les Cayes', 'Les Cayes') },
  jer: { lon: -74.12, lat: 18.62, name: T('Jeremi', 'Jérémie', 'Jérémie') },
  jak: { lon: -72.53, lat: 18.26, name: T('Jakmèl', 'Jacmel', 'Jacmel') },
  pdp: { lon: -72.83, lat: 19.9, name: T('Pòdepè', 'Port-de-Paix', 'Port-de-Paix') },
};
export const COAST: readonly (readonly [number, number])[] = [
  [-73.4, 19.8], [-73.2, 19.93], [-72.83, 19.95], [-72.5, 19.9], [-72.2, 19.78], [-71.84, 19.68], [-71.72, 19.6], [-71.7, 19.35], [-71.63, 19.15],
  [-71.75, 18.95], [-71.95, 18.62], [-71.72, 18.33], [-71.77, 18.04], [-72.1, 18.2], [-72.53, 18.2], [-73, 18.17], [-73.4, 18.24], [-73.75, 18.16],
  [-73.92, 18.04], [-74.2, 18.2], [-74.42, 18.33], [-74.46, 18.57], [-74.12, 18.67], [-73.6, 18.54], [-73.09, 18.46], [-72.75, 18.44], [-72.4, 18.53],
  [-72.33, 18.62], [-72.52, 18.77], [-72.72, 19.08], [-72.78, 19.3], [-72.69, 19.45], [-73.05, 19.63], [-73.25, 19.66],
];
/** Roads: city ids or [lon, lat] bends. */
export const ROADS: readonly (readonly (CityId | readonly [number, number])[])[] = [
  ['pap', [-72.6, 19.0], 'gon', 'okp'], ['pap', 'hin', 'okp'], ['pap', 'jak'], ['pap', [-72.75, 18.42], [-73.09, 18.42], 'oka'], ['oka', [-73.95, 18.4], 'jer'], ['gon', 'pdp'],
];
