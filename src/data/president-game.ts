import type { L10n, PriorityId } from '../types';

/*
 * « Si m te prezidan »: a five year term in eight decisions. The first day and the last year are
 * fixed; six decisions are drawn from a pool built on Haiti's situation (gangs, displacement, the
 * airport, deportations, the international force, the diaspora, schools, fuel, cholera, weapons,
 * recruitment, storms, food, power), so every term differs. The country has five meters (security,
 * economy, schools and health, public trust, treasury). Every answer moves them and costs money or
 * brings some in; some come back later (printing money turns into inflation, a deal with gangs
 * falls apart, a buried scandal leaks, trees planted early hold the soil when the rain comes). The
 * country also reacts on its own (crises when a meter collapses, good news when one is strong).
 * An answer the treasury cannot pay for cannot be chosen; decisions are final; skipping one costs
 * public trust; consequences still pending at the end land after the term and count in the score.
 *
 * Every answer also adds weight to one or two of the site's twelve priorities (2 for the main one,
 * 1 for the second). The three heaviest make the player's profile, and candidates are compared on
 * those three exactly like on the match page: by public record only, never a recommendation. No
 * answer points to a candidate or a party. The scenarios are a game, not a forecast.
 */

export type GaugeId = 'security' | 'economy' | 'social' | 'trust' | 'treasury';
export type Effects = Partial<Record<GaugeId, number>>;
/** A consequence that lands `after` decisions later (or after the term, when that is past the last one). */
export interface Later { after: number; title: L10n; effects: Effects }
export interface GameChoice {
  /** Main priority: also gives the answer its icon. */
  main: PriorityId;
  title: L10n;
  sub: L10n;
  outcome: L10n;
  effects: Effects;
  later?: Later;
  weights: Partial<Record<PriorityId, number>>;
}
export interface GameDecision { id: string; icon: PriorityId; prompt: L10n; choices: readonly GameChoice[] }
export interface Profile { title: L10n; line: L10n }

export const GAUGES: readonly { id: GaugeId; label: L10n }[] = [
  { id: 'security', label: { ht: 'Sekirite', fr: 'Sécurité', en: 'Security' } },
  { id: 'economy', label: { ht: 'Ekonomi', fr: 'Économie', en: 'Economy' } },
  { id: 'social', label: { ht: 'Lekòl ak lasante', fr: 'Écoles et santé', en: 'Schools and health' } },
  { id: 'trust', label: { ht: 'Konfyans pèp la', fr: 'Confiance du peuple', en: 'Public trust' } },
  { id: 'treasury', label: { ht: 'Kès leta', fr: 'Caisses de l’État', en: 'Treasury' } },
];
/** A hard start on purpose: the player has to earn every point. */
export const START: Readonly<Record<GaugeId, number>> = { security: 25, economy: 30, social: 30, trust: 35, treasury: 40 };
/** Taxes come in at the start of every year after the first. */
export const INCOME = 6;
/** Not deciding is a decision too. */
export const SKIP_EFFECTS: Effects = { trust: -6 };

const T = (ht: string, fr: string, en: string): L10n => ({ ht, fr, en });
const c = (main: PriorityId, title: L10n, sub: L10n, effects: Effects, outcome: L10n, second?: PriorityId, later?: Later): GameChoice =>
  ({ main, title, sub, effects, outcome, ...(later ? { later } : {}), weights: second ? { [main]: 2, [second]: 1 } : { [main]: 2 } });

export const DECISIONS: readonly GameDecision[] = [
  { id: 'day1', icon: 'security',
    prompt: T('Premye jou ou nan Palè Nasyonal la. Gang yo kontwole wout nasyonal yo. Kisa ou fè anvan?', 'Premier jour au Palais national. Les gangs contrôlent les routes nationales. Que faites-vous d’abord ?', 'Your first day at the National Palace. Gangs control the national roads. What do you do first?'),
    choices: [
      c('security', T('Voye polis ak lame', 'Une opération police et armée', 'Send in police and army'), T('Reprann wout yo pa lafòs', 'Reprendre les routes par la force', 'Retake the roads by force'),
        { security: 23, trust: 5, treasury: -15 },
        T('Wout yo louvri ankò, machandiz ap sikile. Men operasyon an koute chè e gen moun ki blese.', 'Les routes rouvrent et les marchandises circulent. Mais l’opération coûte cher et fait des blessés.', 'The roads reopen and goods move again. But the operation is costly and people were hurt.')),
      c('justice', T('Netwaye polis la anvan', 'Assainir d’abord la police', 'Clean up the police first'), T('Revoke polisye ki kolabore ak gang', 'Révoquer les policiers complices des gangs', 'Fire officers working with gangs'),
        { trust: 16, security: 8, treasury: -5 },
        T('Pèp la apresye sa e polis la vin pi serye. Men pandan tan sa a, gang yo kenbe wout yo.', 'La population apprécie et la police gagne en sérieux. Mais pendant ce temps, les gangs gardent les routes.', 'People approve and the police becomes more serious. Meanwhile, the gangs keep the roads.'), 'institutions'),
      c('security', T('Negosye ak gang yo', 'Négocier avec les gangs', 'Negotiate with the gangs'), T('Yon akò pou yo kite wout yo', 'Un accord pour libérer les routes', 'A deal to free the roads'),
        { security: 13, trust: -10 },
        T('Gen yon ti kalm touswit, san depans. Men anpil moun santi leta bese tèt devan gang yo.', 'Un calme rapide et gratuit. Mais beaucoup ont le sentiment que l’État a plié devant les gangs.', 'Quick calm at no cost. But many feel the state gave in to the gangs.'), undefined,
        { after: 4, title: T('Gang yo mande plis: akò a kraze.', 'Les gangs en veulent plus : l’accord se brise.', 'The gangs want more: the deal collapses.'), effects: { security: -16, trust: -6 } }),
      c('institutions', T('Mande yon misyon entènasyonal', 'Demander une mission internationale', 'Ask for an international mission'), T('Lòt peyi voye sòlda ak lajan', 'D’autres pays envoient troupes et fonds', 'Other countries send troops and funds'),
        { security: 18, trust: -8, treasury: -3 },
        T('Misyon an ede retabli lòd. Men gen moun ki di souverènte peyi a ap soufri.', 'La mission aide à rétablir l’ordre. Mais certains disent que la souveraineté du pays en souffre.', 'The mission helps restore order. But some say the country’s sovereignty suffers.'), 'security'),
    ] },
  { id: 'money', icon: 'economy',
    prompt: T('Kès leta a prèske vid. Ki kote ou jwenn lajan?', 'Les caisses de l’État sont presque vides. Où trouver de l’argent ?', 'The treasury is almost empty. Where do you find money?'),
    choices: [
      c('economy', T('Pran yon gwo prè etranje', 'Un gros prêt étranger', 'A big foreign loan'), T('Lajan disponib touswit', 'De l’argent tout de suite', 'Money right away'),
        { treasury: 35, economy: 5 },
        T('Lajan an antre vit e tout bagay sanble byen pou kounye a. Men yon jou fò w remèt li.', 'L’argent arrive vite et tout semble aller bien pour l’instant. Mais il faudra le rembourser.', 'The money arrives fast and everything looks fine for now. But it will have to be paid back.'), undefined,
        { after: 4, title: T('Premye gwo peman dèt la rive.', 'La première grosse échéance de la dette arrive.', 'The first big debt payment is due.'), effects: { treasury: -25, economy: -4 } }),
      c('justice', T('Konbat fwod nan dwann', 'Combattre la fraude douanière', 'Fight customs fraud'), T('Kontwole pò ak fwontyè yo', 'Contrôler ports et frontières', 'Control ports and borders'),
        { treasury: 18, trust: 10, security: -4 },
        T('Dwann yo rapòte plis lajan chak mwa. Kontrebandye yo fache e gen tansyon sou fwontyè a.', 'Les douanes rapportent plus chaque mois. Les contrebandiers sont furieux et la frontière se tend.', 'Customs bring in more every month. Smugglers are angry and the border gets tense.'), 'economy'),
      c('economy', T('Ogmante taks yo', 'Augmenter les impôts', 'Raise taxes'), T('Plis taks sou biznis ak konsomasyon', 'Plus de taxes sur les entreprises et la consommation', 'More tax on business and spending'),
        { treasury: 22, trust: -10, economy: -8 },
        T('Kès la ranpli, men biznis yo ralanti e pèp la plenyen pri yo.', 'Les caisses se remplissent, mais les entreprises ralentissent et la population se plaint des prix.', 'The treasury fills up, but businesses slow down and people complain about prices.')),
      c('economy', T('Enprime lajan', 'Faire tourner la planche à billets', 'Print money'), T('Bank santral la kreye goud', 'La banque centrale crée des gourdes', 'The central bank creates gourdes'),
        { treasury: 28 },
        T('Lajan an la touswit, san taks ni dèt. Pou kounye a, pèsonn pa wè pwoblèm.', 'L’argent est là tout de suite, sans impôt ni dette. Pour l’instant, personne ne voit de problème.', 'The money is there right away, with no tax and no debt. For now, nobody sees a problem.'), undefined,
        { after: 2, title: T('Enflasyon: pri manje ak gaz ap monte chak jou.', 'Inflation : nourriture et carburant flambent.', 'Inflation: food and fuel prices soar.'), effects: { economy: -16, social: -8, trust: -8 } }),
    ] },
  { id: 'youth', icon: 'youth',
    prompt: T('Jèn yo ap kite peyi a an mas. Kisa ou fè?', 'Les jeunes quittent le pays en masse. Que faites-vous ?', 'Young people are leaving the country in large numbers. What do you do?'),
    choices: [
      c('education', T('Bous ak fòmasyon', 'Bourses et formation', 'Scholarships and training'), T('Plis jèn nan inivèsite ak nan metye', 'Plus de jeunes à l’université et en formation', 'More young people in university and trades'),
        { social: 16, economy: 3, treasury: -12 },
        T('Plis jèn antre nan inivèsite ak nan lekòl metye. Rezilta a ap vin pi gwo ak tan.', 'Plus de jeunes entrent à l’université et en formation. L’effet grandira avec le temps.', 'More young people enter university and trade school. The effect will grow over time.'), 'youth',
        { after: 4, title: T('Premye pwomosyon bousye yo fin etidye e yo rete travay nan peyi a.', 'La première promotion de boursiers est diplômée et reste travailler au pays.', 'The first class of scholarship students graduates and stays to work at home.'), effects: { economy: 10, social: 5 } }),
      c('economy', T('Kredi pou ti biznis', 'Crédit aux petites entreprises', 'Small business loans'), T('Ti prè pou jèn ki vle lanse', 'Des prêts pour les jeunes qui se lancent', 'Loans for young people starting out'),
        { economy: 16, trust: 4, treasury: -10 },
        T('Plizyè santèn ti biznis louvri. Gen kèk ki fè fayit, men anpil ap anplwaye moun.', 'Des centaines de petites entreprises ouvrent. Certaines échouent, beaucoup embauchent.', 'Hundreds of small businesses open. Some fail, many hire.'), 'youth'),
      c('youth', T('Sèvis sivik obligatwa', 'Service civique obligatoire', 'Mandatory civic service'), T('Jèn yo travay pou peyi a pandan 1 an', 'Les jeunes servent le pays pendant 1 an', 'Young people serve the country for 1 year'),
        { security: 8, social: 7, trust: -8, treasury: -5 },
        T('Jèn yo repare wout ak lekòl, men anpil ladan yo pa t vle e fanmi yo fache.', 'Les jeunes réparent routes et écoles, mais beaucoup n’en voulaient pas et les familles protestent.', 'Young people fix roads and schools, but many did not want it and families protest.'), 'security'),
      c('diaspora', T('Fasilite dyaspora envesti', 'Faciliter l’investissement de la diaspora', 'Make it easy for the diaspora to invest'), T('Mwens papye, plis garanti', 'Moins de paperasse, plus de garanties', 'Less paperwork, more guarantees'),
        { economy: 12, trust: 4, treasury: -3 },
        T('Dyaspora a kòmanse envesti lakay. Sa pran tan, men lajan an rete nan peyi a.', 'La diaspora commence à investir au pays. C’est lent, mais l’argent reste en Haïti.', 'The diaspora starts investing back home. It is slow, but the money stays in Haiti.'), 'economy'),
    ] },
  { id: 'storm', icon: 'environment',
    prompt: T('Sezon siklòn nan ap rive. Kijan ou prepare peyi a?', 'La saison cyclonique arrive. Comment préparez-vous le pays ?', 'Hurricane season is coming. How do you prepare the country?'),
    choices: [
      c('environment', T('Rebwaze mòn yo', 'Reboiser les mornes', 'Reforest the hills'), T('Plante dè milyon pye bwa', 'Planter des millions d’arbres', 'Plant millions of trees'),
        { social: 3, treasury: -8 },
        T('Milyon pye bwa plante. Pou kounye a, pa gen anyen ki chanje: pyebwa yo bezwen tan.', 'Des millions d’arbres plantés. Pour l’instant, rien ne change : les arbres ont besoin de temps.', 'Millions of trees planted. For now nothing changes: trees need time.'), undefined,
        { after: 3, title: T('Gwo lapli: pyebwa yo kenbe tè a, gen mwens inondasyon.', 'Fortes pluies : les arbres retiennent la terre, moins d’inondations.', 'Heavy rain: the trees hold the soil, there is less flooding.'), effects: { social: 13, economy: 8 } }),
      c('infrastructure', T('Bati abri ak kanal', 'Construire abris et canaux', 'Build shelters and drains'), T('Travay piblik nan zòn ki an danje', 'Des travaux dans les zones à risque', 'Public works in high risk areas'),
        { social: 13, trust: 5, security: 3, treasury: -16 },
        T('Abri ak kanal yo pare. Lè siklòn nan pase, pi piti fanmi pèdi kay yo.', 'Abris et canaux sont prêts. Quand le cyclone passe, moins de familles perdent leur maison.', 'Shelters and drains are ready. When the storm hits, fewer families lose their homes.'), 'environment'),
      c('economy', T('Kenbe lajan an', 'Garder l’argent', 'Keep the money'), T('Petèt siklòn nan p ap frape', 'Le cyclone ne frappera peut-être pas', 'Maybe the storm will miss'),
        { treasury: 4 },
        T('Ou ekonomize lajan an. Meteyo a ap swiv yon tanpèt nan Atlantik la.', 'Vous économisez l’argent. La météo surveille une tempête dans l’Atlantique.', 'You save the money. Forecasters are watching a storm in the Atlantic.'), undefined,
        { after: 1, title: T('Yon siklòn frape sid peyi a: gwo domaj.', 'Un cyclone frappe le Sud : de gros dégâts.', 'A hurricane hits the south: heavy damage.'), effects: { social: -16, economy: -10, trust: -10, treasury: -10 } }),
      c('institutions', T('Sistèm alèt sou telefòn', 'Alertes sur téléphone', 'Phone alert system'), T('Evakye moun yo a tan', 'Évacuer la population à temps', 'Evacuate people in time'),
        { social: 8, trust: 7, treasury: -6 },
        T('Chak telefòn resevwa alèt. Moun yo evakye a tan, men kay yo toujou frajil.', 'Chaque téléphone reçoit les alertes. Les gens évacuent à temps, mais les maisons restent fragiles.', 'Every phone gets the alerts. People evacuate in time, but homes stay fragile.'), 'environment'),
    ] },
  { id: 'food', icon: 'agriculture',
    prompt: T('Pri manje ap monte chak semèn. Kisa ou fè?', 'Les prix alimentaires montent chaque semaine. Que faites-vous ?', 'Food prices rise every week. What do you do?'),
    choices: [
      c('economy', T('Sibvansyone diri enpòte', 'Subventionner le riz importé', 'Subsidize imported rice'), T('Pri a bese touswit', 'Les prix baissent tout de suite', 'Prices drop right away'),
        { trust: 13, social: 5, economy: -6, treasury: -14 },
        T('Pri diri a bese vit e pèp la kontan. Men plantè diri nan Latibonit pa ka vann rekòt yo ankò.', 'Le prix du riz baisse vite et la population est contente. Mais les riziculteurs de l’Artibonite ne vendent plus.', 'Rice gets cheaper fast and people are happy. But rice farmers in the Artibonite can no longer sell.'), 'agriculture'),
      c('agriculture', T('Envesti nan agrikilti lokal', 'Investir dans l’agriculture locale', 'Invest in local farming'), T('Semans, irigasyon, wout agrikòl', 'Semences, irrigation, routes agricoles', 'Seeds, irrigation, farm roads'),
        { economy: 8, social: 3, treasury: -12 },
        T('Plantè yo resevwa semans ak dlo. Rekòt yo ap pran tan: pri yo poko bese.', 'Les paysans reçoivent semences et irrigation. Les récoltes prennent du temps : les prix ne baissent pas encore.', 'Farmers get seeds and irrigation. Harvests take time: prices have not dropped yet.'), undefined,
        { after: 3, title: T('Rekòt lokal yo double: pri manje kòmanse bese.', 'Les récoltes locales doublent : les prix commencent à baisser.', 'Local harvests double: food prices start to fall.'), effects: { economy: 10, trust: 8, social: 5 } }),
      c('economy', T('Bloke pri yo pa dekrè', 'Bloquer les prix par décret', 'Freeze prices by decree'), T('Entèdi tout ogmantasyon', 'Interdire toute hausse', 'Ban any increase'),
        { trust: 8, economy: -12 },
        T('Machann yo kache machandiz yo e mache yo vin vid. Pri ofisyèl la ba, men pa gen anyen pou achte.', 'Les commerçants cachent leurs stocks et les marchés se vident. Le prix officiel est bas, mais il n’y a rien à acheter.', 'Traders hide their stock and markets empty out. The official price is low, but there is nothing to buy.')),
      c('security', T('Sekirize wout machandiz yo', 'Sécuriser les routes des marchandises', 'Secure the supply roads'), T('Kamyon yo pase san peye gang', 'Les camions passent sans payer les gangs', 'Trucks pass without paying gangs'),
        { security: 10, economy: 8, treasury: -8 },
        T('Kamyon yo pase san peye gang e pri yo kòmanse estabilize.', 'Les camions passent sans payer les gangs et les prix commencent à se stabiliser.', 'Trucks get through without paying gangs and prices start to stabilize.'), 'economy'),
    ] },
  { id: 'scandal', icon: 'justice',
    prompt: T('Youn nan minis ou yo akize de koripsyon. Kisa ou fè?', 'Un de vos ministres est accusé de corruption. Que faites-vous ?', 'One of your ministers is accused of corruption. What do you do?'),
    choices: [
      c('justice', T('Revoke l, voye dosye a nan jistis', 'Le révoquer et saisir la justice', 'Fire them and go to the courts'), T('Menm règ pou tout moun', 'La même règle pour tous', 'The same rule for everyone'),
        { trust: 21 },
        T('Pèp la wè lalwa aplike pou tout moun. Kèk alye politik vire do ba ou.', 'La population voit que la loi s’applique à tous. Quelques alliés politiques vous tournent le dos.', 'People see the law applies to everyone. Some political allies turn their backs on you.')),
      c('institutions', T('Defann li piblikman', 'Le défendre publiquement', 'Defend them publicly'), T('Kenbe ekip ou ansanm', 'Garder votre équipe unie', 'Keep your team together'),
        { trust: -14 },
        T('Ou pwoteje ekip ou, men pèp la pa kwè nan pwomès ou yo ankò.', 'Vous protégez votre équipe, mais la population ne croit plus vos promesses.', 'You protect your team, but people stop believing your promises.')),
      c('institutions', T('Kreye yon komisyon endepandan', 'Créer une commission indépendante', 'Set up an independent commission'), T('Ankèt piblik, rapò piblik', 'Enquête publique, rapport public', 'Public inquiry, public report'),
        { trust: 10, treasury: -4 },
        T('Komisyon an travay ak transparans. Rezilta yo dousman, men moun fè l konfyans.', 'La commission travaille en toute transparence. C’est lent, mais elle inspire confiance.', 'The commission works in the open. It is slow, but people trust it.'), 'justice'),
      c('institutions', T('Kache dosye a', 'Étouffer l’affaire', 'Bury the file'), T('Pa gen eskandal, pa gen pwoblèm', 'Pas de scandale, pas de problème', 'No scandal, no problem'),
        { trust: 3 },
        T('Dosye a disparèt. Pou kounye a, pèsonn pa pale de sa.', 'Le dossier disparaît. Pour l’instant, personne n’en parle.', 'The file disappears. For now, nobody talks about it.'), undefined,
        { after: 2, title: T('Jounalis yo pibliye dosye a: eskandal nasyonal.', 'Des journalistes publient le dossier : scandale national.', 'Journalists publish the file: national scandal.'), effects: { trust: -24, economy: -4 } }),
    ] },
  { id: 'power', icon: 'utilities',
    prompt: T('Kouran an koupe 20 èdtan pa jou. Kisa ou fè?', 'Le courant est coupé 20 heures par jour. Que faites-vous ?', 'Power is out 20 hours a day. What do you do?'),
    choices: [
      c('utilities', T('Yon gwo santral elektrik', 'Une grande centrale électrique', 'A big power plant'), T('Kouran pou gwo vil yo', 'Du courant pour les grandes villes', 'Power for the big cities'),
        { economy: 18, social: 5, treasury: -22 },
        T('Kouran an tounen nan gwo vil yo e biznis yo louvri pi ta. Men santral la koute anpil.', 'Le courant revient dans les grandes villes et les commerces ouvrent plus tard. Mais la centrale coûte cher.', 'Power returns to the big cities and businesses stay open later. But the plant is expensive.'), 'economy'),
      c('utilities', T('Mini rezo solè nan chak komin', 'Des mini réseaux solaires dans chaque commune', 'Solar mini grids in every commune'), T('Limyè pou lekòl ak lopital', 'De la lumière pour écoles et hôpitaux', 'Light for schools and clinics'),
        { social: 10, economy: 10, treasury: -14 },
        T('Komin yo gen limyè, lekòl ak dispansè mache. Pwogrè a dousman, men li rive toupatou.', 'Les communes ont de la lumière, écoles et dispensaires fonctionnent. C’est lent, mais ça touche tout le pays.', 'Communes get light, schools and clinics work. Progress is slow, but it reaches everywhere.'), 'environment'),
      c('economy', T('Prive konpayi elektrik leta a', 'Privatiser la compagnie d’électricité', 'Privatize the power company'), T('Yon konpayi prive pran kontwòl', 'Une entreprise privée prend la main', 'A private company takes over'),
        { treasury: 12, economy: 8, trust: -10 },
        T('Yon konpayi prive peye leta e kouran an amelyore. Men pri kouran an monte e sendika yo fè grèv.', 'Une entreprise privée paie l’État et le courant s’améliore. Mais le prix grimpe et les syndicats font grève.', 'A private company pays the state and power improves. But prices rise and unions strike.'), 'utilities'),
      c('health', T('Jeneratè pou lopital yo sèlman', 'Des générateurs pour les hôpitaux seulement', 'Generators for hospitals only'), T('Lavi moun anvan tout bagay', 'Les vies d’abord', 'Lives first'),
        { social: 10, treasury: -6 },
        T('Lopital yo pa janm fè nwa ankò. Rès peyi a toujou nan fènwa.', 'Les hôpitaux ne sont plus jamais dans le noir. Le reste du pays, si.', 'Hospitals are never in the dark again. The rest of the country still is.'), 'utilities'),
    ] },
  // ---- Haiti today (late 2026): displacement, the airport, deportations, the anti-gang force, the diaspora,
  //      closed schools, fuel, cholera, weapons trafficking, recruitment of young people ----
  { id: 'displaced', icon: 'youth',
    prompt: T('Plis pase yon milyon moun kouri kite kay yo akoz gang yo. Anpil fanmi ap viv nan lekòl ak sou plas piblik. Kisa ou fè?', 'Plus d’un million de personnes ont fui leur maison à cause des gangs. Beaucoup de familles vivent dans des écoles et sur des places publiques. Que faites-vous ?', 'More than a million people have fled their homes because of gangs. Many families live in schools and public squares. What do you do?'),
    choices: [
      c('infrastructure', T('Sekirize epi rebati katye yo', 'Sécuriser et reconstruire les quartiers', 'Secure and rebuild the neighborhoods'), T('Polis anvan, chantye apre', 'La police d’abord, les chantiers ensuite', 'Police first, then construction'),
        { security: 8, social: 10, treasury: -18 },
        T('Fanmi yo kòmanse tounen lakay yo. Travay la lan e li koute chè, men li dire.', 'Les familles commencent à rentrer chez elles. C’est lent et coûteux, mais durable.', 'Families start returning home. It is slow and costly, but it lasts.'), 'security'),
      c('health', T('Kan pwovizwa ak dlo ak swen', 'Des camps provisoires avec eau et soins', 'Temporary camps with water and care'), T('Yon solisyon rapid', 'Une solution rapide', 'A quick fix'),
        { social: 12, trust: 4, treasury: -8 },
        T('Fanmi yo jwenn dlo ak swen touswit. Pou kounye a, pèsonn pa pale de kilè kan yo ap fèmen.', 'Les familles ont de l’eau et des soins tout de suite. Pour l’instant, personne ne parle de fermer les camps.', 'Families get water and care right away. For now, nobody talks about closing the camps.'), undefined,
        { after: 3, title: T('Kan pwovizwa yo vin pèmanan: lekòl yo toujou okipe.', 'Les camps provisoires deviennent permanents : les écoles restent occupées.', 'The temporary camps become permanent: schools stay occupied.'), effects: { social: -10, trust: -6 } }),
      c('economy', T('Lajan kach pou lwaye kay', 'De l’argent pour payer un loyer', 'Cash to pay rent'), T('Fanmi yo chwazi kote yo prale', 'Les familles choisissent où aller', 'Families choose where to go'),
        { social: 9, economy: 5, treasury: -12 },
        T('Lekòl yo libere e fanmi yo jwenn kay. Men pri lwaye monte nan zòn ki an sekirite yo.', 'Les écoles sont libérées et les familles se logent. Mais les loyers grimpent dans les zones sûres.', 'Schools are freed and families find homes. But rents climb in the safe areas.')),
      c('security', T('Voye yo tounen lakay yo touswit', 'Les renvoyer chez eux tout de suite', 'Send them home right away'), T('Libere lekòl yo kounye a', 'Libérer les écoles maintenant', 'Free the schools now'),
        { social: 5, trust: 3 },
        T('Lekòl yo rouvri e kantite deplase yo bese. Men katye yo poko an sekirite.', 'Les écoles rouvrent et le nombre de déplacés baisse. Mais les quartiers ne sont pas encore sûrs.', 'Schools reopen and the number of displaced people drops. But the neighborhoods are not safe yet.'), undefined,
        { after: 1, title: T('Gang yo atake katye kote fanmi yo te retounen.', 'Les gangs attaquent les quartiers où les familles étaient rentrées.', 'Gangs attack the neighborhoods families went back to.'), effects: { security: -12, social: -12, trust: -8 } }),
    ] },
  { id: 'airport', icon: 'infrastructure',
    prompt: T('Avyon yo pran bal pandan yo t ap ateri. Konpayi yo sispann vole sou Pòtoprens. Kisa ou fè?', 'Des avions ont été touchés par balles à l’atterrissage. Les compagnies ne desservent plus Port-au-Prince. Que faites-vous ?', 'Planes were hit by gunfire while landing. Airlines stop flying to Port-au-Prince. What do you do?'),
    choices: [
      c('security', T('Sekirize zòn ayewopò a', 'Sécuriser la zone de l’aéroport', 'Secure the airport area'), T('Yon perimèt militè lajounen kou lannwit', 'Un périmètre militaire jour et nuit', 'A military perimeter day and night'),
        { security: 12, economy: 8, treasury: -14 },
        T('Vòl yo rekòmanse dousman. Men tout fòs polis la konsantre bò ayewopò a.', 'Les vols reprennent doucement. Mais la police se concentre autour de l’aéroport.', 'Flights slowly resume. But the police force is concentrated around the airport.'), undefined,
        { after: 2, title: T('Pandan polis la ap veye ayewopò a, gang yo pran lòt katye.', 'Pendant que la police garde l’aéroport, les gangs prennent d’autres quartiers.', 'While the police guard the airport, gangs take other neighborhoods.'), effects: { security: -8 } }),
      c('infrastructure', T('Fè Okap tounen gwo ayewopò a', 'Faire du Cap-Haïtien l’aéroport principal', 'Make Cap-Haïtien the main airport'), T('Plis vòl nan nò', 'Plus de vols dans le Nord', 'More flights in the north'),
        { economy: 10, trust: -3, treasury: -10 },
        T('Nò a ap boujonnen ak vwayajè ak machandiz. Moun Pòtoprens yo plenyen wout la long.', 'Le Nord s’anime de voyageurs et de marchandises. À Port-au-Prince, on se plaint du long trajet.', 'The north buzzes with travelers and goods. People in Port-au-Prince complain about the long trip.'), 'economy'),
      c('security', T('Anplwaye yon konpayi sekirite prive', 'Engager une société de sécurité privée', 'Hire a private security company'), T('Rapid e efikas', 'Rapide et efficace', 'Fast and effective'),
        { security: 10, economy: 6, treasury: -16 },
        T('Ajan prive yo pran pòs yo an twa jou. Pou kounye a, pèsonn pa poze kesyon sou kontra a.', 'Les agents privés sont en poste en trois jours. Pour l’instant, personne ne pose de questions sur le contrat.', 'Private guards are in place within three days. For now, nobody asks about the contract.'), undefined,
        { after: 2, title: T('Yon ankèt montre kontra sekirite a te twò chè e san kontwòl.', 'Une enquête révèle un contrat de sécurité surpayé et sans contrôle.', 'An investigation finds the security contract was overpriced and unchecked.'), effects: { trust: -12 } }),
      c('institutions', T('Tann èd entènasyonal', 'Attendre l’aide internationale', 'Wait for international help'), T('Pa depanse lajan peyi a', 'Ne pas dépenser l’argent du pays', 'Do not spend the country’s money'),
        { trust: -6, economy: -6 },
        T('Kès la pa touche, men peyi a rete izole pandan plizyè mwa.', 'Les caisses sont préservées, mais le pays reste isolé pendant des mois.', 'The treasury is spared, but the country stays cut off for months.')),
    ] },
  { id: 'deportations', icon: 'diaspora',
    prompt: T('Chak semèn, dè milye Ayisyen depòte soti Repiblik Dominikèn, anpil ladan yo san anyen. Kisa ou fè?', 'Chaque semaine, des milliers d’Haïtiens sont expulsés de la République dominicaine, beaucoup sans rien. Que faites-vous ?', 'Every week, thousands of Haitians are deported from the Dominican Republic, many with nothing. What do you do?'),
    choices: [
      c('diaspora', T('Sant akèy sou fwontyè a', 'Des centres d’accueil à la frontière', 'Reception centers at the border'), T('Manje, swen, papye, transpò', 'Repas, soins, papiers, transport', 'Food, care, papers, transport'),
        { social: 10, trust: 6, treasury: -10 },
        T('Moun yo resevwa yon plat cho, papye ak yon tikè pou al lakay. Fwontyè a vin pi imen.', 'Les rapatriés reçoivent un repas chaud, des papiers et un billet pour rentrer. La frontière devient plus humaine.', 'Returnees get a hot meal, papers and a ticket home. The border becomes more humane.'), 'health'),
      c('institutions', T('Kraze relasyon diplomatik', 'Rompre les relations diplomatiques', 'Break off diplomatic ties'), T('Montre ou fèm', 'Montrer votre fermeté', 'Show you are firm'),
        { trust: 12, economy: -14 },
        T('Pèp la aplodi. Men komès ak vwazen an kanpe e pri yo monte nan mache fwontyè yo.', 'La population applaudit. Mais le commerce avec le voisin s’arrête et les prix montent dans les marchés frontaliers.', 'People cheer. But trade with the neighbor stops and prices rise in the border markets.'), 'diaspora'),
      c('economy', T('Travay pou moun ki retounen yo', 'Du travail pour les rapatriés', 'Jobs for returnees'), T('Chantye nan pwovens yo', 'Des chantiers en province', 'Public works in the provinces'),
        { economy: 9, social: 4, treasury: -12 },
        T('Moun ki retounen yo travay sou wout ak kanal nan pwovens. Kèk ladan yo rete, lòt yo pati ankò.', 'Les rapatriés travaillent sur routes et canaux en province. Certains restent, d’autres repartent.', 'Returnees work on roads and canals in the provinces. Some stay, others leave again.'), 'youth'),
      c('institutions', T('Negosye yon akò migrasyon', 'Négocier un accord migratoire', 'Negotiate a migration agreement'), T('Papye pou travayè yo', 'Des papiers pour les travailleurs', 'Papers for workers'),
        { trust: 4, economy: 4, treasury: -4 },
        T('Negosyasyon yo lan. Pou kounye a, otobis depòtasyon yo toujou ap travèse fwontyè a.', 'Les négociations sont lentes. Pour l’instant, les bus d’expulsion franchissent toujours la frontière.', 'Talks are slow. For now, deportation buses keep crossing the border.'), 'diaspora',
        { after: 2, title: T('Akò a siyen: depòtasyon yo ralanti e travayè yo jwenn papye.', 'L’accord est signé : les expulsions ralentissent et les travailleurs obtiennent des papiers.', 'The deal is signed: deportations slow down and workers get papers.'), effects: { social: 8, trust: 6 } }),
    ] },
  { id: 'force', icon: 'security',
    prompt: T('Yon fòs entènasyonal kont gang yo ofri vin ede. Ki kondisyon ou mete?', 'Une force internationale contre les gangs propose son aide. Quelles conditions posez-vous ?', 'An international anti-gang force offers to help. What conditions do you set?'),
    choices: [
      c('institutions', T('Wi, anba kòmandman ayisyen', 'Oui, sous commandement haïtien', 'Yes, under Haitian command'), T('Polis la mennen, fòs la sipòte', 'La police dirige, la force appuie', 'The police lead, the force supports'),
        { security: 13, trust: 6, treasury: -8 },
        T('Operasyon yo pi dousman, men pèp la wè se polis pa l ki nan premye liy.', 'Les opérations sont plus lentes, mais la population voit sa police en première ligne.', 'Operations are slower, but people see their own police on the front line.'), 'security'),
      c('security', T('Wi, ak tout pouvwa', 'Oui, avec les pleins pouvoirs', 'Yes, with full powers'), T('Pi vit, pi fò', 'Plus vite, plus fort', 'Faster, stronger'),
        { security: 20, trust: -12 },
        T('Gang yo pèdi teren vit. Men pèp la pa konnen kiyès ki reponsab fòs la.', 'Les gangs perdent vite du terrain. Mais la population ne sait pas qui répond de la force.', 'Gangs lose ground fast. But people do not know who the force answers to.'), undefined,
        { after: 2, title: T('Yon operasyon fè viktim sivil: kòlè monte kont fòs la.', 'Une opération fait des victimes civiles : la colère monte contre la force.', 'An operation kills civilians: anger grows against the force.'), effects: { trust: -10, security: -4 } }),
      c('security', T('Non, bati pwòp lame nou', 'Non, bâtir notre propre armée', 'No, build our own army'), T('Rekrite ak fòme Ayisyen', 'Recruter et former des Haïtiens', 'Recruit and train Haitians'),
        { trust: 8, treasury: -16 },
        T('Rekritman an kòmanse, men fòme yon lame pran tan: pou kounye a gang yo toujou la.', 'Le recrutement commence, mais former une armée prend du temps : les gangs sont toujours là.', 'Recruiting starts, but training an army takes time: the gangs are still there.'), 'institutions',
        { after: 3, title: T('Premye batayon yo fin fòme e yo antre an aksyon.', 'Les premiers bataillons formés entrent en action.', 'The first trained battalions go into action.'), effects: { security: 16 } }),
      c('justice', T('Yon pwogram dezameman', 'Un programme de désarmement', 'A disarmament program'), T('Zam kont travay pou jèn yo', 'Des armes contre un emploi pour les jeunes', 'Guns for jobs for young members'),
        { security: 6, social: 3, trust: -4, treasury: -6 },
        T('Kèk jèn depoze zam yo. Viktim yo mande poukisa moun ki te fè krim jwenn èd.', 'Quelques jeunes rendent les armes. Les victimes demandent pourquoi des criminels sont aidés.', 'Some young members hand in weapons. Victims ask why people who committed crimes get help.'), 'youth',
        { after: 2, title: T('Plizyè santèn jèn depoze zam epi antre nan fòmasyon.', 'Des centaines de jeunes rendent les armes et entrent en formation.', 'Hundreds of young members hand in weapons and start training.'), effects: { security: 8, economy: 4 } }),
    ] },
  { id: 'remittances', icon: 'diaspora',
    prompt: T('Lajan dyaspora a voye fè yon gwo pati nan ekonomi peyi a. Kèk minis vle mete taks sou li. Kisa ou fè?', 'L’argent envoyé par la diaspora pèse lourd dans l’économie. Des ministres veulent le taxer. Que faites-vous ?', 'Money sent home by the diaspora is a big part of the economy. Some ministers want to tax it. What do you do?'),
    choices: [
      c('economy', T('Taks sou transfè yo', 'Taxer les transferts', 'Tax the transfers'), T('Yon ti pousantaj sou chak transfè', 'Un petit pourcentage sur chaque envoi', 'A small cut of every transfer'),
        { treasury: 24, trust: -6 },
        T('Kès la ranpli vit. Sou rezo sosyal yo, dyaspora a fache.', 'Les caisses se remplissent vite. Sur les réseaux sociaux, la diaspora gronde.', 'The treasury fills fast. On social media, the diaspora is angry.'), undefined,
        { after: 2, title: T('Dyaspora a voye mwens pa kanal ofisyèl yo: fanmi yo resevwa mwens.', 'La diaspora envoie moins par les canaux officiels : les familles reçoivent moins.', 'The diaspora sends less through official channels: families receive less.'), effects: { economy: -12, social: -6 } }),
      c('diaspora', T('Bese frè transfè yo', 'Faire baisser les frais de transfert', 'Cut transfer fees'), T('Plis lajan rive nan fanmi yo', 'Plus d’argent arrive aux familles', 'More money reaches families'),
        { economy: 10, social: 4, trust: 4, treasury: -4 },
        T('Chak fanmi resevwa yon ti kras plis chak mwa. Kès leta pa jwenn anyen ladan l.', 'Chaque famille reçoit un peu plus chaque mois. L’État n’y gagne rien.', 'Every family receives a little more each month. The state gains nothing.'), 'economy'),
      c('diaspora', T('Bon dyaspora pou envesti', 'Des obligations diaspora', 'Diaspora bonds'), T('Prete peyi a, touche enterè', 'Prêter au pays, toucher des intérêts', 'Lend to the country, earn interest'),
        { treasury: 18, trust: 4 },
        T('Dyaspora a achte bon yo ak fyète. Lajan an la pou pwojè yo.', 'La diaspora achète les obligations avec fierté. L’argent est là pour les projets.', 'The diaspora buys the bonds with pride. The money is there for projects.'), 'economy',
        { after: 3, title: T('Lè a rive pou peye enterè bon dyaspora yo.', 'Il faut payer les intérêts des obligations diaspora.', 'The diaspora bond interest is due.'), effects: { treasury: -10 } }),
      c('economy', T('Pa chanje anyen', 'Ne rien changer', 'Change nothing'), T('Lajan an kontinye antre jan l ye a', 'L’argent continue d’arriver comme avant', 'The money keeps coming as before'),
        { trust: 2 },
        T('Anyen pa chanje: fanmi yo kontinye viv ak lajan dyaspora a, e leta pa jwenn anyen.', 'Rien ne change : les familles vivent toujours de l’argent de la diaspora, et l’État n’en tire rien.', 'Nothing changes: families keep living on diaspora money, and the state gets nothing.')),
    ] },
  { id: 'schools', icon: 'education',
    prompt: T('Dè santèn lekòl fèmen akoz vyolans. Timoun yo pa al lekòl depi plizyè mwa. Kisa ou fè?', 'Des centaines d’écoles sont fermées à cause de la violence. Les enfants ne vont plus en classe depuis des mois. Que faites-vous ?', 'Hundreds of schools are closed because of violence. Children have missed class for months. What do you do?'),
    choices: [
      c('education', T('Lekòl pa radyo ak telefòn', 'L’école par la radio et le téléphone', 'School by radio and phone'), T('Bon mache, rive toupatou', 'Peu cher, partout', 'Cheap, reaches everywhere'),
        { social: 7, treasury: -4 },
        T('Leson yo pase sou radyo chak maten. Men timoun ki pa gen kouran oswa radyo rete dèyè.', 'Les cours passent à la radio chaque matin. Mais les enfants sans courant ni radio restent à la traîne.', 'Lessons air on the radio every morning. But children without power or a radio fall behind.')),
      c('education', T('Deplase lekòl yo nan zòn ki an sekirite', 'Déplacer les écoles en zone sûre', 'Move schools to safe areas'), T('Lekòl pwovizwa, pwofesè peye', 'Écoles provisoires, enseignants payés', 'Temporary schools, paid teachers'),
        { social: 13, trust: 4, treasury: -14 },
        T('Timoun yo retounen chita sou ban lekòl. Klas yo chaje, men lekòl la ap mache.', 'Les enfants retrouvent les bancs de l’école. Les classes sont pleines, mais l’école fonctionne.', 'Children are back at their desks. Classes are crowded, but school works.'), 'security'),
      c('health', T('Kantin lekòl gratis', 'Des cantines scolaires gratuites', 'Free school meals'), T('Yon plat cho pou chak timoun', 'Un repas chaud pour chaque enfant', 'A hot meal for every child'),
        { social: 15, trust: 6, treasury: -16 },
        T('Paran yo voye timoun yo lekòl pou manje a, e timoun yo aprann pi byen vant plen.', 'Les parents envoient leurs enfants à l’école pour le repas, et ils apprennent mieux le ventre plein.', 'Parents send their children to school for the meal, and they learn better on a full stomach.'), 'education'),
      c('security', T('Yon polisye devan chak lekòl', 'Un policier devant chaque école', 'A police officer at every school'), T('Lekòl yo rouvri touswit', 'Les écoles rouvrent tout de suite', 'Schools reopen right away'),
        { social: 8, security: -6, treasury: -10 },
        T('Lekòl yo rouvri, men polis la kite katye yo pou al veye lekòl yo.', 'Les écoles rouvrent, mais la police quitte les quartiers pour garder les écoles.', 'Schools reopen, but police leave the neighborhoods to guard them.'), 'education'),
    ] },
  { id: 'fuel', icon: 'utilities',
    prompt: T('Gang yo bloke tèminal gaz la. Pa gen gaz nan ponp yo, transpò kanpe. Kisa ou fè?', 'Les gangs bloquent le terminal pétrolier. Plus d’essence aux pompes, les transports s’arrêtent. Que faites-vous ?', 'Gangs block the fuel terminal. Pumps are dry and transport stops. What do you do?'),
    choices: [
      c('security', T('Reprann tèminal la pa lafòs', 'Reprendre le terminal par la force', 'Retake the terminal by force'), T('Yon operasyon pou libere gaz la', 'Une opération pour libérer le carburant', 'An operation to free the fuel'),
        { security: 10, economy: 10, treasury: -12 },
        T('Kamyon gaz yo soti ankò. Operasyon an te difisil, men peyi a rekòmanse woule.', 'Les camions-citernes ressortent. L’opération a été difficile, mais le pays redémarre.', 'Fuel trucks roll out again. The operation was hard, but the country gets moving.'), 'economy'),
      c('economy', T('Fè gaz antre pa pò Okap', 'Faire entrer l’essence par le port du Cap', 'Bring fuel in through Cap-Haïtien'), T('Yon lòt wout pou gaz la', 'Une autre route pour l’essence', 'Another route for fuel'),
        { economy: 8, treasury: -8 },
        T('Gaz la rive, men li pi chè akoz wout la long.', 'L’essence arrive, mais plus chère à cause du long trajet.', 'Fuel arrives, but it costs more because of the long route.'), 'infrastructure'),
      c('economy', T('Retire sibvansyon gaz la', 'Supprimer la subvention du carburant', 'End the fuel subsidy'), T('Leta ekonomize anpil lajan', 'L’État économise beaucoup', 'The state saves a lot'),
        { treasury: 22, economy: -4 },
        T('Kès la respire. Pou kounye a, pri nan ponp yo poko chanje.', 'Les caisses respirent. Pour l’instant, les prix à la pompe n’ont pas encore changé.', 'The treasury breathes. For now, pump prices have not changed yet.'), undefined,
        { after: 1, title: T('Pri gaz la double: grèv ak barikad nan tout peyi a.', 'Le prix de l’essence double : grèves et barricades dans tout le pays.', 'Fuel prices double: strikes and roadblocks across the country.'), effects: { trust: -16, economy: -8, security: -4 } }),
      c('utilities', T('Rasyone gaz pou lopital ak transpò piblik', 'Rationner pour hôpitaux et transports publics', 'Ration fuel for hospitals and public transport'), T('Sa ki pi ijan anvan', 'L’urgent d’abord', 'Urgent needs first'),
        { social: 8, economy: -6, trust: -3 },
        T('Lopital yo kontinye travay. Machann ak chofè prive yo fache.', 'Les hôpitaux continuent de fonctionner. Commerçants et chauffeurs privés sont furieux.', 'Hospitals keep working. Traders and private drivers are furious.'), 'health'),
    ] },
  { id: 'cholera', icon: 'health',
    prompt: T('Kolera parèt ankò nan kan deplase yo. Kisa ou fè?', 'Le choléra réapparaît dans les camps de déplacés. Que faites-vous ?', 'Cholera is back in the displacement camps. What do you do?'),
    choices: [
      c('health', T('Dlo pwòp ak vaksen', 'Eau potable et vaccins', 'Clean water and vaccines'), T('Ekip sante nan chak kan', 'Des équipes de santé dans chaque camp', 'Health teams in every camp'),
        { social: 14, trust: 4, treasury: -12 },
        T('Epidemi an ralanti nan kèk semèn. Ekip sante yo vin yon egzanp.', 'L’épidémie ralentit en quelques semaines. Les équipes de santé deviennent un exemple.', 'The outbreak slows within weeks. The health teams become an example.'), 'utilities'),
      c('institutions', T('Kite ONG yo jere l', 'Laisser les ONG gérer', 'Let NGOs handle it'), T('Pa koute leta anyen', 'Rien à payer pour l’État', 'Costs the state nothing'),
        { social: 8, trust: -6 },
        T('ONG yo fè travay la byen, men pèp la mande kote leta a ye.', 'Les ONG font bien le travail, mais la population demande où est l’État.', 'NGOs do the job well, but people ask where the state is.'), 'health'),
      c('institutions', T('Pa fè bri sou sa', 'Ne pas l’annoncer', 'Keep it quiet'), T('Evite panik', 'Éviter la panique', 'Avoid panic'),
        { trust: 2 },
        T('Pa gen panik. Pou kounye a, se sèlman kèk ka nan kan yo.', 'Pas de panique. Pour l’instant, seulement quelques cas dans les camps.', 'No panic. For now, only a few cases in the camps.'), undefined,
        { after: 1, title: T('Kolera a gaye nan twa depatman: lopital yo debòde.', 'Le choléra s’étend à trois départements : les hôpitaux débordent.', 'Cholera spreads to three departments: hospitals are overwhelmed.'), effects: { social: -16, trust: -10, economy: -4 } }),
      c('security', T('Mete kan yo an karantèn', 'Mettre les camps en quarantaine', 'Quarantine the camps'), T('Polis bloke antre ak soti', 'La police bloque les entrées et sorties', 'Police block the way in and out'),
        { social: 6, trust: -10, treasury: -4 },
        T('Maladi a rete nan kan yo, men fanmi yo santi yo nan prizon.', 'La maladie reste dans les camps, mais les familles se sentent emprisonnées.', 'The disease stays in the camps, but families feel imprisoned.'), 'health'),
    ] },
  { id: 'weapons', icon: 'justice',
    prompt: T('Zam gang yo antre pa pò ak fwontyè yo. Kisa ou fè?', 'Les armes des gangs entrent par les ports et la frontière. Que faites-vous ?', 'Gang weapons come in through the ports and the border. What do you do?'),
    choices: [
      c('security', T('Eskanè ak enspektè entènasyonal', 'Scanners et inspecteurs internationaux', 'Scanners and international inspectors'), T('Chak konteynè tcheke', 'Chaque conteneur contrôlé', 'Every container checked'),
        { security: 12, trust: 4, treasury: -14 },
        T('Plizyè chajman zam bloke nan pò yo. Gang yo kòmanse manke minisyon.', 'Plusieurs cargaisons d’armes sont saisies. Les gangs commencent à manquer de munitions.', 'Several weapons shipments are seized. Gangs start running low on ammunition.'), 'justice'),
      c('justice', T('Arete fonksyonè ki konplis yo', 'Arrêter les fonctionnaires complices', 'Arrest complicit officials'), T('Netwaye dwann ak pò yo', 'Assainir douanes et ports', 'Clean up customs and ports'),
        { trust: 12, security: 6, economy: -4 },
        T('Gwo non tonbe e pèp la swiv pwosè yo. Kèk biznis fè grèv pou pwoteste.', 'De gros noms tombent et la population suit les procès. Quelques entreprises font grève pour protester.', 'Big names fall and people follow the trials. Some businesses strike in protest.')),
      c('economy', T('Fèmen pò prive yo', 'Fermer les ports privés', 'Close the private ports'), T('Sèlman pò leta yo louvri', 'Seuls les ports publics restent ouverts', 'Only public ports stay open'),
        { security: 8, economy: -12, treasury: 6 },
        T('Kontrebann nan bese, men machandiz yo pran plis tan pou rive e pri yo monte.', 'La contrebande baisse, mais les marchandises mettent plus de temps à arriver et les prix montent.', 'Smuggling drops, but goods take longer to arrive and prices rise.'), 'security'),
      c('institutions', T('Mande peyi ki fè zam yo aji', 'Demander aux pays producteurs d’agir', 'Ask the countries making the guns to act'), T('Diplomasi, san depans', 'Diplomatie, sans dépense', 'Diplomacy, no spending'),
        { trust: 3 },
        T('Diskou ou fè bri nan Nasyonzini. Sou teren an, anyen poko chanje.', 'Votre discours fait du bruit à l’ONU. Sur le terrain, rien n’a encore changé.', 'Your speech makes noise at the UN. On the ground, nothing has changed yet.'), undefined,
        { after: 3, title: T('Kèk peyi sere kontwòl ekspòtasyon zam yo.', 'Quelques pays durcissent le contrôle des exportations d’armes.', 'Some countries tighten controls on gun exports.'), effects: { security: 6 } }),
    ] },
  { id: 'recruitment', icon: 'youth',
    prompt: T('Gang yo ap rekrite timoun ak jèn nan katye yo. Kisa ou fè?', 'Les gangs recrutent des enfants et des jeunes dans les quartiers. Que faites-vous ?', 'Gangs are recruiting children and teenagers in the neighborhoods. What do you do?'),
    choices: [
      c('youth', T('Premye djòb pou jèn yo', 'Un premier emploi pour les jeunes', 'A first job for young people'), T('Leta peye mwatye salè a', 'L’État paie la moitié du salaire', 'The state pays half the wage'),
        { economy: 8, security: 6, treasury: -14 },
        T('Plizyè milye jèn jwenn premye djòb yo. Gang yo jwenn mwens moun pou rekrite.', 'Des milliers de jeunes décrochent un premier emploi. Les gangs recrutent moins.', 'Thousands of young people land a first job. Gangs find fewer recruits.'), 'economy'),
      c('justice', T('Pinisyon sevè, menm pou minè', 'Des peines sévères, même pour les mineurs', 'Harsh sentences, even for minors'), T('Montre fòs leta a', 'Montrer la force de l’État', 'Show the state’s strength'),
        { security: 6, trust: 4 },
        T('Pèp la renmen fèmte a. Prizon yo kòmanse ranpli vit.', 'La population apprécie la fermeté. Les prisons se remplissent vite.', 'People like the firmness. Prisons start filling fast.'), undefined,
        { after: 2, title: T('Prizon yo debòde ak jèn: gang yo rekrite anndan prizon an.', 'Les prisons débordent de jeunes : les gangs y recrutent.', 'Prisons overflow with young people: gangs recruit inside.'), effects: { security: -10, social: -4 } }),
      c('youth', T('Sant espò ak mizik nan chak katye', 'Des centres sport et musique dans chaque quartier', 'Sports and music centers in every neighborhood'), T('Yon lòt kote pou jèn yo ale', 'Un autre endroit où aller', 'Another place to go'),
        { social: 8, trust: 5, treasury: -8 },
        T('Jèn yo jwe foutbòl ak fè mizik olye yo rete nan lari. Sant yo bezwen sekirite tou.', 'Les jeunes jouent au foot et font de la musique au lieu de traîner dehors. Les centres ont aussi besoin de sécurité.', 'Young people play football and make music instead of hanging out. The centers need security too.')),
      c('justice', T('Amnisti pou jèn ki kite gang', 'Amnistie pour les jeunes qui quittent les gangs', 'Amnesty for youths who leave gangs'), T('Yon dezyèm chans', 'Une seconde chance', 'A second chance'),
        { security: 8, trust: -8 },
        T('Plizyè santèn jèn kite gang yo. Viktim yo mande jistis.', 'Des centaines de jeunes quittent les gangs. Les victimes réclament justice.', 'Hundreds of young people leave the gangs. Victims demand justice.'), 'youth',
        { after: 2, title: T('Kèk ansyen manm retounen nan gang yo: viktim yo fache.', 'Quelques anciens membres retournent dans les gangs : les victimes s’indignent.', 'Some former members go back to the gangs: victims are outraged.'), effects: { security: -6, trust: -6 } }),
    ] },
  { id: 'legacy', icon: 'institutions',
    prompt: T('Dènye ane manda w. Eleksyon yo ap vini. Kisa ou fè?', 'Dernière année du mandat. Les élections approchent. Que faites-vous ?', 'The last year of your term. Elections are coming. What do you do?'),
    choices: [
      c('institutions', T('Eleksyon lib ak yon CEP endepandan', 'Des élections libres avec un CEP indépendant', 'Free elections with an independent CEP'), T('Ou remèt pouvwa a nan lapè', 'Vous transmettez le pouvoir en paix', 'You hand over power peacefully'),
        { trust: 21, security: 5, treasury: -10 },
        T('Eleksyon yo fèt nan lapè e tout moun aksepte rezilta yo. Ou kite yon egzanp.', 'Les élections se tiennent dans le calme et chacun accepte les résultats. Vous laissez un exemple.', 'Elections are held peacefully and everyone accepts the results. You leave an example.')),
      c('institutions', T('Chanje Konstitisyon an pou rete', 'Changer la Constitution pour rester', 'Change the Constitution to stay'), T('Yon dezyèm manda san eleksyon', 'Un second mandat sans élection', 'A second term without an election'),
        { trust: -25, security: -12, economy: -6 },
        T('Manifestasyon toupatou e peyi a bloke. Ou pèdi tout sa ou te bati.', 'Manifestations partout, le pays est bloqué. Vous perdez tout ce que vous aviez construit.', 'Protests everywhere and the country shuts down. You lose everything you built.')),
      c('infrastructure', T('Gwo pwojè vizib anvan vòt la', 'De grands projets visibles avant le vote', 'Big visible projects before the vote'), T('Ribon, foto, inogirasyon', 'Rubans, photos, inaugurations', 'Ribbons, photos, openings'),
        { economy: 8, trust: 5, treasury: -16 },
        T('Ribon yo koupe, foto yo bèl. Men kès la vid pou moun ki vin apre w.', 'Les rubans sont coupés, les photos sont belles. Mais les caisses sont vides pour votre successeur.', 'Ribbons are cut, the photos look good. But the treasury is empty for whoever comes next.'), 'economy'),
      c('education', T('Envesti nan lekòl ak lopital', 'Investir dans les écoles et les hôpitaux', 'Invest in schools and hospitals'), T('Yon eritaj ki dire', 'Un héritage durable', 'A lasting legacy'),
        { social: 18, trust: 5, treasury: -12 },
        T('Nouvo lekòl ak dispansè louvri. Se yon eritaj ki ap dire.', 'De nouvelles écoles et des dispensaires ouvrent. Un héritage qui dure.', 'New schools and clinics open. A legacy that lasts.'), 'health'),
    ] },
];

/** One profile per priority; French titles name the presidency so they fit every player. */
export const PROFILES: Record<PriorityId, Profile> = {
  security: { title: T('Prezidan lapè', 'Une présidence de paix', 'The peacekeeper'), line: T('Pou ou, anyen pa ka mache si moun pa an sekirite.', 'Pour vous, rien ne marche tant que les gens ne sont pas en sécurité.', 'For you, nothing works until people are safe.') },
  education: { title: T('Prezidan konesans', 'Une présidence du savoir', 'The educator'), line: T('Pou ou, tout bagay kòmanse lekòl la.', 'Pour vous, tout commence à l’école.', 'For you, everything starts at school.') },
  infrastructure: { title: T('Prezidan batisè', 'Une présidence bâtisseuse', 'The builder'), line: T('Ou wè yon peyi ki konekte: wout, pon ak pò.', 'Vous voyez un pays relié : routes, ponts et ports.', 'You see a connected country: roads, bridges and ports.') },
  economy: { title: T('Prezidan travay', 'Une présidence du travail', 'The job creator'), line: T('Pou ou, yon djòb se diyite.', 'Pour vous, un emploi, c’est la dignité.', 'For you, a job means dignity.') },
  health: { title: T('Prezidan swen', 'Une présidence du soin', 'The caregiver'), line: T('Pou ou, lasante moun yo vini anvan tout bagay.', 'Pour vous, la santé passe avant tout.', 'For you, people’s health comes first.') },
  agriculture: { title: T('Prezidan tè a', 'Une présidence de la terre', 'The farmer’s president'), line: T('Ou kwè Ayiti ka manje sa li plante.', 'Vous croyez qu’Haïti peut se nourrir de ce qu’elle cultive.', 'You believe Haiti can eat what it grows.') },
  justice: { title: T('Prezidan jistis', 'Une présidence de justice', 'The guardian of justice'), line: T('Pou ou, pèsonn pa anwo lalwa.', 'Pour vous, personne n’est au-dessus de la loi.', 'For you, no one is above the law.') },
  utilities: { title: T('Prezidan limyè', 'Une présidence de la lumière', 'The power bringer'), line: T('Kouran ak dlo nan chak kay: se baz la.', 'L’électricité et l’eau dans chaque maison : c’est la base.', 'Power and water in every home: that is the foundation.') },
  diaspora: { title: T('Prezidan pon', 'Une présidence passerelle', 'The bridge builder'), line: T('Ou wè dyaspora a kòm yon fòs pou rebati peyi a.', 'Vous voyez la diaspora comme une force pour reconstruire.', 'You see the diaspora as a force to rebuild.') },
  environment: { title: T('Prezidan lanati', 'Une présidence verte', 'The guardian of nature'), line: T('Pyebwa, rivyè ak pwoteksyon kont dezas: se avni an.', 'Arbres, rivières et protection contre les catastrophes : c’est l’avenir.', 'Trees, rivers and disaster protection: that is the future.') },
  institutions: { title: T('Prezidan leta', 'Une présidence des institutions', 'The state builder'), line: T('Pou ou, enstitisyon solid ak eleksyon onèt se fondasyon an.', 'Pour vous, des institutions solides et des élections honnêtes sont la fondation.', 'For you, strong institutions and honest elections are the foundation.') },
  youth: { title: T('Prezidan jenès', 'Une présidence de la jeunesse', 'The youth champion'), line: T('Ou mize sou jèn yo pou fè peyi a avanse.', 'Vous misez sur les jeunes pour faire avancer le pays.', 'You bet on young people to move the country forward.') },
};

export type Gauges = Record<GaugeId, number>;

/** The country reacts: each event fires at most once per term, at the start of a year, when its condition is met. */
export interface CrisisEvent { id: string; when: (g: Gauges) => boolean; title: L10n; effects: Effects }
export const EVENTS: readonly CrisisEvent[] = [
  { id: 'roads', when: (g) => g.security <= 15, effects: { economy: -8, trust: -4 },
    title: T('Gang yo bloke wout nasyonal yo: machandiz pa ka pase.', 'Les gangs bloquent les routes nationales : les marchandises ne passent plus.', 'Gangs block the national roads: goods cannot get through.') },
  { id: 'unpaid', when: (g) => g.treasury <= 5, effects: { trust: -8, social: -6 },
    title: T('Kès leta vid: fonksyonè yo pa touche.', 'Caisses vides : les fonctionnaires ne sont pas payés.', 'Empty treasury: civil servants go unpaid.') },
  { id: 'protests', when: (g) => g.trust <= 15, effects: { economy: -6, security: -6 },
    title: T('Manifestasyon nan tout gwo vil yo: peyi a bloke.', 'Manifestations dans toutes les grandes villes : le pays est bloqué.', 'Protests in every big city: the country shuts down.') },
  { id: 'rally', when: (g) => g.trust >= 70, effects: { social: 6, economy: 4 },
    title: T('Pèp la mobilize: volontè ede rebati lekòl ak wout.', 'La population se mobilise : des volontaires aident à rebâtir écoles et routes.', 'People rally: volunteers help rebuild schools and roads.') },
  { id: 'investors', when: (g) => g.security >= 55, effects: { economy: 8 },
    title: T('Sekirite a ap tounen: envestisè yo kòmanse retounen.', 'La sécurité revient : les investisseurs reviennent.', 'Security is coming back: investors start to return.') },
];

const clamp = (n: number) => Math.max(0, Math.min(100, n));
export function applyEffects(g: Gauges, e: Effects): Gauges {
  const next = { ...g };
  for (const [k, v] of Object.entries(e) as [GaugeId, number][]) next[k] = clamp(next[k] + v);
  return next;
}
/** The country index: the average of the five meters, 0 to 100. */
export function scoreOf(g: Gauges): number {
  return Math.round((g.security + g.economy + g.social + g.trust + g.treasury) / 5);
}
/** An answer the treasury cannot pay for cannot be chosen. */
export function affordable(g: Gauges, ch: GameChoice): boolean {
  return g.treasury + (ch.effects.treasury ?? 0) >= 0;
}

/** A term: the first and last decisions are fixed, the others are drawn from the pool, so every term differs. */
export const FIRST = 'day1';
export const LAST = 'legacy';
export const PER_TERM = 8;
export function drawDeck(random: () => number = Math.random): string[] {
  const middle = DECISIONS.filter((d) => d.id !== FIRST && d.id !== LAST).map((d) => d.id);
  for (let i = middle.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [middle[i], middle[j]] = [middle[j] as string, middle[i] as string];
  }
  return [FIRST, ...middle.slice(0, PER_TERM - 2), LAST];
}
/** The decisions for a list of ids, or null when an id is unknown (a game saved by an older version). */
export function deckOf(ids: readonly string[]): GameDecision[] | null {
  const deck = ids.map((id) => DECISIONS.find((d) => d.id === id));
  return deck.length === PER_TERM && deck.every((d) => d !== undefined) ? (deck as GameDecision[]) : null;
}

export interface News { title: L10n; effects: Effects; crisis: boolean }
export interface Turn { news: News[]; income: number; before: Gauges }
export interface Run { g: Gauges; pending: { at: number; title: L10n; effects: Effects }[]; fired: string[] }

export function startRun(): Run { return { g: { ...START }, pending: [], fired: [] }; }
/** Opens decision i: the year's taxes, the delayed consequences that land now, then any crisis the meters trigger. */
export function beginTurn(run: Run, i: number): Turn {
  const income = i > 0 ? INCOME : 0;
  if (income) run.g = applyEffects(run.g, { treasury: income });
  const news: News[] = [];
  for (const p of run.pending.filter((x) => x.at === i)) { run.g = applyEffects(run.g, p.effects); news.push({ title: p.title, effects: p.effects, crisis: false }); }
  for (const ev of EVENTS) {
    if (run.fired.includes(ev.id) || !ev.when(run.g)) continue;
    run.fired.push(ev.id);
    run.g = applyEffects(run.g, ev.effects);
    news.push({ title: ev.title, effects: ev.effects, crisis: true });
  }
  return { news, income, before: { ...run.g } };
}
export function applyDecision(run: Run, deck: readonly GameDecision[], i: number, a: number | null | undefined): void {
  const ch = a === null || a === undefined ? undefined : deck[i]?.choices[a];
  run.g = applyEffects(run.g, ch ? ch.effects : SKIP_EFFECTS);
  if (ch?.later) run.pending.push({ at: i + ch.later.after, title: ch.later.title, effects: ch.later.effects });
}
/** Consequences still pending when the term ends land after it, and count in the final score. */
export function endRun(run: Run, n: number): News[] {
  const after: News[] = [];
  for (const p of run.pending.filter((x) => x.at >= n)) { run.g = applyEffects(run.g, p.effects); after.push({ title: p.title, effects: p.effects, crisis: false }); }
  return after;
}

/** Replays a term from the start; once every decision is made, `after` lists what landed after the term. */
export function replay(deck: readonly GameDecision[], answers: readonly (number | null)[]): { turns: Turn[]; final: Gauges; after: News[] } {
  const run = startRun();
  const turns: Turn[] = [];
  for (let i = 0; i < deck.length; i++) {
    turns.push(beginTurn(run, i));
    if (i >= answers.length) return { turns, final: run.g, after: [] };
    applyDecision(run, deck, i, answers[i]);
  }
  const after = endRun(run, deck.length);
  return { turns, final: run.g, after };
}

/**
 * The three heaviest priorities for a set of answers (an index per decision, null = skipped).
 * Ties go to the priority the player reached first, so the order follows their own choices.
 */
export function topPriorities(deck: readonly GameDecision[], answers: readonly (number | null)[], n = 3): PriorityId[] {
  const score = new Map<PriorityId, number>();
  const first = new Map<PriorityId, number>();
  let step = 0;
  answers.forEach((a, i) => {
    const choice = a === null ? undefined : deck[i]?.choices[a];
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
