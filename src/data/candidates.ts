import type { Candidate, L10nList } from '../types';

/*
 * CEP registry of presidential registrants as of Oct 30, 2026 (19 names), VERIFY against the
 * CEP preliminary list (Dec 15, 2026) and final list (Jan 11, 2027) before publishing.
 * Facts come from the Haiti Policy House tracker and its October 2026 brief, the CEP registry,
 * and the primary sources listed per candidate (research notes: 2026-10-30).
 * Rules: never invent positions. A candidate gets a tag only when there is a public record
 * (office held, documented action, published platform) for that priority, with a one-line note.
 * No tags = "Platform not yet published". Registration does not mean CEP approval.
 */
const HPH = { label: 'Haiti Policy House: Haiti election tracker', url: 'https://www.haitipolicyhouse.org/haiti-election-tracker', date: '2026-10-30' };
const HPH_BRIEF = { label: 'Haiti Policy House: October 2026 situation brief', url: 'https://www.haitipolicyhouse.org/briefing-room/oct-2026-lu2621nt', date: '2026-10-30' };
const CEP = { label: 'CEP: Registre des candidatures (tableau)', url: 'https://tableau.cephaiti.ht/', date: '2026-10-30' };
const DECREE_NOTE = {
  ht: 'Anrejistre anba dekrè elektoral revize 6 oktòb 2026 la, ki retire entèdiksyon pou moun ki anba sanksyon etranje (sanksyon Konsèy Sekirite ONU toujou entèdi).',
  fr: 'Inscrit sous le décret électoral révisé du 6 octobre 2026, qui a supprimé l’inadmissibilité des personnes sous sanctions étrangères (les sanctions du Conseil de sécurité de l’ONU restent exclusives).',
  en: 'Registered under the revised electoral decree of Oct 6, 2026, which removed the bar on persons under foreign sanctions (UN Security Council sanctions still disqualify).',
};

const none: L10nList = { ht: [], fr: [], en: [] };
const limited = (party: string) => ({
  ht: `Anrejistre nan CEP anba banyè ${party}; byografi piblik ak pwogram li toujou limite. Pwofil la ap mete ajou.`,
  fr: `Inscrit au CEP sous la bannière ${party} ; biographie publique et programme encore limités. Le profil sera mis à jour.`,
  en: `Registered with the CEP under the ${party} banner; public biography and platform still limited. The profile will be updated.`,
});

export const CANDIDATES: readonly Candidate[] = [
  {
    id: 'martelly',
    name: 'Michel Joseph Martelly',
    party: 'Debloke',
    partyFull: 'Debloke (regwoupman)',
    role: { ht: 'Prezidan Repiblik la, 2011-2016', fr: 'Président de la République, 2011-2016', en: 'President of Haiti, 2011-2016' },
    photo: 'martelly.jpg',
    photoCredit: 'World Economic Forum, Davos 2012, CC BY-SA 2.0 (Wikimedia Commons)',
    bio: {
      ht: 'Michel Joseph Martelly te fèt 12 fevriye 1961 epi li te fè klas li nan Enstitisyon Sen Lwi de Gonzag. Li se yon mizisyen konpa (Sweet Micky) ki t ap anrejistre depi 1988. Li te genyen eleksyon 2010 a 2011 la anba Repons Peyizan (67,57 % nan dezyèm tou 20 mas 2011 la) epi li te prezidan Ayiti soti 14 me 2011 rive 7 fevriye 2016. Li fonde PHTK, ki pa t anrejistre pou 2027; Debloke gen ladan ansyen manm PHTK. Trezò Etazini (out 2024), Kanada (novanm 2022) ak Inyon Ewopeyèn (desanm 2025) mete sanksyon sou li pou akizasyon trafik dwòg ak sipò pou gang, sa li demanti.',
      fr: 'Michel Joseph Martelly est né le 12 février 1961 et a fait ses études à l’Institution Saint-Louis de Gonzague. Musicien de konpa (Sweet Micky), il enregistre depuis 1988. Vainqueur de l’élection de 2010 à 2011 sous Repons Peyizan (67,57 % au second tour du 20 mars 2011), il a été président d’Haïti du 14 mai 2011 au 7 février 2016. Il a fondé le PHTK, qui n’est pas inscrit pour 2027 ; Debloke regroupe d’anciens membres du PHTK. Il est sous sanctions du Trésor américain (août 2024), du Canada (novembre 2022) et de l’Union européenne (décembre 2025) pour des allégations de trafic de drogue et de soutien à des gangs, qu’il nie.',
      en: 'Michel Joseph Martelly was born on 12 February 1961 and attended the Institution Saint-Louis de Gonzague. A konpa musician (Sweet Micky), he has recorded since 1988. He won the 2010 to 2011 election under Repons Peyizan (67.57 % in the 20 March 2011 runoff) and was president of Haiti from 14 May 2011 to 7 February 2016. He founded the PHTK, which did not register for 2027; Debloke includes former PHTK members. He is under sanctions by the U.S. Treasury (August 2024), Canada (November 2022) and the European Union (December 2025) over alleged drug trafficking and gang support, which he denies.',
    },
    record: {
      ht: ['Prezidan Repiblik la, 14 me 2011 rive 7 fevriye 2016', 'Fondatè PHTK; kandida 2027 anba Debloke', 'Pwogram lekòl gratis PSUGO ak Fon Nasyonal Edikasyon', 'Pak Endistriyèl Karakòl (2012); touris ak envestisman etranje', 'Anonse retou Fòs Ame Ayiti yo (2011)', 'Sanksyon Trezò Etazini (2024), Kanada (2022), Inyon Ewopeyèn (2025); li demanti akizasyon yo', DECREE_NOTE.ht],
      fr: ['Président de la République, du 14 mai 2011 au 7 février 2016', 'Fondateur du PHTK ; candidat 2027 sous Debloke', 'Scolarisation gratuite PSUGO et Fonds national de l’éducation', 'Parc industriel de Caracol (2012) ; tourisme et investissements étrangers', 'Annonce du rétablissement des Forces armées (2011)', 'Sanctions du Trésor américain (2024), du Canada (2022), de l’Union européenne (2025) ; il nie les allégations', DECREE_NOTE.fr],
      en: ['President of Haiti, 14 May 2011 to 7 February 2016', 'Founder of the PHTK; 2027 candidate under Debloke', 'PSUGO free-schooling program and National Education Fund', 'Caracol Industrial Park (2012); tourism and foreign-investment push', 'Announced the revival of the armed forces (2011)', 'Sanctions by the U.S. Treasury (2024), Canada (2022), the European Union (2025); he denies the allegations', DECREE_NOTE.en],
    },
    term: {
      title: { ht: 'Manda prezidansyèl 2011-2016', fr: 'Mandat présidentiel 2011-2016', en: 'Presidential term 2011-2016' },
      items: {
        ht: [
          'Premye transfè pasifik pouvwa ant prezidan pati opoze nan istwa Ayiti (14 me 2011).',
          'Senk Premye Minis an senk an: Conille, Lamothe, Evans Paul… Lamothe demisyone desanm 2014 akoz blokaj elektoral la.',
          'Revoke CEP a an desanm 2011; pa t gen okenn eleksyon lejislatif jiska out 2015; Sena a te pèdi yon tyè manm li yo an 2012.',
          'Pibliye amannman konstitisyonèl 2012 yo (dwa vòt pou doub nasyonalite, kota 30 % fanm nan pòs piblik).',
          'Inogire Pak Endistriyèl Karakòl (22 oktòb 2012) ak Etazini ak BID; pwojeksyon 37 000-60 000 djòb, anviwon 13 000 an 2019.',
          'Lekòl gratis (PSUGO) finanse ak taks sou apèl entènasyonal ak transfè dyaspora; plis pase yon milyon elèv dapre ministè a; ankèt 2013 jwenn peman ki manke, lekòl fantòm ak yon ka fwod nan Pòdepè.',
          'Pwogram sosyal (Ede Pèp, Ti Manman Cheri) ak kontra enfrastrikti finanse ak PetroCaribe; odit CSCCA (2019) jwenn kolizyon ak detounman nan pwojè fon an; ansyen PM Lamothe sanksyone pa Etazini an 2023.',
          'Anonse retou lame a (out 2011), ki te disparèt depi 1995.',
          'Akizasyon koripsyon ak manifestasyon kont gouvènman an apati novanm 2013; madanm li rejte kòm kandida Sena (2015).',
          'Palman an tonbe 12 janvye 2015 san eleksyon; li gouvène pa dekrè jiska fen manda a.',
          'Eleksyon 2015 yo (patisipasyon ~18-26 %) konteste; dezyèm tou a ranvwaye plizyè fwa; li sipòte Jovenel Moïse (PHTK).',
          'Kite pouvwa a 7 fevriye 2016 san siksesè eli, apre akò ak Palman an; an jen 2016 yon komisyon verifikasyon jwenn vòt 2015 la « malonèt » epi CEP anile l.',
        ],
        fr: [
          'Première passation pacifique du pouvoir entre présidents de partis opposés dans l’histoire d’Haïti (14 mai 2011).',
          'Cinq Premiers ministres en cinq ans : Conille, Lamothe, Evans Paul… Lamothe démissionne en décembre 2014 sous la pression de l’impasse électorale.',
          'Limogeage du CEP en décembre 2011 ; aucune élection législative jusqu’en août 2015 ; le Sénat perd un tiers de ses membres en 2012.',
          'Publication des amendements constitutionnels de 2012 (droit de vote des binationaux, quota de 30 % de femmes dans la fonction publique).',
          'Inauguration du Parc industriel de Caracol (22 octobre 2012) avec les États-Unis et la BID ; 37 000 à 60 000 emplois projetés, environ 13 000 en 2019.',
          'Scolarisation gratuite (PSUGO) financée par des taxes sur les appels internationaux et les transferts de la diaspora ; plus d’un million d’élèves selon le ministère ; une enquête de 2013 relève des paiements manquants, des écoles fantômes et un cas de fraude à Port-de-Paix.',
          'Programmes sociaux (Ede Pèp, Ti Manman Cheri) et contrats d’infrastructure financés par PetroCaribe ; l’audit de la CSCCA (2019) relève collusion et détournements ; l’ex-PM Lamothe sanctionné par les États-Unis en 2023.',
          'Annonce du retour de l’armée (août 2011), dissoute depuis 1995.',
          'Allégations de corruption et manifestations antigouvernementales à partir de novembre 2013 ; candidature de son épouse au Sénat rejetée (2015).',
          'Caducité du Parlement le 12 janvier 2015 faute d’élections ; gouvernement par décret jusqu’à la fin du mandat.',
          'Élections de 2015 (participation ~18-26 %) contestées ; second tour reporté à plusieurs reprises ; soutien à Jovenel Moïse (PHTK).',
          'Départ le 7 février 2016 sans successeur élu, après un accord avec le Parlement ; en juin 2016 une commission de vérification juge le vote de 2015 « malhonnête » et le CEP l’annule.',
        ],
        en: [
          'First peaceful transfer of power between presidents of opposing parties in Haiti’s history (14 May 2011).',
          'Five prime ministers in five years: Conille, Lamothe, Evans Paul… Lamothe resigned in December 2014 under pressure over the electoral impasse.',
          'Fired the electoral council in December 2011; no legislative elections until August 2015; the Senate lost a third of its members in 2012.',
          'Published the 2012 constitutional amendments (voting rights for dual citizens, 30 % quota for women in public posts).',
          'Inaugurated the Caracol Industrial Park (22 October 2012) with the U.S. and the IDB; 37,000-60,000 jobs projected, about 13,000 by 2019.',
          'Free schooling (PSUGO) funded by levies on international calls and diaspora transfers; over a million pupils per the ministry; a 2013 investigation found missing payments, phantom schools and a fraud case in Port-de-Paix.',
          'Social programs (Ede Pèp, Ti Manman Cheri) and infrastructure contracts funded by PetroCaribe; the 2019 CSCCA audit found collusion and embezzlement in the fund’s projects; ex-PM Lamothe was sanctioned by the U.S. in 2023.',
          'Announced the return of the army (August 2011), disbanded since 1995.',
          'Corruption allegations and anti-government protests from November 2013; his wife’s Senate candidacy was rejected (2015).',
          'Parliament lapsed on 12 January 2015 with no elections held; he governed by decree for the rest of the term.',
          'The 2015 elections (turnout ~18-26 %) were contested; the runoff was postponed repeatedly; he backed Jovenel Moïse (PHTK).',
          'Left office on 7 February 2016 without an elected successor, under an accord with Parliament; in June 2016 a verification commission found the 2015 vote “dishonest” and the CEP annulled it.',
        ],
      },
    },
    tags: [
      { id: 'education', note: { ht: 'Pwogram lekòl gratis PSUGO pandan manda li', fr: 'Programme de scolarisation gratuite PSUGO pendant son mandat', en: 'PSUGO free-schooling program during his term' } },
      { id: 'economy', note: { ht: 'Pak Karakòl, touris ak envestisman etranje', fr: 'Parc de Caracol, tourisme et investissements étrangers', en: 'Caracol park, tourism and foreign investment' } },
      { id: 'security', note: { ht: 'Retou Fòs Ame Ayiti yo', fr: 'Rétablissement des Forces armées', en: 'Revival of the armed forces' } },
    ],
    sources: [HPH, HPH_BRIEF, CEP,
      { label: 'U.S. Treasury: press release jy2542 (Aug 2024)', url: 'https://home.treasury.gov/news/press-releases/jy2542', date: '2026-10-30' },
      { label: 'CRS R42559: Haiti Under President Martelly', url: 'https://www.everycrsreport.com/reports/R42559.html', date: '2026-10-30' },
      { label: 'Wikipedia: Michel Martelly', url: 'https://en.wikipedia.org/wiki/Michel_Martelly', date: '2026-10-30' }],
  },
  {
    id: 'claude-joseph',
    name: 'Claude Joseph',
    party: 'EDE',
    partyFull: 'Les Engagés pour le Développement',
    role: { ht: 'Ansyen Minis Afè Etranjè; Premye Minis pa enterim 2021', fr: 'Ancien ministre des Affaires étrangères ; Premier ministre par intérim 2021', en: 'Former foreign minister; interim prime minister 2021' },
    photo: 'claude-joseph.jpg',
    photoCredit: 'Ministère de la Communication d’Haïti, 2020, CC BY 4.0 (Wikimedia Commons)',
    bio: {
      ht: 'Claude Joseph gen yon doktora nan politik piblik (The New School) ak yon metriz nan administrasyon piblik (Long Island University), epi li te anseye nan University of Connecticut ak Long Island University. Li te Minis Afè Etranjè (mas 2020 rive novanm 2021) epi Premye Minis pa enterim (14 avril rive 20 jiyè 2021); li te dirije Konsèy Minis yo apre asasina Prezidan Moïse la anvan li remèt Ariel Henry. Li lanse EDE 3 septanm 2022 epi li mande eleksyon ak yon fen òdone pou tranzisyon an. Jij enstriksyon an te site l nan òdonans fevriye 2024 dosye Moïse la, sa li rele pèsekisyon politik; Kou Dapèl la kase òdonans lan 13 oktòb 2025.',
      fr: 'Claude Joseph est titulaire d’un doctorat en politiques publiques (The New School) et d’une maîtrise en administration publique (Long Island University), et a enseigné à l’University of Connecticut et à Long Island University. Il a été ministre des Affaires étrangères (de mars 2020 à novembre 2021) et Premier ministre par intérim (du 14 avril au 20 juillet 2021) ; il a dirigé le Conseil des ministres après l’assassinat du président Moïse avant de céder la place à Ariel Henry. Il a lancé EDE le 3 septembre 2022 et plaide pour des élections et une sortie ordonnée de la transition. Cité dans l’ordonnance de février 2024 du juge d’instruction dans l’affaire Moïse, qu’il a qualifiée de persécution politique ; l’ordonnance a été cassée en appel le 13 octobre 2025.',
      en: 'Claude Joseph holds a PhD in public policy from The New School and a master’s in public administration from Long Island University, and taught at the University of Connecticut and Long Island University. He was foreign minister (March 2020 to November 2021) and interim prime minister (14 April to 20 July 2021), leading the Council of Ministers after President Moïse’s assassination until he handed over to Ariel Henry. He launched EDE on 3 September 2022 and has pressed for elections and an orderly end to the transition. He was named in the investigating judge’s February 2024 indictment in the Moïse case, which he called political persecution; it was overturned on appeal on 13 October 2025.',
    },
    record: {
      ht: ['Minis Afè Etranjè, 2020-2021', 'Premye Minis pa enterim, avril-jiyè 2021', 'Fondatè EDE (lanse 2022)', 'Mande eleksyon ak fen tranzisyon an', 'Òdonans 2024 dosye Moïse la kase an apèl (oktòb 2025)'],
      fr: ['Ministre des Affaires étrangères, 2020-2021', 'Premier ministre par intérim, avril-juillet 2021', 'Fondateur d’EDE (lancé en 2022)', 'A réclamé des élections et la fin de la transition', 'Ordonnance de 2024 (affaire Moïse) cassée en appel (octobre 2025)'],
      en: ['Foreign minister, 2020-2021', 'Interim prime minister, April-July 2021', 'Founder of EDE (launched 2022)', 'Pressed for elections and an end to the transition', '2024 indictment (Moïse case) overturned on appeal (October 2025)'],
    },
    tags: [
      { id: 'institutions', note: { ht: 'Mande eleksyon ak yon fen òdone pou tranzisyon an', fr: 'A plaidé pour des élections et une sortie ordonnée de la transition', en: 'Pressed for elections and an orderly end to the transition' } },
    ],
    sources: [HPH, HPH_BRIEF, CEP, { label: 'Wikipedia: Claude Joseph', url: 'https://en.wikipedia.org/wiki/Claude_Joseph', date: '2026-10-30' }],
  },
  {
    id: 'privert',
    name: 'Jocelerme Privert',
    party: 'Ayiti Transfòme',
    partyFull: 'Ayiti Transfòme (regwoupman)',
    role: { ht: 'Prezidan pwovizwa, 2016-2017', fr: 'Président provisoire, 2016-2017', en: 'Provisional president, 2016-2017' },
    photo: 'privert.jpg',
    photoCredit: 'Press Service, Office of the Prime Minister of Dominica, 2016, public domain (Wikimedia Commons)',
    bio: {
      ht: 'Jocelerme Privert te fèt an 1953 nan Ti Twou Nip. Kontab, li te travay nan Direksyon Jeneral Enpo a de 1979 a 1999, answit li te Sekretè Deta Finans (2001 a 2002) ak Minis Enteryè (2002 a 2004). Li te senatè Nip (2011 a 2016), prezidan Sena a (14 janvye rive 14 fevriye 2016) epi prezidan pwovizwa Ayiti (14 fevriye 2016 rive 7 fevriye 2017), kote li sipèvize repriz eleksyon 2016 la. Kanada mete sanksyon sou li an fevriye 2023 pou « koripsyon enpòtan » ak akizasyon sipò pou gang, sa li konteste piblikman.',
      fr: 'Jocelerme Privert est né en 1953 à Petit-Trou-de-Nippes. Comptable, il a travaillé à la Direction générale des impôts de 1979 à 1999, puis a été secrétaire d’État aux Finances (2001 à 2002) et ministre de l’Intérieur (2002 à 2004). Il a été sénateur des Nippes (2011 à 2016), président du Sénat (du 14 janvier au 14 février 2016) et président provisoire d’Haïti (du 14 février 2016 au 7 février 2017), supervisant la reprise des élections de 2016. Le Canada l’a sanctionné en février 2023 pour « corruption significative » et soutien présumé à des gangs, ce qu’il conteste publiquement.',
      en: 'Jocelerme Privert was born in 1953 in Petit-Trou-de-Nippes. An accountant, he worked at the General Tax Directorate from 1979 to 1999, then served as secretary of state for finance (2001 to 2002) and interior minister (2002 to 2004). He was senator for Nippes (2011 to 2016), Senate president (14 January to 14 February 2016) and provisional president of Haiti (14 February 2016 to 7 February 2017), overseeing the 2016 election rerun. Canada sanctioned him in February 2023 for “significant corruption” and alleged support to gangs, which he publicly contests.',
    },
    record: {
      ht: ['Prezidan pwovizwa, 14 fevriye 2016 rive 7 fevriye 2017', 'Prezidan Sena a, janvye-fevriye 2016', 'Senatè Nip, 2011-2016', 'Minis Enteryè, 2002-2004', 'Sanksyon Kanada (fevriye 2023); li konteste yo', DECREE_NOTE.ht],
      fr: ['Président provisoire, du 14 février 2016 au 7 février 2017', 'Président du Sénat, janvier-février 2016', 'Sénateur des Nippes, 2011-2016', 'Ministre de l’Intérieur, 2002-2004', 'Sanctions du Canada (février 2023) ; il les conteste', DECREE_NOTE.fr],
      en: ['Provisional president, 14 February 2016 to 7 February 2017', 'Senate president, January-February 2016', 'Senator for Nippes, 2011-2016', 'Interior minister, 2002-2004', 'Canadian sanctions (February 2023); he contests them', DECREE_NOTE.en],
    },
    term: {
      title: { ht: 'Manda pwovizwa 2016-2017', fr: 'Mandat provisoire 2016-2017', en: 'Provisional term 2016-2017' },
      items: {
        ht: [
          'Asanble Nasyonal la eli l prezidan pwovizwa 14 fevriye 2016 (77 vwa kont 33) apre akò 5-6 fevriye a, pou yon manda 120 jou.',
          'Nonmen yon nouvo CEP nèf manm (13 mas 2016); gouvènman Enex Jean-Charles enstale 28 mas 2016.',
          'Komisyon verifikasyon endepandan li an jwenn vòt 2015 la « malonèt »; CEP anile rezilta prezidansyèl oktòb 2015 yo 6 jen 2016 epi pwograme yon nouvo premye tou.',
          'Manda 120 jou a fini 14 jen 2016 san Palman an vote ni pwolongasyon ni ranplasman; li rete nan pouvwa a « jiskaske Palman an deside otreman ».',
          'Siklòn Matye (4 oktòb 2016, omwen 500 mò) fòse ranvwa eleksyon 9 oktòb la; CEP fikse 20 novanm 2016.',
          'Eleksyon 20 novanm 2016 la: Jovenel Moïse genyen nan premye tou ak anviwon 55,6 %; rezilta final pibliye 3 janvye 2017.',
          'Remèt pouvwa a bay Jovenel Moïse 7 fevriye 2017, nan dat konstitisyonèl la.',
          'Kritik: PHTK akize l manipile CEP a pou refè eleksyon an (« koudeta elektoral »); rete nan pouvwa apre 14 jen 2016 san vòt Palman.',
        ],
        fr: [
          'Élu président provisoire par l’Assemblée nationale le 14 février 2016 (77 voix contre 33) après l’accord des 5-6 février, pour un mandat de 120 jours.',
          'Nomination d’un nouveau CEP de neuf membres (13 mars 2016) ; gouvernement Enex Jean-Charles installé le 28 mars 2016.',
          'Sa commission indépendante de vérification juge le vote de 2015 « malhonnête » ; le CEP annule les résultats présidentiels d’octobre 2015 le 6 juin 2016 et programme un nouveau premier tour.',
          'Le mandat de 120 jours expire le 14 juin 2016 sans vote du Parlement sur une prolongation ou un remplacement ; il reste en fonction « sauf décision contraire du Parlement ».',
          'L’ouragan Matthew (4 octobre 2016, au moins 500 morts) force le report du scrutin du 9 octobre ; le CEP fixe le 20 novembre 2016.',
          'Élection du 20 novembre 2016 : Jovenel Moïse l’emporte au premier tour avec environ 55,6 % ; résultats définitifs publiés le 3 janvier 2017.',
          'Passation du pouvoir à Jovenel Moïse le 7 février 2017, à la date constitutionnelle.',
          'Critiques : le PHTK l’accuse d’avoir manipulé le CEP pour refaire le vote (« coup d’État électoral ») ; maintien au pouvoir après le 14 juin 2016 sans vote parlementaire.',
        ],
        en: [
          'Elected provisional president by the National Assembly on 14 February 2016 (77 votes to 33) under the 5-6 February accord, for a mandate of 120 days.',
          'Named a new nine-member electoral council (13 March 2016); the Enex Jean-Charles government was installed on 28 March 2016.',
          'His independent verification commission found the 2015 vote “dishonest”; the CEP annulled the October 2015 presidential results on 6 June 2016 and scheduled a new first round.',
          'The 120-day mandate expired on 14 June 2016 with no parliamentary vote to extend or replace him; he stayed in office “unless Parliament decides otherwise”.',
          'Hurricane Matthew (4 October 2016, at least 500 deaths) forced the postponement of the 9 October vote; the CEP set 20 November 2016.',
          'The 20 November 2016 election: Jovenel Moïse won outright with about 55.6 %; final results were published on 3 January 2017.',
          'Handed power to Jovenel Moïse on 7 February 2017, on the constitutional date.',
          'Criticism: PHTK accused him of manipulating the CEP to force a rerun (“electoral coup”); he remained in office after 14 June 2016 without a parliamentary vote.',
        ],
      },
    },
    tags: [
      { id: 'institutions', note: { ht: 'Sipèvize repriz eleksyon 2016 la kòm prezidan pwovizwa', fr: 'A supervisé la reprise des élections de 2016 comme président provisoire', en: 'Oversaw the 2016 election rerun as provisional president' } },
    ],
    sources: [HPH, HPH_BRIEF, CEP,
      { label: 'Canada Gazette: SOR/2023-25 (Feb 2023)', url: 'https://gazette.gc.ca/rp-pr/p2/2023/2023-03-01/html/sor-dors25-eng.html', date: '2026-10-30' },
      { label: 'CRS IF10440: Haiti’s political situation (Jan 2017)', url: 'https://www.everycrsreport.com/files/2017-01-06_IF10440_d49e98ffe990d855fa8f713856ea6dcf4c6bfe96.pdf', date: '2026-10-30' },
      { label: 'Wikipedia: Jocelerme Privert', url: 'https://en.wikipedia.org/wiki/Jocelerme_Privert', date: '2026-10-30' }],
  },
  {
    id: 'bodeau',
    name: 'Gary Bodeau',
    party: 'Rekonsilye',
    partyFull: 'Platfòm Rekonsilye (regwoupman)',
    role: { ht: 'Ansyen Prezidan Chanm Depite yo, 2018-2020', fr: 'Ancien président de la Chambre des députés, 2018-2020', en: 'Former president of the Chamber of Deputies, 2018-2020' },
    photo: 'bodeau.jpg',
    photoCredit: 'Lozamar11, CC0 1.0 (Wikimedia Commons)',
    bio: {
      ht: 'Gary Bodeau te fèt an 1977 Pòtoprens. Li te depite Delmas (2016 a 2020) ak prezidan Chanm Depite yo (10 janvye 2018 rive 13 janvye 2020); Platfòm Rekonsilye andose l an septanm 2026. Trezò Etazini mete sanksyon sou li an avril 2023 (Global Magnitsky) pou akizasyon achte vòt ak koripsyon nan nominasyon minis yo, epi Kanada tou. Lè li depoze dokiman li 29 oktòb 2026, li di sekirite se pwoblèm santral la, li pale sou kreyasyon travay ak desantralizasyon, epi li di tranzisyon an « dire twò lontan ».',
      fr: 'Gary Bodeau est né en 1977 à Port-au-Prince. Il a été député de Delmas (2016 à 2020) et président de la Chambre des députés (du 10 janvier 2018 au 13 janvier 2020) ; la Platfòm Rekonsilye l’a investi en septembre 2026. Le Trésor américain l’a sanctionné en avril 2023 (Global Magnitsky) pour des allégations d’achat de votes et de corruption liées à des nominations ministérielles, et le Canada également. En déposant ses pièces le 29 octobre 2026, il a présenté la sécurité comme enjeu central, évoqué la création d’emplois et la décentralisation, et jugé que la transition « a trop duré ».',
      en: 'Gary Bodeau was born in 1977 in Port-au-Prince. He was deputy for Delmas (2016 to 2020) and president of the Chamber of Deputies (10 January 2018 to 13 January 2020); the Platfòm Rekonsilye endorsed him in September 2026. The U.S. Treasury sanctioned him in April 2023 (Global Magnitsky) over alleged vote-buying and bribery tied to ministerial appointments, and Canada did too. Filing his papers on 29 October 2026, he named security as the central issue, spoke of job creation and decentralization, and said the transition “has lasted too long”.',
    },
    record: {
      ht: ['Prezidan Chanm Depite yo, 2018-2020', 'Depite Delmas, 2016-2020', 'Priyorite li deklare (29 oktòb 2026): sekirite, travay, desantralizasyon, san mezi konkrè oswa kalandriye pou kounye a', 'Sanksyon Trezò Etazini (avril 2023) ak Kanada; akizasyon achte vòt ak koripsyon', DECREE_NOTE.ht],
      fr: ['Président de la Chambre des députés, 2018-2020', 'Député de Delmas, 2016-2020', 'Priorités déclarées (29 octobre 2026) : sécurité, emploi, décentralisation, sans mesures concrètes ni calendrier à ce stade', 'Sanctions du Trésor américain (avril 2023) et du Canada ; allégations d’achat de votes et de corruption', DECREE_NOTE.fr],
      en: ['President of the Chamber of Deputies, 2018-2020', 'Deputy for Delmas, 2016-2020', 'Stated priorities (29 October 2026): security, jobs, decentralization, no concrete measures or timelines yet', 'Sanctions by the U.S. Treasury (April 2023) and Canada; vote-buying and bribery allegations', DECREE_NOTE.en],
    },
    tags: [
      { id: 'security', note: { ht: 'Deklare sekirite kòm pwoblèm santral (29 oktòb 2026)', fr: 'A présenté la sécurité comme enjeu central (29 octobre 2026)', en: 'Named security as the central issue (29 October 2026)' } },
      { id: 'economy', note: { ht: 'Pale sou kreyasyon travay lè li depoze kandidati li', fr: 'A évoqué la création d’emplois au dépôt de sa candidature', en: 'Spoke of job creation when filing his candidacy' } },
      { id: 'institutions', note: { ht: 'Dirije Chanm Depite yo; pwogram rekonsilyasyon ak desantralizasyon', fr: 'A dirigé la Chambre des députés ; programme de réconciliation et de décentralisation', en: 'Led the Chamber of Deputies; reconciliation and decentralization platform' } },
    ],
    sources: [HPH, HPH_BRIEF, CEP,
      { label: 'U.S. Treasury: press release jy1389 (Apr 2023)', url: 'https://home.treasury.gov/news/press-releases/jy1389', date: '2026-10-30' },
      { label: 'HPN: Gary Bodeau dépose ses pièces au BED (29 oct 2026)', url: 'https://www.hpninfo.com/post/ha%C3%AFti-%C3%A9lections-gary-bodeau-d%C3%A9pose-ses-pi%C3%A8ces-au-bed-et-appelle-%C3%A0-sortir-de-la-transition', date: '2026-10-30' }, { label: 'Wikipedia: Gary Bodeau', url: 'https://en.wikipedia.org/wiki/Gary_Bodeau', date: '2026-11-04' }, { label: 'Wikipedia: 2026 Haitian general election', url: 'https://en.wikipedia.org/wiki/2026_Haitian_general_election', date: '2026-11-04' }],
  },
  {
    id: 'jeudy',
    name: 'Wilson Jeudy',
    party: 'VAR',
    partyFull: 'Vision-Action-Réalisation',
    role: { ht: 'Majistra Delmas depi 2006', fr: 'Maire de Delmas depuis 2006', en: 'Mayor of Delmas since 2006' },
    photo: 'jeudy.png',
    photoCredit: 'OlistikBlok, CC BY-SA 4.0 (Wikimedia Commons)',
    status: {
      ht: 'Yon rapò laprès (18 oktòb 2026) di li ta chwazi rete majistra Delmas olye li kandida; rejis CEP a (30 oktòb) toujou mete l anba VAR. N ap verifye.',
      fr: 'Un article de presse (18 octobre 2026) indique qu’il aurait choisi de rester maire de Delmas plutôt que de se présenter ; le registre du CEP (30 octobre) le maintient sous VAR. En cours de vérification.',
      en: 'A press report (18 October 2026) says he may have chosen to keep the Delmas mayoralty rather than run; the CEP registry (30 October) still lists him under VAR. Being verified.',
    },
    bio: {
      ht: 'Wilson Jeudy se majistra komin Delmas depi 2006, kote li konn pou travay wout, kanal drenaj, mache ak espas piblik. Li te kandida prezidan nan eleksyon 2010 a 2011 la anba FORCE 2010 epi li te jwenn 6 076 vòt (0,57 %) nan premye tou a, san li pa pase nan dezyèm tou a. VAR, ki lanse an avril 2026, mete aksan sou sekirite, responsablite ak relans ekonomik. Li anrejistre nan CEP anba banyè VAR.',
      fr: 'Wilson Jeudy est maire de Delmas depuis 2006, connu pour ses travaux de voirie, de drainage, de marchés et d’espaces publics. Candidat à la présidentielle de 2010 à 2011 sous FORCE 2010, il a obtenu 6 076 voix (0,57 %) au premier tour, sans accéder au second. VAR, lancé en avril 2026, met l’accent sur la sécurité, la redevabilité et la relance économique. Il est inscrit au CEP sous la bannière VAR.',
      en: 'Wilson Jeudy has been mayor of Delmas since 2006, known for road, drainage, market and public-space works. He ran for president in the 2010 to 2011 election under FORCE 2010 and received 6,076 votes (0.57 %) in the first round, without reaching the runoff. VAR, launched in April 2026, emphasizes security, accountability and economic recovery. He is registered with the CEP under the VAR banner.',
    },
    record: {
      ht: ['Majistra Delmas, depi 2006', 'Travay wout, drenaj, mache ak plas piblik nan Delmas', 'Kandida prezidan 2010 (FORCE 2010)'],
      fr: ['Maire de Delmas, depuis 2006', 'Travaux de voirie, de drainage, de marchés et de places publiques à Delmas', 'Candidat à la présidentielle de 2010 (FORCE 2010)'],
      en: ['Mayor of Delmas, since 2006', 'Road, drainage, market and public-space works in Delmas', 'Presidential candidate in 2010 (FORCE 2010)'],
    },
    tags: [
      { id: 'infrastructure', note: { ht: 'Wout, drenaj ak mache piblik nan Delmas depi 2006', fr: 'Voirie, drainage et marchés publics à Delmas depuis 2006', en: 'Roads, drainage and public markets in Delmas since 2006' } },
    ],
    sources: [HPH, HPH_BRIEF, CEP, { label: 'Wikipedia: 2010 to 2011 Haitian general election', url: 'https://en.wikipedia.org/wiki/2010%E2%80%9311_Haitian_general_election', date: '2026-11-04' }, { label: 'Wikipedia: 2026 Haitian general election', url: 'https://en.wikipedia.org/wiki/2026_Haitian_general_election', date: '2026-11-04' }],
  },
  {
    id: 'muscadin',
    name: 'Jean Ernest Muscadin',
    party: 'FCN',
    partyFull: 'Fòs Chanjman Nasyonal',
    role: { ht: 'Komisè Gouvènman Miragwàn (Nip) depi 2020', fr: 'Commissaire du gouvernement de Miragoâne (Nippes) depuis 2020', en: 'Government commissioner of Miragoâne (Nippes) since 2020' },
    photo: 'muscadin.jpg',
    photoCredit: 'Juno7 (13/09/2026), copyright Juno7',
    status: {
      ht: 'Yon rapò laprès (29 oktòb 2026) di BED Lwès I deklare kandidati li pa resevab pou dokiman ki manke. N ap verifye ak CEP.',
      fr: 'Un article de presse (29 octobre 2026) indique que le BED Ouest I a déclaré sa candidature irrecevable pour pièces manquantes. En cours de vérification auprès du CEP.',
      en: 'A press report (29 October 2026) says the BED Ouest I declared his candidacy inadmissible for missing documents. Being verified with the CEP.',
    },
    bio: {
      ht: 'Jean Ernest Muscadin, avoka ki jwenn diplòm dwa li nan Lekòl Dwa ak Syans Ekonomik Okay (2004), se komisè gouvènman (chèf pakè) Miragwàn depi 2020, ak yon dosye di kont gang; FCN andose l an septanm 2026. Òganizasyon dwa moun kritike l pou arestasyon manifestan ak itilizasyon fòs; Ministè Jistis la te reprimande l an 2023. Yon rapò Nasyonzini (novanm 2025) akize l pou omwen 28 egzekisyon somè moun yo sispèk nan gang, sa li defann (« asasen, teworis »); plizyè milye moun manifeste pou sipòte l nan Miragwàn.',
      fr: 'Jean Ernest Muscadin, avocat titulaire d’une licence en droit de l’École de droit et des sciences économiques des Cayes (2004), est commissaire du gouvernement (chef du parquet) de Miragoâne depuis 2020, avec une ligne dure contre les gangs ; le FCN l’a investi en septembre 2026. Des organisations de droits humains l’ont critiqué pour des arrestations de manifestants et l’usage de la force ; le ministère de la Justice l’a réprimandé en 2023. Un rapport de l’ONU (novembre 2025) l’accuse d’au moins 28 exécutions sommaires de membres présumés de gangs, ce qu’il assume (« assassins, terroristes ») ; des milliers de personnes ont manifesté en sa faveur à Miragoâne.',
      en: 'Jean Ernest Muscadin, a lawyer with a law degree from the École de Droit et des Sciences Économiques des Cayes (2004), has been government commissioner (chief prosecutor) of Miragoâne since 2020, with a hardline anti-gang record; FCN endorsed him in September 2026. Rights groups criticized him over arrests of demonstrators and use of force; the Justice Ministry reprimanded him in 2023. A UN report (November 2025) accused him of at least 28 summary executions of suspected gang members, which he has defended (“murderers, terrorists”); thousands marched in his support in Miragoâne.',
    },
    record: {
      ht: ['Komisè Gouvènman Miragwàn, depi 2020', 'Dosye di kont gang nan Nip', 'Reprimande pa Ministè Jistis la (2023)', 'Rapò ONU novanm 2025: omwen 28 egzekisyon somè akize; li defann aksyon li yo', 'Manifestasyon sipò nan Miragwàn (2025)'],
      fr: ['Commissaire du gouvernement de Miragoâne, depuis 2020', 'Ligne dure contre les gangs dans les Nippes', 'Réprimandé par le ministère de la Justice (2023)', 'Rapport de l’ONU de novembre 2025 : au moins 28 exécutions sommaires alléguées ; il assume ses actions', 'Manifestations de soutien à Miragoâne (2025)'],
      en: ['Government commissioner of Miragoâne, since 2020', 'Hardline anti-gang record in Nippes', 'Reprimanded by the Justice Ministry (2023)', 'November 2025 UN report: at least 28 alleged summary executions; he defends his actions', 'Support demonstrations in Miragoâne (2025)'],
    },
    tags: [
      { id: 'security', note: { ht: 'Dosye di kont gang kòm komisè gouvènman Miragwàn', fr: 'Ligne dure contre les gangs comme commissaire du gouvernement de Miragoâne', en: 'Hardline anti-gang record as Miragoâne’s government commissioner' } },
      { id: 'justice', note: { ht: 'Chèf pakè Miragwàn depi 2020', fr: 'Chef du parquet de Miragoâne depuis 2020', en: 'Chief prosecutor of Miragoâne since 2020' } },
    ],
    sources: [HPH, HPH_BRIEF, CEP, { label: 'Wikipedia: Jean Ernest Muscadin', url: 'https://en.wikipedia.org/wiki/Jean_Ernest_Muscadin', date: '2026-10-30' }, { label: 'BINUH: rapports', url: 'https://binuh.unmissions.org/', date: '2026-10-30' }],
  },
  {
    id: 'maxo-joseph',
    name: 'Maxo Joseph',
    party: 'RCH',
    partyFull: 'Réveil des Citoyens Haïtiens',
    photo: 'maxo-joseph.jpg',
    photoCredit: 'Le Nouvelliste (24/09/2026), copyright Le Nouvelliste',
    role: { ht: 'Pastè; kandida prezidan 2015-2016', fr: 'Pasteur ; candidat à la présidentielle 2015-2016', en: 'Pastor; presidential candidate 2015-2016' },
    bio: {
      ht: 'Maxo Joseph se yon pastè ki te deja kandida prezidan nan sik 2015 a 2016 la anba Randevou, kote li te jwenn 5 336 vòt (0,50 %) nan premye tou novanm 2016 la. Li anrejistre nan CEP anba banyè RCH (Réveil des Citoyens Haïtiens), ki lanse an 2023 epi dirijan li yo dekri l kòm sant. Pwogram li pou 2027 poko pibliye.',
      fr: 'Maxo Joseph est un pasteur, déjà candidat à la présidentielle lors du cycle 2015 à 2016 sous Randevou, où il a obtenu 5 336 voix (0,50 %) au premier tour de novembre 2016. Il est inscrit au CEP sous la bannière du RCH (Réveil des Citoyens Haïtiens), lancé en 2023 et qui se décrit comme centriste. Son programme pour 2027 n’est pas encore publié.',
      en: 'Maxo Joseph is a pastor who already ran for president in the 2015 to 2016 cycle under Randevou, receiving 5,336 votes (0.50 %) in the November 2016 first round. He is registered with the CEP under the RCH banner (Réveil des Citoyens Haïtiens), launched in 2023 and described as centrist by its leaders. His 2027 platform has not yet been published.',
    },
    record: { ht: ['Kandida prezidan, sik elektoral 2015-2016'], fr: ['Candidat à la présidentielle, cycle 2015-2016'], en: ['Presidential candidate, 2015-2016 cycle'] },
    tags: [],
    sources: [HPH, HPH_BRIEF, CEP, { label: 'Wikipedia: November 2016 Haitian presidential election', url: 'https://en.wikipedia.org/wiki/November_2016_Haitian_presidential_election', date: '2026-11-04' }],
  },
  {
    id: 'ricardo-jean-pierre', name: 'Ricardo Jean-Pierre', party: 'PANAH', partyFull: 'Parti Nationaliste Haïtien',
    bio: {
      ht: 'Ricardo Jean-Pierre anrejistre nan CEP kòm kandida prezidan anba Parti Nationaliste Haïtien (PANAH) epi non li sou lis kandida deklare pou eleksyon 2026 la. Pa gen enfòmasyon verifye sou edikasyon, karyè ak patisipasyon elektoral li anvan sa, se poutèt sa nou pa site anyen isit la. Pwofil la ap mete ajou.',
      fr: 'Ricardo Jean-Pierre est inscrit au CEP comme candidat à la présidentielle sous la bannière du Parti Nationaliste Haïtien (PANAH) et figure parmi les candidats déclarés pour l’élection de 2026. Aucune information vérifiée sur sa formation, sa carrière ou sa participation électorale antérieure n’a été trouvée ; rien n’est donc avancé ici. Le profil sera mis à jour.',
      en: 'Ricardo Jean-Pierre is registered with the CEP as a presidential candidate under the Parti Nationaliste Haïtien (PANAH) and appears among the declared candidates for the 2026 election. No verified information on his education, career or earlier electoral participation was found, so none is stated here. The profile will be updated.',
    }, record: none, tags: [], sources: [HPH, HPH_BRIEF, CEP, { label: 'Wikipedia: 2026 Haitian general election', url: 'https://en.wikipedia.org/wiki/2026_Haitian_general_election', date: '2026-11-04' }],
  },
  {
    id: 'wilner-joseph', name: 'Wilner Joseph', party: 'Viktwa', partyFull: 'Viktwa (regwoupman)',
    photo: 'wilner-joseph.jpg', photoCredit: 'Le Nouvelliste (29/09/2026), copyright Le Nouvelliste',
    role: { ht: 'Ansyen Sekretè Deta Popilasyon, 2020-2021', fr: 'Ancien secrétaire d’État à la Population, 2020-2021', en: 'Former secretary of state for population, 2020-2021' },
    bio: {
      ht: 'Wilner Joseph te kandida depite nan 3yèm sikonskripsyon Pòtoprens an 2015 (Vérité). Li anrejistre nan CEP anba Viktwa, yon kowalisyon ki di li gen 52 pati manm. Pwogram li poko pibliye.',
      fr: 'Wilner Joseph a été candidat à la députation dans la 3e circonscription de Port-au-Prince en 2015 (Vérité). Il est inscrit au CEP sous Viktwa, une coalition qui déclare 52 partis membres. Son programme n’est pas encore publié.',
      en: 'Wilner Joseph ran for deputy in Port-au-Prince’s 3rd constituency in 2015 (Vérité). He is registered with the CEP under Viktwa, a coalition reporting 52 member parties. His platform has not yet been published.',
    },
    record: { ht: ['Sekretè Deta Popilasyon, 2020-2021', 'Kandida depite Pòtoprens, 2015'], fr: ['Secrétaire d’État à la Population, 2020-2021', 'Candidat à la députation, Port-au-Prince, 2015'], en: ['Secretary of state for population, 2020-2021', 'Candidate for deputy, Port-au-Prince, 2015'] },
    tags: [], sources: [HPH, HPH_BRIEF, CEP, { label: 'Wikipedia: 2026 Haitian general election', url: 'https://en.wikipedia.org/wiki/2026_Haitian_general_election', date: '2026-11-04' }],
  },
  {
    id: 'mourra', name: 'Munir Joseph Mourra', party: 'MPH', partyFull: 'Mobilisation pour le Progrès d’Haïti',
    photo: 'mourra.jpg', photoCredit: 'Le Nouvelliste (19/10/2026), copyright Le Nouvelliste',
    role: { ht: 'Prezidan MPH', fr: 'Président du MPH', en: 'President of MPH' },
    bio: {
      ht: 'Munir Joseph Mourra prezide MPH, yon pati Samir Mourra fonde an 2004 ki te patisipe nan lejislatif 2006 yo epi prezante Jacques Édouard Alexis pou prezidan an 2010. Li anrejistre nan CEP anba banyè MPH. Pati a mete aksan sou relans ekonomik ak refòm enstitisyonèl; pwogram pèsonèl kandida a poko pibliye.',
      fr: 'Munir Joseph Mourra préside le MPH, parti fondé en 2004 par Samir Mourra, qui a participé aux législatives de 2006 et présenté Jacques Édouard Alexis à la présidentielle de 2010. Il est inscrit au CEP sous la bannière du MPH. Le parti met l’accent sur la relance économique et la réforme institutionnelle ; le programme personnel du candidat n’est pas encore publié.',
      en: 'Munir Joseph Mourra presides over MPH, a party founded in 2004 by Samir Mourra that took part in the 2006 legislative elections and fielded Jacques Édouard Alexis for president in 2010. He is registered with the CEP under the MPH banner. The party emphasizes economic recovery and institutional reform; the candidate’s own platform has not yet been published.',
    },
    record: { ht: ['Prezidan pati MPH'], fr: ['Président du parti MPH'], en: ['President of the MPH party'] },
    tags: [], sources: [HPH, HPH_BRIEF, CEP, { label: 'Wikipedia: 2026 Haitian general election', url: 'https://en.wikipedia.org/wiki/2026_Haitian_general_election', date: '2026-11-04' }],
  },
  {
    id: 'dorfeuille', name: 'Gandhy Dorfeuille', party: 'ANF', partyFull: 'Ansanm Nou Fò',
    photo: 'dorfeuille.jpg', photoCredit: 'Vant Bèf Info (21/10/2025), copyright Vant Bèf Info',
    role: { ht: 'Ansyen depite Sen-Lwi-di-Sid/Kavayon', fr: 'Ancien député de Saint-Louis-du-Sud/Cavaillon', en: 'Former deputy for Saint-Louis-du-Sud/Cavaillon' },
    bio: {
      ht: 'Gandhy Dorfeuille te depite Sen-Lwi-di-Sid/Kavayon pandan de lejislati (dènye afilyasyon li nan Palman an: PHTK). Li vin prezidan ANF an out 2025. ANF te patisipe nan eleksyon 2010 a 2011 yo ak Leslie Voltaire kòm kandida prezidan. Pwogram li poko pibliye.',
      fr: 'Gandhy Dorfeuille a été député de Saint-Louis-du-Sud/Cavaillon pendant deux législatures (dernière affiliation parlementaire : PHTK). Il est devenu président de l’ANF en août 2025. L’ANF a participé aux élections de 2010 à 2011 avec Leslie Voltaire comme candidat à la présidence. Son programme n’est pas encore publié.',
      en: 'Gandhy Dorfeuille was deputy for Saint-Louis-du-Sud/Cavaillon for two terms (latest parliamentary affiliation: PHTK). He became ANF president in August 2025. ANF contested the 2010 to 2011 elections with Leslie Voltaire as presidential candidate. His platform has not yet been published.',
    },
    record: { ht: ['Depite Sen-Lwi-di-Sid/Kavayon, de lejislati', 'Prezidan ANF depi out 2025'], fr: ['Député de Saint-Louis-du-Sud/Cavaillon, deux législatures', 'Président de l’ANF depuis août 2025'], en: ['Deputy for Saint-Louis-du-Sud/Cavaillon, two terms', 'ANF president since August 2025'] },
    tags: [], sources: [HPH, HPH_BRIEF, CEP],
  },
  {
    id: 'deronneth', name: 'Déus Déronneth', party: 'DVNH', partyFull: 'Les Démocrates Visionnaires pour la Nouvelle Haïti',
    photo: 'deronneth.jpg', photoCredit: 'Le Nouvelliste (13/10/2026), copyright Le Nouvelliste',
    role: { ht: 'Ekonomis; ansyen depite Marigo', fr: 'Économiste ; ancien député de Marigot', en: 'Economist; former deputy for Marigot' },
    bio: {
      ht: 'Déus Déronneth (CEP: « Deronneth, Deus ») se yon ekonomis, pwofesè inivèsite ak ekriven, ansyen depite Marigo (anba yon lòt afilyasyon) ak ansyen kad administrasyon fiskal la. Li anrejistre nan CEP anba DVNH (Les Démocrates Visionnaires pour la Nouvelle Haïti). Dapre Haiti Policy House, pwogram li mete aksan sou desantralizasyon ak devlopman rejyonal.',
      fr: 'Déus Déronneth (CEP : « Deronneth, Deus ») est économiste, professeur d’université et écrivain, ancien député de Marigot (sous une autre affiliation) et ancien cadre de l’administration fiscale. Il est inscrit au CEP sous la bannière du DVNH (Les Démocrates Visionnaires pour la Nouvelle Haïti). Selon Haiti Policy House, son programme met l’accent sur la décentralisation et le développement régional.',
      en: 'Déus Déronneth (CEP: “Deronneth, Deus”) is an economist, university lecturer and writer, former deputy for Marigot (under a different affiliation) and former tax-administration official. He is registered with the CEP under the DVNH banner (Les Démocrates Visionnaires pour la Nouvelle Haïti). According to Haiti Policy House, his platform emphasizes decentralization and regional development.',
    },
    record: { ht: ['Ansyen depite Marigo', 'Ansyen kad administrasyon fiskal la', 'Pwogram: desantralizasyon ak devlopman rejyonal (dapre HPH)'], fr: ['Ancien député de Marigot', 'Ancien cadre de l’administration fiscale', 'Programme : décentralisation et développement régional (selon HPH)'], en: ['Former deputy for Marigot', 'Former tax-administration official', 'Platform: decentralization and regional development (per HPH)'] },
    tags: [
      { id: 'institutions', note: { ht: 'Pwogram li mete aksan sou desantralizasyon ak devlopman rejyonal', fr: 'Son programme met l’accent sur la décentralisation et le développement régional', en: 'His platform emphasizes decentralization and regional development' } },
    ],
    sources: [HPH, HPH_BRIEF, CEP],
  },
  {
    id: 'adrien', name: 'Daniest Adrien', party: 'PRC', partyFull: 'Parti de la Restauration et du Changement',
    bio: {
      ht: 'Daniest Adrien, medsen, anrejistre nan CEP anba banyè PRC (Parti de la Restauration et du Changement). Enfòmasyon verifye sou edikasyon, karyè ak patisipasyon elektoral li toujou limite, se poutèt sa nou pa site anyen anplis isit la. Pwofil la ap mete ajou.',
      fr: 'Daniest Adrien, médecin, est inscrit au CEP sous la bannière du PRC (Parti de la Restauration et du Changement). Les informations vérifiées sur sa formation, sa carrière et sa participation électorale restent limitées ; rien de plus n’est donc avancé ici. Le profil sera mis à jour.',
      en: 'Daniest Adrien, a physician, is registered with the CEP under the PRC banner (Parti de la Restauration et du Changement). Verified information on his education, career and electoral participation remains limited, so nothing more is stated here. The profile will be updated.',
    },
    record: none, tags: [], sources: [HPH, HPH_BRIEF, CEP],
  },
  {
    id: 'durocher', name: 'Moïse Durocher', party: 'Sol Ayiti', partyFull: 'Solidarité pou Ayiti Respire (regwoupman)',
    photo: 'durocher.jpg', photoCredit: 'Vant Bèf Info (24/09/2026), copyright Vant Bèf Info',
    role: { ht: 'Pwofesè inivèsite; ansyen kad administratif Palè Nasyonal', fr: 'Enseignant universitaire ; ancien cadre administratif du Palais national', en: 'University lecturer; former National Palace administrative official' },
    bio: {
      ht: 'Moïse Durocher, pwofesè inivèsite ak ansyen kad administratif Palè Nasyonal, te chwazi an septanm 2026 pa regwoupman Sol Ayiti (Solidarité pou Ayiti Respire), ki gen 11 pati. Li anrejistre nan CEP anba banyè Sol Ayiti. Pwogram li poko pibliye.',
      fr: 'Moïse Durocher, enseignant universitaire et ancien cadre administratif du Palais national, a été choisi en septembre 2026 par le regroupement Sol Ayiti (Solidarité pou Ayiti Respire), qui compte 11 partis. Il est inscrit au CEP sous la bannière de Sol Ayiti. Son programme n’est pas encore publié.',
      en: 'Moïse Durocher, a university lecturer and former National Palace administrative official, was selected in September 2026 by the 11-party Sol Ayiti grouping (Solidarité pou Ayiti Respire). He is registered with the CEP under the Sol Ayiti banner. His platform has not yet been published.',
    },
    record: { ht: ['Ansyen kad administratif Palè Nasyonal'], fr: ['Ancien cadre administratif du Palais national'], en: ['Former National Palace administrative official'] },
    tags: [], sources: [HPH, HPH_BRIEF, CEP],
  },
  {
    id: 'gue', name: 'Joanas Gué', party: 'Kapab', partyFull: 'Konbit ak Aksyon Pou Ayiti Bèl (regwoupman)',
    role: { ht: 'Agwonòm; ansyen Minis Agrikilti (2010)', fr: 'Agronome ; ancien ministre de l’Agriculture (2010)', en: 'Agronomist; former agriculture minister (2010)' },
    photo: 'gue.jpg', photoCredit: 'USAID / Ben Edwards, 2011, public domain (Wikimedia Commons)',
    bio: {
      ht: 'Joanas Gué se yon agwonòm epi li te antre nan gouvènman Premye Minis Jean-Max Bellerive a kòm Minis Agrikilti, Resous Natirèl ak Devlopman Riral (Sena a te apwouve gouvènman an 9 novanm 2009, anba René Préval). Apre tranblemanntè 12 janvye 2010 la, li te prezante yon plan rekonstriksyon ak reaktivasyon agrikilti ak sipò teknik IICA ak FAO, epi li te vwayaje Wòm ak Kanada pou chèche sipò entènasyonal. Li te youn nan dirijan platfòm Vérité. Pwogram li pou 2027 poko pibliye.',
      fr: 'Joanas Gué est agronome et a rejoint le gouvernement du Premier ministre Jean-Max Bellerive comme ministre de l’Agriculture, des Ressources naturelles et du Développement rural (gouvernement approuvé par le Sénat le 9 novembre 2009, sous René Préval). Après le séisme du 12 janvier 2010, il a présenté un plan de reconstruction et de relance agricole avec l’appui technique de l’IICA et de la FAO, et s’est rendu à Rome et au Canada pour chercher un soutien international. Il a été l’un des dirigeants de la plateforme Vérité. Son programme pour 2027 n’est pas encore publié.',
      en: 'Joanas Gué is an agronomist who joined Prime Minister Jean-Max Bellerive’s government as minister of agriculture, natural resources and rural development (the Senate approved the government on 9 November 2009, under René Préval). After the 12 January 2010 earthquake he presented a plan to rebuild and restart the agricultural sector with technical support from IICA and the FAO, and traveled to Rome and Canada to seek international backing. He was one of the leaders of the Vérité platform. His 2027 platform has not yet been published.',
    },
    record: { ht: ['Minis Agrikilti, Resous Natirèl ak Devlopman Riral, 2010', 'Dirijan platfòm Vérité'], fr: ['Ministre de l’Agriculture, des Ressources naturelles et du Développement rural, 2010', 'Dirigeant de la plateforme Vérité'], en: ['Minister of agriculture, natural resources and rural development, 2010', 'Leader of the Vérité platform'] },
    tags: [
      { id: 'agriculture', note: { ht: 'Ansyen Minis Agrikilti; agwonòm', fr: 'Ancien ministre de l’Agriculture ; agronome', en: 'Former agriculture minister; agronomist' } },
    ],
    sources: [HPH, HPH_BRIEF, CEP, { label: 'IICA: Haiti’s agriculture minister presents reconstruction plan (2010)', url: 'https://iica.int/en/press/news/ministro-de-agricultura-presentara-en-washington-plan-de-reconstruccion-de-agro-2', date: '2026-10-30' }, { label: 'Paperblog: Haïti a un nouveau gouvernement (Nov 2009)', url: 'https://www.paperblog.fr/2510557/haiti-a-un-nouveau-gouvernement/', date: '2026-11-04' }],
  },
  {
    id: 'st-fort', name: 'René St-Fort', party: 'PRN', partyFull: 'Parti Réformiste National',
    photo: 'st-fort.jpg', photoCredit: 'Vant Bèf Info (12/08/2026), copyright Vant Bèf Info',
    role: { ht: 'Avoka; lidè PRN', fr: 'Avocat ; dirigeant du PRN', en: 'Lawyer; PRN leader' },
    bio: {
      ht: 'René St-Fort (CEP: « St Fort, René ») se yon avoka ki dirije PRN (Parti Réformiste National). Li anrejistre nan CEP anba banyè PRN. Pwogram li poko pibliye.',
      fr: 'René St-Fort (CEP : « St Fort, René ») est un avocat qui dirige le PRN (Parti Réformiste National). Il est inscrit au CEP sous la bannière du PRN. Son programme n’est pas encore publié.',
      en: 'René St-Fort (CEP: “St Fort, René”) is a lawyer who leads the PRN (Parti Réformiste National). He is registered with the CEP under the PRN banner. His platform has not yet been published.',
    },
    record: { ht: ['Lidè pati PRN', 'Depoze kandidati prezidansyèl 2010'], fr: ['Dirigeant du PRN', 'Candidature déposée à la présidentielle de 2010'], en: ['Leader of the PRN', 'Filed for the 2010 presidential election'] },
    tags: [], sources: [HPH, HPH_BRIEF, CEP],
  },
  {
    id: 'salomon', name: 'Jean-Marie Junior Salomon', party: 'OPL', partyFull: 'Organisation du Peuple en Lutte',
    photo: 'salomon.jpg', photoCredit: 'Foto ofisyèl OPL, via Satellite509 (26/10/2026)',
    role: { ht: 'Avoka; ansyen senatè Sid (2015)', fr: 'Avocat ; ancien sénateur du Sud (2015)', en: 'Lawyer; former senator for the South (2015)' },
    bio: {
      ht: 'Jean-Marie Junior Salomon, avoka, te etidye nan Lekòl Dwa ak Syans Ekonomik Okay epi li te komisè gouvènman nan Tribinal Premye Enstans Okay soti jiyè 2011 rive li demisyone septanm 2013. Li te eli premye senatè depatman Sid nan lejislatif 2015 yo epi li te okipe pòs nan biwo Sena a, ansanm ak vis-prezidan. Li anrejistre anba OPL an oktòb 2026 (18yèm kandida). Li di sekirite se premye priyorite, answit jistis ak reparasyon pou viktim yo, yon « revolisyon agrikòl » pou tè abandone yo ak yon wòl espesyal pou fanm, epi li vle reyinifye kouran OPL yo.',
      fr: 'Jean-Marie Junior Salomon, avocat, a étudié à l’École de droit et des sciences économiques des Cayes et a été commissaire du gouvernement près le tribunal de première instance des Cayes de juillet 2011 à sa démission en septembre 2013. Élu premier sénateur du département du Sud aux législatives de 2015, il a occupé des fonctions au bureau du Sénat, dont celle de vice-président. Il s’est inscrit sous l’OPL en octobre 2026 (18e candidat). Il place la sécurité en premier, puis la justice et les réparations pour les victimes, une « révolution agricole » pour les terres abandonnées et un rôle particulier pour les femmes, et veut réunifier les courants de l’OPL.',
      en: 'Jean-Marie Junior Salomon, a lawyer, studied at the École de Droit et des Sciences Économiques des Cayes and served as government commissioner at the Les Cayes court of first instance from July 2011 until his resignation in September 2013. Elected first senator for the South department in the 2015 legislative elections, he held posts on the Senate bureau, including vice president. He registered under the OPL in October 2026 (18th candidate). He puts security first, then justice and reparations for victims, an “agricultural revolution” for abandoned farmland and a special role for women, and wants to reunify the OPL’s currents.',
    },
    record: { ht: ['Senatè Sid, eli 2015', 'Priyorite li deklare (30 oktòb 2026): sekirite anvan tout bagay, jistis ak reparasyon, agrikilti, fanm'], fr: ['Sénateur du Sud, élu en 2015', 'Priorités déclarées (30 octobre 2026) : sécurité d’abord, justice et réparations, agriculture, femmes'], en: ['Senator for the South, elected 2015', 'Stated priorities (30 October 2026): security first, justice and reparations, agriculture, women'] },
    tags: [
      { id: 'security', note: { ht: 'Di sekirite se premye priyorite: mezi fò kont gang ame', fr: 'Place la sécurité en premier : mesures fortes contre les gangs armés', en: 'Puts security first: strong measures against armed gangs' } },
      { id: 'justice', note: { ht: 'Jistis ak reparasyon pou viktim yo', fr: 'Justice et réparations pour les victimes', en: 'Justice and reparations for victims' } },
      { id: 'agriculture', note: { ht: 'Yon « revolisyon agrikòl » pou tè abandone yo', fr: 'Une « révolution agricole » pour les terres abandonnées', en: 'An “agricultural revolution” for abandoned farmland' } },
    ],
    sources: [CEP, { label: 'Scoop FM: Salomon promet de réunifier l’OPL et de rétablir la sécurité (30 oct 2026)', url: 'https://www.scoopfmhaiti.com/17503/haiti-presidentielle-jean-marie-salomon-promet-de-reunifier-lopl-et-de-retablir-la-securite/', date: '2026-10-30' }, { label: 'Wikipédia: Jean-Marie Junior Salomon', url: 'https://fr.wikipedia.org/wiki/Jean-Marie_Junior_Salomon', date: '2026-10-30' }],
  },
  {
    id: 'tardieu', name: 'Philippe Gérard Jerry Tardieu', party: 'EAPH', partyFull: 'En Avant pour Haïti (regwoupman)',
    photo: 'tardieu.jpg', photoCredit: 'Hugue-Robert Marsan, 2014, CC BY-SA 4.0 (Wikimedia Commons)',
    role: { ht: 'Antreprenè; ansyen depite Petyonvil, 2016-2020', fr: 'Entrepreneur ; ancien député de Pétion-Ville, 2016-2020', en: 'Businessman; former deputy for Pétion-Ville, 2016-2020' },
    bio: {
      ht: 'Jerry Tardieu, antreprenè epi ko-fondatè otèl Royal Oasis la, gen yon metriz nan administrasyon piblik nan Harvard (Kennedy School). Eli an 2015, li te depite Petyonvil (2016 a 2020) epi li dirije En Avant pour Haïti. Nan fen manda CPT a, li pibliye yon lèt ouvè ki mande yon « dyalòg repibliken » pou peryòd apre CPT a ak kondisyon pou eleksyon kredib. Li anrejistre nan CEP an oktòb 2026; pwogram konplè li poko pibliye.',
      fr: 'Jerry Tardieu, entrepreneur et cofondateur de l’hôtel Royal Oasis, est titulaire d’une maîtrise en administration publique de Harvard (Kennedy School). Élu en 2015, il a été député de Pétion-Ville (2016 à 2020) et dirige En Avant pour Haïti. À la fin du mandat du CPT, il a publié une lettre ouverte appelant à un « dialogue républicain » pour l’après-CPT et à des conditions pour des élections crédibles. Inscrit au CEP en octobre 2026 ; son programme complet n’est pas encore publié.',
      en: 'Jerry Tardieu, a businessman and co-founder of the Royal Oasis hotel, holds a master’s in public administration from Harvard (Kennedy School). Elected in 2015, he was deputy for Pétion-Ville (2016 to 2020) and leads En Avant pour Haïti. At the end of the CPT’s mandate he published an open letter calling for a “republican dialogue” for the post-CPT period and for conditions for credible elections. Registered with the CEP in October 2026; his full platform has not yet been published.',
    },
    record: { ht: ['Depite Petyonvil, 2016-2020', 'Lèt ouvè 2026: dyalòg repibliken, eleksyon kredib'], fr: ['Député de Pétion-Ville, 2016-2020', 'Lettre ouverte 2026 : dialogue républicain, élections crédibles'], en: ['Deputy for Pétion-Ville, 2016-2020', '2026 open letter: republican dialogue, credible elections'] },
    tags: [
      { id: 'institutions', note: { ht: 'Mande yon dyalòg repibliken ak kondisyon pou eleksyon kredib (2026)', fr: 'A appelé à un dialogue républicain et à des conditions pour des élections crédibles (2026)', en: 'Called for a republican dialogue and conditions for credible elections (2026)' } },
    ],
    sources: [CEP, { label: 'Le Relief Haïti: Tardieu calls for republican dialogue (2026)', url: 'https://www.lereliefhaiti.com/en/articles/haiti-jerry-tardieu-calls-for-republican-dialogue-to-frame-the-post-cpt-period', date: '2026-10-30' }, { label: 'Wikipedia: Jerry Tardieu', url: 'https://en.wikipedia.org/wiki/Jerry_Tardieu', date: '2026-10-30' }],
  },
  {
    id: 'barrau', name: 'Lucien Olivier Barrau', party: 'MTH', partyFull: 'Mouvement Travailliste Haïtien',
    photo: 'barrau.jpg', photoCredit: 'Le Nouvelliste (27/10/2026), copyright Le Nouvelliste',
    bio: {
      ht: 'Lucien Olivier Barrau anrejistre nan CEP anba banyè MTH (Mouvement Travailliste Haïtien); laprès rapòte l kòm 19yèm kandida a 27 oktòb 2026. Enfòmasyon verifye sou edikasyon, karyè ak patisipasyon elektoral li poko disponib, se poutèt sa nou pa site anyen anplis isit la. Pwofil la ap mete ajou.',
      fr: 'Lucien Olivier Barrau est inscrit au CEP sous la bannière du MTH (Mouvement Travailliste Haïtien) ; la presse l’a signalé comme 19e candidat le 27 octobre 2026. Les informations vérifiées sur sa formation, sa carrière et sa participation électorale ne sont pas encore disponibles ; rien de plus n’est donc avancé ici. Le profil sera mis à jour.',
      en: 'Lucien Olivier Barrau is registered with the CEP under the MTH banner (Mouvement Travailliste Haïtien); the press reported him as the 19th candidate on 27 October 2026. Verified information on his education, career and electoral participation is not yet available, so nothing more is stated here. The profile will be updated.',
    }, record: none, tags: [], sources: [CEP, { label: 'HaitiLibre: Zapping, 27 oct 2026 (19e candidat)', url: 'https://www.haitilibre.com/article-48768-haiti-actualite-zapping.html', date: '2026-10-30' }],
  },
];

export const CANDIDATE_BY_ID: ReadonlyMap<string, Candidate> = new Map(CANDIDATES.map((c) => [c.id, c]));
