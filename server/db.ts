import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  User,
  Trip,
  TripVersion,
  CustomerInquiry,
  TripReview,
  NotificationItem,
  SubscriptionPlan,
  UserSubscription,
  PaymentRequest,
  PromoCode,
  AiUsageData,
  AuditLogItem,
  Campaign,
  AdminAiSettings
} from '../src/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'tourvia_db.json');

export interface DatabaseSchema {
  users: User[];
  userPins: Record<string, string>; // userId -> hashedPin
  sessions: Record<string, { userId: string; expiresAt: number }>;
  trips: Trip[];
  tripVersions: TripVersion[];
  inquiries: CustomerInquiry[];
  reviews: TripReview[];
  notifications: NotificationItem[];
  plans: SubscriptionPlan[];
  subscriptions: UserSubscription[];
  paymentRequests: PaymentRequest[];
  promoCodes: PromoCode[];
  aiUsage: Record<string, AiUsageData>; // userId -> AiUsageData
  auditLogs: AuditLogItem[];
  campaigns: Campaign[];
  adminAiSettings: AdminAiSettings;
  publicLinkViews: Record<string, { token: string; tripId: string; count: number; firstViewAt: string; lastViewAt: string }>;
}

export function hashPin(pin: string): string {
  // Normalize Arabic numerals to Latin
  const normalizedPin = pin.replace(/[٠-٩]/g, d => '0123456789'['٠١٢٣٤٥٦٧٨٩'.indexOf(d)]);
  return crypto.createHash('sha256').update(normalizedPin + '_tourvia_salt_2026').digest('hex');
}

export function generateSecureToken(prefix = 'tv'): string {
  return `${prefix}_${crypto.randomBytes(16).toString('hex')}`;
}

export function generateRecoveryCode(): string {
  return `TRV-${crypto.randomBytes(4).toString('hex').toUpperCase()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

const DEFAULT_PLANS: SubscriptionPlan[] = [
  {
    id: 'plan_free',
    code: 'FREE',
    name: 'Free Explorer',
    nameAr: 'الباقة المجانية',
    description: 'Perfect for testing TOURVIA with 3 lifetime AI travel programs',
    descriptionAr: 'مثالية لتجربة المنصة مع 3 برامج سياحية بالذكاء الاصطناعي مدى الحياة',
    price: 0,
    currency: 'EGP',
    billingPeriod: 'lifetime',
    aiLimit: 3,
    aiUnlimited: false,
    features: ['3 Lifetime AI Trip Generations', 'Up to 3 Destinations per Trip', 'Public Client Web Links', 'Basic Cost Calculation'],
    featuresAr: ['3 برامج سياحية بالذكاء الاصطناعي مدى الحياة', 'حتى 3 وجهات لكل برنامج', 'روابط ويب عامة للعملاء', 'حساب التكاليف الأساسي'],
    maxDestinations: 3,
    exportsAllowed: false,
    brandingAllowed: false,
    teamMembers: 1,
    isActive: true,
  },
  {
    id: 'plan_basic',
    code: 'BASIC',
    name: 'Guide Starter',
    nameAr: 'باقة المرشد الأساسية',
    description: 'For active individual tour guides creating regular itineraries',
    descriptionAr: 'للمرشدين النشطين الراغبين في إنشاء برامج منتظمة وتصدير PDF',
    price: 350,
    currency: 'EGP',
    billingPeriod: 'monthly',
    aiLimit: 15,
    aiUnlimited: false,
    features: ['15 AI Trip Generations / month', 'Up to 5 Destinations per Trip', 'PDF Export & Slide Presentations', 'Custom Inclusions/Exclusions', 'Client Inquiries & Reviews'],
    featuresAr: ['15 برنامج بالذكاء الاصطناعي شهريًا', 'حتى 5 وجهات لكل برنامج', 'تصدير PDF وعروض تقديمية', 'تخصيص المشتملات وغير المشتملات', 'استقبال استفسارات وتقييمات العملاء'],
    maxDestinations: 5,
    exportsAllowed: true,
    brandingAllowed: false,
    teamMembers: 1,
    isActive: true,
  },
  {
    id: 'plan_pro',
    code: 'PRO',
    name: 'Professional Guide',
    nameAr: 'باقة المحترفين (الأكثر شعبية)',
    description: 'High AI quota, White-label branding, interactive maps, and priority support',
    descriptionAr: 'سعة ذكاء اصطناعي عالية، هوية بصرية مخصصة، خرائط تفاعلية، ودعم أولوية',
    price: 750,
    currency: 'EGP',
    billingPeriod: 'monthly',
    aiLimit: 60,
    aiUnlimited: false,
    features: ['60 AI Trip Generations / month', 'Unlimited Destinations & Stations', 'Custom Logo & Brand Colors', 'Interactive Route Maps', 'Detailed Profit Analytics & CSV', 'Priority Verification & Support'],
    featuresAr: ['60 برنامج ذكي شهريًا', 'وجهات ومحطات غير محدودة', 'إضافة شعار وألوان شركتك الخاصة', 'خرائط مسار تفاعلية للمسافر', 'تحليلات أرباح متقدمة وتصدير CSV', 'توثيق ودعم فني متميز'],
    maxDestinations: 10,
    exportsAllowed: true,
    brandingAllowed: true,
    teamMembers: 2,
    isActive: true,
  },
  {
    id: 'plan_premium',
    code: 'PREMIUM',
    name: 'Enterprise / Agency',
    nameAr: 'باقة الشركات والوكالات',
    description: 'Unlimited AI programs, full white-labeling, multi-member teams and campaign tools',
    descriptionAr: 'برامج ذكاء اصطناعي غير محدودة، تخصيص كامل للعلامة التجارية، وفرق عمل',
    price: 1800,
    currency: 'EGP',
    billingPeriod: 'monthly',
    aiLimit: 9999,
    aiUnlimited: true,
    features: ['Unlimited AI Trip Generations', 'Full White-Label Client Experience', 'Team Multi-User Access (Up to 10 Guides)', 'Advanced Campaign & Promo Engine', 'Dedicated Account Manager'],
    featuresAr: ['توليد برامج ذكاء اصطناعي غير محدود', 'تجربة عميل مخصصة بالكامل باسم وكالتك', 'دعم فرق العمل حتى 10 مرشدين', 'محرك حملات تسويقية وأكواد خصم', 'مدير حساب مخصص'],
    maxDestinations: 20,
    exportsAllowed: true,
    brandingAllowed: true,
    teamMembers: 10,
    isActive: true,
  },
];

const DEFAULT_PROMOS: PromoCode[] = [
  {
    id: 'promo_welcome50',
    code: 'WELCOME50',
    discountPercent: 50,
    startDate: '2026-01-01',
    expiryDate: '2027-12-31',
    maxUses: 500,
    usedCount: 12,
    minOrderAmount: 300,
    maxDiscountAmount: 400,
    isActive: true,
  },
  {
    id: 'promo_guide2026',
    code: 'TOURVIA2026',
    fixedDiscount: 100,
    startDate: '2026-01-01',
    expiryDate: '2026-12-31',
    maxUses: 1000,
    usedCount: 38,
    minOrderAmount: 350,
    isActive: true,
  },
];

const INITIAL_ADMIN: User = {
  id: 'usr_admin_master',
  name: 'TOURVIA Super Admin',
  email: 'admin@tourvia.app',
  phone: '+201000000001',
  accountType: 'admin',
  workingLanguages: ['ar', 'en'],
  verificationStatus: 'VERIFIED',
  recoveryCode: 'TRV-ADMIN-MASTER-99',
  role: 'admin',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const INITIAL_GUIDE: User = {
  id: 'usr_guide_tamer',
  name: 'Tamer El-Masry (تامر المصري)',
  email: 'tamer.guide@tourvia.app',
  phone: '+201012345678',
  accountType: 'guide',
  workingLanguages: ['ar', 'en', 'de', 'fr'],
  verificationStatus: 'VERIFIED',
  verificationNote: 'Official Egypt Tourism Ministry License #9482 verified',
  proofDocumentUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80',
  recoveryCode: 'TRV-7782-9901-EG',
  role: 'user',
  companyName: 'Nile Wonders Travel & Tours',
  companyTagline: 'Bespoke Historical & Luxury Experiences in Egypt',
  companyBrandColor: '#f59e0b',
  companyLogoUrl: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=200&q=80',
  createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  updatedAt: new Date().toISOString(),
};

const INITIAL_DEMO_TRIP: Trip = {
  id: 'trip_egypt_classic_5d',
  guideId: INITIAL_GUIDE.id,
  guideName: INITIAL_GUIDE.name,
  guidePhone: INITIAL_GUIDE.phone,
  guideEmail: INITIAL_GUIDE.email,
  name: 'Egypt Pharaohs & Nile Odyssey (5 Days / 4 Nights)',
  summary: 'A breathtaking journey exploring the Great Pyramids of Giza, the Grand Egyptian Museum, Luxor Karnak & Valley of the Kings, and Alexandria Mediterranean treasures.',
  durationDays: 5,
  nightsCount: 4,
  travelerType: 'family',
  travelersCount: 4,
  budgetTier: 'luxury',
  travelPace: 'moderate',
  walkingPreference: 'moderate',
  interests: ['History', 'Ancient Temples', 'Nile Views', 'Culinary & Local Markets'],
  restrictions: ['Vegetarian meal options', 'Wheelchair accessible vehicle required'],
  notes: 'Internal guide note: Private Egyptologist VIP entrance arranged at Giza plateau at 8:00 AM before general public.',
  status: 'published',
  isArchived: false,
  coverImage: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=1200&q=80',
  destinations: [
    {
      id: 'dest_cairo',
      name: 'Cairo & Giza',
      nameAr: 'القاهرة والجيزة',
      coordinates: { lat: 30.0444, lng: 31.2357 },
      description: 'The historic capital of Egypt and home to the Great Pyramids of Giza, the Sphinx, and world-class museums.',
      imageUrl: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=600&q=80',
      order: 1,
      arrivalDay: 1,
      departureDay: 2,
    },
    {
      id: 'dest_luxor',
      name: 'Luxor (Ancient Thebes)',
      nameAr: 'الأقصر (طيبة القديمة)',
      coordinates: { lat: 25.6872, lng: 32.6396 },
      description: 'The world greatest open-air museum, featuring Karnak Temple, Luxor Temple, and the Valley of the Kings.',
      imageUrl: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=600&q=80',
      order: 2,
      arrivalDay: 3,
      departureDay: 4,
    },
    {
      id: 'dest_alex',
      name: 'Alexandria',
      nameAr: 'الإسكندرية عروس البحر المتوسط',
      coordinates: { lat: 31.2001, lng: 29.9187 },
      description: 'The Mediterranean jewel of Egypt, boasting the Qaitbay Citadel, Bibliotheca Alexandrina, and fresh seafood.',
      imageUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=600&q=80',
      order: 3,
      arrivalDay: 5,
      departureDay: 5,
    },
  ],
  days: [
    {
      dayNumber: 1,
      title: 'Arrival & The Great Pyramids of Giza & The Sphinx',
      destinationId: 'dest_cairo',
      destinationName: 'Cairo & Giza',
      stations: [
        {
          id: 'st_1_1',
          dayNumber: 1,
          name: 'VIP Airport Meet & Hotel Check-in',
          nameAr: 'الاستقبال في المطار والتسكين بالفندق',
          description: 'Private arrival transfer in Mercedes luxury van to Mena House Hotel overlooking the Pyramids.',
          startTime: '09:00',
          endTime: '10:30',
          durationMinutes: 90,
          activityType: 'transit',
          order: 1,
        },
        {
          id: 'st_1_2',
          dayNumber: 1,
          name: 'The Great Pyramid of Khufu & Panoramic View',
          nameAr: 'أهرامات الجيزة البانورامية وتمثال أبو الهول',
          description: 'Guided exploration of Khufu, Khafre, Menkaure pyramids with private desert horse carriage ride.',
          startTime: '11:00',
          endTime: '14:00',
          durationMinutes: 180,
          activityType: 'sightseeing',
          order: 2,
        },
        {
          id: 'st_1_3',
          dayNumber: 1,
          name: 'Traditional Egyptian Lunch overlooking the Sphinx',
          nameAr: 'غداء مصري تقليدي بإطلالة على الأهرامات',
          description: 'Authentic dining experiencing grilled kofta, fresh bread, mezzes, and mango juice.',
          startTime: '14:30',
          endTime: '16:00',
          durationMinutes: 90,
          activityType: 'culinary',
          order: 3,
        },
      ],
      mealsIncluded: { breakfast: true, lunch: true, dinner: false },
      notes: 'Please bring sunglasses, hat, and comfortable walking shoes.',
    },
    {
      dayNumber: 2,
      title: 'Grand Egyptian Museum & Historic Khan El Khalili Bazaar',
      destinationId: 'dest_cairo',
      destinationName: 'Cairo & Giza',
      stations: [
        {
          id: 'st_2_1',
          dayNumber: 2,
          name: 'Grand Egyptian Museum (GEM) Masterpieces',
          nameAr: 'المتحف المصري الكبير ومقتنيات توت عنخ آمون',
          description: 'Marvel at the full Tutankhamun collection, majestic atrium statues, and grand staircase.',
          startTime: '09:30',
          endTime: '13:00',
          durationMinutes: 210,
          activityType: 'museum',
          order: 1,
        },
        {
          id: 'st_2_2',
          dayNumber: 2,
          name: 'Khan El Khalili Bazaar & Al-Fishawy Historic Cafe',
          nameAr: 'خان الخليلي ومقهى الفيشاوي التاريخي',
          description: 'Walking tour through 14th-century souks, spices, alabaster lamps, and mint tea.',
          startTime: '15:00',
          endTime: '18:00',
          durationMinutes: 180,
          activityType: 'shopping',
          order: 2,
        },
      ],
      mealsIncluded: { breakfast: true, lunch: true, dinner: true },
    },
    {
      dayNumber: 3,
      title: 'Flight to Luxor & Karnak Temple Complex',
      destinationId: 'dest_luxor',
      destinationName: 'Luxor (Ancient Thebes)',
      stations: [
        {
          id: 'st_3_1',
          dayNumber: 3,
          name: 'Morning Flight Cairo to Luxor & Check-in',
          nameAr: 'رحلة الطيران إلى الأقصَر والتسكين',
          description: '1-hour flight to Luxor and check-in at historic Winter Palace hotel.',
          startTime: '07:00',
          endTime: '09:30',
          durationMinutes: 150,
          activityType: 'transit',
          order: 1,
        },
        {
          id: 'st_3_2',
          dayNumber: 3,
          name: 'Karnak Temple & Hypostyle Hall',
          nameAr: 'معبد الكرنك وصالة الأعمدة الكبرى',
          description: 'Walking through 134 colossal stone columns, sacred lake, and avenue of sphinxes.',
          startTime: '10:30',
          endTime: '13:30',
          durationMinutes: 180,
          activityType: 'historical',
          order: 2,
        },
        {
          id: 'st_3_3',
          dayNumber: 3,
          name: 'Sunset Felucca Sail on the River Nile',
          nameAr: 'جولة فلوكة شراعية في نيل الأقصر وقت الغروب',
          description: 'Peaceful traditional sailing with local music and fresh Egyptian tea.',
          startTime: '16:30',
          endTime: '18:00',
          durationMinutes: 90,
          activityType: 'relaxation',
          order: 3,
        },
      ],
      mealsIncluded: { breakfast: true, lunch: true, dinner: true },
    },
    {
      dayNumber: 4,
      title: 'Valley of the Kings, Hatshepsut Temple & Colossi of Memnon',
      destinationId: 'dest_luxor',
      destinationName: 'Luxor (Ancient Thebes)',
      stations: [
        {
          id: 'st_4_1',
          dayNumber: 4,
          name: 'Optional Sunrise Hot Air Balloon over Luxor',
          nameAr: 'منطاد الهواء الساخن وقت شروق الشمس (اختياري)',
          description: 'Panoramic bird-eye view of ancient temples and the Nile at dawn.',
          startTime: '05:30',
          endTime: '07:30',
          durationMinutes: 120,
          activityType: 'adventure',
          order: 1,
        },
        {
          id: 'st_4_2',
          dayNumber: 4,
          name: 'Royal Tombs in the Valley of the Kings',
          nameAr: 'مقابر وادي الملوك ومعبد حتشبسوت بالدير البحري',
          description: 'Deep underground tombs with preserved vibrant ancient Egyptian murals and hieroglyphics.',
          startTime: '08:30',
          endTime: '12:30',
          durationMinutes: 240,
          activityType: 'historical',
          order: 2,
        },
      ],
      mealsIncluded: { breakfast: true, lunch: true, dinner: false },
    },
    {
      dayNumber: 5,
      title: 'Alexandria Mediterranean Excursion & Departure',
      destinationId: 'dest_alex',
      destinationName: 'Alexandria',
      stations: [
        {
          id: 'st_5_1',
          dayNumber: 5,
          name: 'Qaitbay Citadel & Sea Corniche Walk',
          nameAr: 'قلعة قايتباي وكورنيش الإسكندرية',
          description: '15th-century fortress erected on the site of the ancient Pharos Lighthouse.',
          startTime: '10:00',
          endTime: '12:30',
          durationMinutes: 150,
          activityType: 'sightseeing',
          order: 1,
        },
        {
          id: 'st_5_2',
          dayNumber: 5,
          name: 'Bibliotheca Alexandrina & Seafood Farewell Lunch',
          nameAr: 'مكتبة الإسكندرية وغداء وداعي للأسماك الطازجة',
          description: 'Visiting the world-famous modern library and enjoying fresh Mediterranean catch with seaside views.',
          startTime: '13:00',
          endTime: '16:00',
          durationMinutes: 180,
          activityType: 'culinary',
          order: 2,
        },
      ],
      mealsIncluded: { breakfast: true, lunch: true, dinner: false },
    },
  ],
  transportation: [
    {
      id: 'tr_1',
      fromDestination: 'Cairo & Giza',
      toDestination: 'Luxor (Ancient Thebes)',
      type: 'flight',
      departureTime: '07:00',
      meetingPoint: 'Cairo Airport Terminal 3',
      distanceKm: 650,
      estimatedDurationMinutes: 65,
      estimatedCost: 3200,
    },
    {
      id: 'tr_2',
      fromDestination: 'Luxor (Ancient Thebes)',
      toDestination: 'Alexandria',
      type: 'flight',
      departureTime: '18:00',
      meetingPoint: 'Luxor Airport',
      distanceKm: 850,
      estimatedDurationMinutes: 120,
      estimatedCost: 3800,
    },
    {
      id: 'tr_3',
      fromDestination: 'Cairo & Giza',
      toDestination: 'Alexandria',
      type: 'car',
      departureTime: '08:00',
      meetingPoint: 'Hotel Lobby',
      distanceKm: 220,
      estimatedDurationMinutes: 150,
      estimatedCost: 1800,
    },
  ],
  costs: {
    accommodation: 14000,
    transportation: 8800,
    activities: 6200,
    guideFee: 7500,
    food: 4500,
    otherCosts: 2000,
    totalCost: 43000,
    sellingPrice: 58000,
    calculatedProfit: 15000,
    profitMarginPercent: 25.86,
    currency: 'EGP',
  },
  publicToken: 'tv_demo_egypt_explorer_2026',
  publicLinkUrl: '/trip/public/tv_demo_egypt_explorer_2026',
  isPublicPriceVisible: true,
  publicNotes: 'Includes airport meet-and-assist, deluxe private air-conditioned vehicle, licensed Egyptologist guide, all monument entry tickets, and daily breakfast & lunches.',
  inclusions: [
    'Private licensed expert Egyptologist guide',
    'VIP air-conditioned private vehicle throughout',
    'All entrance fees to listed sites and museums',
    'Domestic flights (Cairo - Luxor - Cairo)',
    'Nile Felucca sailing ride',
    'All breakfasts and highlighted authentic lunches',
    'Mineral water and refreshing wipes during tours',
  ],
  exclusions: [
    'International flights to/from Egypt',
    'Entry inside the Great Pyramid burial chamber (optional ticket)',
    'Sunrise Hot Air Balloon ride in Luxor ($75 optional)',
    'Personal tipping for drivers & luggage handlers',
  ],
  currentVersion: 1,
  createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  updatedAt: new Date().toISOString(),
};

function ensureDataDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function getInitialDatabase(): DatabaseSchema {
  const pinHashAdmin = hashPin('123456');
  const pinHashGuide = hashPin('123456');

  return {
    users: [INITIAL_ADMIN, INITIAL_GUIDE],
    userPins: {
      [INITIAL_ADMIN.id]: pinHashAdmin,
      [INITIAL_GUIDE.id]: pinHashGuide,
    },
    sessions: {},
    trips: [INITIAL_DEMO_TRIP],
    tripVersions: [
      {
        id: 'ver_1',
        tripId: INITIAL_DEMO_TRIP.id,
        versionNumber: 1,
        changeSummary: 'Initial verified published version',
        createdAt: INITIAL_DEMO_TRIP.createdAt,
        createdBy: INITIAL_GUIDE.id,
        snapshot: INITIAL_DEMO_TRIP,
      },
    ],
    inquiries: [
      {
        id: 'inq_1',
        tripId: INITIAL_DEMO_TRIP.id,
        tripName: INITIAL_DEMO_TRIP.name,
        guideId: INITIAL_GUIDE.id,
        clientName: 'Alexander Schmidt',
        clientEmail: 'alex.schmidt@berlin-travel.de',
        clientPhone: '+491701234567',
        message: 'Hello Tamer! We are a family of 4 from Germany looking to book this exact 5-day itinerary for November. Can we add a private dinner cruise in Cairo?',
        status: 'NEW',
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
    ],
    reviews: [
      {
        id: 'rev_1',
        tripId: INITIAL_DEMO_TRIP.id,
        guideId: INITIAL_GUIDE.id,
        clientName: 'Sarah & Mark Jenkins',
        clientCountry: 'United Kingdom',
        rating: 5,
        comment: 'Tamer was the absolute highlight of our Egypt trip! His historical knowledge at Karnak and Giza was mesmerizing, and the timing of every stop was flawless. 10/10 recommended!',
        createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      },
      {
        id: 'rev_2',
        tripId: INITIAL_DEMO_TRIP.id,
        guideId: INITIAL_GUIDE.id,
        clientName: 'Matteo Rossi',
        clientCountry: 'Italy',
        rating: 5,
        comment: 'Esperienza indimenticabile! Organizzazione impeccabile, veicolo comodo e spiegazioni chiare e coinvolgenti.',
        createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
      },
    ],
    notifications: [
      {
        id: 'notif_welcome',
        userId: INITIAL_GUIDE.id,
        type: 'SYSTEM',
        title: 'مرحبًا بك في منصة TOURVIA!',
        message: 'تم تفعيل حسابك كمرشد موثق. يمكنك الآن إنشاء برامج ذكية بالذكاء الاصطناعي ومشاركتها مع عملائك.',
        isRead: false,
        createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
      },
      {
        id: 'notif_inq_1',
        userId: INITIAL_GUIDE.id,
        type: 'INQUIRY',
        title: 'استفسار عميل جديد: Alexander Schmidt',
        message: 'تلقيت استفسارًا جديدًا بخصوص برنامج: Egypt Pharaohs & Nile Odyssey.',
        isRead: false,
        actionUrl: '/inquiries',
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
    ],
    plans: DEFAULT_PLANS,
    subscriptions: [
      {
        id: 'sub_guide_pro',
        userId: INITIAL_GUIDE.id,
        planId: 'plan_pro',
        planCode: 'PRO',
        status: 'ACTIVE',
        startDate: new Date(Date.now() - 30 * 86400000).toISOString(),
        endDate: new Date(Date.now() + 335 * 86400000).toISOString(),
        amountPaid: 750,
        currency: 'EGP',
        provider: 'INSTAPAY',
      },
    ],
    paymentRequests: [
      {
        id: 'pay_init_1',
        userId: INITIAL_GUIDE.id,
        userEmail: INITIAL_GUIDE.email,
        userName: INITIAL_GUIDE.name,
        planId: 'plan_pro',
        planName: 'Professional Guide',
        amount: 750,
        currency: 'EGP',
        paymentMethod: 'INSTAPAY',
        transactionReference: 'IPN-90281-TOURVIA',
        status: 'APPROVED',
        adminNote: 'InstaPay transfer confirmed on bank statement.',
        createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
        resolvedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      },
    ],
    promoCodes: DEFAULT_PROMOS,
    aiUsage: {
      [INITIAL_GUIDE.id]: {
        userId: INITIAL_GUIDE.id,
        lifetimeUsed: 2,
        lifetimeLimit: 60,
        currentPlanAiLimit: 60,
        isUnlimited: false,
        history: [
          {
            id: 'gen_1',
            tripName: 'Egypt Pharaohs & Nile Odyssey',
            destinations: ['Cairo & Giza', 'Luxor', 'Alexandria'],
            durationDays: 5,
            timestamp: new Date(Date.now() - 7 * 86400000).toISOString(),
            success: true,
          },
          {
            id: 'gen_2',
            tripName: 'Red Sea & Sinai Adventure',
            destinations: ['Sharm El Sheikh', 'Dahab', 'Saint Catherine'],
            durationDays: 4,
            timestamp: new Date(Date.now() - 3 * 86400000).toISOString(),
            success: true,
          },
        ],
      },
    },
    auditLogs: [
      {
        id: 'log_1',
        userId: INITIAL_ADMIN.id,
        userEmail: INITIAL_ADMIN.email,
        action: 'SYSTEM_BOOTSTRAP',
        details: 'TOURVIA production database initialized with core seed tables.',
        timestamp: new Date().toISOString(),
      },
      {
        id: 'log_2',
        userId: INITIAL_GUIDE.id,
        userEmail: INITIAL_GUIDE.email,
        action: 'TRIP_PUBLISHED',
        details: 'Trip Egypt Pharaohs & Nile Odyssey (5 Days) published with public token.',
        timestamp: new Date(Date.now() - 7 * 86400000).toISOString(),
      },
    ],
    campaigns: [
      {
        id: 'cmp_spring2026',
        title: 'Spring Tourism Season Launch 2026',
        targetSegment: 'all',
        message: 'استعد لموسم السياحة الربيعي مع TOURVIA! استخدم كود WELCOME50 للحصول على 50% خصم على باقة Pro.',
        promoCode: 'WELCOME50',
        status: 'active',
        sentCount: 142,
        createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      },
    ],
    adminAiSettings: {
      freeAiLifetimeLimit: 3,
      aiProvider: 'gemini',
      aiModel: 'gemini-3.7-flash',
      allowDayRegeneration: true,
      dayRegenConsumesQuota: false,
      fallbackEnabled: true,
    },
    publicLinkViews: {
      [INITIAL_DEMO_TRIP.publicToken!]: {
        token: INITIAL_DEMO_TRIP.publicToken!,
        tripId: INITIAL_DEMO_TRIP.id,
        count: 48,
        firstViewAt: new Date(Date.now() - 6 * 86400000).toISOString(),
        lastViewAt: new Date(Date.now() - 3600000).toISOString(),
      },
    },
  };
}

class Database {
  private db: DatabaseSchema;

  constructor() {
    ensureDataDirectory();
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.db = JSON.parse(raw);
        // Merge missing tables if updated
        const initial = getInitialDatabase();
        this.db.plans = this.db.plans || initial.plans;
        this.db.promoCodes = this.db.promoCodes || initial.promoCodes;
        this.db.adminAiSettings = this.db.adminAiSettings || initial.adminAiSettings;
        this.db.publicLinkViews = this.db.publicLinkViews || initial.publicLinkViews;
      } catch (err) {
        console.error('Error reading database file, re-initializing...', err);
        this.db = getInitialDatabase();
        this.save();
      }
    } else {
      this.db = getInitialDatabase();
      this.save();
    }
  }

  public save(): void {
    ensureDataDirectory();
    fs.writeFileSync(DB_FILE, JSON.stringify(this.db, null, 2), 'utf-8');
  }

  public get data(): DatabaseSchema {
    return this.db;
  }
}

export const dbInstance = new Database();
export const db = dbInstance.data;
export const saveDb = () => dbInstance.save();
