import type { Lang } from '../types';

/*
 * About us, Privacy policy and Terms of use, in the three languages.
 * {email} and {date} are filled at render time from src/data/site.ts.
 * Copy rules: sentence case, typographic apostrophes, « » in French, no em or en dashes.
 */
export interface LegalSection { h: string; p?: string[]; li?: string[] }
export interface LegalDoc { title: string; intro: string; sections: LegalSection[] }
export interface LegalSet { aboutUs: LegalDoc; privacy: LegalDoc; terms: LegalDoc }

const ht: LegalSet = {
  aboutUs: {
    title: 'Sou Prezidan Pa M',
    intro: 'Prezidan Pa M se yon inisyativ sivik endepandan pou eleksyon prezidansyèl Ayiti 2027 la. Nou ede sitwayen yo kòmanse ak sa yo vle chanje nan peyi a, konpare dosye piblik kandida yo, epi bay vwa yo. Sit la gratis, li pa gen piblisite, epi li disponib an kreyòl, an franse ak an angle.',
    sections: [
      { h: 'Misyon nou', p: [
        'Fè chak moun kapab chwazi yon prezidan ak enfòmasyon klè, san presyon, san piblisite. Nou kwè yon vòt ki byen enfòme kòmanse ak kesyon sa a: kisa ou vle chanje?',
        'Twòp fwa, deba a kòmanse ak non kandida yo olye de pwoblèm yo. Nou vire lojik sa a: ou chwazi priyorite w yo anvan, epi apre sa ou gade ki kandida ki gen yon dosye piblik sou yo. Konsa, chwa a rete chwa pa w.',
        'Nou vle tou pou moun ki an Ayiti ak moun nan dyaspora a ka pale sou menm baz la, ak menm enfòmasyon an, nan lang yo pi alèz la.',
      ] },
      { h: 'Sa nou ye', li: [
        'Yon ekip sitwayen endepandan, an Ayiti ak nan dyaspora a.',
        'Nou pa afilye ak okenn kandida, pati, regwoupman, ni ak CEP oswa gouvènman an.',
        'Nou pa resevwa lajan ni piblisite nan men kandida oswa pati.',
        'Pa gen okenn kandida nan ekip la, ni okenn moun k ap travay pou yon kanpay.',
        'Kòd sous sit la louvri sou GitHub: nenpòt moun ka verifye kijan li fonksyone.',
      ] },
      { h: 'Sa nou montre', li: [
        'Sèlman dosye piblik chak kandida: pòs li okipe, aksyon ki dokimante, pwogram li pibliye.',
        'Lè yon kandida poko pibliye pwogram, nou di sa, nou pa devine.',
        'Menm fòma, menm gwosè kat pou tout kandida; lòd la chanje chak fwa ou louvri sit la.',
        'Pou ansyen chèf Leta yo, nou ajoute sa yo te fè pandan manda yo, ak dat yo.',
        'Nou pa pibliye rimè, ni akizasyon ki pa gen sous piblik ki ka verifye.',
      ] },
      { h: 'Vòt la', li: [
        'Se yon vòt pèp la, se pa yon sondaj syantifik ni yon prediksyon rezilta eleksyon an.',
        'Yon vòt pa moun; ou ka chanje l nenpòt lè.',
        'Rezilta yo piblik; rezon ou ekri yo parèt anonim.',
        'Rezilta yo mete ajou chak minit; nou prezante yo kòm yon foto moman an, pa kòm yon prediksyon.',
        'Lè ou chwazi priyorite w yo, nou montre w ki kandida ki gen dosye sou yo, men nou pa di w pou ki moun pou vote.',
      ] },
      { h: 'Kijan nou finanse', p: [
        'Prezidan Pa M se yon pwojè benevòl. Li pa resevwa lajan nan men okenn kandida, pati, òganizasyon politik, ni gouvènman. Frè ebèjman yo piti epi se ekip la ki peye yo. Si sa ta chanje yon jou, n ap ekri l sou paj sa a anvan.',
      ] },
      { h: 'Korije yon erè', p: [
        'Si ou wè yon enfòmasyon ki pa egzak sou yon kandida, ekri nou: {email}. Nou verifye epi nou korije vit.',
        'Di nou ki kandida, ki fraz, ak ki sous ki montre erè a. Nou reponn nan kèk jou, epi dat dènye mizajou a parèt sou paj « Kijan sa mache ».',
      ] },
      { h: 'Kontak', p: ['Pou nenpòt kesyon, pwopozisyon oswa demann laprès: {email}. Nou reponn an kreyòl, an franse oswa an angle.'] },
    ],
  },
  privacy: {
    title: 'Politik konfidansyalite',
    intro: 'Politik sa a eksplike ki done Prezidan Pa M kolekte, poukisa, ak ki dwa ou genyen. Nou ekri l yon fason senp, paske nou vle ou konprann egzakteman sa k ap pase ak done ou yo. Dènye mizajou: {date}.',
    sections: [
      { h: 'Done nou kolekte', p: ['Nou kolekte sèlman sa ki nesesè pou vòt la mache, pa plis. Men lis la, dapre fason ou itilize sit la.'], li: [
        'San kont: yon idantifyan anonim (Firebase Anonymous Authentication) ki rete sou aparèy ou pou garanti yon vòt pa moun; vòt ou (kandida, rezon opsyonèl jiska 240 karaktè, depatman opsyonèl, priyorite ou chwazi yo, lang); repons ou nan sondaj yo.',
        'Ak yon kont: adrès imèl ou; ak Google, non ak foto pwofil Google ou bay la; priyorite ou sove yo.',
        'Sou aparèy ou sèlman: lang ou, priyorite ou, yon kopi done kandida yo ak dènye rezilta yo (localStorage ak IndexedDB).',
        'Done teknik: adrès IP, navigatè ak dat koneksyon nan jounal sèvè founisè ebèjman yo, pou sekirite.',
      ] },
      { h: 'Poukisa nou itilize yo', li: [
        'Pou fè vòt la mache, ak yon vòt pa moun.',
        'Pou montre rezilta piblik ak anonim.',
        'Pou sove pwogrè w si ou gen yon kont.',
        'Pou pwoteje sèvis la kont abi.',
        'Pou konnen, an total sèlman, konbyen moun ki itilize sit la.',
      ], p: ['Nou pa itilize done ou yo pou okenn lòt bagay. Pa gen pwofil piblisite, pa gen vant, pa gen pataj ak kanpay.'] },
      { h: 'Sa ki piblik', p: [
        'Rezilta yo parèt sèlman an total. Rezon ou ekri yo parèt anonim, ak depatman ou (si ou bay li) ak lè a. Non ou, imèl ou ak idantifyan ou pa janm parèt.',
        'Si ou ekri yon rezon, sonje ke nenpòt moun ka li l. Pa mete non w, nimewo telefòn ou, ni enfòmasyon sou lòt moun ladan l.',
      ] },
      { h: 'Kote done yo rete', p: [
        'Done yo sou Google Firebase (Firestore, Authentication, Hosting) ak Vercel (ebèjman). Yo ka trete Ozetazini. Nou pa vann done, nou pa fè piblisite, nou pa pataje done ak kandida oswa pati.',
        'Founisè sa yo gen pwòp règ sekirite yo ak sètifikasyon yo. Kominikasyon ant aparèy ou ak sèvè yo toujou chifre (HTTPS).',
      ] },
      { h: 'Konbyen tan', li: [
        'Vòt ak repons sondaj: jiska fen sik elektoral 2027 la, oswa jiskaske ou efase yo.',
        'Kont: jiskaske ou efase l.',
        'Jounal teknik: dapre règ founisè yo (jeneralman kèk semèn).',
        'Kopi done yo sou aparèy ou: jiskaske ou efase done navigatè w la.',
      ] },
      { h: 'Dwa ou', li: [
        'Wè ak chanje vòt ou nenpòt lè sou sit la.',
        'Efase vòt ou, repons ou oswa kont ou: ekri nou.',
        'Mande yon kopi done ou yo oswa yon koreksyon.',
        'Retire konsantman w: sispann itilize sit la epi mande nou efase done ou yo.',
      ], p: ['Pou egzèse yon dwa, ekri nou ak menm adrès imèl ou te itilize a. Si ou pa gen kont, dekri aparèy ou ak dat vòt ou pou nou ka jwenn li. Nou reponn nan 30 jou maksimòm.'] },
      { h: 'Sekirite', p: [
        'Aksè nan done yo pwoteje ak règ sekirite Firestore: chak moun ka li oswa modifye sèlman pwòp vòt li. Administratè yo konekte ak yon kont Google ki nan yon lis otorize. Malgre sa, okenn sistèm pa garanti 100 %; si yon pwoblèm sekirite ta rive, n ap enfòme moun ki konsène yo.',
      ] },
      { h: 'Cookies', p: [
        'Nou pa itilize cookies piblisite. Sit la kenbe sèlman sa li bezwen sou aparèy ou: sesyon koneksyon an, lang, priyorite ak kopi done kandida yo.',
        'Nou pa itilize Google Analytics ni okenn lòt zouti swivi. Si ou efase done navigatè w la, sit la bliye w, epi yon nouvo idantifyan anonim kreye lè ou retounen.',
      ] },
      { h: 'Timoun', p: ['Sit la fèt pou moun ki gen 18 an oswa plis. Nou pa mande laj, men si nou aprann ke yon timoun te bay done, nou efase yo.'] },
      { h: 'Chanjman', p: ['Nou ka mete politik sa a ajou. Dat dènye mizajou a toujou parèt anlè paj la. Si chanjman an enpòtan, n ap mete yon avi sou paj dakèy la pandan kèk semèn.'] },
      { h: 'Kontak', p: ['Pou nenpòt kesyon sou done ou yo: {email}.'] },
    ],
  },
  terms: {
    title: 'Kondisyon itilizasyon',
    intro: 'Lè ou itilize Prezidan Pa M, ou aksepte kondisyon sa yo. Si ou pa dakò ak yo, tanpri pa itilize sit la. Dènye mizajou: {date}.',
    sections: [
      { h: 'Sèvis la', p: [
        'Prezidan Pa M se yon vòt sivik, endepandan, san okenn valè ofisyèl. Li pa yon sondaj syantifik, li pa yon eleksyon, epi li pa ranplase vòt ou nan biwo vòt la.',
        'Sèvis la gratis. Nou ofri l pou ankouraje yon deba sou pwoblèm peyi a ak sou dosye piblik kandida yo.',
      ] },
      { h: 'Règ pou itilize l', li: [
        'Yon vòt pa moun. Pa eseye vote plizyè fwa, ni ak robo oswa kont fo.',
        'Rezon ou ekri yo dwe respekte moun: pa gen ensilt, menas, diskou rayisman, ni fo akizasyon sou yon moun. Lyen yo retire otomatikman.',
        'Pa eseye kraze, kopye an mas oswa deranje sèvis la (robo, atak, kontoune règ sekirite yo).',
        'Nou ka retire nenpòt kontni ki vyole règ sa yo, epi bloke abi.',
      ] },
      { h: 'Kont ou', p: ['Ou responsab pou kenbe modpas ou an sekirite. Ou dwe gen omwen 18 an pou kreye yon kont. Ou ka efase kont ou nenpòt lè (ekri nou), epi nou ka fèmen yon kont ki vyole règ sa yo.'] },
      { h: 'Enfòmasyon sou kandida yo', p: [
        'Enfòmasyon yo soti nan sous piblik. Malgre swen nou, yon erè ka rive. Si ou wè youn, ekri nou epi n ap korije l vit. Nou pa sipòte okenn kandida.',
        'Dosye yo pa konplè: yon kandida ka gen aksyon nou poko dokimante. Sa nou ekri a se pa yon jijman sou moun nan, se yon rezime sous piblik ak dat yo.',
      ] },
      { h: 'Pwopriyete entelektyèl', p: [
        'Tèks ak desen sit la se pou Prezidan Pa M. Foto kandida yo rete pwopriyete moun ki gen dwa sou yo; kredi yo parèt nan paj « Kijan sa mache ». Si ou gen dwa sou yon foto epi ou vle nou retire l, ekri nou.',
        'Foto peyi a (drapo Ayiti, Sitadèl Laferyè) soti nan Wikimedia Commons ak lisans lib; kredi yo parèt sou menm paj la. Ou ka pataje lyen sit la ak rezilta yo lib, ak yon mansyon « Prezidan Pa M ».',
      ] },
      { h: 'Disponiblite ak responsablite', p: [
        'Sèvis la bay « jan li ye a ». Li ka chanje oswa sispann nenpòt lè. Nan limit lalwa pèmèt, nou pa responsab pou domaj ki soti nan itilizasyon sit la.',
        'Nou ka chanje lis kandida yo lè CEP pibliye lis preliminè oswa lis final la.',
      ] },
      { h: 'Lwa ki aplikab', p: ['Kondisyon sa yo entèprete dapre lwa ki aplikab. Nou toujou eseye rezoud nenpòt dezakò yon fason amikal anvan.'] },
      { h: 'Kontak', p: ['Pou nenpòt kesyon sou kondisyon sa yo: {email}.'] },
    ],
  },
};

const fr: LegalSet = {
  aboutUs: {
    title: 'À propos de Prezidan Pa M',
    intro: 'Prezidan Pa M est une initiative citoyenne indépendante pour l’élection présidentielle haïtienne de 2027. Nous aidons les citoyens à partir de ce qu’ils veulent changer dans le pays, à comparer le dossier public des candidats et à faire entendre leur voix. Le site est gratuit, sans publicité, et disponible en créole, en français et en anglais.',
    sections: [
      { h: 'Notre mission', p: [
        'Permettre à chacun de choisir un président avec des informations claires, sans pression et sans publicité. Nous croyons qu’un vote éclairé commence par cette question : que voulez-vous changer ?',
        'Trop souvent, le débat commence par les noms des candidats plutôt que par les problèmes. Nous renversons cette logique : vous choisissez d’abord vos priorités, puis vous regardez quels candidats ont un dossier public sur ces sujets. Le choix reste le vôtre.',
        'Nous voulons aussi que les Haïtiens du pays et ceux de la diaspora puissent discuter sur la même base, avec les mêmes informations, dans la langue où ils sont le plus à l’aise.',
      ] },
      { h: 'Qui nous sommes', li: [
        'Une équipe de citoyens indépendants, en Haïti et dans la diaspora.',
        'Nous ne sommes affiliés à aucun candidat, parti ou regroupement, ni au CEP ni au gouvernement.',
        'Nous ne recevons ni argent ni publicité de candidats ou de partis.',
        'Aucun candidat ne fait partie de l’équipe, et personne n’y travaille pour une campagne.',
        'Le code source du site est ouvert sur GitHub : chacun peut vérifier comment il fonctionne.',
      ] },
      { h: 'Ce que nous montrons', li: [
        'Uniquement le dossier public de chaque candidat : fonctions occupées, actions documentées, programme publié.',
        'Quand un candidat n’a pas publié de programme, nous le disons, nous ne devinons pas.',
        'Même format et même taille de carte pour tous ; l’ordre change à chaque ouverture du site.',
        'Pour les anciens chefs d’État, nous ajoutons ce qu’ils ont fait pendant leur mandat, avec les dates.',
        'Nous ne publions ni rumeurs ni accusations sans source publique vérifiable.',
      ] },
      { h: 'Le vote', li: [
        'C’est un vote populaire, ni un sondage scientifique ni une prédiction du résultat de l’élection.',
        'Un vote par personne, modifiable à tout moment.',
        'Les résultats sont publics ; les raisons que vous écrivez apparaissent de façon anonyme.',
        'Les résultats sont mis à jour chaque minute ; nous les présentons comme une photo de l’instant, pas comme une prédiction.',
        'Quand vous choisissez vos priorités, nous vous montrons quels candidats ont un dossier sur ces sujets, mais nous ne vous disons pas pour qui voter.',
      ] },
      { h: 'Comment nous sommes financés', p: [
        'Prezidan Pa M est un projet bénévole. Il ne reçoit d’argent d’aucun candidat, parti, organisation politique ni gouvernement. Les frais d’hébergement sont modestes et pris en charge par l’équipe. Si cela devait changer un jour, nous l’écririons d’abord sur cette page.',
      ] },
      { h: 'Signaler une erreur', p: [
        'Si vous voyez une information inexacte sur un candidat, écrivez-nous : {email}. Nous vérifions et corrigeons rapidement.',
        'Indiquez-nous le candidat, la phrase concernée et la source qui montre l’erreur. Nous répondons en quelques jours, et la date de dernière mise à jour figure sur la page « Comment ça marche ».',
      ] },
      { h: 'Contact', p: ['Pour toute question, suggestion ou demande de presse : {email}. Nous répondons en créole, en français ou en anglais.'] },
    ],
  },
  privacy: {
    title: 'Politique de confidentialité',
    intro: 'Cette politique explique quelles données Prezidan Pa M collecte, pourquoi, et quels sont vos droits. Nous l’avons écrite simplement, parce que nous voulons que vous compreniez exactement ce qui se passe avec vos données. Dernière mise à jour : {date}.',
    sections: [
      { h: 'Données collectées', p: ['Nous collectons uniquement ce qui est nécessaire au fonctionnement du vote, rien de plus. Voici la liste, selon la façon dont vous utilisez le site.'], li: [
        'Sans compte : un identifiant anonyme (Firebase Anonymous Authentication) conservé sur votre appareil pour garantir un vote par personne ; votre vote (candidat, raison facultative de 240 caractères maximum, département facultatif, priorités choisies, langue) ; vos réponses aux sondages.',
        'Avec un compte : votre adresse courriel ; avec Google, le nom et la photo de profil que Google fournit ; vos priorités sauvegardées.',
        'Sur votre appareil seulement : langue, priorités, une copie des données des candidats et des derniers résultats (localStorage et IndexedDB).',
        'Données techniques : adresse IP, navigateur et horodatage dans les journaux des hébergeurs, à des fins de sécurité.',
      ] },
      { h: 'Pourquoi nous les utilisons', li: [
        'Faire fonctionner le vote, avec un vote par personne.',
        'Afficher des résultats publics et anonymes.',
        'Sauvegarder votre progression si vous avez un compte.',
        'Protéger le service contre les abus.',
        'Savoir, en totaux seulement, combien de personnes utilisent le site.',
      ], p: ['Nous n’utilisons vos données pour rien d’autre. Pas de profil publicitaire, pas de vente, pas de partage avec des campagnes.'] },
      { h: 'Ce qui est public', p: [
        'Les résultats n’apparaissent qu’en totaux. Les raisons que vous écrivez apparaissent de façon anonyme, avec votre département (si vous l’indiquez) et l’heure. Votre nom, votre courriel et votre identifiant n’apparaissent jamais.',
        'Si vous écrivez une raison, gardez en tête que tout le monde peut la lire. N’y mettez ni votre nom, ni votre numéro de téléphone, ni des informations sur d’autres personnes.',
      ] },
      { h: 'Où sont les données', p: [
        'Les données sont hébergées chez Google Firebase (Firestore, Authentication, Hosting) et Vercel (hébergement) et peuvent être traitées aux États-Unis. Nous ne vendons pas de données, nous ne faisons pas de publicité et nous ne partageons rien avec des candidats ou des partis.',
        'Ces fournisseurs ont leurs propres règles de sécurité et certifications. Les échanges entre votre appareil et les serveurs sont toujours chiffrés (HTTPS).',
      ] },
      { h: 'Durée de conservation', li: [
        'Votes et réponses aux sondages : jusqu’à la fin du cycle électoral 2027, ou jusqu’à leur suppression à votre demande.',
        'Compte : jusqu’à sa suppression.',
        'Journaux techniques : selon les règles des hébergeurs (généralement quelques semaines).',
        'Copies sur votre appareil : jusqu’à ce que vous effaciez les données de votre navigateur.',
      ] },
      { h: 'Vos droits', li: [
        'Voir et modifier votre vote à tout moment sur le site.',
        'Supprimer votre vote, vos réponses ou votre compte : écrivez-nous.',
        'Demander une copie de vos données ou une correction.',
        'Retirer votre consentement : cessez d’utiliser le site et demandez-nous d’effacer vos données.',
      ], p: ['Pour exercer un droit, écrivez-nous depuis l’adresse courriel que vous avez utilisée. Sans compte, décrivez votre appareil et la date de votre vote pour que nous puissions le retrouver. Nous répondons sous 30 jours au plus.'] },
      { h: 'Sécurité', p: [
        'L’accès aux données est protégé par les règles de sécurité Firestore : chacun ne peut lire ou modifier que son propre vote. Les administrateurs se connectent avec un compte Google figurant sur une liste autorisée. Aucun système n’est toutefois garanti à 100 % ; en cas d’incident de sécurité, nous informerions les personnes concernées.',
      ] },
      { h: 'Cookies', p: [
        'Nous n’utilisons pas de cookies publicitaires. Le site ne conserve sur votre appareil que ce dont il a besoin : la session de connexion, la langue, les priorités et une copie des données des candidats.',
        'Nous n’utilisons ni Google Analytics ni aucun autre outil de suivi. Si vous effacez les données de votre navigateur, le site vous oublie, et un nouvel identifiant anonyme est créé à votre retour.',
      ] },
      { h: 'Mineurs', p: ['Le site s’adresse aux personnes de 18 ans et plus. Nous ne demandons pas l’âge, mais si nous apprenons qu’un mineur a fourni des données, nous les supprimons.'] },
      { h: 'Modifications', p: ['Nous pouvons mettre cette politique à jour. La date de dernière mise à jour figure toujours en haut de la page. En cas de changement important, un avis sera affiché sur la page d’accueil pendant quelques semaines.'] },
      { h: 'Contact', p: ['Pour toute question sur vos données : {email}.'] },
    ],
  },
  terms: {
    title: 'Conditions d’utilisation',
    intro: 'En utilisant Prezidan Pa M, vous acceptez ces conditions. Si vous n’êtes pas d’accord, merci de ne pas utiliser le site. Dernière mise à jour : {date}.',
    sections: [
      { h: 'Le service', p: [
        'Prezidan Pa M est un vote citoyen, indépendant et sans valeur officielle. Ce n’est ni un sondage scientifique ni une élection, et il ne remplace pas votre vote au bureau de vote.',
        'Le service est gratuit. Nous le proposons pour encourager un débat sur les problèmes du pays et sur le dossier public des candidats.',
      ] },
      { h: 'Règles d’utilisation', li: [
        'Un vote par personne. N’essayez pas de voter plusieurs fois, ni avec des robots ou de faux comptes.',
        'Les raisons que vous écrivez doivent respecter les personnes : pas d’insultes, de menaces, de discours de haine ni de fausses accusations. Les liens sont retirés automatiquement.',
        'N’essayez pas de perturber, de copier en masse ou de contourner le service (robots, attaques, contournement des règles de sécurité).',
        'Nous pouvons retirer tout contenu qui enfreint ces règles et bloquer les abus.',
      ] },
      { h: 'Votre compte', p: ['Vous êtes responsable de la sécurité de votre mot de passe. Il faut avoir au moins 18 ans pour créer un compte. Vous pouvez supprimer votre compte à tout moment (écrivez-nous), et nous pouvons fermer un compte qui enfreint ces règles.'] },
      { h: 'Informations sur les candidats', p: [
        'Les informations proviennent de sources publiques. Malgré notre soin, une erreur est possible. Si vous en voyez une, écrivez-nous et nous la corrigerons rapidement. Nous ne soutenons aucun candidat.',
        'Les dossiers ne sont pas exhaustifs : un candidat peut avoir des actions que nous n’avons pas encore documentées. Ce que nous écrivons n’est pas un jugement sur la personne, mais un résumé de sources publiques, avec leurs dates.',
      ] },
      { h: 'Propriété intellectuelle', p: [
        'Les textes et le design du site appartiennent à Prezidan Pa M. Les photos des candidats restent la propriété de leurs ayants droit ; les crédits figurent sur la page « Comment ça marche ». Si vous détenez les droits d’une photo et souhaitez son retrait, écrivez-nous.',
        'Les images du pays (drapeau d’Haïti, Citadelle Laferrière) proviennent de Wikimedia Commons sous licence libre ; les crédits figurent sur la même page. Vous pouvez partager librement le lien du site et les résultats, avec la mention « Prezidan Pa M ».',
      ] },
      { h: 'Disponibilité et responsabilité', p: [
        'Le service est fourni « tel quel ». Il peut changer ou s’arrêter à tout moment. Dans la limite permise par la loi, nous ne sommes pas responsables des dommages liés à l’utilisation du site.',
        'Nous pouvons modifier la liste des candidats lorsque le CEP publie la liste préliminaire ou la liste définitive.',
      ] },
      { h: 'Droit applicable', p: ['Ces conditions s’interprètent selon le droit applicable. Nous cherchons toujours d’abord une solution amiable à tout désaccord.'] },
      { h: 'Contact', p: ['Pour toute question sur ces conditions : {email}.'] },
    ],
  },
};

const en: LegalSet = {
  aboutUs: {
    title: 'About Prezidan Pa M',
    intro: 'Prezidan Pa M is an independent civic initiative for Haiti’s 2027 presidential election. We help citizens start from what they want changed in the country, compare the candidates’ public record, and make their voice heard. The site is free, carries no advertising, and is available in Haitian Creole, French and English.',
    sections: [
      { h: 'Our mission', p: [
        'Let everyone choose a president with clear information, no pressure and no advertising. We believe an informed vote starts with one question: what do you want changed?',
        'Too often the debate starts with the candidates’ names instead of the problems. We flip that: you pick your priorities first, then you look at which candidates have a public record on them. The choice stays yours.',
        'We also want Haitians at home and in the diaspora to talk on the same footing, with the same information, in the language they are most comfortable with.',
      ] },
      { h: 'Who we are', li: [
        'An independent team of citizens, in Haiti and in the diaspora.',
        'We are not affiliated with any candidate, party or grouping, nor with the CEP or the government.',
        'We take no money and no advertising from candidates or parties.',
        'No candidate is part of the team, and nobody on it works for a campaign.',
        'The site’s source code is open on GitHub: anyone can check how it works.',
      ] },
      { h: 'What we show', li: [
        'Only each candidate’s public record: offices held, documented actions, published platform.',
        'When a candidate has not published a platform, we say so; we do not guess.',
        'Same card format and size for everyone; the order changes every time you open the site.',
        'For former heads of state, we add what they did during their term, with dates.',
        'We publish no rumours and no accusations without a verifiable public source.',
      ] },
      { h: 'The vote', li: [
        'It is a people’s vote, neither a scientific poll nor a prediction of the election result.',
        'One vote per person, changeable at any time.',
        'Results are public; the reasons you write appear anonymously.',
        'Results update every minute; we present them as a snapshot of the moment, not as a prediction.',
        'When you pick your priorities, we show you which candidates have a record on them, but we never tell you whom to vote for.',
      ] },
      { h: 'How we are funded', p: [
        'Prezidan Pa M is a volunteer project. It takes no money from any candidate, party, political organisation or government. Hosting costs are small and paid by the team. If that ever changed, we would write it on this page first.',
      ] },
      { h: 'Report an error', p: [
        'If you see inaccurate information about a candidate, write to us: {email}. We verify and correct quickly.',
        'Tell us the candidate, the sentence concerned and the source that shows the error. We reply within a few days, and the date of the last update appears on the “How it works” page.',
      ] },
      { h: 'Contact', p: ['For any question, suggestion or press request: {email}. We reply in Haitian Creole, French or English.'] },
    ],
  },
  privacy: {
    title: 'Privacy policy',
    intro: 'This policy explains what data Prezidan Pa M collects, why, and what your rights are. We wrote it plainly, because we want you to understand exactly what happens to your data. Last updated: {date}.',
    sections: [
      { h: 'Data we collect', p: ['We collect only what the vote needs to work, nothing more. Here is the list, depending on how you use the site.'], li: [
        'Without an account: an anonymous identifier (Firebase Anonymous Authentication) kept on your device to guarantee one vote per person; your vote (candidate, optional reason of up to 240 characters, optional department, chosen priorities, language); your poll answers.',
        'With an account: your email address; with Google, the name and profile picture Google provides; your saved priorities.',
        'On your device only: language, priorities, a copy of the candidate data and of the latest results (localStorage and IndexedDB).',
        'Technical data: IP address, browser and timestamp in the hosting providers’ logs, for security.',
      ] },
      { h: 'Why we use it', li: [
        'To run the vote, with one vote per person.',
        'To show public, anonymous results.',
        'To save your progress if you have an account.',
        'To protect the service against abuse.',
        'To know, in totals only, how many people use the site.',
      ], p: ['We use your data for nothing else. No advertising profile, no sale, no sharing with campaigns.'] },
      { h: 'What is public', p: [
        'Results appear only as totals. The reasons you write appear anonymously, with your department (if you give it) and the time. Your name, email and identifier never appear.',
        'If you write a reason, keep in mind that anyone can read it. Do not include your name, your phone number or information about other people.',
      ] },
      { h: 'Where the data lives', p: [
        'Data is hosted on Google Firebase (Firestore, Authentication, Hosting) and Vercel (hosting) and may be processed in the United States. We do not sell data, we show no advertising, and we share nothing with candidates or parties.',
        'These providers have their own security rules and certifications. Traffic between your device and the servers is always encrypted (HTTPS).',
      ] },
      { h: 'How long we keep it', li: [
        'Votes and poll answers: until the end of the 2027 electoral cycle, or until you ask for deletion.',
        'Account: until you delete it.',
        'Technical logs: per the hosting providers’ rules (usually a few weeks).',
        'Copies on your device: until you clear your browser data.',
      ] },
      { h: 'Your rights', li: [
        'See and change your vote at any time on the site.',
        'Delete your vote, your answers or your account: write to us.',
        'Ask for a copy of your data or a correction.',
        'Withdraw consent: stop using the site and ask us to delete your data.',
      ], p: ['To exercise a right, write to us from the email address you used. Without an account, describe your device and the date of your vote so we can find it. We reply within 30 days at most.'] },
      { h: 'Security', p: [
        'Access to the data is protected by Firestore security rules: each person can read or change only their own vote. Administrators sign in with a Google account on an allow list. No system is guaranteed 100 %, though; in the event of a security incident we would inform the people concerned.',
      ] },
      { h: 'Cookies', p: [
        'We use no advertising cookies. The site keeps on your device only what it needs: the sign-in session, the language, your priorities and a copy of the candidate data.',
        'We use neither Google Analytics nor any other tracking tool. If you clear your browser data, the site forgets you, and a new anonymous identifier is created when you come back.',
      ] },
      { h: 'Minors', p: ['The site is intended for people aged 18 and over. We do not ask for your age, but if we learn that a minor has provided data, we delete it.'] },
      { h: 'Changes', p: ['We may update this policy. The date of the last update always appears at the top of the page. For an important change, a notice will appear on the home page for a few weeks.'] },
      { h: 'Contact', p: ['For any question about your data: {email}.'] },
    ],
  },
  terms: {
    title: 'Terms of use',
    intro: 'By using Prezidan Pa M you accept these terms. If you do not agree with them, please do not use the site. Last updated: {date}.',
    sections: [
      { h: 'The service', p: [
        'Prezidan Pa M is an independent civic vote with no official value. It is neither a scientific poll nor an election, and it does not replace your vote at the polling station.',
        'The service is free. We offer it to encourage a debate about the country’s problems and the candidates’ public record.',
      ] },
      { h: 'Rules of use', li: [
        'One vote per person. Do not try to vote several times, nor with bots or fake accounts.',
        'The reasons you write must respect people: no insults, threats, hate speech or false accusations. Links are removed automatically.',
        'Do not try to disrupt, mass copy or work around the service (bots, attacks, bypassing the security rules).',
        'We may remove any content that breaks these rules and block abuse.',
      ] },
      { h: 'Your account', p: ['You are responsible for keeping your password safe. You must be at least 18 to create an account. You can delete your account at any time (write to us), and we may close an account that breaks these rules.'] },
      { h: 'Candidate information', p: [
        'Information comes from public sources. Despite our care, errors can happen. If you see one, write to us and we will correct it quickly. We endorse no candidate.',
        'The records are not exhaustive: a candidate may have actions we have not documented yet. What we write is not a judgement of the person but a summary of public sources, with their dates.',
      ] },
      { h: 'Intellectual property', p: [
        'The site’s text and design belong to Prezidan Pa M. Candidate photos remain the property of their rights holders; credits appear on the “How it works” page. If you hold the rights to a photo and want it removed, write to us.',
        'Pictures of the country (the flag of Haiti, the Citadelle Laferrière) come from Wikimedia Commons under free licences; credits appear on the same page. You may freely share the site’s link and the results, with a mention of “Prezidan Pa M”.',
      ] },
      { h: 'Availability and liability', p: [
        'The service is provided “as is”. It may change or stop at any time. To the extent the law allows, we are not liable for damages arising from the use of the site.',
        'We may change the list of candidates when the CEP publishes the preliminary or the final list.',
      ] },
      { h: 'Governing law', p: ['These terms are interpreted under the applicable law. We always seek an amicable solution to any disagreement first.'] },
      { h: 'Contact', p: ['For any question about these terms: {email}.'] },
    ],
  },
};

export const LEGAL: Record<Lang, LegalSet> = { ht, fr, en };
