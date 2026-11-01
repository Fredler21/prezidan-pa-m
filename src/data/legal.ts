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
    intro: 'Prezidan Pa M se yon inisyativ sivik endepandan pou eleksyon prezidansyèl Ayiti 2027 la. Nou ede sitwayen yo kòmanse ak sa yo vle chanje nan peyi a, konpare dosye piblik kandida yo, epi bay vwa yo.',
    sections: [
      { h: 'Misyon nou', p: ['Fè chak moun kapab chwazi yon prezidan ak enfòmasyon klè, san presyon, san piblisite. Nou kwè yon vòt ki byen enfòme kòmanse ak kesyon sa a: kisa ou vle chanje?'] },
      { h: 'Sa nou ye', li: ['Yon ekip sitwayen endepandan, an Ayiti ak nan dyaspora a.', 'Nou pa afilye ak okenn kandida, pati, regwoupman, ni ak CEP oswa gouvènman an.', 'Nou pa resevwa lajan ni piblisite nan men kandida oswa pati.'] },
      { h: 'Sa nou montre', li: ['Sèlman dosye piblik chak kandida: pòs li okipe, aksyon ki dokimante, pwogram li pibliye.', 'Lè yon kandida poko pibliye pwogram, nou di sa, nou pa devine.', 'Menm fòma, menm gwosè kat pou tout kandida; lòd la chanje chak fwa ou louvri sit la.'] },
      { h: 'Vòt la', li: ['Se yon vòt pèp la, se pa yon sondaj syantifik ni yon prediksyon rezilta eleksyon an.', 'Yon vòt pa moun; ou ka chanje l nenpòt lè.', 'Rezilta yo piblik; rezon ou ekri yo parèt anonim.'] },
      { h: 'Korije yon erè', p: ['Si ou wè yon enfòmasyon ki pa egzak sou yon kandida, ekri nou: {email}. Nou verifye epi nou korije vit.'] },
      { h: 'Kontak', p: ['{email}'] },
    ],
  },
  privacy: {
    title: 'Politik konfidansyalite',
    intro: 'Politik sa a eksplike ki done Prezidan Pa M kolekte, poukisa, ak ki dwa ou genyen. Dènye mizajou: {date}.',
    sections: [
      { h: 'Done nou kolekte', li: [
        'San kont: yon idantifyan anonim (Firebase Anonymous Authentication) ki rete sou aparèy ou pou garanti yon vòt pa moun; vòt ou (kandida, rezon opsyonèl jiska 240 karaktè, depatman opsyonèl, priyorite ou chwazi yo, lang); repons ou nan sondaj yo.',
        'Ak yon kont: adrès imèl ou; ak Google, non ak foto pwofil Google ou bay la; priyorite ou sove yo.',
        'Sou aparèy ou sèlman: lang ou, priyorite ou, yon kopi done kandida yo (localStorage ak IndexedDB).',
        'Done teknik: adrès IP, navigatè ak dat koneksyon nan jounal sèvè founisè ebèjman yo, pou sekirite.',
      ] },
      { h: 'Poukisa nou itilize yo', li: ['Pou fè vòt la mache, ak yon vòt pa moun.', 'Pou montre rezilta piblik ak anonim.', 'Pou sove pwogrè w si ou gen yon kont.', 'Pou pwoteje sèvis la kont abi.'] },
      { h: 'Sa ki piblik', p: ['Rezilta yo parèt sèlman an total. Rezon ou ekri yo parèt anonim, ak depatman ou (si ou bay li) ak lè a. Non ou, imèl ou ak idantifyan ou pa janm parèt.'] },
      { h: 'Kote done yo rete', p: ['Done yo sou Google Firebase (Firestore, Authentication, Hosting) ak Vercel (ebèjman). Yo ka trete Ozetazini. Nou pa vann done, nou pa fè piblisite, nou pa pataje done ak kandida oswa pati.'] },
      { h: 'Konbyen tan', li: ['Vòt ak repons sondaj: jiska fen sik elektoral 2027 la, oswa jiskaske ou efase yo.', 'Kont: jiskaske ou efase l.', 'Jounal teknik: dapre règ founisè yo (jeneralman kèk semèn).'] },
      { h: 'Dwa ou', li: ['Wè ak chanje vòt ou nenpòt lè sou sit la.', 'Efase vòt ou, repons ou oswa kont ou: ekri nou.', 'Mande yon kopi done ou yo oswa yon koreksyon.'] },
      { h: 'Cookies', p: ['Nou pa itilize cookies piblisite. Sit la kenbe sèlman sa li bezwen sou aparèy ou: sesyon koneksyon an, lang, priyorite ak kopi done kandida yo.'] },
      { h: 'Timoun', p: ['Sit la fèt pou moun ki gen 18 an oswa plis.'] },
      { h: 'Chanjman', p: ['Nou ka mete politik sa a ajou. Dat dènye mizajou a toujou parèt anlè paj la.'] },
      { h: 'Kontak', p: ['{email}'] },
    ],
  },
  terms: {
    title: 'Kondisyon itilizasyon',
    intro: 'Lè ou itilize Prezidan Pa M, ou aksepte kondisyon sa yo. Dènye mizajou: {date}.',
    sections: [
      { h: 'Sèvis la', p: ['Prezidan Pa M se yon vòt sivik, endepandan, san okenn valè ofisyèl. Li pa yon sondaj syantifik, li pa yon eleksyon, epi li pa ranplase vòt ou nan biwo vòt la.'] },
      { h: 'Règ pou itilize l', li: ['Yon vòt pa moun. Pa eseye vote plizyè fwa, ni ak robo oswa kont fo.', 'Rezon ou ekri yo dwe respekte moun: pa gen ensilt, menas, diskou rayisman, ni fo akizasyon sou yon moun. Lyen yo retire otomatikman.', 'Nou ka retire nenpòt kontni ki vyole règ sa yo, epi bloke abi.'] },
      { h: 'Kont ou', p: ['Ou responsab pou kenbe modpas ou an sekirite. Ou ka efase kont ou nenpòt lè (ekri nou).'] },
      { h: 'Enfòmasyon sou kandida yo', p: ['Enfòmasyon yo soti nan sous piblik. Malgre swen nou, yon erè ka rive. Si ou wè youn, ekri nou epi n ap korije l vit. Nou pa sipòte okenn kandida.'] },
      { h: 'Pwopriyete entelektyèl', p: ['Tèks ak desen sit la se pou Prezidan Pa M. Foto kandida yo rete pwopriyete moun ki gen dwa sou yo; kredi yo parèt nan paj « Kijan sa mache ». Si ou gen dwa sou yon foto epi ou vle nou retire l, ekri nou.'] },
      { h: 'Disponiblite ak responsablite', p: ['Sèvis la bay « jan li ye a ». Li ka chanje oswa sispann nenpòt lè. Nan limit lalwa pèmèt, nou pa responsab pou domaj ki soti nan itilizasyon sit la.'] },
      { h: 'Lwa ki aplikab', p: ['Kondisyon sa yo entèprete dapre lwa ki aplikab. Nou toujou eseye rezoud nenpòt dezakò yon fason amikal anvan.'] },
      { h: 'Kontak', p: ['{email}'] },
    ],
  },
};

const fr: LegalSet = {
  aboutUs: {
    title: 'À propos de Prezidan Pa M',
    intro: 'Prezidan Pa M est une initiative citoyenne indépendante pour l’élection présidentielle haïtienne de 2027. Nous aidons les citoyens à partir de ce qu’ils veulent changer dans le pays, à comparer le dossier public des candidats et à faire entendre leur voix.',
    sections: [
      { h: 'Notre mission', p: ['Permettre à chacun de choisir un président avec des informations claires, sans pression et sans publicité. Nous croyons qu’un vote éclairé commence par cette question : que voulez-vous changer ?'] },
      { h: 'Qui nous sommes', li: ['Une équipe de citoyens indépendants, en Haïti et dans la diaspora.', 'Nous ne sommes affiliés à aucun candidat, parti ou regroupement, ni au CEP ni au gouvernement.', 'Nous ne recevons ni argent ni publicité de candidats ou de partis.'] },
      { h: 'Ce que nous montrons', li: ['Uniquement le dossier public de chaque candidat : fonctions occupées, actions documentées, programme publié.', 'Quand un candidat n’a pas publié de programme, nous le disons, nous ne devinons pas.', 'Même format et même taille de carte pour tous ; l’ordre change à chaque ouverture du site.'] },
      { h: 'Le vote', li: ['C’est un vote populaire, ni un sondage scientifique ni une prédiction du résultat de l’élection.', 'Un vote par personne, modifiable à tout moment.', 'Les résultats sont publics ; les raisons que vous écrivez apparaissent de façon anonyme.'] },
      { h: 'Signaler une erreur', p: ['Si vous voyez une information inexacte sur un candidat, écrivez-nous : {email}. Nous vérifions et corrigeons rapidement.'] },
      { h: 'Contact', p: ['{email}'] },
    ],
  },
  privacy: {
    title: 'Politique de confidentialité',
    intro: 'Cette politique explique quelles données Prezidan Pa M collecte, pourquoi, et quels sont vos droits. Dernière mise à jour : {date}.',
    sections: [
      { h: 'Données collectées', li: [
        'Sans compte : un identifiant anonyme (Firebase Anonymous Authentication) conservé sur votre appareil pour garantir un vote par personne ; votre vote (candidat, raison facultative de 240 caractères maximum, département facultatif, priorités choisies, langue) ; vos réponses aux sondages.',
        'Avec un compte : votre adresse courriel ; avec Google, le nom et la photo de profil que Google fournit ; vos priorités sauvegardées.',
        'Sur votre appareil seulement : langue, priorités, une copie des données des candidats (localStorage et IndexedDB).',
        'Données techniques : adresse IP, navigateur et horodatage dans les journaux des hébergeurs, à des fins de sécurité.',
      ] },
      { h: 'Pourquoi nous les utilisons', li: ['Faire fonctionner le vote, avec un vote par personne.', 'Afficher des résultats publics et anonymes.', 'Sauvegarder votre progression si vous avez un compte.', 'Protéger le service contre les abus.'] },
      { h: 'Ce qui est public', p: ['Les résultats n’apparaissent qu’en totaux. Les raisons que vous écrivez apparaissent de façon anonyme, avec votre département (si vous l’indiquez) et l’heure. Votre nom, votre courriel et votre identifiant n’apparaissent jamais.'] },
      { h: 'Où sont les données', p: ['Les données sont hébergées chez Google Firebase (Firestore, Authentication, Hosting) et Vercel (hébergement) et peuvent être traitées aux États-Unis. Nous ne vendons pas de données, nous ne faisons pas de publicité et nous ne partageons rien avec des candidats ou des partis.'] },
      { h: 'Durée de conservation', li: ['Votes et réponses aux sondages : jusqu’à la fin du cycle électoral 2027, ou jusqu’à leur suppression à votre demande.', 'Compte : jusqu’à sa suppression.', 'Journaux techniques : selon les règles des hébergeurs (généralement quelques semaines).'] },
      { h: 'Vos droits', li: ['Voir et modifier votre vote à tout moment sur le site.', 'Supprimer votre vote, vos réponses ou votre compte : écrivez-nous.', 'Demander une copie de vos données ou une correction.'] },
      { h: 'Cookies', p: ['Nous n’utilisons pas de cookies publicitaires. Le site ne conserve sur votre appareil que ce dont il a besoin : la session de connexion, la langue, les priorités et une copie des données des candidats.'] },
      { h: 'Mineurs', p: ['Le site s’adresse aux personnes de 18 ans et plus.'] },
      { h: 'Modifications', p: ['Nous pouvons mettre cette politique à jour. La date de dernière mise à jour figure toujours en haut de la page.'] },
      { h: 'Contact', p: ['{email}'] },
    ],
  },
  terms: {
    title: 'Conditions d’utilisation',
    intro: 'En utilisant Prezidan Pa M, vous acceptez ces conditions. Dernière mise à jour : {date}.',
    sections: [
      { h: 'Le service', p: ['Prezidan Pa M est un vote citoyen, indépendant et sans valeur officielle. Ce n’est ni un sondage scientifique ni une élection, et il ne remplace pas votre vote au bureau de vote.'] },
      { h: 'Règles d’utilisation', li: ['Un vote par personne. N’essayez pas de voter plusieurs fois, ni avec des robots ou de faux comptes.', 'Les raisons que vous écrivez doivent respecter les personnes : pas d’insultes, de menaces, de discours de haine ni de fausses accusations. Les liens sont retirés automatiquement.', 'Nous pouvons retirer tout contenu qui enfreint ces règles et bloquer les abus.'] },
      { h: 'Votre compte', p: ['Vous êtes responsable de la sécurité de votre mot de passe. Vous pouvez supprimer votre compte à tout moment (écrivez-nous).'] },
      { h: 'Informations sur les candidats', p: ['Les informations proviennent de sources publiques. Malgré notre soin, une erreur est possible. Si vous en voyez une, écrivez-nous et nous la corrigerons rapidement. Nous ne soutenons aucun candidat.'] },
      { h: 'Propriété intellectuelle', p: ['Les textes et le design du site appartiennent à Prezidan Pa M. Les photos des candidats restent la propriété de leurs ayants droit ; les crédits figurent sur la page « Comment ça marche ». Si vous détenez les droits d’une photo et souhaitez son retrait, écrivez-nous.'] },
      { h: 'Disponibilité et responsabilité', p: ['Le service est fourni « tel quel ». Il peut changer ou s’arrêter à tout moment. Dans la limite permise par la loi, nous ne sommes pas responsables des dommages liés à l’utilisation du site.'] },
      { h: 'Droit applicable', p: ['Ces conditions s’interprètent selon le droit applicable. Nous cherchons toujours d’abord une solution amiable à tout désaccord.'] },
      { h: 'Contact', p: ['{email}'] },
    ],
  },
};

const en: LegalSet = {
  aboutUs: {
    title: 'About Prezidan Pa M',
    intro: 'Prezidan Pa M is an independent civic initiative for Haiti’s 2027 presidential election. We help citizens start from what they want changed in the country, compare the candidates’ public record, and make their voice heard.',
    sections: [
      { h: 'Our mission', p: ['Let everyone choose a president with clear information, no pressure and no advertising. We believe an informed vote starts with one question: what do you want changed?'] },
      { h: 'Who we are', li: ['An independent team of citizens, in Haiti and in the diaspora.', 'We are not affiliated with any candidate, party or grouping, nor with the CEP or the government.', 'We take no money and no advertising from candidates or parties.'] },
      { h: 'What we show', li: ['Only each candidate’s public record: offices held, documented actions, published platform.', 'When a candidate has not published a platform, we say so; we do not guess.', 'Same card format and size for everyone; the order changes every time you open the site.'] },
      { h: 'The vote', li: ['It is a people’s vote, neither a scientific poll nor a prediction of the election result.', 'One vote per person, changeable at any time.', 'Results are public; the reasons you write appear anonymously.'] },
      { h: 'Report an error', p: ['If you see inaccurate information about a candidate, write to us: {email}. We verify and correct quickly.'] },
      { h: 'Contact', p: ['{email}'] },
    ],
  },
  privacy: {
    title: 'Privacy policy',
    intro: 'This policy explains what data Prezidan Pa M collects, why, and what your rights are. Last updated: {date}.',
    sections: [
      { h: 'Data we collect', li: [
        'Without an account: an anonymous identifier (Firebase Anonymous Authentication) kept on your device to guarantee one vote per person; your vote (candidate, optional reason of up to 240 characters, optional department, chosen priorities, language); your poll answers.',
        'With an account: your email address; with Google, the name and profile picture Google provides; your saved priorities.',
        'On your device only: language, priorities, a copy of the candidate data (localStorage and IndexedDB).',
        'Technical data: IP address, browser and timestamp in the hosting providers’ logs, for security.',
      ] },
      { h: 'Why we use it', li: ['To run the vote, with one vote per person.', 'To show public, anonymous results.', 'To save your progress if you have an account.', 'To protect the service against abuse.'] },
      { h: 'What is public', p: ['Results appear only as totals. The reasons you write appear anonymously, with your department (if you give it) and the time. Your name, email and identifier never appear.'] },
      { h: 'Where the data lives', p: ['Data is hosted on Google Firebase (Firestore, Authentication, Hosting) and Vercel (hosting) and may be processed in the United States. We do not sell data, we show no advertising, and we share nothing with candidates or parties.'] },
      { h: 'How long we keep it', li: ['Votes and poll answers: until the end of the 2027 electoral cycle, or until you ask for deletion.', 'Account: until you delete it.', 'Technical logs: per the hosting providers’ rules (usually a few weeks).'] },
      { h: 'Your rights', li: ['See and change your vote at any time on the site.', 'Delete your vote, your answers or your account: write to us.', 'Ask for a copy of your data or a correction.'] },
      { h: 'Cookies', p: ['We use no advertising cookies. The site keeps on your device only what it needs: the sign-in session, the language, your priorities and a copy of the candidate data.'] },
      { h: 'Minors', p: ['The site is intended for people aged 18 and over.'] },
      { h: 'Changes', p: ['We may update this policy. The date of the last update always appears at the top of the page.'] },
      { h: 'Contact', p: ['{email}'] },
    ],
  },
  terms: {
    title: 'Terms of use',
    intro: 'By using Prezidan Pa M you accept these terms. Last updated: {date}.',
    sections: [
      { h: 'The service', p: ['Prezidan Pa M is an independent civic vote with no official value. It is neither a scientific poll nor an election, and it does not replace your vote at the polling station.'] },
      { h: 'Rules of use', li: ['One vote per person. Do not try to vote several times, nor with bots or fake accounts.', 'The reasons you write must respect people: no insults, threats, hate speech or false accusations. Links are removed automatically.', 'We may remove any content that breaks these rules and block abuse.'] },
      { h: 'Your account', p: ['You are responsible for keeping your password safe. You can delete your account at any time (write to us).'] },
      { h: 'Candidate information', p: ['Information comes from public sources. Despite our care, errors can happen. If you see one, write to us and we will correct it quickly. We endorse no candidate.'] },
      { h: 'Intellectual property', p: ['The site’s text and design belong to Prezidan Pa M. Candidate photos remain the property of their rights holders; credits appear on the “How it works” page. If you hold the rights to a photo and want it removed, write to us.'] },
      { h: 'Availability and liability', p: ['The service is provided “as is”. It may change or stop at any time. To the extent the law allows, we are not liable for damages arising from the use of the site.'] },
      { h: 'Governing law', p: ['These terms are interpreted under the applicable law. We always seek an amicable solution to any disagreement first.'] },
      { h: 'Contact', p: ['{email}'] },
    ],
  },
};

export const LEGAL: Record<Lang, LegalSet> = { ht, fr, en };
