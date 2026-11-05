import type { L10n } from '../types';

/*
 * « Konnen Ayiti »: the daily civic quiz. Each question has four options, the index of the right
 * one, and a short fact shown after answering. Facts come from the 1987 Constitution (as amended
 * in 2011), the CEP calendar and well documented history; election questions that depend on the
 * site's data are built at runtime (quizFromContent) so they never go stale.
 * Copy rules: no em or en dashes; proper names keep their own hyphens.
 */
export interface QuizQuestion { id: string; q: L10n; options: (string | L10n)[]; answer: number; fact: L10n }

const L = (ht: string, fr: string, en: string): L10n => ({ ht, fr, en });

export const QUIZ: readonly QuizQuestion[] = [
  {
    id: 'independence-year',
    q: L('Ki ane Ayiti vin endepandan?', 'En quelle année Haïti est-elle devenue indépendante ?', 'In what year did Haiti become independent?'),
    options: ['1791', '1803', '1804', '1825'], answer: 2,
    fact: L('Jean-Jacques Dessalines pwoklame endepandans lan 1ye janvye 1804. Ayiti vin premye repiblik nwa lib nan monn nan.',
      'Jean-Jacques Dessalines a proclamé l’indépendance le 1er janvier 1804. Haïti est devenue la première république noire libre du monde.',
      'Jean-Jacques Dessalines proclaimed independence on 1 January 1804. Haiti became the world’s first free Black republic.'),
  },
  {
    id: 'independence-city',
    q: L('Nan ki vil yo te pwoklame endepandans lan?', 'Dans quelle ville l’indépendance a-t-elle été proclamée ?', 'In which city was independence proclaimed?'),
    options: [L('Okap', 'Cap-Haïtien', 'Cap-Haïtien'), L('Gonayiv', 'Gonaïves', 'Gonaïves'), L('Pòtoprens', 'Port-au-Prince', 'Port-au-Prince'), L('Jakmèl', 'Jacmel', 'Jacmel')], answer: 1,
    fact: L('Se pou sa yo rele Gonayiv « Vil endepandans lan ».', 'C’est pourquoi on appelle les Gonaïves « la Cité de l’Indépendance ».', 'That is why Gonaïves is called « the City of Independence ».'),
  },
  {
    id: 'vertieres',
    q: L('Ki batay, 18 novanm 1803, ki te louvri chemen endepandans lan?', 'Quelle bataille, le 18 novembre 1803, a ouvert la voie à l’indépendance ?', 'Which battle, on 18 November 1803, opened the way to independence?'),
    options: [L('Vètyè', 'Vertières', 'Vertières'), L('Kre-a-Pyewo', 'Crête-à-Pierrot', 'Crête-à-Pierrot'), L('Ravin-a-Koulèv', 'Ravine-à-Couleuvres', 'Ravine-à-Couleuvres'), L('Lakayè', 'L’Arcahaie', 'Arcahaie')], answer: 0,
    fact: L('Lame endijèn nan, anba kòmandman Dessalines, avèk François Capois, bat lame franse a nan Vètyè, toupre Okap.',
      'L’armée indigène, sous le commandement de Dessalines, avec François Capois, a vaincu l’armée française à Vertières, près du Cap.',
      'The Indigenous Army led by Dessalines, with François Capois, defeated the French army at Vertières, near Cap-Haïtien.'),
  },
  {
    id: 'first-leader',
    q: L('Ki moun ki te premye chèf Leta Ayiti endepandan?', 'Qui fut le premier chef d’État d’Haïti indépendante ?', 'Who was the first head of state of independent Haiti?'),
    options: ['Toussaint Louverture', 'Jean-Jacques Dessalines', 'Henri Christophe', 'Alexandre Pétion'], answer: 1,
    fact: L('Dessalines te gouvènè jeneral an 1804, epi li vin anperè sou non Jak 1ye menm ane a.',
      'Dessalines fut gouverneur général en 1804, puis empereur sous le nom de Jacques Ier la même année.',
      'Dessalines was governor general in 1804, then emperor as Jacques I the same year.'),
  },
  {
    id: 'citadelle',
    q: L('Ki moun ki te fè bati Sitadèl Laferyè?', 'Qui a fait construire la Citadelle Laferrière ?', 'Who had the Citadelle Laferrière built?'),
    options: ['Alexandre Pétion', 'Henri Christophe', 'Jean-Pierre Boyer', 'Faustin Soulouque'], answer: 1,
    fact: L('Henri Christophe te fè bati l sou mòn Bonnet a l’Évêque, toupre Milo, pou defann peyi a. UNESCO mete l sou lis eritaj mondyal la an 1982.',
      'Henri Christophe l’a fait bâtir sur le Bonnet à l’Évêque, près de Milot, pour défendre le pays. L’UNESCO l’a inscrite au patrimoine mondial en 1982.',
      'Henri Christophe had it built on the Bonnet à l’Évêque mountain near Milot to defend the country. UNESCO listed it as World Heritage in 1982.'),
  },
  {
    id: 'flag-day',
    q: L('Ki dat yo fete jou drapo a?', 'Quel jour fête-t-on le drapeau ?', 'On what date is Flag Day celebrated?'),
    options: [L('1ye janvye', '1er janvier', '1 January'), L('18 me', '18 mai', '18 May'), L('18 novanm', '18 novembre', '18 November'), L('7 fevriye', '7 février', '7 February')], answer: 1,
    fact: L('Drapo a te fèt 18 me 1803 nan Kongrè Lakayè. 18 me se jou drapo ak inivèsite.',
      'Le drapeau a été créé le 18 mai 1803 au Congrès de l’Arcahaie. Le 18 mai est la fête du Drapeau et de l’Université.',
      'The flag was created on 18 May 1803 at the Congress of Arcahaie. 18 May is the Flag and University Day.'),
  },
  {
    id: 'motto',
    q: L('Ki deviz ki ekri sou drapo Ayiti?', 'Quelle devise figure sur le drapeau d’Haïti ?', 'Which motto appears on Haiti’s flag?'),
    options: ['Liberté, égalité, fraternité', 'L’union fait la force', 'Dieu, patrie, liberté', 'Liberté ou la mort'], answer: 1,
    fact: L('Deviz la sou blazon ki nan mitan drapo a, anba yon pye palmis.', 'La devise est sur les armoiries au centre du drapeau, sous un palmier.', 'The motto sits on the coat of arms in the middle of the flag, beneath a palm tree.'),
  },
  {
    id: 'anthem',
    q: L('Ki non im nasyonal Ayiti?', 'Comment s’appelle l’hymne national d’Haïti ?', 'What is Haiti’s national anthem called?'),
    options: ['La Marseillaise', 'La Dessalinienne', L('Chante Vètyè', 'Chant de Vertières', 'Song of Vertières'), L('Im Lakayè', 'Hymne de l’Arcahaie', 'Hymn of Arcahaie')], answer: 1,
    fact: L('Justin Lhérisson ekri pawòl yo, Nicolas Geffrard konpoze mizik la, an 1903, pou santnè endepandans lan.',
      'Justin Lhérisson en a écrit les paroles et Nicolas Geffrard la musique, en 1903, pour le centenaire de l’indépendance.',
      'Justin Lhérisson wrote the words and Nicolas Geffrard the music, in 1903, for the centenary of independence.'),
  },
  {
    id: 'departments',
    q: L('Konbyen depatman Ayiti genyen?', 'Combien de départements Haïti compte-t-elle ?', 'How many departments does Haiti have?'),
    options: ['9', '10', '11', '12'], answer: 1,
    fact: L('Nip se dènye depatman ki te kreye, an 2003.', 'Les Nippes sont le dernier département créé, en 2003.', 'Nippes is the newest department, created in 2003.'),
  },
  {
    id: 'most-populous',
    q: L('Ki depatman ki gen plis moun?', 'Quel département est le plus peuplé ?', 'Which department has the most people?'),
    options: [L('Lwès', 'Ouest', 'Ouest'), L('Nò', 'Nord', 'Nord'), L('Latibonit', 'Artibonite', 'Artibonite'), L('Sid', 'Sud', 'Sud')], answer: 0,
    fact: L('Dapre estimasyon IHSI 2015, plis pase 4 milyon moun rete nan Lwès, kote Pòtoprens ye.',
      'Selon l’estimation de l’IHSI de 2015, plus de 4 millions de personnes vivent dans l’Ouest, où se trouve Port-au-Prince.',
      'According to the 2015 IHSI estimate, over 4 million people live in Ouest, home to Port-au-Prince.'),
  },
  {
    id: 'nord-capital',
    q: L('Ki vil ki chèf lye depatman Nò?', 'Quel est le chef-lieu du département du Nord ?', 'What is the chief town of the Nord department?'),
    options: [L('Okap', 'Cap-Haïtien', 'Cap-Haïtien'), L('Fòlibète', 'Fort-Liberté', 'Fort-Liberté'), L('Pòdepè', 'Port-de-Paix', 'Port-de-Paix'), L('Ench', 'Hinche', 'Hinche')], answer: 0,
    fact: L('Okap, ansyen Cap-Français, se youn nan pi gwo vil peyi a.', 'Le Cap-Haïtien, l’ancien Cap-Français, est l’une des plus grandes villes du pays.', 'Cap-Haïtien, the former Cap-Français, is one of the country’s largest cities.'),
  },
  {
    id: 'grand-anse-capital',
    q: L('Ki vil ki chèf lye Grandans?', 'Quel est le chef-lieu de la Grand’Anse ?', 'What is the chief town of Grand’Anse?'),
    options: [L('Okay', 'Les Cayes', 'Les Cayes'), L('Jeremi', 'Jérémie', 'Jérémie'), L('Miragwàn', 'Miragoâne', 'Miragoâne'), L('Jakmèl', 'Jacmel', 'Jacmel')], answer: 1,
    fact: L('Yo rele Jeremi « Vil powèt yo » paske anpil ekriven fèt la.', 'On appelle Jérémie « la Cité des poètes » parce que beaucoup d’écrivains y sont nés.', 'Jérémie is called « the City of Poets » because many writers were born there.'),
  },
  {
    id: 'constitution-date',
    q: L('Ki dat pèp la te vote Konstitisyon ki an vigè a?', 'À quelle date le peuple a-t-il approuvé la Constitution en vigueur ?', 'When did the people approve the Constitution in force?'),
    options: [L('7 fevriye 1986', '7 février 1986', '7 February 1986'), L('29 mas 1987', '29 mars 1987', '29 March 1987'), L('16 desanm 1990', '16 décembre 1990', '16 December 1990'), L('1ye janvye 2004', '1er janvier 2004', '1 January 2004')], answer: 1,
    fact: L('Konstitisyon an te apwouve pa referandòm 29 mas 1987, epi yo te amande l an 2011.', 'La Constitution a été approuvée par référendum le 29 mars 1987, puis amendée en 2011.', 'The Constitution was approved by referendum on 29 March 1987 and amended in 2011.'),
  },
  {
    id: 'term-length',
    q: L('Konbyen ane manda yon prezidan dire?', 'Combien d’années dure le mandat présidentiel ?', 'How many years does a presidential term last?'),
    options: ['4', '5', '6', '7'], answer: 1,
    fact: L('Konstitisyon an di yon prezidan pa ka fè de manda youn dèyè lòt, epi li pa janm ka fè yon twazyèm.',
      'La Constitution interdit deux mandats consécutifs et tout troisième mandat.',
      'The Constitution bars two consecutive terms and any third term.'),
  },
  {
    id: 'min-age',
    q: L('Ki laj minimòm pou kandida pou prezidan?', 'Quel est l’âge minimum pour être candidat à la présidence ?', 'What is the minimum age to run for president?'),
    options: ['30', '35', '40', '45'], answer: 1,
    fact: L('Atik 135 Konstitisyon an mande pou kandida a gen 35 an konplè jou eleksyon an, ak lòt kondisyon.',
      'L’article 135 de la Constitution exige 35 ans accomplis le jour de l’élection, entre autres conditions.',
      'Article 135 of the Constitution requires being 35 on election day, among other conditions.'),
  },
  {
    id: 'swearing-in',
    q: L('Ki dat prezidan eli a kòmanse manda li?', 'Quel jour le président élu entre-t-il en fonction ?', 'On what date does the president-elect take office?'),
    options: [L('1ye janvye', '1er janvier', '1 January'), L('7 fevriye', '7 février', '7 February'), L('18 me', '18 mai', '18 May'), L('14 me', '14 mai', '14 May')], answer: 1,
    fact: L('Dapre Konstitisyon an, prezidan eli a antre an fonksyon 7 fevriye apre eleksyon an.', 'Selon la Constitution, le président élu entre en fonction le 7 février suivant l’élection.', 'Under the Constitution, the president-elect takes office on the 7 February after the election.'),
  },
  {
    id: 'cep',
    q: L('Ki enstitisyon ki òganize eleksyon yo?', 'Quelle institution organise les élections ?', 'Which institution runs the elections?'),
    options: [L('Palman an', 'Le Parlement', 'Parliament'), L('CEP, Konsèy Elektoral Pwovizwa', 'Le CEP, Conseil électoral provisoire', 'The CEP, Provisional Electoral Council'), L('Kou Kasasyon', 'La Cour de cassation', 'The Court of Cassation'), L('Ministè Enteryè', 'Le ministère de l’Intérieur', 'The Interior Ministry')], answer: 1,
    fact: L('CEP a pibliye kalandriye a, anrejistre kandida yo, epi bay rezilta ofisyèl yo.', 'Le CEP publie le calendrier, enregistre les candidats et proclame les résultats officiels.', 'The CEP publishes the calendar, registers candidates and announces the official results.'),
  },
  {
    id: 'senators',
    q: L('Konbyen senatè chak depatman genyen?', 'Combien de sénateurs par département ?', 'How many senators does each department have?'),
    options: ['1', '2', '3', '4'], answer: 2,
    fact: L('Ak 10 depatman, Sena a gen 30 senatè.', 'Avec 10 départements, le Sénat compte 30 sénateurs.', 'With 10 departments, the Senate has 30 senators.'),
  },
  {
    id: 'languages',
    q: L('Ki lang ofisyèl Ayiti?', 'Quelles sont les langues officielles d’Haïti ?', 'What are Haiti’s official languages?'),
    options: [L('Franse sèlman', 'Le français seulement', 'French only'), L('Kreyòl ak franse', 'Le créole et le français', 'Creole and French'), L('Kreyòl sèlman', 'Le créole seulement', 'Creole only'), L('Kreyòl, franse ak angle', 'Créole, français et anglais', 'Creole, French and English')], answer: 1,
    fact: L('Atik 5 Konstitisyon an di kreyòl ak franse se lang ofisyèl, epi kreyòl se lang ki ini tout Ayisyen.',
      'L’article 5 de la Constitution fait du créole et du français les langues officielles; le créole est la langue commune de tous les Haïtiens.',
      'Article 5 of the Constitution makes Creole and French the official languages; Creole is the language all Haitians share.'),
  },
  {
    id: 'election-1990',
    q: L('Ki moun ki te genyen eleksyon prezidansyèl 16 desanm 1990 la?', 'Qui a remporté l’élection présidentielle du 16 décembre 1990 ?', 'Who won the presidential election of 16 December 1990?'),
    options: ['Leslie Manigat', 'Jean-Bertrand Aristide', 'Marc Bazin', 'René Préval'], answer: 1,
    fact: L('Se te premye eleksyon prezidansyèl yo konsidere kòm lib apre Konstitisyon 1987 la. Marc Bazin te fini dezyèm.',
      'Ce fut la première présidentielle considérée comme libre après la Constitution de 1987. Marc Bazin est arrivé deuxième.',
      'It was the first presidential election regarded as free after the 1987 Constitution. Marc Bazin came second.'),
  },
  {
    id: 'first-woman',
    q: L('Ki premye fanm ki te prezidan Ayiti?', 'Qui fut la première femme présidente d’Haïti ?', 'Who was Haiti’s first woman president?'),
    options: ['Michèle Pierre-Louis', 'Ertha Pascal-Trouillot', 'Mirlande Manigat', 'Claudette Werleigh'], answer: 1,
    fact: L('Ertha Pascal-Trouillot, jij nan Kou Kasasyon, te prezidan pwovizwa an 1990. Michèle Pierre-Louis ak Claudette Werleigh te premye minis.',
      'Ertha Pascal-Trouillot, juge à la Cour de cassation, fut présidente provisoire en 1990. Michèle Pierre-Louis et Claudette Werleigh ont été Premières ministres.',
      'Ertha Pascal-Trouillot, a Court of Cassation judge, was provisional president in 1990. Michèle Pierre-Louis and Claudette Werleigh served as prime ministers.'),
  },
  {
    id: 'highest-peak',
    q: L('Ki pi wo mòn Ayiti?', 'Quel est le plus haut sommet d’Haïti ?', 'What is Haiti’s highest peak?'),
    options: [L('Pik Lasèl', 'Pic la Selle', 'Pic la Selle'), L('Pik Makaya', 'Pic Macaya', 'Pic Macaya'), L('Mòn Lopital', 'Morne l’Hôpital', 'Morne l’Hôpital'), L('Bonnet a l’Évêque', 'Bonnet à l’Évêque', 'Bonnet à l’Évêque')], answer: 0,
    fact: L('Pik Lasèl rive anviwon 2 680 mèt. Pik Makaya se dezyèm pi wo.', 'Le pic la Selle culmine à environ 2 680 mètres. Le pic Macaya est le deuxième.', 'Pic la Selle rises to about 2,680 metres. Pic Macaya is second.'),
  },
  {
    id: 'largest-lake',
    q: L('Ki pi gwo lak natirèl Ayiti?', 'Quel est le plus grand lac naturel d’Haïti ?', 'What is Haiti’s largest natural lake?'),
    options: [L('Letan Somat', 'L’étang Saumâtre', 'Étang Saumâtre'), L('Lak Peligre', 'Le lac de Péligre', 'Lake Péligre'), L('Letan Miragwàn', 'L’étang de Miragoâne', 'Étang de Miragoâne'), L('Letan Twou Kayiman', 'L’étang Trou Caïman', 'Étang Trou Caïman')], answer: 0,
    fact: L('Letan Somat, yo rele l tou lak Azuei, gen dlo yon ti jan sale, sou fwontyè a. Lak Peligre se yon baraj.',
      'L’étang Saumâtre, aussi appelé lac Azuei, a une eau légèrement salée, près de la frontière. Péligre est un lac de barrage.',
      'Étang Saumâtre, also called Lake Azuei, is slightly salty and lies by the border. Péligre is a reservoir.'),
  },
  {
    id: 'longest-river',
    q: L('Ki pi long rivyè Ayiti?', 'Quel est le plus long fleuve d’Haïti ?', 'What is Haiti’s longest river?'),
    options: [L('Latibonit', 'L’Artibonite', 'The Artibonite'), L('Twa Rivyè', 'Les Trois Rivières', 'Trois Rivières'), L('Gwann Rivyè di Nò', 'La Grande Rivière du Nord', 'Grande Rivière du Nord'), L('Rivyè Gwiz', 'La Rivière Grise', 'Rivière Grise')], answer: 0,
    fact: L('Latibonit pran sous li nan Repiblik Dominikèn epi li wouze plèn Latibonit, gwo grenye diri peyi a.',
      'L’Artibonite prend sa source en République dominicaine et arrose la plaine de l’Artibonite, grenier à riz du pays.',
      'The Artibonite rises in the Dominican Republic and waters the Artibonite plain, the country’s rice bowl.'),
  },
  {
    id: 'coat-of-arms',
    q: L('Ki pye bwa ki sou blazon Ayiti?', 'Quel arbre figure sur les armoiries d’Haïti ?', 'Which tree is on Haiti’s coat of arms?'),
    options: [L('Palmis', 'Le palmiste', 'The royal palm'), L('Mapou', 'Le mapou', 'The kapok tree'), L('Pye mango', 'Le manguier', 'The mango tree'), L('Pye kokoye', 'Le cocotier', 'The coconut palm')], answer: 0,
    fact: L('Yon palmis ak yon bonnèt libète anlè l kanpe nan mitan blazon an, ak kanon ak drapo bò kote l.', 'Un palmiste coiffé du bonnet de la liberté se dresse au centre, entouré de canons et de drapeaux.', 'A royal palm topped by a liberty cap stands in the middle, flanked by cannons and flags.'),
  },
  {
    id: 'toussaint',
    q: L('Nan ki peyi Toussaint Louverture te mouri an prizon?', 'Dans quel pays Toussaint Louverture est-il mort en prison ?', 'In which country did Toussaint Louverture die in prison?'),
    options: [L('Lafrans', 'La France', 'France'), L('Espay', 'L’Espagne', 'Spain'), L('Etazini', 'Les États-Unis', 'The United States'), L('Ayiti', 'Haïti', 'Haiti')], answer: 0,
    fact: L('Lafrans te arete l an 1802. Li mouri nan fò Joux, nan mòn Jura, 7 avril 1803.', 'Arrêté par la France en 1802, il est mort au fort de Joux, dans le Jura, le 7 avril 1803.', 'Arrested by France in 1802, he died at Fort de Joux in the Jura mountains on 7 April 1803.'),
  },
  {
    id: 'soup-joumou',
    q: L('Ki manje Ayisyen manje 1ye janvye pou fete endepandans?', 'Quel plat les Haïtiens mangent-ils le 1er janvier pour fêter l’indépendance ?', 'Which dish do Haitians eat on 1 January to celebrate independence?'),
    options: [L('Diri ak pwa', 'Le riz aux pois', 'Rice and beans'), L('Soup joumou', 'La soupe joumou', 'Soup joumou'), L('Griyo', 'Le griot', 'Griot'), L('Lanbi', 'Le lambi', 'Conch')], answer: 1,
    fact: L('Pandan koloni an, se mèt yo sèlman ki te gen dwa manje l. UNESCO mete soup joumou sou lis eritaj kiltirèl imateryèl limanite an 2021.',
      'Pendant la colonie, seuls les maîtres pouvaient en manger. L’UNESCO a inscrit la soupe joumou au patrimoine culturel immatériel en 2021.',
      'Under slavery only the masters could eat it. UNESCO added soup joumou to the intangible cultural heritage list in 2021.'),
  },
  {
    id: 'taino',
    q: L('Non « Ayiti » soti nan lang ki pèp?', 'De quel peuple vient le nom « Haïti » ?', 'The name « Haiti » comes from which people’s language?'),
    options: [L('Tayino', 'Les Taïnos', 'The Taíno'), L('Panyòl', 'Les Espagnols', 'The Spanish'), L('Fransè', 'Les Français', 'The French'), L('Yowouba', 'Les Yorubas', 'The Yoruba')], answer: 0,
    fact: L('Tayino yo te rele zile a Ayiti, sa vle di « tè mòn wo ».', 'Les Taïnos appelaient l’île Ayiti, « la terre des hautes montagnes ».', 'The Taíno called the island Ayiti, « land of high mountains ».'),
  },
  {
    id: 'boyer-1822',
    q: L('Ki prezidan ki te inifye tout zile a an 1822?', 'Quel président a unifié toute l’île en 1822 ?', 'Which president unified the whole island in 1822?'),
    options: ['Alexandre Pétion', 'Jean-Pierre Boyer', 'Henri Christophe', 'Faustin Soulouque'], answer: 1,
    fact: L('Boyer te dirije tout zile a soti 1822 rive 1844, epi li te aboli esklavaj nan pati lès la.', 'Boyer a dirigé toute l’île de 1822 à 1844 et a aboli l’esclavage dans la partie est.', 'Boyer ruled the whole island from 1822 to 1844 and abolished slavery in the eastern part.'),
  },
  {
    id: 'indemnity',
    q: L('Ki ane Lafrans te fòse Ayiti peye yon « endamnite » pou rekonèt endepandans li?', 'En quelle année la France a-t-elle imposé à Haïti une « indemnité » contre la reconnaissance de son indépendance ?', 'In what year did France force Haiti to pay an « indemnity » for recognising its independence?'),
    options: ['1804', '1825', '1838', '1915'], answer: 1,
    fact: L('Charles X te mande 150 milyon fran; yo te bese l a 90 milyon an 1838. Ayiti te peye dèt sa a pandan plis pase yon syèk.',
      'Charles X exigea 150 millions de francs, ramenés à 90 millions en 1838. Haïti a payé cette dette pendant plus d’un siècle.',
      'Charles X demanded 150 million francs, cut to 90 million in 1838. Haiti paid off the debt over more than a century.'),
  },
  {
    id: 'us-recognition',
    q: L('Ki ane Etazini te rekonèt endepandans Ayiti?', 'En quelle année les États-Unis ont-ils reconnu l’indépendance d’Haïti ?', 'In what year did the United States recognise Haiti’s independence?'),
    options: ['1804', '1825', '1862', '1915'], answer: 2,
    fact: L('Abraham Lincoln te rekonèt Ayiti an 1862. Pita, Etazini te okipe peyi a soti 1915 rive 1934.', 'Abraham Lincoln a reconnu Haïti en 1862. Les États-Unis ont ensuite occupé le pays de 1915 à 1934.', 'Abraham Lincoln recognised Haiti in 1862. The United States later occupied the country from 1915 to 1934.'),
  },
  {
    id: 'capital',
    q: L('Ki kapital Ayiti?', 'Quelle est la capitale d’Haïti ?', 'What is the capital of Haiti?'),
    options: [L('Okap', 'Cap-Haïtien', 'Cap-Haïtien'), L('Pòtoprens', 'Port-au-Prince', 'Port-au-Prince'), L('Gonayiv', 'Gonaïves', 'Gonaïves'), L('Jakmèl', 'Jacmel', 'Jacmel')], answer: 1,
    fact: L('Pòtoprens te vin kapital koloni Sen Domeng an 1770. Jodi a se kapital peyi a ak chèf lye Lwès.', 'Port-au-Prince est devenue la capitale de Saint-Domingue en 1770. C’est aujourd’hui la capitale et le chef-lieu de l’Ouest.', 'Port-au-Prince became the capital of Saint-Domingue in 1770. Today it is the national capital and the chief town of Ouest.'),
  },
  {
    id: 'neighbor',
    q: L('Ak ki peyi Ayiti pataje zile a?', 'Avec quel pays Haïti partage-t-elle son île ?', 'Which country shares the island with Haiti?'),
    options: [L('Kiba', 'Cuba', 'Cuba'), L('Jamayik', 'La Jamaïque', 'Jamaica'), L('Repiblik Dominikèn', 'La République dominicaine', 'The Dominican Republic'), L('Pòtoriko', 'Porto Rico', 'Puerto Rico')], answer: 2,
    fact: L('Zile a rele Ispayola. Ayiti nan pati lwès la, anviwon yon tyè sipèfisi a.', 'L’île s’appelle Hispaniola. Haïti en occupe la partie ouest, environ un tiers de la superficie.', 'The island is Hispaniola. Haiti covers its western part, about a third of the area.'),
  },
];

/** Election questions built from the site's current data, so they follow the CEP calendar and the candidate list. */
export function quizFromContent(p: { firstRound: L10n; otherDates: L10n[]; candidates: number }): QuizQuestion[] {
  const out: QuizQuestion[] = [];
  if (p.otherDates.length >= 3) {
    out.push({
      id: 'first-round-date',
      q: L('Dapre kalandriye CEP la, ki dat premye tou eleksyon prezidansyèl la?', 'Selon le calendrier du CEP, à quelle date a lieu le premier tour de la présidentielle ?', 'According to the CEP calendar, when is the first round of the presidential election?'),
      options: [p.otherDates[0] as L10n, p.firstRound, p.otherDates[1] as L10n, p.otherDates[2] as L10n], answer: 1,
      fact: L('Dat sa yo ka chanje. Gade « Kijan sa mache » pou dènye kalandriye a.', 'Ces dates peuvent changer. Voir « Comment ça marche » pour le calendrier à jour.', 'These dates can change. See « How it works » for the latest calendar.'),
    });
  }
  const n = p.candidates;
  if (n > 3) {
    out.push({
      id: 'candidates-count',
      q: L('Konbyen kandida ki sou Prezidan Pa M kounye a?', 'Combien de candidats figurent sur Prezidan Pa M en ce moment ?', 'How many candidates are on Prezidan Pa M right now?'),
      options: [String(n - 4), String(n), String(n + 3), String(n + 8)], answer: 1,
      fact: L('Yo parèt nan lòd o aza, ak menm fòma kat pou chak moun.', 'Ils apparaissent dans un ordre aléatoire, avec la même carte pour chacun.', 'They appear in random order, with the same card format for everyone.'),
    });
  }
  return out;
}
