import { WorkingLanguage } from '../types';

export interface TripTranslationDictionary {
  [englishKey: string]: Record<WorkingLanguage, string>;
}

export const INCLUSIONS_TRANSLATIONS: TripTranslationDictionary = {
  'Private licensed expert Egyptologist guide': {
    ar: 'مرشد سياحي مرخص وخبير بعلم المصريات',
    en: 'Private licensed expert Egyptologist guide',
    de: 'Privater lizenzierter Ägyptologe als Reiseleiter',
    fr: 'Guide égyptologue expert privé agréé',
    es: 'Guía egiptólogo experto privado y con licencia',
    it: 'Guida egittologa privata esperta e certificata',
    pl: 'Prywatny licencjonowany przewodnik egiptolog',
    ru: 'Личный лицензированный гид-египтолог',
    zh: '私人持证埃及学专家导游',
  },
  'VIP air-conditioned private vehicle throughout': {
    ar: 'سيارة خاصة ومكيفة VIP طوال مدة البرنامج',
    en: 'VIP air-conditioned private vehicle throughout',
    de: 'Klimatisiertes VIP-Privatfahrzeug während der gesamten Reise',
    fr: 'Véhicule privé VIP climatisé pendant tout le séjour',
    es: 'Vehículo privado VIP con aire acondicionado durante todo el viaje',
    it: 'Veicolo privato VIP climatizzato per l\'intera durata',
    pl: 'Prywatny klimatyzowany pojazd VIP przez cały czas',
    ru: 'Индивидуальный VIP-транспорт с кондиционером на весь маршрут',
    zh: '行程全程专属VIP空调专车',
  },
  'All entrance fees to listed sites and museums': {
    ar: 'جميع رسوم دخول المزارات والمتاحف المذكورة في البرنامج',
    en: 'All entrance fees to listed sites and museums',
    de: 'Alle Eintrittsgelder für die aufgeführten Stätten und Museen',
    fr: 'Tous les droits d\'entrée pour les sites et musées mentionnés',
    es: 'Todas las entradas a los sitios y museos indicados',
    it: 'Tutti i biglietti d\'ingresso ai siti e musei elencati',
    pl: 'Wszystkie opłaty wstępu do wymienionych zabytków i muzeów',
    ru: 'Все входные билеты в указанные достопримечательности и музеи',
    zh: '行程所列景点及博物馆全部首道门票',
  },
  'Domestic flights (Cairo - Luxor - Cairo)': {
    ar: 'تذاكر الطيران الداخلي (القاهرة - الأقصر - القاهرة)',
    en: 'Domestic flights (Cairo - Luxor - Cairo)',
    de: 'Inlandsflüge (Kairo - Luxor - Kairo)',
    fr: 'Vols intérieurs (Le Caire - Louxor - Le Caire)',
    es: 'Vuelos domésticos (El Cairo - Luxor - El Cairo)',
    it: 'Voli interni (Il Cairo - Luxor - Il Cairo)',
    pl: 'Loty krajowe (Kair - Luksor - Kair)',
    ru: 'Внутренние авиаперелеты (Каир — Луксор — Каир)',
    zh: '埃及国内段机票（开罗 - 卢克索 - 开罗）',
  },
  'Nile Felucca sailing ride': {
    ar: 'جولة فلوكة شراعية في النيل',
    en: 'Nile Felucca sailing ride',
    de: 'Nil-Felucca-Segelfahrt',
    fr: 'Balade en felouque à voile sur le Nil',
    es: 'Paseo en faluca tradicional por el Nilo',
    it: 'Giro in feluca a vela sul Nilo',
    pl: 'Rejs tradycyjną feluką po Nilu',
    ru: 'Прогулка на традиционной парусной фелуке по Нилу',
    zh: '尼罗河传统帆船巡游体验',
  },
  'All breakfasts and highlighted authentic lunches': {
    ar: 'جميع وجبات الإفطار بالإضافة إلى وجبات الغداء المميزة',
    en: 'All breakfasts and highlighted authentic lunches',
    de: 'Alle Frühstücke und ausgewählte authentische Mittagessen',
    fr: 'Tous les petits-déjeuners et déjeuners authentiques sélectionnés',
    es: 'Todos los desayunos y almuerzos tradicionales destacados',
    it: 'Tutte le colazioni e pranzi tipici selezionati',
    pl: 'Wszystkie śniadania oraz wybrane tradycyjne obiady',
    ru: 'Все завтраки и фирменные традиционные обеды',
    zh: '全程酒店早餐及特色地道午餐',
  },
  'Mineral water and refreshing wipes during tours': {
    ar: 'مياه معدنية ومناديل منعشة طوال الجولات اليومية',
    en: 'Mineral water and refreshing wipes during tours',
    de: 'Mineralwasser und Erfrischungstücher während der Touren',
    fr: 'Eau minérale et lingettes rafraîchissantes pendant les visites',
    es: 'Agua mineral y toallitas refrescantes durante las excursiones',
    it: 'Acqua minerale e salviette rinfrescanti durante le visite',
    pl: 'Woda mineralna i chusteczki odświeżające podczas wycieczek',
    ru: 'Бутилированная минеральная вода и освежающие салфетки на экскурсиях',
    zh: '游览期间每日矿泉水与清新湿巾',
  },
  'Airport meet and assist service': {
    ar: 'خدمة الاستقبال والمساعدة في المطار',
    en: 'Airport meet and assist service',
    de: 'Flughafen-Empfang und Betreuungsservice',
    fr: 'Accueil et assistance personnalisée à l\'aéroport',
    es: 'Servicio de bienvenida y asistencia en el aeropuerto',
    it: 'Servizio di accoglienza e assistenza in aeroporto',
    pl: 'Powitanie i asysta na lotnisku',
    ru: 'Встреча и сопровождение в аэропорту',
    zh: '机场专人接送机协助服务',
  },
  'Hotel accommodation with daily breakfast': {
    ar: 'الإقامة الفندقية الفاخرة شاملة الإفطار اليومي',
    en: 'Hotel accommodation with daily breakfast',
    de: 'Hotelübernachtungen inklusive täglichem Frühstück',
    fr: 'Hébergement à l\'hôtel avec petit-déjeuner quotidien',
    es: 'Alojamiento en hotel con desayuno diario incluido',
    it: 'Pernottamento in hotel con colazione inclusa',
    pl: 'Zakwaterowanie w hotelu ze śniadaniem',
    ru: 'Проживание в отеле с ежедневным завтраком',
    zh: '精选酒店住宿含每日早餐',
  },
};

export const EXCLUSIONS_TRANSLATIONS: TripTranslationDictionary = {
  'International flights to/from Egypt': {
    ar: 'تذاكر الطيران الدولي من وإلى مصر',
    en: 'International flights to/from Egypt',
    de: 'Internationale Flüge nach/von Ägypten',
    fr: 'Vols internationaux à destination et en provenance d\'Égypte',
    es: 'Vuelos internacionales hacia/desde Egipto',
    it: 'Voli internazionali da/per l\'Egitto',
    pl: 'Międzynarodowe przeloty do/z Egiptu',
    ru: 'Международные авиабилеты в/из Египта',
    zh: '往返埃及的国际机票',
  },
  'Entry inside the Great Pyramid burial chamber (optional ticket)': {
    ar: 'دخول غرفة الدفن داخل الهرم الأكبر (تذكرة اختيارية)',
    en: 'Entry inside the Great Pyramid burial chamber (optional ticket)',
    de: 'Eintritt in die Grabkammer der Cheops-Pyramide (optionales Ticket)',
    fr: 'Entrée dans la chambre funéraire de la Grande Pyramide (billet optionnel)',
    es: 'Entrada a la cámara funeraria de la Gran Pirámide (boleto opcional)',
    it: 'Ingresso alla camera sepolcrale della Grande Piramide (biglietto opzionale)',
    pl: 'Wejście do komory grobowej Wielkiej Piramidy (bilet opcjonalny)',
    ru: 'Вход в погребальную камеру Великой пирамиды (по желанию)',
    zh: '胡夫大金字塔内部墓室门票（自选自费）',
  },
  'Sunrise Hot Air Balloon ride in Luxor ($75 optional)': {
    ar: 'ركوب منطاد الهواء الساخن في الأقصر وقت الشروق (75$ اختياري)',
    en: 'Sunrise Hot Air Balloon ride in Luxor ($75 optional)',
    de: 'Heißluftballonfahrt zum Sonnenaufgang in Luxor (optional 75 $)',
    fr: 'Vol en montgolfière au lever du soleil à Louxor (75 $ en option)',
    es: 'Paseo en globo aerostático al amanecer en Luxor (75$ opcional)',
    it: 'Volo in mongolfiera all\'alba a Luxor (75$ facoltativo)',
    pl: 'Lot balonem o wschodzie słońca w Luksorze (opcjonalnie 75 USD)',
    ru: 'Полет на воздушном шаре на рассвете в Луксоре (опция $75)',
    zh: '卢克索日出热气球体验（自选项目，约75美元）',
  },
  'Personal tipping for drivers & luggage handlers': {
    ar: 'الإكراميات والمصروفات الشخصية للسائقين وحاملي الحقائب',
    en: 'Personal tipping for drivers & luggage handlers',
    de: 'Persönliche Trinkgelder für Fahrer und Gepäckträger',
    fr: 'Pourboires personnels pour les chauffeurs et bagagistes',
    es: 'Propinas personales para conductores y maleteros',
    it: 'Mance personali per autisti e facchini',
    pl: 'Napiwki osobiste dla kierowców i tragarzy',
    ru: 'Чаевые и личные расходы для водителей и носильщиков',
    zh: '行程中的个人消费及司机行李员小费',
  },
  'Travel and medical insurance': {
    ar: 'وثيقة التأمين الطبي والسفر الشخصي',
    en: 'Travel and medical insurance',
    de: 'Reise- und Krankenversicherung',
    fr: 'Assurance voyage et médicale',
    es: 'Seguro médico y de viaje',
    it: 'Assicurazione medica e di viaggio',
    pl: 'Ubezpieczenie turystyczne i medyczne',
    ru: 'Туристическая и медицинская страховка',
    zh: '旅游及人身医疗意外保险',
  },
  'Egypt entry visa upon arrival': {
    ar: 'رسوم تأشيرة دخول مصر عند الوصول',
    en: 'Egypt entry visa upon arrival',
    de: 'Ägypten-Einreisevisum bei Ankunft',
    fr: 'Frais de visa d\'entrée en Égypte à l\'arrivée',
    es: 'Visado de entrada a Egipto a la llegada',
    it: 'Visto d\'ingresso in Egitto all\'arrivo',
    pl: 'Wiza wjazdowa do Egiptu po przylocie',
    ru: 'Въездная виза в Египет по прибытии',
    zh: '埃及落地入境签证费用',
  },
};

/**
 * Translates an inclusion item based on the selected language
 */
export function translateInclusion(text: string, lang: WorkingLanguage): string {
  if (!text) return '';
  const trimmed = text.trim();
  
  // Direct match
  if (INCLUSIONS_TRANSLATIONS[trimmed] && INCLUSIONS_TRANSLATIONS[trimmed][lang]) {
    return INCLUSIONS_TRANSLATIONS[trimmed][lang];
  }

  // Reverse match (if text is already Arabic or another language, find the key)
  for (const [enKey, dict] of Object.entries(INCLUSIONS_TRANSLATIONS)) {
    if (Object.values(dict).some(val => val.toLowerCase() === trimmed.toLowerCase())) {
      return dict[lang] || enKey;
    }
  }

  return trimmed;
}

/**
 * Translates an exclusion item based on the selected language
 */
export function translateExclusion(text: string, lang: WorkingLanguage): string {
  if (!text) return '';
  const trimmed = text.trim();
  
  // Direct match
  if (EXCLUSIONS_TRANSLATIONS[trimmed] && EXCLUSIONS_TRANSLATIONS[trimmed][lang]) {
    return EXCLUSIONS_TRANSLATIONS[trimmed][lang];
  }

  // Reverse match
  for (const [enKey, dict] of Object.entries(EXCLUSIONS_TRANSLATIONS)) {
    if (Object.values(dict).some(val => val.toLowerCase() === trimmed.toLowerCase())) {
      return dict[lang] || enKey;
    }
  }

  return trimmed;
}

/**
 * Multilingual destination names dictionary
 */
export const DESTINATIONS_TRANSLATIONS: Record<string, Record<WorkingLanguage, string>> = {
  'Cairo & Giza': {
    ar: 'القاهرة والجيزة',
    en: 'Cairo & Giza',
    de: 'Kairo & Gizeh',
    fr: 'Le Caire & Gizeh',
    es: 'El Cairo y Guiza',
    it: 'Il Cairo e Giza',
    pl: 'Kair i Giza',
    ru: 'Каир и Гиза',
    zh: '开罗与吉萨',
  },
  'Luxor (Ancient Thebes)': {
    ar: 'الأقصر (طيبة القديمة)',
    en: 'Luxor (Ancient Thebes)',
    de: 'Luxor (Das antike Theben)',
    fr: 'Louxor (Thèbes antique)',
    es: 'Luxor (Tebas antigua)',
    it: 'Luxor (Antica Tebe)',
    pl: 'Luksor (Starożytne Teby)',
    ru: 'Луксор (Древние Фивы)',
    zh: '卢克索（古底比斯）',
  },
  'Alexandria': {
    ar: 'الإسكندرية عروس البحر المتوسط',
    en: 'Alexandria (Pearl of the Mediterranean)',
    de: 'Alexandria (Perle des Mittelmeers)',
    fr: 'Alexandrie (Perle de la Méditerranée)',
    es: 'Alejandría (Perla del Mediterráneo)',
    it: 'Alessandria (Perla del Mediterraneo)',
    pl: 'Aleksandria (Perła Morza Śródziemnego)',
    ru: 'Александрия (Жемчужина Средиземноморья)',
    zh: '亚历山大（地中海明珠）',
  },
  'Aswan & Nubia': {
    ar: 'أسوان وبلاد النوبة',
    en: 'Aswan & Nubia',
    de: 'Assuan & Nubien',
    fr: 'Assouan et la Nubie',
    es: 'Asuán y Nubia',
    it: 'Aswan e la Nubia',
    pl: 'Asuan i Nubia',
    ru: 'Асуан и Нубия',
    zh: '阿斯旺与努比亚',
  },
  'Hurghada & Red Sea': {
    ar: 'الغردقة والبحر الأحمر',
    en: 'Hurghada & Red Sea',
    de: 'Hurghada & Rotes Meer',
    fr: 'Hurghada & Mer Rouge',
    es: 'Hurghada y Mar Rojo',
    it: 'Hurghada e Mar Rosso',
    pl: 'Hurghada i Morze Czerwone',
    ru: 'Хургада и Красное море',
    zh: '赫尔格达与红海',
  },
  'Sharm El-Sheikh & Sinai': {
    ar: 'شرم الشيخ وسيناء',
    en: 'Sharm El-Sheikh & Sinai',
    de: 'Scharm El-Scheich & Sinai',
    fr: 'Charm el-Cheikh & Sinaï',
    es: 'Sharm El-Sheij y Sinaí',
    it: 'Sharm El-Sheikh e Sinai',
    pl: 'Szarm el-Szejk i Synaj',
    ru: 'Шарм-эль-Шейх и Синай',
    zh: '沙姆沙伊赫与西奈半岛',
  },
};

export function translateDestinationName(name: string, lang: WorkingLanguage): string {
  if (!name) return '';
  const trimmed = name.trim();
  if (DESTINATIONS_TRANSLATIONS[trimmed] && DESTINATIONS_TRANSLATIONS[trimmed][lang]) {
    return DESTINATIONS_TRANSLATIONS[trimmed][lang];
  }
  for (const [key, dict] of Object.entries(DESTINATIONS_TRANSLATIONS)) {
    if (Object.values(dict).some(val => val.toLowerCase() === trimmed.toLowerCase())) {
      return dict[lang] || key;
    }
  }
  return trimmed;
}

/**
 * Multilingual day titles and station names helper
 */
export const TRIP_TEXTS_TRANSLATIONS: Record<string, Record<WorkingLanguage, string>> = {
  'Egypt Pharaohs & Nile Odyssey (5 Days / 4 Nights)': {
    ar: 'رحلة فراعنة مصر وأساطير النيل (5 أيام / 4 ليالٍ)',
    en: 'Egypt Pharaohs & Nile Odyssey (5 Days / 4 Nights)',
    de: 'Ägyptens Pharaonen & Nil-Odyssee (5 Tage / 4 Nächte)',
    fr: 'Pharaons d\'Égypte & Odyssée du Nil (5 jours / 4 nuits)',
    es: 'Faraones de Egipto y Odisea del Nilo (5 días / 4 noches)',
    it: 'Faraoni d\'Egitto e Odissea sul Nilo (5 giorni / 4 notti)',
    pl: 'Faraonowie Egiptu i Odyseja Nilu (5 dni / 4 noce)',
    ru: 'Фараоны Египта и Одиссея по Нилу (5 дней / 4 ночи)',
    zh: '埃及法老与尼罗河史诗之旅（5天4晚）',
  },
  'A breathtaking journey exploring the Great Pyramids of Giza, the Grand Egyptian Museum, Luxor Karnak & Valley of the Kings, and Alexandria Mediterranean treasures.': {
    ar: 'رحلة استثنائية لاستكشاف أهرامات الجيزة العظيمة، المتحف المصري الكبير، معابد الكرنك ووادي الملوك بالأقصر، وكنوز الإسكندرية على ساحل البحر المتوسط.',
    en: 'A breathtaking journey exploring the Great Pyramids of Giza, the Grand Egyptian Museum, Luxor Karnak & Valley of the Kings, and Alexandria Mediterranean treasures.',
    de: 'Eine atemberaubende Reise zu den Großen Pyramiden von Gizeh, dem Großen Ägyptischen Museum, dem Karnak-Tempel & Tal der Könige in Luxor und den Schätzen Alexandrias.',
    fr: 'Un voyage exceptionnel explorant les Grandes Pyramides de Gizeh, le Grand Musée Égyptien, Karnak et la Vallée des Rois à Louxor, et les trésors d\'Alexandrie.',
    es: 'Un viaje inolvidable explorando las Grandes Pirámides de Guiza, el Gran Museo Egipcio, Karnak y el Valle de los Reyes en Luxor, y Alejandría.',
    it: 'Un viaggio straordinario alla scoperta delle Grandi Piramidi di Giza, del Grand Egyptian Museum, di Karnak e della Valle dei Re a Luxor e di Alessandria.',
    pl: 'Niezapomniana podróż odkrywająca Wielkie Piramidy w Gizie, Wielkie Muzeum Egipskie, Luksor i Dolinę Królów oraz skarby Aleksandrii.',
    ru: 'Захватывающее путешествие к Великим пирамидам Гизы, Большому Египетскому музею, храмам Луксора, Долине Царей и сокровищам Александрии.',
    zh: '探索吉萨大金字塔、大埃及博物馆、卢克索卡纳克神庙与帝王谷、以及亚历山大地中海瑰宝的震撼之旅。',
  },
  'Arrival & The Great Pyramids of Giza & The Sphinx': {
    ar: 'الوصول وزيارة أهرامات الجيزة الخالدة وتمثال أبو الهول',
    en: 'Arrival & The Great Pyramids of Giza & The Sphinx',
    de: 'Ankunft & Die Großen Pyramiden von Gizeh & Die Sphinx',
    fr: 'Arrivée & Les Grandes Pyramides de Gizeh & Le Sphinx',
    es: 'Llegada y las Grandes Pirámides de Guiza y la Esfinge',
    it: 'Arrivo e le Grandi Piramidi di Giza e la Sfinge',
    pl: 'Przylot i Wielkie Piramidy w Gizie oraz Sfinks',
    ru: 'Прибытие, Великие пирамиды Гизы и Сфинкс',
    zh: '抵达开罗、吉萨大金字塔与狮身人面像巡礼',
  },
  'Grand Egyptian Museum & Historic Khan El Khalili Bazaar': {
    ar: 'المتحف المصري الكبير وخان الخليلي التاريخي',
    en: 'Grand Egyptian Museum & Historic Khan El Khalili Bazaar',
    de: 'Großes Ägyptisches Museum & Historischer Basar Khan el-Khalili',
    fr: 'Grand Musée Égyptien et le souk historique de Khan El Khalili',
    es: 'Gran Museo Egipcio y el histórico Bazar Jan el-Jalili',
    it: 'Grand Egyptian Museum e il Bazar storico di Khan El Khalili',
    pl: 'Wielkie Muzeum Egipskie i historyczny bazar Chan al-Chalili',
    ru: 'Большой Египетский музей и исторический базар Хан аль-Халили',
    zh: '大埃及博物馆与历史悠久的哈利利集市',
  },
  'Flight to Luxor & Karnak Temple Complex': {
    ar: 'الطيران إلى الأقصر ومجمع معابد الكرنك',
    en: 'Flight to Luxor & Karnak Temple Complex',
    de: 'Flug nach Luxor & Karnak-Tempelkomplex',
    fr: 'Vol vers Louxor & Complexe du temple de Karnak',
    es: 'Vuelo a Luxor y Complejo del Templo de Karnak',
    it: 'Volo per Luxor e il Complesso del Tempio di Karnak',
    pl: 'Lot do Luksoru i Kompleks Świątynny w Karnaku',
    ru: 'Перелет в Луксор и Храмовый комплекс Карнак',
    zh: '飞往卢克索与卡纳克神庙建筑群',
  },
  'Valley of the Kings, Hatshepsut Temple & Colossi of Memnon': {
    ar: 'وادي الملوك ومعبد حتشبسوت وتمثالا ممنون',
    en: 'Valley of the Kings, Hatshepsut Temple & Colossi of Memnon',
    de: 'Tal der Könige, Hatschepsut-Tempel & Memnonkolosse',
    fr: 'Vallée des Rois, Temple d\'Hatchepsout & Colosses de Memnon',
    es: 'Valle de los Reyes, Templo de Hatshepsut y Colosos de Memnón',
    it: 'Valle dei Re, Tempio di Hatshepsut e Colossi di Memnone',
    pl: 'Dolina Królów, Świątynia Hatszepsut i Kolosy Memnona',
    ru: 'Долина Царей, Храм Хатшепсут и Колоссы Мемнона',
    zh: '帝王谷、哈特谢普苏特女王神庙与门农巨像',
  },
  'Alexandria Mediterranean Excursion & Departure': {
    ar: 'جولة الإسكندرية وعروس المتوسط ثم التوديع',
    en: 'Alexandria Mediterranean Excursion & Departure',
    de: 'Ausflug nach Alexandria ans Mittelmeer & Abreise',
    fr: 'Excursion méditerranéenne à Alexandrie & Départ',
    es: 'Excursión mediterránea a Alejandría y salida',
    it: 'Escursione mediterranea ad Alessandria e partenza',
    pl: 'Wycieczka nad Morze Śródziemne do Aleksandrii i wylot',
    ru: 'Экскурсия в Александрию на Средиземное море и вылет',
    zh: '亚历山大地中海一日游与欢送启程',
  },
};

export function translateTripText(text: string, lang: WorkingLanguage): string {
  if (!text) return '';
  const trimmed = text.trim();
  if (TRIP_TEXTS_TRANSLATIONS[trimmed] && TRIP_TEXTS_TRANSLATIONS[trimmed][lang]) {
    return TRIP_TEXTS_TRANSLATIONS[trimmed][lang];
  }
  for (const [key, dict] of Object.entries(TRIP_TEXTS_TRANSLATIONS)) {
    if (Object.values(dict).some(val => val.toLowerCase() === trimmed.toLowerCase())) {
      return dict[lang] || key;
    }
  }
  return trimmed;
}
