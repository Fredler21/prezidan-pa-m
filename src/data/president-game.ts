import type { L10n, PriorityId } from '../types';

/*
 * « Si m te prezidan »: a five year term in eight decisions. The country has five meters
 * (security, economy, schools and health, public trust, treasury). Every answer moves them,
 * costs money or brings some in, and some answers come back later: printing money turns into
 * inflation, a deal with gangs falls apart, a buried scandal leaks, trees planted early hold the
 * soil when the rain comes. An answer the treasury cannot pay for cannot be chosen. Decisions are
 * final; skipping one costs public trust.
 *
 * Every answer also adds weight to one or two of the site's twelve priorities (2 for the main one,
 * 1 for the second). The three heaviest make the player's profile, and candidates are compared on
 * those three exactly like on the match page: by public record only, never a recommendation. No
 * answer points to a candidate or a party. The scenarios are a game, not a forecast.
 */

export type GaugeId = 'security' | 'economy' | 'social' | 'trust' | 'treasury';
export type Effects = Partial<Record<GaugeId, number>>;
export interface Later { at: number; title: L10n; effects: Effects }
export interface GameChoice {
  /** Main priority: also gives the answer its icon. */
  main: PriorityId;
  title: L10n;
  sub: L10n;
  outcome: L10n;
  effects: Effects;
  /** A consequence that lands when decision `at` (0 based) opens. */
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
        { at: 4, title: T('Gang yo mande plis: akò a kraze.', 'Les gangs en veulent plus : l’accord se brise.', 'The gangs want more: the deal collapses.'), effects: { security: -16, trust: -6 } }),
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
        { at: 5, title: T('Premye gwo peman dèt la rive.', 'La première grosse échéance de la dette arrive.', 'The first big debt payment is due.'), effects: { treasury: -25, economy: -4 } }),
      c('justice', T('Konbat fwod nan dwann', 'Combattre la fraude douanière', 'Fight customs fraud'), T('Kontwole pò ak fwontyè yo', 'Contrôler ports et frontières', 'Control ports and borders'),
        { treasury: 18, trust: 10, security: -4 },
        T('Dwann yo rapòte plis lajan chak mwa. Kontrebandye yo fache e gen tansyon sou fwontyè a.', 'Les douanes rapportent plus chaque mois. Les contrebandiers sont furieux et la frontière se tend.', 'Customs bring in more every month. Smugglers are angry and the border gets tense.'), 'economy'),
      c('economy', T('Ogmante taks yo', 'Augmenter les impôts', 'Raise taxes'), T('Plis taks sou biznis ak konsomasyon', 'Plus de taxes sur les entreprises et la consommation', 'More tax on business and spending'),
        { treasury: 22, trust: -10, economy: -8 },
        T('Kès la ranpli, men biznis yo ralanti e pèp la plenyen pri yo.', 'Les caisses se remplissent, mais les entreprises ralentissent et la population se plaint des prix.', 'The treasury fills up, but businesses slow down and people complain about prices.')),
      c('economy', T('Enprime lajan', 'Faire tourner la planche à billets', 'Print money'), T('Bank santral la kreye goud', 'La banque centrale crée des gourdes', 'The central bank creates gourdes'),
        { treasury: 28 },
        T('Lajan an la touswit, san taks ni dèt. Pou kounye a, pèsonn pa wè pwoblèm.', 'L’argent est là tout de suite, sans impôt ni dette. Pour l’instant, personne ne voit de problème.', 'The money is there right away, with no tax and no debt. For now, nobody sees a problem.'), undefined,
        { at: 3, title: T('Enflasyon: pri manje ak gaz ap monte chak jou.', 'Inflation : nourriture et carburant flambent.', 'Inflation: food and fuel prices soar.'), effects: { economy: -16, social: -8, trust: -8 } }),
    ] },
  { id: 'youth', icon: 'youth',
    prompt: T('Jèn yo ap kite peyi a an mas. Kisa ou fè?', 'Les jeunes quittent le pays en masse. Que faites-vous ?', 'Young people are leaving the country in large numbers. What do you do?'),
    choices: [
      c('education', T('Bous ak fòmasyon', 'Bourses et formation', 'Scholarships and training'), T('Plis jèn nan inivèsite ak nan metye', 'Plus de jeunes à l’université et en formation', 'More young people in university and trades'),
        { social: 16, economy: 3, treasury: -12 },
        T('Plis jèn antre nan inivèsite ak nan lekòl metye. Rezilta a ap vin pi gwo ak tan.', 'Plus de jeunes entrent à l’université et en formation. L’effet grandira avec le temps.', 'More young people enter university and trade school. The effect will grow over time.'), 'youth',
        { at: 6, title: T('Premye pwomosyon bousye yo fin etidye e yo rete travay nan peyi a.', 'La première promotion de boursiers est diplômée et reste travailler au pays.', 'The first class of scholarship students graduates and stays to work at home.'), effects: { economy: 10, social: 5 } }),
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
        { at: 6, title: T('Gwo lapli: pyebwa yo kenbe tè a, gen mwens inondasyon.', 'Fortes pluies : les arbres retiennent la terre, moins d’inondations.', 'Heavy rain: the trees hold the soil, there is less flooding.'), effects: { social: 13, economy: 8 } }),
      c('infrastructure', T('Bati abri ak kanal', 'Construire abris et canaux', 'Build shelters and drains'), T('Travay piblik nan zòn ki an danje', 'Des travaux dans les zones à risque', 'Public works in high risk areas'),
        { social: 13, trust: 5, security: 3, treasury: -16 },
        T('Abri ak kanal yo pare. Lè siklòn nan pase, pi piti fanmi pèdi kay yo.', 'Abris et canaux sont prêts. Quand le cyclone passe, moins de familles perdent leur maison.', 'Shelters and drains are ready. When the storm hits, fewer families lose their homes.'), 'environment'),
      c('economy', T('Kenbe lajan an', 'Garder l’argent', 'Keep the money'), T('Petèt siklòn nan p ap frape', 'Le cyclone ne frappera peut-être pas', 'Maybe the storm will miss'),
        { treasury: 4 },
        T('Ou ekonomize lajan an. Meteyo a ap swiv yon tanpèt nan Atlantik la.', 'Vous économisez l’argent. La météo surveille une tempête dans l’Atlantique.', 'You save the money. Forecasters are watching a storm in the Atlantic.'), undefined,
        { at: 4, title: T('Yon siklòn frape sid peyi a: gwo domaj.', 'Un cyclone frappe le Sud : de gros dégâts.', 'A hurricane hits the south: heavy damage.'), effects: { social: -16, economy: -10, trust: -10, treasury: -10 } }),
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
        { at: 7, title: T('Rekòt lokal yo double: pri manje kòmanse bese.', 'Les récoltes locales doublent : les prix commencent à baisser.', 'Local harvests double: food prices start to fall.'), effects: { economy: 10, trust: 8, social: 5 } }),
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
        { at: 7, title: T('Jounalis yo pibliye dosye a: eskandal nasyonal.', 'Des journalistes publient le dossier : scandale national.', 'Journalists publish the file: national scandal.'), effects: { trust: -24, economy: -4 } }),
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

const clamp = (n: number) => Math.max(0, Math.min(100, n));
export function applyEffects(g: Record<GaugeId, number>, e: Effects): Record<GaugeId, number> {
  const next = { ...g };
  for (const [k, v] of Object.entries(e) as [GaugeId, number][]) next[k] = clamp(next[k] + v);
  return next;
}
/** The country index: the average of the five meters, 0 to 100. */
export function scoreOf(g: Record<GaugeId, number>): number {
  return Math.round((g.security + g.economy + g.social + g.trust + g.treasury) / 5);
}
/** An answer the treasury cannot pay for cannot be chosen. */
export function affordable(g: Record<GaugeId, number>, ch: GameChoice): boolean {
  return g.treasury + (ch.effects.treasury ?? 0) >= 0;
}

export interface Turn { news: Later[]; income: number; before: Record<GaugeId, number> }
/**
 * Replays a set of answers from the start: the meters before each decision (after any delayed
 * consequence that lands there), the news shown at each step, and the final state.
 */
export function replay(answers: readonly (number | null)[]): { turns: Turn[]; final: Record<GaugeId, number> } {
  let g: Record<GaugeId, number> = { ...START };
  const pending: Later[] = [];
  const turns: Turn[] = [];
  for (let i = 0; i < DECISIONS.length; i++) {
    const income = i > 0 ? INCOME : 0;
    if (income) g = applyEffects(g, { treasury: income });
    const news = pending.filter((p) => p.at === i);
    for (const n of news) g = applyEffects(g, n.effects);
    turns.push({ news, income, before: { ...g } });
    if (i >= answers.length) break;
    const a = answers[i];
    const ch = a === null || a === undefined ? undefined : DECISIONS[i]?.choices[a];
    g = applyEffects(g, ch ? ch.effects : SKIP_EFFECTS);
    if (ch?.later) pending.push(ch.later);
  }
  return { turns, final: g };
}

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
