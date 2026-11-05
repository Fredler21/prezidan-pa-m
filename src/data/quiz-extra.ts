import type { QuizQuestion } from './quiz';
import type { L10n } from '../types';

/*
 * « Konnen Ayiti »: extra question bank. Same rules as quiz.ts: four options, one right answer,
 * a short self-contained fact, no em or en dashes, neutral topics only (history, geography,
 * symbols, culture, sport, the 1987 Constitution as amended). Every question has a source comment.
 * Constitution article numbers follow the amended text (constituteproject.org, Haiti 2012).
 */
const L = (ht: string, fr: string, en: string): L10n => ({ ht, fr, en });

export const QUIZ_EXTRA: readonly QuizQuestion[] = [
  // source: https://en.wikipedia.org/wiki/Bois_Ca%C3%AFman
  {
    id: 'bois-caiman',
    q: L('Ki moun ki te dirije seremoni Bwa Kayiman nan, nan mwa out 1791?', 'Qui a dirigé la cérémonie du Bois-Caïman, en août 1791 ?', 'Who led the Bois Caïman ceremony in August 1791?'),
    options: ['Makandal', 'Toussaint Louverture', 'Dutty Boukman', 'Jean-Jacques Dessalines'], answer: 2,
    fact: L('Dutty Boukman, yon oungan, te dirije seremoni an. Anpil istoryen konsidere l kòm kòmansman ofisyèl Revolisyon ayisyen an.',
      'Dutty Boukman, un houngan, dirigea la cérémonie. Beaucoup d’historiens la considèrent comme le début officiel de la Révolution haïtienne.',
      'Dutty Boukman, a houngan, led the ceremony. Many historians treat it as the official start of the Haitian Revolution.'),
  },
  // source: https://en.wikipedia.org/wiki/Catherine_Flon
  {
    id: 'catherine-flon',
    q: L('Dapre tradisyon an, ki moun ki te koud premye drapo Ayiti a?', 'Selon la tradition, qui a cousu le premier drapeau d’Haïti ?', 'According to tradition, who sewed Haiti’s first flag?'),
    options: ['Catherine Flon', 'Sanité Bélair', 'Cécile Fatiman', 'Marie-Jeanne Lamartinière'], answer: 0,
    fact: L('Catherine Flon, fiyèl Dessalines, te koud drapo ble ak wouj la nan Kongrè Lakayè a, 18 me 1803, dapre tradisyon an.',
      'Catherine Flon, filleule de Dessalines, aurait cousu le drapeau bleu et rouge au Congrès de l’Arcahaie, le 18 mai 1803, selon la tradition.',
      'Catherine Flon, Dessalines’s goddaughter, is said to have sewn the blue and red flag at the Congress of Arcahaie on 18 May 1803.'),
  },
  // source: https://en.wikipedia.org/wiki/Sanit%C3%A9_B%C3%A9lair
  {
    id: 'sanite-belair',
    q: L('Ki fanm nan lame endijèn nan, madanm Charles Bélair, ki Franse yo te egzekite an 1802?', 'Quelle combattante de la Révolution, épouse de Charles Bélair, fut exécutée par les Français en 1802 ?', 'Which fighter of the Revolution, wife of Charles Bélair, was executed by the French in 1802?'),
    options: ['Catherine Flon', 'Cécile Fatiman', 'Marie-Jeanne Lamartinière', 'Sanité Bélair'], answer: 3,
    fact: L('Sanité Bélair te goumen akote mari l nan lame Toussaint Louverture. Franse yo te egzekite yo toude 5 oktòb 1802.',
      'Sanité Bélair combattit aux côtés de son mari dans l’armée de Toussaint Louverture. Les Français les ont exécutés tous deux le 5 octobre 1802.',
      'Sanité Bélair fought beside her husband in Toussaint Louverture’s army. The French executed them both on 5 October 1802.'),
  },
  // source: https://en.wikipedia.org/wiki/Alexandre_P%C3%A9tion
  {
    id: 'petion-bolivar',
    q: L('Ki gran chèf Amerik Latin Alexandre Pétion te bay refij ak èd an 1815?', 'Quel grand chef d’Amérique latine Alexandre Pétion a-t-il accueilli et soutenu en 1815 ?', 'Which great Latin American leader did Alexandre Pétion shelter and support in 1815?'),
    options: ['José de San Martín', 'Simón Bolívar', 'Francisco de Miranda', 'Miguel Hidalgo'], answer: 1,
    fact: L('Pétion te bay Simón Bolívar refij, zam ak sòlda pou lit li pou endepandans Amerik Latin.',
      'Pétion a donné refuge à Simón Bolívar, avec des armes et des hommes, pour sa lutte en faveur de l’indépendance de l’Amérique latine.',
      'Pétion gave Simón Bolívar refuge, along with arms and men, for his struggle for Latin American independence.'),
  },
  // source: https://en.wikipedia.org/wiki/Henri_Christophe
  {
    id: 'christophe-king',
    q: L('Ki ane Henri Christophe te vin wa nan nò peyi a?', 'En quelle année Henri Christophe est-il devenu roi dans le nord du pays ?', 'In what year did Henri Christophe become king in the north of the country?'),
    options: ['1804', '1807', '1811', '1820'], answer: 2,
    fact: L('Henri Christophe te pran tit wa Henri 1ye an 1811. Wayòm li an te dire jiskaske li mouri an 1820.',
      'Henri Christophe prit le titre de roi Henri Ier en 1811. Son royaume dura jusqu’à sa mort en 1820.',
      'Henri Christophe took the title of King Henri I in 1811. His kingdom lasted until his death in 1820.'),
  },
  // source: https://whc.unesco.org/en/list/180
  {
    id: 'sans-souci-town',
    q: L('Nan ki vil ki gen Palè Sans-Souci, ki Henri Christophe te fè bati?', 'Dans quelle ville se trouve le palais de Sans-Souci, bâti par Henri Christophe ?', 'In which town is the Sans-Souci Palace, built by Henri Christophe?'),
    options: [L('Okap', 'Cap-Haïtien', 'Cap-Haïtien'), L('Gonayiv', 'Gonaïves', 'Gonaïves'), L('Jakmèl', 'Jacmel', 'Jacmel'), L('Milo', 'Milot', 'Milot')], answer: 3,
    fact: L('Palè Sans-Souci a, ansanm ak Sitadèl Laferyè ak Ramye yo, fòme Pak nasyonal istorik la. UNESCO mete l sou lis eritaj mondyal la an 1982.',
      'Le palais de Sans-Souci forme, avec la Citadelle Laferrière et les Ramiers, le Parc national historique. L’UNESCO l’a inscrit au patrimoine mondial en 1982.',
      'The Sans-Souci Palace, together with the Citadelle Laferrière and the Ramiers, forms the National History Park. UNESCO listed it as World Heritage in 1982.'),
  },
  // source: https://en.wikipedia.org/wiki/Saint-Domingue
  {
    id: 'saint-domingue',
    q: L('Ki non koloni franse a te genyen anvan 1804?', 'Comment s’appelait la colonie française avant 1804 ?', 'What was the French colony called before 1804?'),
    options: ['Saint-Domingue', 'Nouvelle-France', 'Saint-Christophe', 'Guyane'], answer: 0,
    fact: L('Saint-Domingue, yo te rele l « Pèl Antiy yo », te okipe tyè lwès zile Ispanyola a.',
      'Saint-Domingue, surnommée « la Perle des Antilles », occupait le tiers ouest de l’île d’Hispaniola.',
      'Saint-Domingue, nicknamed « the Pearl of the Antilles », occupied the western third of the island of Hispaniola.'),
  },
  // source: https://en.wikipedia.org/wiki/Jean-Jacques_Dessalines
  {
    id: 'dessalines-death',
    q: L('Ki ane yo te asasine Dessalines?', 'En quelle année Dessalines a-t-il été assassiné ?', 'In what year was Dessalines assassinated?'),
    options: ['1804', '1806', '1807', '1820'], answer: 1,
    fact: L('Dessalines te mouri 17 oktòb 1806 nan Pon Wouj, nan nò Pòtoprens, pandan li t ap monte al goumen kont rebèl.',
      'Dessalines fut tué le 17 octobre 1806 à Pont-Rouge, au nord de Port-au-Prince, alors qu’il allait combattre des rebelles.',
      'Dessalines was killed on 17 October 1806 at Pont-Rouge, north of Port-au-Prince, while on his way to fight rebels.'),
  },
  // source: https://en.wikipedia.org/wiki/L%C3%A9ger-F%C3%A9licit%C3%A9_Sonthonax
  {
    id: 'sonthonax-1793',
    q: L('Ki komisè franse ki te pwoklame libète esklav yo nan Nò Sendomeng, an out 1793?', 'Quel commissaire français a proclamé la liberté des esclaves dans le Nord de Saint-Domingue, en août 1793 ?', 'Which French commissioner proclaimed freedom for the enslaved in the north of Saint-Domingue in August 1793?'),
    options: ['Étienne Polverel', 'Charles Leclerc', 'Léger-Félicité Sonthonax', 'Donatien de Rochambeau'], answer: 2,
    fact: L('Léger-Félicité Sonthonax te pwoklame libète esklav yo nan Nò an out 1793. Lafrans te aboli esklavaj nan tout koloni li yo an fevriye 1794.',
      'Léger-Félicité Sonthonax proclama la liberté des esclaves dans le Nord en août 1793. La France abolit l’esclavage dans toutes ses colonies en février 1794.',
      'Léger-Félicité Sonthonax proclaimed freedom for the enslaved in the North in August 1793. France abolished slavery in all its colonies in February 1794.'),
  },
  // source: https://en.wikipedia.org/wiki/United_States_occupation_of_Haiti
  {
    id: 'occupation-1915',
    q: L('Ki ane okipasyon ameriken an Ayiti te kòmanse?', 'En quelle année l’occupation américaine d’Haïti a-t-elle commencé ?', 'In what year did the American occupation of Haiti begin?'),
    options: ['1898', '1915', '1925', '1946'], answer: 1,
    fact: L('Marin ameriken yo te debake 28 jiyè 1915. Okipasyon an te fini an 1934.',
      'Les Marines américains ont débarqué le 28 juillet 1915. L’occupation a pris fin en 1934.',
      'US Marines landed on 28 July 1915. The occupation ended in 1934.'),
  },
  // source: Constitution 1987, art. 3
  {
    id: 'flag-colors-art3',
    q: L('Dapre atik 3 Konstitisyon an, ki koulè ki sou drapo Ayiti a?', 'Selon l’article 3 de la Constitution, quelles couleurs porte le drapeau d’Haïti ?', 'According to Article 3 of the Constitution, what colours does Haiti’s flag carry?'),
    options: [L('Ble ak wouj', 'Bleu et rouge', 'Blue and red'), L('Nwa ak wouj', 'Noir et rouge', 'Black and red'), L('Ble, blan ak wouj', 'Bleu, blanc et rouge', 'Blue, white and red'), L('Vèt ak jòn', 'Vert et jaune', 'Green and yellow')], answer: 0,
    fact: L('Atik 3 la dekri drapo a ak de bann orizontal egal, ble anwo, wouj anba, ak blazon nan mitan.',
      'L’article 3 décrit un drapeau à deux bandes horizontales égales, bleu en haut et rouge en bas, avec les armoiries au centre.',
      'Article 3 describes a flag with two equal horizontal bands, blue above and red below, with the coat of arms in the centre.'),
  },
  // source: Constitution 1987, art. 134
  {
    id: 'president-election-art134',
    q: L('Dapre atik 134 Konstitisyon an, ki jan yo eli Prezidan Repiblik la?', 'Selon l’article 134 de la Constitution, comment le Président de la République est-il élu ?', 'According to Article 134 of the Constitution, how is the President of the Republic elected?'),
    options: [L('Pa vòt Asanble nasyonal la', 'Par vote de l’Assemblée nationale', 'By vote of the National Assembly'), L('Pa Sena a sèlman', 'Par le Sénat seul', 'By the Senate alone'), L('Pa nominasyon CEP la', 'Par nomination du CEP', 'By appointment of the CEP'), L('Pa sifraj inivèsèl dirèk', 'Au suffrage universel direct', 'By direct universal suffrage')], answer: 3,
    fact: L('Atik 134 la di se pèp la ki eli Prezidan an dirèkteman, pa sifraj inivèsèl.', 'L’article 134 dit que le Président est élu au suffrage universel direct, donc directement par le peuple.', 'Article 134 says the President is elected by direct universal suffrage, that is, directly by the people.'),
  },
  // source: Constitution 1987, art. 92
  {
    id: 'deputy-term-art92',
    q: L('Konbyen ane manda yon depite dire?', 'Combien d’années dure le mandat d’un député ?', 'How many years does a deputy’s term last?'),
    options: ['3', '4', '5', '6'], answer: 1,
    fact: L('Atik 92 la di depite yo eli pou kat an, epi yo ka reyeli san limit.',
      'L’article 92 prévoit que les députés sont élus pour quatre ans et sont indéfiniment rééligibles.',
      'Article 92 provides that deputies are elected for four years and are indefinitely reyeligible.'),
  },
  // source: Constitution 1987, art. 95
  {
    id: 'senator-term-art95',
    q: L('Konbyen ane manda yon senatè dire?', 'Combien d’années dure le mandat d’un sénateur ?', 'How many years does a senator’s term last?'),
    options: ['4', '5', '6', '8'], answer: 2,
    fact: L('Atik 95 la di senatè yo eli pou sis an, epi yo ka reyeli san limit.',
      'L’article 95 prévoit que les sénateurs sont élus pour six ans et sont indéfiniment rééligibles.',
      'Article 95 provides that senators are elected for six years and are indefinitely reyeligible.'),
  },
  // source: Constitution 1987, art. 98
  {
    id: 'national-assembly-art98',
    q: L('Ki non yo bay reyinyon Chanm depite yo ak Sena a nan yon sèl asanble?', 'Comment s’appelle la réunion de la Chambre des députés et du Sénat en une seule assemblée ?', 'What is the joint meeting of the Chamber of Deputies and the Senate called?'),
    options: [L('Asanble nasyonal', 'Assemblée nationale', 'National Assembly'), L('Kongrè', 'Congrès', 'Congress'), L('Konsèy konstitisyonèl', 'Conseil constitutionnel', 'Constitutional Council'), L('Konsèy elektoral', 'Conseil électoral', 'Electoral Council')], answer: 0,
    fact: L('Atik 98 la di reyinyon de branch Lejislati a nan yon sèl Asanble se Asanble nasyonal la.',
      'L’article 98 prévoit que la réunion en une seule Assemblée des deux branches du Pouvoir législatif constitue l’Assemblée nationale.',
      'Article 98 provides that the meeting of the two branches of the Legislature in a single Assembly constitutes the National Assembly.'),
  },
  // source: https://en.wikipedia.org/wiki/Pic_Macaya
  {
    id: 'pic-macaya-massif',
    q: L('Nan ki mòn Pik Makaya ye?', 'Dans quel massif se trouve le pic Macaya ?', 'In which massif is Pic Macaya?'),
    options: ['Massif de la Selle', 'Montagnes Noires', 'Massif de la Hotte', 'Chaîne des Matheux'], answer: 2,
    fact: L('Pik Makaya, 2 347 mèt, nan Massif de la Hotte, nan sid peyi a. Li nan Pak nasyonal Pik Makaya a.',
      'Le pic Macaya, 2 347 mètres, se dresse dans le massif de la Hotte, dans le sud du pays. Il se trouve dans le parc national Pic Macaya.',
      'Pic Macaya, at 2,347 metres, rises in the Massif de la Hotte in the south of the country. It lies within Pic Macaya National Park.'),
  },
  // source: https://en.wikipedia.org/wiki/Gon%C3%A2ve_Island
  {
    id: 'gonave-island',
    q: L('Ki pi gwo zile ki fè pati Ayiti?', 'Quelle est la plus grande île d’Haïti ?', 'What is Haiti’s largest island?'),
    options: [L('Zile Latòti', 'L’île de la Tortue', 'Tortuga'), L('Zile Lavach', 'L’Île-à-Vache', 'Île-à-Vache'), L('Gwo Kayemit', 'La Grande Cayemite', 'Grande Cayemite'), L('Lagonav', 'La Gonâve', 'La Gonâve')], answer: 3,
    fact: L('Lagonav chita nan Gòlf Lagonav la, nan lwès Pòtoprens, epi li fè pati depatman Lwès.',
      'La Gonâve se trouve dans le golfe de la Gonâve, à l’ouest de Port-au-Prince, et fait partie du département de l’Ouest.',
      'La Gonâve lies in the Gulf of Gonâve, west of Port-au-Prince, and belongs to the Ouest department.'),
  },
  // source: https://www.britannica.com/place/Tortue-Island
  {
    id: 'tortuga-pirates',
    q: L('Ki zile devan kòt nò peyi a ki te yon baz flibistye ak pirat nan 17yèm syèk la?', 'Quelle île au large de la côte nord d’Haïti fut une base de flibustiers et de pirates au XVIIe siècle ?', 'Which island off Haiti’s north coast was a base for buccaneers and pirates in the 17th century?'),
    options: [L('Lagonav', 'La Gonâve', 'La Gonâve'), L('Zile Latòti', 'L’île de la Tortue', 'Tortuga'), L('Zile Lavach', 'L’Île-à-Vache', 'Île-à-Vache'), L('Gwo Kayemit', 'La Grande Cayemite', 'Grande Cayemite')], answer: 1,
    fact: L('Zile Latòti, anfas Pòdepè, te yon baz flibistye ak pirat nan 17yèm syèk la.',
      'L’île de la Tortue, en face de Port-de-Paix, fut une base de flibustiers et de pirates au XVIIe siècle.',
      'Tortuga, facing Port-de-Paix, was a base for buccaneers and pirates in the 17th century.'),
  },
  // source: https://en.wikipedia.org/wiki/Lake_P%C3%A9ligre
  {
    id: 'peligre-river',
    q: L('Ki rivyè yo bare pou fòme Lak Peligre?', 'Quelle rivière est barrée pour former le lac de Péligre ?', 'Which river is dammed to form Lake Péligre?'),
    options: [L('Latibonit', 'L’Artibonite', 'Artibonite'), L('Twarivyè', 'Les Trois Rivières', 'Trois Rivières'), L('Grann Rivyè dinò', 'La Grande Rivière du Nord', 'Grande Rivière du Nord'), L('Rivyè Masak', 'La rivière du Massacre', 'Massacre River')], answer: 0,
    fact: L('Lak Peligre, nan depatman Sant, se yon rezèvwa ki fòme ak baraj sou Latibonit lan. Baraj la pwodui kouran elektrik.',
      'Le lac de Péligre, dans le département du Centre, est un réservoir formé par un barrage sur l’Artibonite. Le barrage produit de l’électricité.',
      'Lake Péligre, in the Centre department, is a reservoir formed by a dam on the Artibonite. The dam produces hydroelectric power.'),
  },
  // source: https://en.wikipedia.org/wiki/Hinche
  {
    id: 'centre-capital',
    q: L('Ki vil ki chèf lye depatman Sant?', 'Quel est le chef-lieu du département du Centre ?', 'What is the chief town of the Centre department?'),
    options: ['Mirebalais', L('Ench', 'Hinche', 'Hinche'), 'Lascahobas', 'Belladère'], answer: 1,
    fact: L('Ench se chèf lye depatman Sant, nan Plato santral la.',
      'Hinche est le chef-lieu du département du Centre, sur le Plateau central.',
      'Hinche is the chief town of the Centre department, on the Central Plateau.'),
  },
  // source: https://www.britannica.com/place/Tortue-Island (Port-de-Paix faces Tortue)
  {
    id: 'nord-ouest-capital',
    q: L('Ki vil ki chèf lye depatman Nòdwès?', 'Quel est le chef-lieu du département du Nord-Ouest ?', 'What is the chief town of the Nord-Ouest department?'),
    options: [L('Fòlibète', 'Fort-Liberté', 'Fort-Liberté'), 'Jean-Rabel', L('Pòdepè', 'Port-de-Paix', 'Port-de-Paix'), 'Môle-Saint-Nicolas'], answer: 2,
    fact: L('Pòdepè, anfas zile Latòti, se chèf lye depatman Nòdwès.',
      'Port-de-Paix, en face de l’île de la Tortue, est le chef-lieu du département du Nord-Ouest.',
      'Port-de-Paix, facing Tortuga, is the chief town of the Nord-Ouest department.'),
  },
  // source: https://en.wikipedia.org/wiki/Miragoane
  {
    id: 'nippes-capital',
    q: L('Ki vil ki chèf lye depatman Nip?', 'Quel est le chef-lieu du département des Nippes ?', 'What is the chief town of the Nippes department?'),
    options: ['Anse-à-Veau', 'Petit-Trou-de-Nippes', L('Jeremi', 'Jérémie', 'Jérémie'), L('Miragwàn', 'Miragoâne', 'Miragoâne')], answer: 3,
    fact: L('Miragwàn, sou kòt Gòlf Lagonav la, se chèf lye depatman Nip.',
      'Miragoâne, sur la côte du golfe de la Gonâve, est le chef-lieu du département des Nippes.',
      'Miragoâne, on the coast of the Gulf of Gonâve, is the chief town of the Nippes department.'),
  },
  // source: https://en.wikipedia.org/wiki/Les_Cayes
  {
    id: 'sud-capital',
    q: L('Ki vil ki chèf lye depatman Sid?', 'Quel est le chef-lieu du département du Sud ?', 'What is the chief town of the Sud department?'),
    options: [L('Okay', 'Les Cayes', 'Les Cayes'), 'Aquin', 'Côteaux', L('Jakmèl', 'Jacmel', 'Jacmel')], answer: 0,
    fact: L('Okay, yon pò sou kòt sid la, se chèf lye depatman Sid.',
      'Les Cayes, port de la côte sud, est le chef-lieu du département du Sud.',
      'Les Cayes, a port on the south coast, is the chief town of the Sud department.'),
  },
  // source: https://en.wikipedia.org/wiki/Fort-Libert%C3%A9
  {
    id: 'nord-est-capital',
    q: L('Ki vil ki chèf lye depatman Nòdès?', 'Quel est le chef-lieu du département du Nord-Est ?', 'What is the chief town of the Nord-Est department?'),
    options: [L('Wanament', 'Ouanaminthe', 'Ouanaminthe'), L('Okap', 'Cap-Haïtien', 'Cap-Haïtien'), L('Twou di Nò', 'Trou-du-Nord', 'Trou-du-Nord'), L('Fòlibète', 'Fort-Liberté', 'Fort-Liberté')], answer: 3,
    fact: L('Fòlibète, bati bò yon gwo baie sou kòt nòdès la, se chèf lye depatman Nòdès.',
      'Fort-Liberté, bâtie au bord d’une grande baie de la côte nord-est, est le chef-lieu du département du Nord-Est.',
      'Fort-Liberté, built beside a large bay on the north-east coast, is the chief town of the Nord-Est department.'),
  },
  // source: https://core-prod.cambridgecore.org (Why Rara Burns Judas during Lent, The Americas 2021)
  {
    id: 'rara-season',
    q: L('Ki lè nan ane a bann rara yo soti nan lari yo pi plis?', 'À quelle période de l’année les bandes de rara sortent-elles surtout dans les rues ?', 'At what time of year do rara bands mainly take to the streets?'),
    options: [L('Nan fen ane a, anvan Nwèl', 'À la fin de l’année, avant Noël', 'At the end of the year, before Christmas'), L('Pandan rekòt kafe a', 'Pendant la récolte du café', 'During the coffee harvest'), L('Pandan Karèm, jouk nan Semèn sent lan', 'Pendant le Carême, jusqu’à la Semaine sainte', 'During Lent, up to Holy Week'), L('Nan mwa jiyè', 'En juillet', 'In July')], answer: 2,
    fact: L('Rara se yon mizik ak yon pwosesyon nan lari ki gen rapò ak tan Karèm ak Pak. Li vin pi fò pandan Semèn sent lan.',
      'Le rara est une musique et un défilé de rue liés au Carême et à Pâques. Il s’intensifie pendant la Semaine sainte.',
      'Rara is a street music and procession tied to Lent and Easter. It intensifies during Holy Week.'),
  },
  // source: https://en.wikipedia.org/wiki/Nemours_Jean-Baptiste
  {
    id: 'kompa-origin',
    q: L('Ki mizisyen yo bay kredi pou konpa dirèk la?', 'Quel musicien est considéré comme le créateur du konpa dirèk ?', 'Which musician is credited with creating konpa dirèk?'),
    options: ['Wyclef Jean', 'Toto Bissainthe', 'Coupé Cloué', 'Nemours Jean-Baptiste'], answer: 3,
    fact: L('Nemours Jean-Baptiste, ki te fonde Ensemble aux Calebasses an 1955, se li yo bay kredi pou konpa dirèk la.',
      'Nemours Jean-Baptiste, qui fonda l’Ensemble aux Calebasses en 1955, est reconnu comme l’inventeur du konpa dirèk.',
      'Nemours Jean-Baptiste, who founded the Ensemble aux Calebasses in 1955, is credited with inventing konpa dirèk.'),
  },
  // source: https://harpers.org/2014/03/carnival-in-jacmel/
  {
    id: 'jacmel-masks',
    q: L('Ki vil ki pi renome pou mask papye mache li yo nan kanaval la?', 'Quelle ville est surtout célèbre pour ses masques en papier mâché au carnaval ?', 'Which city is best known for its papier-mâché carnival masks?'),
    options: [L('Okay', 'Les Cayes', 'Les Cayes'), L('Jakmèl', 'Jacmel', 'Jacmel'), L('Jeremi', 'Jérémie', 'Jérémie'), L('Okap', 'Cap-Haïtien', 'Cap-Haïtien')], answer: 1,
    fact: L('Jakmèl se vil ki pi konnen pou mask ak kreyati papye mache atizan lokal yo fè pou kanaval la.',
      'Jacmel est surtout connue pour les masques et les créatures en papier mâché que ses artisans fabriquent pour le carnaval.',
      'Jacmel is best known for the papier-mâché masks and creatures its artisans make for carnival.'),
  },
  // source: https://haitianartsociety.org/le-centre-d-art
  {
    id: 'centre-d-art',
    q: L('Ki ane yo te louvri Centre d’Art Pòtoprens lan, ki te bay penti ayisyen an gwo elan?', 'En quelle année le Centre d’Art de Port-au-Prince, qui a donné un grand élan à la peinture haïtienne, a-t-il ouvert ?', 'In what year did the Centre d’Art in Port-au-Prince, which gave Haitian painting a major boost, open?'),
    options: ['1904', '1934', '1944', '1964'], answer: 2,
    fact: L('Atis ameriken DeWitt Peters te louvri Centre d’Art la an 1944, ak entelektyèl ak atis ayisyen.',
      'L’artiste américain DeWitt Peters a ouvert le Centre d’Art en 1944, avec des intellectuels et des artistes haïtiens.',
      'The American artist DeWitt Peters opened the Centre d’Art in 1944, together with Haitian intellectuals and artists.'),
  },
  // source: https://www.themodernnovel.org/?p=7156 (Roumain, Gouverneurs de la rosée)
  {
    id: 'gouverneurs-rosee',
    q: L('Ki ekriven ki siyen woman « Gouverneurs de la rosée » (1944)?', 'Quel écrivain a signé le roman « Gouverneurs de la rosée » (1944) ?', 'Which writer wrote the novel « Gouverneurs de la rosée » (Masters of the Dew, 1944)?'),
    options: ['Jacques Stephen Alexis', 'Jean Price-Mars', 'Jacques Roumain', 'Marie Vieux-Chauvet'], answer: 2,
    fact: L('Jacques Roumain te mouri an 1944, epi woman an pibliye kèk mwa apre. Li rakonte sechrès ak konbit nan vilaj peyizan Fonds-Rouge.',
      'Le roman, publié quelques mois après la mort de Jacques Roumain en 1944, raconte la sécheresse et le coumbite dans le village paysan de Fonds-Rouge.',
      'The novel, published a few months after Jacques Roumain’s death in 1944, tells of drought and the coumbite in the peasant village of Fonds-Rouge.'),
  },
  // source: https://caribbeananti-colonialthoughtarchive.domains.trincoll.edu/jean-price-mars
  {
    id: 'price-mars-oncle',
    q: L('Ki ekriven ki siyen « Ainsi parla l’oncle » (1928), yon liv ki valorize kilti popilè ayisyen an?', 'Quel écrivain a signé « Ainsi parla l’oncle » (1928), un livre qui valorise la culture populaire haïtienne ?', 'Which writer wrote « Ainsi parla l’oncle » (1928), a book that celebrates Haitian popular culture?'),
    options: ['Jacques Roumain', 'Oswald Durand', 'Jean Price-Mars', 'Frédéric Marcelin'], answer: 2,
    fact: L('Jean Price-Mars te pibliye « Ainsi parla l’oncle » an 1928, pandan okipasyon ameriken an. Liv la etidye foklò ayisyen an epi li enspire mouvman endijenis la.',
      'Jean Price-Mars publia « Ainsi parla l’oncle » en 1928, pendant l’occupation américaine. Le livre étudie le folklore haïtien et a inspiré le mouvement indigéniste.',
      'Jean Price-Mars published « Ainsi parla l’oncle » in 1928, during the American occupation. The book studies Haitian folklore and inspired the indigenist movement.'),
  },
  // source: https://en.wikipedia.org/wiki/Oswald_Durand
  {
    id: 'choucoune-poet',
    q: L('Ki powèt ki ekri powèm kreyòl « Choucoune » an 1883?', 'Quel poète a écrit le poème créole « Choucoune » en 1883 ?', 'Which poet wrote the Creole poem « Choucoune » in 1883?'),
    options: ['Massillon Coicou', 'Oswald Durand', 'Georges Sylvain', 'Damas Pierre'], answer: 1,
    fact: L('Oswald Durand te ekri « Choucoune » an 1883. Powèm nan vin yon chante popilè, ki chante an plizyè lang.',
      'Oswald Durand a écrit « Choucoune » en 1883. Le poème est devenu une chanson populaire, reprise en plusieurs langues.',
      'Oswald Durand wrote « Choucoune » in 1883. The poem became a popular song, performed in several languages.'),
  },
  // source: https://www.concacaf.com/world-cup-men/article/top-moments-for-concacaf-nations-at-the-fifa-world-cup-1974-86
  {
    id: 'world-cup-1974',
    q: L('Nan ki ane Ayiti te jwe nan Koup di Mond foutbòl la pou premye fwa?', 'En quelle année Haïti a-t-elle disputé la Coupe du monde de football pour la première fois ?', 'In what year did Haiti first play in the football World Cup?'),
    options: ['1966', '1970', '1974', '1978'], answer: 2,
    fact: L('Ayiti te jwe Koup di Mond 1974 an, nan Almay de l’Wès. Li te nan menm gwoup ak Itali, Polòy ak Ajantin.',
      'Haïti a disputé la Coupe du monde 1974, en Allemagne de l’Ouest. Elle était dans le groupe de l’Italie, de la Pologne et de l’Argentine.',
      'Haiti played in the 1974 World Cup in West Germany. It was drawn in a group with Italy, Poland and Argentina.'),
  },
  // source: https://www.irishtimes.com/sport/soccer/international/world-cup-moments-emmanuel-sanon-ends-dino-zoff-s-resistance-1.3479195
  {
    id: 'sanon-goal',
    q: L('Ki jwè ayisyen ki make premye gòl Ayiti nan yon Koup di Mond, kont Itali an 1974?', 'Quel joueur haïtien a marqué le premier but d’Haïti en Coupe du monde, contre l’Italie en 1974 ?', 'Which Haitian player scored Haiti’s first World Cup goal, against Italy in 1974?'),
    options: ['Philippe Vorbe', 'Guy Saint-Vil', 'Ernst Jean-Joseph', 'Emmanuel Sanon'], answer: 3,
    fact: L('Emmanuel Sanon te make nan minit 46 nan match 15 jen 1974 la, e li kase seri 1 142 minit Dino Zoff te fè san li pa pran gòl.',
      'Emmanuel Sanon a marqué à la 46e minute du match du 15 juin 1974, mettant fin aux 1 142 minutes sans but encaissé de Dino Zoff.',
      'Emmanuel Sanon scored in the 46th minute of the 15 June 1974 match, ending Dino Zoff’s run of 1,142 minutes without conceding.'),
  },
  // source: https://en.wikipedia.org/wiki/Haitian_gourde
  {
    id: 'gourde',
    q: L('Ki non lajan Ayiti?', 'Comment s’appelle la monnaie d’Haïti ?', 'What is Haiti’s currency called?'),
    options: ['Peso', L('Goud', 'Gourde', 'Gourde'), L('Dola', 'Dollar', 'Dollar'), L('Lir', 'Livre', 'Livre')], answer: 1,
    fact: L('Goud la se lajan ofisyèl Ayiti. Nan lavi chak jou, anpil moun konte tou an « dola ayisyen », ki vo senk goud.',
      'La gourde est la monnaie officielle d’Haïti. Au quotidien, beaucoup comptent aussi en « dollars haïtiens », qui valent cinq gourdes.',
      'The gourde is Haiti’s official currency. In daily life many people also count in « Haitian dollars », each worth five gourdes.'),
  },
  // source: https://en.wikipedia.org/wiki/Dajab%C3%B3n_River
  {
    id: 'massacre-river',
    q: L('Ki rivyè ki separe Wanament ak Dajabón?', 'Quelle rivière sépare Ouanaminthe de Dajabón ?', 'Which river separates Ouanaminthe from Dajabón?'),
    options: [L('Rivyè Masak', 'La rivière du Massacre', 'Massacre River'), L('Latibonit', 'L’Artibonite', 'Artibonite'), L('Twarivyè', 'Les Trois Rivières', 'Trois Rivières'), L('Grann Rivyè dinò', 'La Grande Rivière du Nord', 'Grande Rivière du Nord')], answer: 0,
    fact: L('Rivyè Masak la fòme yon pati fwontyè ant Ayiti ak Repiblik Dominikèn, ant Wanament ak Dajabón. Non li soti nan yon masak ki te fèt an 1728.',
      'La rivière du Massacre forme une partie de la frontière entre Haïti et la République dominicaine, entre Ouanaminthe et Dajabón. Son nom vient d’un massacre survenu en 1728.',
      'The Massacre River forms part of the border between Haiti and the Dominican Republic, between Ouanaminthe and Dajabón. Its name comes from a killing in 1728.'),
  },
  // source: https://www.themodernnovel.org/?p=7156 (the coumbite in Roumain, Gouverneurs de la rosée)
  {
    id: 'konbit-meaning',
    q: L('Kisa mo « konbit » vle di nan kilti ayisyen an?', 'Que désigne le mot « konbit » dans la culture haïtienne ?', 'What does the word « konbit » mean in Haitian culture?'),
    options: [L('Yon dans kanaval', 'Une danse de carnaval', 'A carnival dance'), L('Yon sòt manje', 'Un plat traditionnel', 'A traditional dish'), L('Yon kalite lajan', 'Une monnaie', 'A currency'), L('Travay an gwoup kote vwazen yo ede youn lòt', 'Un travail collectif où les voisins s’entraident', 'Collective work where neighbours help one another')], answer: 3,
    fact: L('Konbit se yon tradisyon travay an gwoup kote vwazen yo ede youn lòt, souvan nan jaden yo.',
      'Le konbit (coumbite) est une tradition d’entraide où les voisins travaillent ensemble, souvent aux champs.',
      'The konbit (coumbite) is a tradition of mutual aid in which neighbours work together, often in the fields.'),
  },
  // source: https://en.wikipedia.org/wiki/Battle_of_Cr%C3%AAte-%C3%A0-Pierrot
  {
    id: 'crete-a-pierrot',
    q: L('Ki fò Dessalines te defann kont lame franse Leclerc la an mas 1802?', 'Quel fort Dessalines a-t-il défendu contre l’armée française de Leclerc en mars 1802 ?', 'Which fort did Dessalines defend against Leclerc’s French army in March 1802?'),
    options: [L('Fò Lakayè', 'Fort de l’Arcahaie', 'Fort Arcahaie'), L('Kre-a-Pyewo', 'Crête-à-Pierrot', 'Crête-à-Pierrot'), L('Sitadèl Laferyè', 'Citadelle Laferrière', 'Citadelle Laferrière'), L('Fò Jak', 'Fort Jacques', 'Fort Jacques')], answer: 1,
    fact: L('Kre-a-Pyewo, nan vale Latibonit lan, te vin yon sènbòl rezistans. Defansè yo te goumen kont lame franse a pandan plizyè jou, an mas 1802.',
      'Crête-à-Pierrot, dans la vallée de l’Artibonite, est devenu un symbole de résistance. Ses défenseurs ont combattu l’armée française pendant plusieurs jours, en mars 1802.',
      'Crête-à-Pierrot, in the Artibonite valley, became a symbol of resistance. Its defenders fought the French army for several days in March 1802.'),
  },
  // source: https://en.wikipedia.org/wiki/Peace_of_Ryswick
  {
    id: 'ryswick-1697',
    q: L('Ki trete 1697 ki te rekonèt prezans franse nan lwès zile Ispanyola a?', 'Quel traité de 1697 a reconnu la présence française dans l’ouest de l’île d’Hispaniola ?', 'Which 1697 treaty recognised the French presence in the west of the island of Hispaniola?'),
    options: [L('Trete Ryswick', 'Le traité de Ryswick', 'Treaty of Ryswick'), L('Trete Aranjuez', 'Le traité d’Aranjuez', 'Treaty of Aranjuez'), L('Trete Utrecht', 'Le traité d’Utrecht', 'Treaty of Utrecht'), L('Trete Vèsay', 'Le traité de Versailles', 'Treaty of Versailles')], answer: 0,
    fact: L('Trete Ryswick (1697) te rekonèt prezans franse nan lwès Ispanyola. Se trete Aranjuez, an 1777, ki te fikse fwontyè ak pati espanyòl la.',
      'Le traité de Ryswick (1697) a reconnu la présence française dans l’ouest d’Hispaniola. C’est le traité d’Aranjuez, en 1777, qui fixa la frontière avec la partie espagnole.',
      'The Treaty of Ryswick (1697) recognised the French presence in western Hispaniola. The 1777 Treaty of Aranjuez fixed the border with the Spanish part.'),
  },
];
