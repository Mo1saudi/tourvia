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
  AdminAiSettings,
  ComplianceRequirement,
  RegulatoryUpdate,
  PlatformComplaint,
  SiteRegulatoryNotice,
  ComplianceReadinessReport,
  HomepageCustomStats,
} from '../src/types';

// On Vercel the deployed filesystem is read-only at runtime (only /tmp is
// writable), so the live DB file must live in /tmp. We seed it on cold start
// from the committed data/tourvia_db.json so existing users/trips are kept.
const IS_VERCEL = !!process.env.VERCEL;
const SOURCE_DB_FILE = path.join(process.cwd(), 'data', 'tourvia_db.json');
const DATA_DIR = IS_VERCEL ? '/tmp' : path.join(process.cwd(), 'data');
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
  homepageStats: HomepageCustomStats;
  publicLinkViews: Record<string, { token: string; tripId: string; count: number; firstViewAt: string; lastViewAt: string }>;
  complianceRequirements: ComplianceRequirement[];
  regulatoryUpdates: RegulatoryUpdate[];
  complaints: PlatformComplaint[];
  siteRegulatoryNotices: SiteRegulatoryNotice[];
  documentRetentionSettings: {
    maxDaysUnverifiedDocs: number;
    autoPurgeRejectedDocs: boolean;
    lastPurgeRunAt: string;
  };
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

export const DEFAULT_HOMEPAGE_STATS: HomepageCustomStats = {
  mode: 'custom',
  usersCountOverride: 250,
  usersCountDisplay: '250+',
  usersCountLabelAr: 'مرشد سياحي وشركة معتمدة',
  usersCountLabelEn: 'Licensed Guides & Agencies',
  tripsCountOverride: 1200,
  tripsCountDisplay: '1,200+',
  tripsCountLabelAr: 'برنامج سياحي مصمم بالذكاء الاصطناعي',
  tripsCountLabelEn: 'AI Travel Itineraries Created',
  monumentsCountDisplay: '50+',
  monumentsLabelAr: 'معلم أثري وموقع سياحي مصري',
  monumentsLabelEn: 'Monuments & Archaeological Sites',
  satisfactionRateDisplay: '99.8%',
  satisfactionLabelAr: 'دقة التوقيتات ورضا المسافرين',
  satisfactionLabelEn: 'Timetable Precision & Rating',
  heroTaglineAr: 'المنصة الذكية الرائدة لتصميم البرامج السياحية بالذكاء الاصطناعي للمرشدين والشركات السياحية في مصر',
  heroTaglineEn: 'The Smart Operating System for Egyptian Tour Guides & Agencies',
  updatedAt: new Date().toISOString(),
};

export const DEFAULT_PLANS: SubscriptionPlan[] = [
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

export const DEFAULT_PROMOS: PromoCode[] = [
  {
    id: 'promo_welcome50',
    code: 'WELCOME50',
    discountPercent: 50,
    startDate: '2026-01-01',
    expiryDate: '2027-12-31',
    maxUses: 500,
    usedCount: 0,
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
    usedCount: 0,
    minOrderAmount: 350,
    isActive: true,
  },
];

export const INITIAL_ADMIN: User = {
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

export const INITIAL_PRIMARY_ADMIN: User = {
  id: 'usr_admin_mohamed',
  name: 'Mohamed (TOURVIA Admin)',
  email: 'mohamedseo2002@gmail.com',
  phone: '+201000000002',
  accountType: 'admin',
  workingLanguages: ['ar', 'en'],
  verificationStatus: 'VERIFIED',
  recoveryCode: 'TRV-ADMIN-MOHAMED-2026',
  role: 'admin',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const DEFAULT_COMPLIANCE_REQUIREMENTS: ComplianceRequirement[] = [
  {
    id: 'comp_req_license_validity',
    category: 'GUIDE_REQUIREMENTS',
    categoryNameAr: 'متطلبات ترخيص المرشد',
    title: 'Valid Tourist Guide License from Ministry',
    titleAr: 'حيازة ترخيص ساري لمزاولة الإرشاد السياحي من وزارة السياحة والآثار',
    legalBasis: 'المادة (2) والمادة (4) من القانون رقم 121 لسنة 1983 ولائحته التنفيذية',
    description: 'All users practicing professional tourist guiding must hold a valid, non-expired license issued by the Egyptian Ministry of Tourism and Antiquities.',
    descriptionAr: 'يلزم لممارسة مهنة الإرشاد السياحي الحصول على ترخيص ساري من وزارة السياحة والآثار، وتجديده دورياً طبقاً للمواعيد المقررة.',
    status: 'COMPLIANT',
    statusAr: 'مستوفى',
    evidenceNote: 'تم تطبيق نظام التحقق اليدوي الإداري مع تسجيل رقم الترخيص وتاريخ الانتهاء والجهة المصدرة.',
    lastReviewedAt: '2026-08-30',
    reviewedBy: 'Compliance Officer (Legal Readiness)',
    riskLevel: 'LOW',
  },
  {
    id: 'comp_req_syndicate_membership',
    category: 'GUIDE_REQUIREMENTS',
    categoryNameAr: 'متطلبات ترخيص المرشد',
    title: 'Tourist Guides Syndicate Membership',
    titleAr: 'القيد بجداول نقابة المرشدين السياحيين المصرية وسريان العضوية',
    legalBasis: 'المادة (5) والمادة (7) من القانون رقم 121 لسنة 1983 بشأن نقابة المرشدين السياحيين',
    description: 'Proof of active registration with the Egyptian Tourist Guides Syndicate is required before granting professional guide status.',
    descriptionAr: 'اشتراط التحقق من القيد بنقابة المرشدين وسريان بطاقة العضوية قبل منح صفة مرشد معتمد بالمنصة.',
    status: 'COMPLIANT',
    statusAr: 'مستوفى',
    evidenceNote: 'حقل رقم القيد النقابي متاح بالمراجعة الإدارية مع فحص بطاقة النقابة.',
    lastReviewedAt: '2026-08-30',
    reviewedBy: 'Compliance Officer (Legal Readiness)',
    riskLevel: 'LOW',
  },
  {
    id: 'comp_req_commercial_distinction',
    category: 'GUIDE_REQUIREMENTS',
    categoryNameAr: 'متطلبات ترخيص المرشد',
    title: 'Separation between Individual Guides and Tourism Companies',
    titleAr: 'الفصل بين المرشد السياحي الفردي وشركات السياحة (القانون 38 لسنة 1977)',
    legalBasis: 'المادة (13) من القانون رقم 121 لسنة 1983 والقانون رقم 38 لسنة 1977 وتعديلاته',
    description: 'Ensure individual guides do not represent themselves as licensed Class A/B/C tourism companies unless verified.',
    descriptionAr: 'منع خلط الصفة المهنية للمرشد الفردي بصفة شركة سياحة مرخصة دون حيازة ترخيص شركة سياحة مستقل.',
    status: 'COMPLIANT',
    statusAr: 'مستوفى',
    evidenceNote: 'تم إلزام تحديد نوع الكيان (مرشد فردي vs شركة سياحة) وحظر الادعاءات التجارية المضللة.',
    lastReviewedAt: '2026-08-30',
    reviewedBy: 'Compliance Officer (Legal Readiness)',
    riskLevel: 'LOW',
  },
  {
    id: 'comp_req_verification_separation',
    category: 'VERIFICATION_STATUS',
    categoryNameAr: 'حالة التحقق المهني',
    title: 'Separation of User Account from License Status',
    titleAr: 'الفصل بين حساب المستخدم والتحقق المهني وصلاحية الترخيص',
    legalBasis: 'معايير النزاهة الرقمية ومنع تضليل المستهلك وقانون حماية المستهلك رقم 181 لسنة 2018',
    description: 'A new account creation never automatically grants professional guide status or verified badge.',
    descriptionAr: 'لا يمنح تسجيل حساب جديد صفة مرشد مرخص أو شارة توثيق تلقائية، بل يتطلب مسار تدقيق إداري منفصل.',
    status: 'COMPLIANT',
    statusAr: 'مستوفى',
    evidenceNote: 'مطبق بنية حالات: حساب جديد > بانتظار التحقق > مرشد تم التحقق من ترخيصه > منتهي > موقوف.',
    lastReviewedAt: '2026-08-30',
    reviewedBy: 'Lead Compliance Architect',
    riskLevel: 'LOW',
  },
  {
    id: 'comp_req_no_fake_gov_api',
    category: 'VERIFICATION_STATUS',
    categoryNameAr: 'حالة التحقق المهني',
    title: 'No Simulated or Fake Government Verification APIs',
    titleAr: 'حظر محاكاة أو اصطناع واجهات ربط حكومية وهمية مع الوزارة أو النقابة',
    legalBasis: 'الشفافية الرقمية ومكافحة التزوير والاحتيال المعلوماتي (القانون رقم 175 لسنة 2018)',
    description: 'Never simulate fake Ministry or Syndicate APIs. Verification is explicitly labelled as manual admin review.',
    descriptionAr: 'المنصة لا تصطنع أي ربط إلكتروني وهمي مع الوزارة أو النقابة، وتوضح بشفافية أن المراجعة إدارية يدوية.',
    status: 'COMPLIANT',
    statusAr: 'مستوفى',
    evidenceNote: 'التدقيق يتم عبر لوحة تحكم الإدارة اليدوية ومراجعة الوثائق المرفوعة.',
    lastReviewedAt: '2026-08-30',
    reviewedBy: 'QA Auditor',
    riskLevel: 'LOW',
  },
  {
    id: 'comp_req_document_security',
    category: 'DOCUMENTS_SECURITY',
    categoryNameAr: 'أمن وسرية المستندات',
    title: 'Secure Document Storage & No Public Indexing',
    titleAr: 'تأمين وثائق التراخيص والبطاقات ومنع فهرستها أو إتاحتها للعامة',
    legalBasis: 'قانون حماية البيانات الشخصية رقم 151 لسنة 2020 والمعايير الأمنية للأيزو 27001',
    description: 'Uploaded licenses and IDs must not be accessible to public visitors, search engines, or unauthenticated users.',
    descriptionAr: 'وثائق التراخيص والبطاقات الشخصية مشفرة ومحجوبة تمامًا عن العرض العام للمسافرين ومحركات البحث.',
    status: 'COMPLIANT',
    statusAr: 'مستوفى',
    evidenceNote: 'مسارات العرض العام لا ترجع أي مستندات أو أرقام قومية، والوصول محصور للأدمن المصرح له فقط.',
    lastReviewedAt: '2026-08-30',
    reviewedBy: 'Security Engineer',
    riskLevel: 'LOW',
  },
  {
    id: 'comp_req_retention_policy',
    category: 'DOCUMENTS_SECURITY',
    categoryNameAr: 'أمن وسرية المستندات',
    title: 'Document Retention & Secure Purging Policy',
    titleAr: 'سياسة الاحتفاظ بالمستندات والتخلص الآمن بعد انتهاء الحاجة القانونية',
    legalBasis: 'المادة (4) من قانون حماية البيانات الشخصية رقم 151 لسنة 2020 (مبدأ الحد من مدة التخزين)',
    description: 'Implement administrative retention controls to purge rejected or unverified documents after specified intervals.',
    descriptionAr: 'توفير خيارات إدارية لحذف وثائق الحسابات المرفوضة بعد فترة السماح لتجنب الاحتفاظ غير المبرر.',
    status: 'COMPLIANT',
    statusAr: 'مستوفى',
    evidenceNote: 'تم تضمين وظيفة التطهير الآمن وتعيين سياسة الاحتفاظ في لوحة تحكم الامتثال.',
    lastReviewedAt: '2026-08-30',
    reviewedBy: 'Data Protection Specialist',
    riskLevel: 'LOW',
  },
  {
    id: 'comp_req_language_verification',
    category: 'AUTHORIZED_LANGUAGES',
    categoryNameAr: 'اللغات المرخص بها',
    title: 'Distinction Between Claimed and Officially Authorized Languages',
    titleAr: 'التمييز بين اللغات المدخلة ذاتيًا واللغات المرخص بها رسميًا للإرشاد',
    legalBasis: 'قرارات وزارة السياحة والآثار بشأن شروط إضافة اللغات الأجنبية لترخيص الإرشاد',
    description: 'A guide cannot claim official language qualification without documented proof of license language endorsement.',
    descriptionAr: 'لا يحصل المرشد على علامة (لغة معتمدة بالترخيص) إلا للغات المثبتة في ترخيص الوزارة فقط.',
    status: 'COMPLIANT',
    statusAr: 'مستوفى',
    evidenceNote: 'تم الفصل بين workingLanguages و authorizedLanguages في النموذج وقواعد البيانات والواجهة.',
    lastReviewedAt: '2026-08-30',
    reviewedBy: 'Compliance Architect',
    riskLevel: 'LOW',
  },
  {
    id: 'comp_req_scope_enforcement',
    category: 'PROFESSIONAL_SCOPE',
    categoryNameAr: 'نطاق العمل والكيان',
    title: 'Prohibition of Unverified Commercial & Official Claims',
    titleAr: 'حظر الادعاءات المضللة مثل "معتمد من الوزارة" أو "شريك النقابة"',
    legalBasis: 'المادة (66) من قانون حماية المستهلك رقم 181 لسنة 2018 بشأن الإعلانات والادعاءات المضللة',
    description: 'Prohibit unauthorized promotional statements claiming official ministry endorsement or government partnership.',
    descriptionAr: 'حظر كامل لاستخدام شعارات الوزارة أو النقابة أو ادعاء "منصة حكومية معتمدة" دون تفويض قانوني رسمي.',
    status: 'COMPLIANT',
    statusAr: 'مستوفى',
    evidenceNote: 'تم تدقيق كافة النصوص والواجهات وإلزام صياغة "تم التحقق من بيانات الترخيص بواسطة TOURVIA".',
    lastReviewedAt: '2026-08-30',
    reviewedBy: 'QA & Legal Compliance Auditor',
    riskLevel: 'LOW',
  },
  {
    id: 'comp_req_archaeological_sites',
    category: 'ITINERARIES_SITES',
    categoryNameAr: 'المواقع الأثرية والمتاحف',
    title: 'Archaeological Sites Regulations & Photography Permits Awareness',
    titleAr: 'إشعارات ضوابط المواقع الأثرية وتصاريح التصوير والفعاليات الخاصة',
    legalBasis: 'قانون حماية الآثار رقم 117 لسنة 1983 وقرارات المجلس الأعلى للآثار بشأن التصوير والمزارات',
    description: 'Provide clear notices that photography equipment, commercial filming, and special site access require official Supreme Council of Antiquities permits.',
    descriptionAr: 'إبراز تنبيهات واضحة بأن التصوير التجاري أو الفعاليات الخاصة بالمواقع الأثرية تتطلب تصاريح مسبقة من المجلس الأعلى للآثار.',
    status: 'COMPLIANT',
    statusAr: 'مستوفى',
    evidenceNote: 'تم تضمين بطاقات الإشعارات التنظيمية للمواقع الأثرية والتنبيه على الأسعار الرسمية.',
    lastReviewedAt: '2026-08-30',
    reviewedBy: 'Tourism Technology Consultant',
    riskLevel: 'LOW',
  },
  {
    id: 'comp_req_ai_guardrails',
    category: 'AI_CONTENT_SAFETY',
    categoryNameAr: 'أمان المحتوى والذكاء الاصطناعي',
    title: 'AI Planning Role & Human Professional Responsibility',
    titleAr: 'تحديد دور الذكاء الاصطناعي كمساعد تخطيط وتأكيد المسؤولية البشرية',
    legalBasis: 'إرشادات النزاهة وحوكمة الذكاء الاصطناعي الصادرة عن وزارة الاتصالات وتكنولوجيا المعلومات المصرية',
    description: 'AI assists in generating itinerary drafts but never grants licenses, verifies credentials, or replaces human professional accuracy check.',
    descriptionAr: 'الذكاء الاصطناعي لا يمنح تراخيص ولا يقر صحة تاريخية، والمسؤولية الكاملة عن دقة المعلومات تقع على المرشد.',
    status: 'COMPLIANT',
    statusAr: 'مستوفى',
    evidenceNote: 'تم وضع نصوص إخلاء مسؤولية واضحة في أدوات الذكاء الاصطناعي وصفحات التوليد وعرض الرحلات.',
    lastReviewedAt: '2026-08-30',
    reviewedBy: 'AI Governance Specialist',
    riskLevel: 'LOW',
  },
  {
    id: 'comp_req_privacy_minimization',
    category: 'PRIVACY_MINIMIZATION',
    categoryNameAr: 'الخصوصية والحد الأدنى للبيانات',
    title: 'Data Minimization & Public Profile Privacy',
    titleAr: 'تطبيق مبدأ الحد الأدنى للبيانات وحماية خصوصية بيانات المسافرين والمرشدين',
    legalBasis: 'قانون حماية البيانات الشخصية رقم 151 لسنة 2020',
    description: 'Collect only necessary operating data; sanitize public view payloads to avoid exposing guide margins, costs, or national IDs.',
    descriptionAr: 'تطهير الروابط العامة والواجهات الموجهة للجمهور من التكاليف الداخلية وهوامش الربح والأرقام القومية.',
    status: 'COMPLIANT',
    statusAr: 'مستوفى',
    evidenceNote: 'مسار GET /api/public/trip/:token يقوم بتطهير البيانات بالكامل وحجب التكاليف الحساسة.',
    lastReviewedAt: '2026-08-30',
    reviewedBy: 'Data Protection Officer',
    riskLevel: 'LOW',
  },
  {
    id: 'comp_req_complaint_mechanism',
    category: 'COMPLAINTS_INTEGRITY',
    categoryNameAr: 'الشكاوى والنزاهة',
    title: 'Public Reporting & Misrepresentation Complaint Channel',
    titleAr: 'آلية إبلاغ الجمهور والمسافرين عن الادعاءات المضللة أو انتحال الصفة',
    legalBasis: 'قانون حماية المستهلك رقم 181 لسنة 2018 ومعايير جودة الخدمة السياحية',
    description: 'Travelers and guides can report misleading information, false professional claims, or incorrect pricing.',
    descriptionAr: 'توفير نموذج إبلاغ سريع ومسار إداري للتحقيق في الشكاوى واتخاذ إجراءات الإيقاف عند المخالفة.',
    status: 'COMPLIANT',
    statusAr: 'مستوفى',
    evidenceNote: 'تم إنشاء مسار تقديم البلاغات ونظام معالجة الشكاوى الإداري الشامل.',
    lastReviewedAt: '2026-08-30',
    reviewedBy: 'QA Auditor',
    riskLevel: 'LOW',
  },
  {
    id: 'comp_req_auditability',
    category: 'AUDIT_LOGS',
    categoryNameAr: 'السجلات والتدقيق',
    title: 'Immutable Administrative Action Logging',
    titleAr: 'سجل تدقيق إداري غير قابل للتعديل لتوثيق وتعديل التراخيص',
    legalBasis: 'قانون التوقيع الإلكتروني والمعاملات الرقمية رقم 15 لسنة 2004 ومعايير الرقابة الداخلية',
    description: 'All verification, license rejection, role changes, and compliance updates are logged with timestamps and admin identity.',
    descriptionAr: 'تسجيل تاريخي كامل ومؤمن لكل قرار توثيق أو رفض أو تعديل صلاحية مع هوية المسؤول ووقت العملية.',
    status: 'COMPLIANT',
    statusAr: 'مستوفى',
    evidenceNote: 'سجل Audit Logs مفعل ومحمي على الخادم.',
    lastReviewedAt: '2026-08-30',
    reviewedBy: 'Security Auditor',
    riskLevel: 'LOW',
  },
  {
    id: 'comp_req_change_management',
    category: 'REGULATORY_REVIEW',
    categoryNameAr: 'المراجعة والتحديثات التنظيمية',
    title: 'Regulatory Change Management & Legal Review Flagging',
    titleAr: 'إدارة التحديثات التنظيمية ووسم المسائل الخاضعة للمراجعة القانونية المستمرة',
    legalBasis: 'أفضل ممارسات الامتثال المؤسسي وإدارة المخاطر القانونية والتشريعية',
    description: 'Maintain a living registry of tourism laws and ministerial decrees, flagging uncertain requirements for formal legal review.',
    descriptionAr: 'سجل نشط لمتابعة القرارات الوزارية المستجدة ووسم الميزات غير المحسومة قانونياً بطلب مراجعة.',
    status: 'COMPLIANT',
    statusAr: 'مستوفى',
    evidenceNote: 'تم إنشاء قسم التحديثات التنظيمية ولوحة تقرير الجاهزية للامتثال.',
    lastReviewedAt: '2026-08-30',
    reviewedBy: 'Senior Compliance Architect',
    riskLevel: 'LOW',
  },
];

export const DEFAULT_REGULATORY_UPDATES: RegulatoryUpdate[] = [
  {
    id: 'reg_upd_law121',
    regulationName: 'Tourist Guides Law No. 121 of 1983 & Executive Regulations',
    regulationNameAr: 'القانون رقم 121 لسنة 1983 بشأن المرشدين السياحيين ونقابتهم ولائحته التنفيذية',
    source: 'الجريدة الرسمية - جمهورية مصر العربية',
    publishedDate: '1983-08-01',
    effectiveDate: '1983-08-15',
    summaryAr: 'تحديد شروط ممارسة مهنة الإرشاد السياحي، حظر مزاولة المهنة دون ترخيص من الوزارة والقيد بالنقابة، وحظر الجمع بين الإرشاد والأنشطة التجارية غير المصرح بها.',
    affectedPlatformFeature: 'توثيق المرشدين، التحقق من التراخيص، شارات الاعتماد المهني، وتحديد نطاق العمل.',
    requiredSystemChange: 'إلزام تسجيل رقم الترخيص ورقم القيد النقابي وفحص تاريخ الانتهاء بصورة دورية.',
    reviewStatus: 'IMPLEMENTED',
    reviewedBy: 'Senior Legal & Compliance Architect',
    notes: 'المصدر التشريعي الأساسي لمهنة الإرشاد السياحي بمصر.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'reg_upd_eticketing',
    regulationName: 'Ministry of Tourism Electronic Ticketing & Digital Payment Mandate',
    regulationNameAr: 'قرارات وزارة السياحة والآثار بشأن التحول لمنظومة الدفع غير النقدي والتذاكر الإلكترونية للمزارات والمتاحف الأثرية',
    source: 'وزارة السياحة والآثار - المجلس الأعلى للآثار',
    decreeNumber: 'قرار المجلس الأعلى للآثار لسنة 2023/2024',
    publishedDate: '2023-06-01',
    effectiveDate: '2023-09-01',
    summaryAr: 'إلغاء التعامل النقدي في شباك التذاكر بالمواقع والمتاحف الأثرية الكبرى (الأهرامات، الكرنك، وادي الملوك، المتحف المصري) والاعتماد الكامل على البطاقات البنكية والحجز الإلكتروني.',
    affectedPlatformFeature: 'حساب تكاليف الرحلات، إشعارات تذاكر المزارات الأثرية بالبرامج.',
    requiredSystemChange: 'إضافة إشعار للمسافر بأن الدفع في المواقع الأثرية بالبطاقات البنكية فقط أو عبر البوابة الرسمية للوزارة.',
    reviewStatus: 'IMPLEMENTED',
    reviewedBy: 'Tourism Technology Consultant',
    notes: 'تم تحديث التنبيهات في بطاقات الوجهات والمحطات.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'reg_upd_photography',
    regulationName: 'Supreme Council of Antiquities Photography & Filming Regulations',
    regulationNameAr: 'ضوابط المجلس الأعلى للآثار بشأن تصوير الهواة والتصوير التجاري والسينمائي بالمتاحف والمواقع الأثرية',
    source: 'المجلس الأعلى للآثار - وزارة السياحة والآثار',
    decreeNumber: 'قرار مجلس إدارة المجلس الأعلى للآثار لسنة 2022',
    publishedDate: '2022-10-18',
    effectiveDate: '2022-11-01',
    summaryAr: 'السماح بالتصوير الفوتوغرافي التذكاري الشخصي بالهواتف مجاناً، مع اشتراط تصاريح مسبقة ورسوم للمعدات الاحترافية، التصوير التجاري، الإعلانات، والدرون.',
    affectedPlatformFeature: 'إشعارات محطات التصوير بالمزارات والبرامج السياحية.',
    requiredSystemChange: 'عرض تنبيه تنظيمي بأن التصوير التجاري والسينمائي يتطلب تصاريح رسمية مسبقة من المجلس الأعلى للآثار.',
    reviewStatus: 'IMPLEMENTED',
    reviewedBy: 'Compliance Architect',
    notes: 'تم تضمين الإشعار في تفاصيل المحطات الأثرية.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'reg_upd_privacy_law151',
    regulationName: 'Data Protection Law No. 151 of 2020',
    regulationNameAr: 'قانون حماية البيانات الشخصية رقم 151 لسنة 2020',
    source: 'الجريدة الرسمية - جمهورية مصر العربية',
    decreeNumber: 'القانون رقم 151 لسنة 2020',
    publishedDate: '2020-07-15',
    effectiveDate: '2020-10-15',
    summaryAr: 'إلزام المنصات الرقمية بحماية البيانات الشخصية، تطبيق مبدأ الحد الأدنى للجمع، وتوفير حق التعديل والحذف وتأمين الوثائق الحساسة.',
    affectedPlatformFeature: 'حفظ مستندات الهوية، سياسة الاحتفاظ، وحجب البيانات الحساسة عن العرض العام.',
    requiredSystemChange: 'تطبيق التشفير والحجب على الأرقام القومية ومستندات التراخيص وسياسة التطهير الدوري.',
    reviewStatus: 'IMPLEMENTED',
    reviewedBy: 'Data Protection Specialist',
    notes: 'مطبق على مستوى قاعدة البيانات ومسارات الخادم العامة.',
    updatedAt: new Date().toISOString(),
  },
];

export const DEFAULT_SITE_NOTICES: SiteRegulatoryNotice[] = [
  {
    siteKey: 'giza_plateau',
    nameAr: 'منطقة أهرامات الجيزة وأبو الهول',
    nameEn: 'Giza Pyramids Plateau & Sphinx',
    category: 'ARCHAEOLOGICAL_SITE',
    requiresOfficialLicensedGuide: true,
    photographyPermitNotice: 'التصوير الشخصي بالموبايل متاح مجاناً. تصوير الفيديو التجاري أو استخدام معدات احترافية أو حامل ثلاثي يتطلب تصريحاً مسبقاً من المجلس الأعلى للآثار.',
    officialTicketingNotice: 'يتم شراء التذاكر إلكترونياً أو بالبطاقات البنكية فقط عبر بوابة وزارة السياحة والآثار الرسمية (egymonuments.com). لا يُقبل الدفع النقدي.',
    openingHoursNotice: 'تفتح المنطقة يومياً من 8:00 صباحاً حتى 5:00 مساءً (تغلق شبابيك التذاكر الساعة 4:00 مساءً).',
    officialSourceUrl: 'https://egymonuments.com/locations/details/GizaPlateau',
  },
  {
    siteKey: 'grand_egyptian_museum',
    nameAr: 'المتحف المصري الكبير (GEM)',
    nameEn: 'Grand Egyptian Museum (GEM)',
    category: 'MUSEUM',
    requiresOfficialLicensedGuide: true,
    photographyPermitNotice: 'التصوير بدون فلاش مسموح بالهواتف في المناطق المفتوحة والبهو العظيم. المعارض الحصرية والتصوير التجاري يخضع لضوابط إدارة المتحف.',
    officialTicketingNotice: 'الحجز المسبق للتذاكر عبر موقع المتحف الرسمي (visit-gem.com) شرط أساسي للدخول للجولات التجريبية.',
    openingHoursNotice: 'مواعيد الجولات اليومية من 9:00 صباحاً حتى 6:00 مساءً.',
    officialSourceUrl: 'https://visit-gem.com',
  },
  {
    siteKey: 'karnak_temple',
    nameAr: 'مجمع معابد الكرنك (الأقصر)',
    nameEn: 'Karnak Temple Complex (Luxor)',
    category: 'ARCHAEOLOGICAL_SITE',
    requiresOfficialLicensedGuide: true,
    photographyPermitNotice: 'ممنوع استخدام طائرات الدرون نهائياً. التصوير التجاري والسينمائي يتطلب موافقة أمنية وتصريحاً من وزارة السياحة والآثار.',
    officialTicketingNotice: 'الدفع إلكتروني بالبطاقات البنكية عبر منافذ الدفع غير النقدي أو الموقع الرسمي.',
    openingHoursNotice: 'تفتح المعابد يومياً من 6:00 صباحاً حتى 5:30 مساءً.',
    officialSourceUrl: 'https://egymonuments.com/locations/details/KarnakTemple',
  },
  {
    siteKey: 'valley_of_the_kings',
    nameAr: 'وادي الملوك (البر الغربي - الأقصر)',
    nameEn: 'Valley of the Kings (Luxor)',
    category: 'ARCHAEOLOGICAL_SITE',
    requiresOfficialLicensedGuide: true,
    photographyPermitNotice: 'التصوير بالهاتف مسموح داخل المقابر المفتوحة بدون فلاش. بعض المقابر الملكية الاستثنائية (كتوت عنخ آمون وسيتي الأول) تتطلب تذكرة خاصة إضافية.',
    officialTicketingNotice: 'التذكرة العامة تشمل زيارة 3 مقابر ملكية من المقابر المفتوحة باليوم.',
    openingHoursNotice: 'يومياً من 6:00 صباحاً حتى 5:00 مساءً.',
    officialSourceUrl: 'https://egymonuments.com/locations/details/ValleyoftheKings',
  },
  {
    siteKey: 'qaitbay_citadel',
    nameAr: 'قلعة قايتباي (الإسكندرية)',
    nameEn: 'Citadel of Qaitbay (Alexandria)',
    category: 'ARCHAEOLOGICAL_SITE',
    requiresOfficialLicensedGuide: false,
    photographyPermitNotice: 'التصوير التذكاري الشخصي متاح، وجلسات التصوير التجاري وعقود الفعاليات تتطلب موافقة المجلس الأعلى للآثار.',
    officialTicketingNotice: 'الدفع الإلكتروني بالبطاقات البنكية بمنافذ القلعة.',
    openingHoursNotice: 'يومياً من 9:00 صباحاً حتى 5:00 مساءً.',
    officialSourceUrl: 'https://egymonuments.com/locations/details/QaitbayCitadel',
  },
];

function ensureDataDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function getInitialDatabase(): DatabaseSchema {
  return {
    users: [INITIAL_PRIMARY_ADMIN, INITIAL_ADMIN],
    userPins: {
      [INITIAL_PRIMARY_ADMIN.id]: hashPin('123456'),
      [INITIAL_ADMIN.id]: hashPin('123456'),
    },
    sessions: {},
    trips: [],
    tripVersions: [],
    inquiries: [],
    reviews: [],
    notifications: [],
    plans: DEFAULT_PLANS,
    subscriptions: [
      {
        id: `sub_admin_${INITIAL_PRIMARY_ADMIN.id}`,
        userId: INITIAL_PRIMARY_ADMIN.id,
        planId: 'plan_premium',
        planCode: 'PREMIUM',
        status: 'ACTIVE',
        startDate: new Date().toISOString(),
        amountPaid: 0,
        currency: 'EGP',
        provider: 'ADMIN_GRANT',
      },
      {
        id: `sub_admin_${INITIAL_ADMIN.id}`,
        userId: INITIAL_ADMIN.id,
        planId: 'plan_premium',
        planCode: 'PREMIUM',
        status: 'ACTIVE',
        startDate: new Date().toISOString(),
        amountPaid: 0,
        currency: 'EGP',
        provider: 'ADMIN_GRANT',
      },
    ],
    paymentRequests: [],
    promoCodes: DEFAULT_PROMOS,
    aiUsage: {
      [INITIAL_PRIMARY_ADMIN.id]: {
        userId: INITIAL_PRIMARY_ADMIN.id,
        lifetimeUsed: 0,
        lifetimeLimit: 99999,
        currentPlanAiLimit: 99999,
        isUnlimited: true,
        history: [],
      },
      [INITIAL_ADMIN.id]: {
        userId: INITIAL_ADMIN.id,
        lifetimeUsed: 0,
        lifetimeLimit: 99999,
        currentPlanAiLimit: 99999,
        isUnlimited: true,
        history: [],
      },
    },
    auditLogs: [
      {
        id: 'log_init',
        userId: INITIAL_PRIMARY_ADMIN.id,
        userEmail: INITIAL_PRIMARY_ADMIN.email,
        action: 'SYSTEM_BOOTSTRAP',
        details: 'TOURVIA production database initialized with clean configuration.',
        timestamp: new Date().toISOString(),
      },
    ],
    campaigns: [],
    adminAiSettings: {
      freeAiLifetimeLimit: 3,
      aiProvider: 'gemini',
      aiModel: 'gemini-3.7-flash',
      allowDayRegeneration: true,
      dayRegenConsumesQuota: false,
      fallbackEnabled: true,
    },
    homepageStats: DEFAULT_HOMEPAGE_STATS,
    publicLinkViews: {},
    complianceRequirements: DEFAULT_COMPLIANCE_REQUIREMENTS,
    regulatoryUpdates: DEFAULT_REGULATORY_UPDATES,
    complaints: [],
    siteRegulatoryNotices: DEFAULT_SITE_NOTICES,
    documentRetentionSettings: {
      maxDaysUnverifiedDocs: 90,
      autoPurgeRejectedDocs: true,
      lastPurgeRunAt: new Date().toISOString(),
    },
  };
}

class Database {
  private db: DatabaseSchema;

  constructor() {
    ensureDataDirectory();

    // On Vercel, seed the writable /tmp DB from the committed read-only file
    // on cold starts so existing data (users, trips, ...) is preserved.
    if (IS_VERCEL && !fs.existsSync(DB_FILE) && fs.existsSync(SOURCE_DB_FILE)) {
      try {
        fs.copyFileSync(SOURCE_DB_FILE, DB_FILE);
      } catch (err) {
        console.warn('Could not seed DB from source, starting fresh:', err);
      }
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.db = JSON.parse(raw);

        // Merge missing tables if updated
        const initial = getInitialDatabase();
        this.db.plans = this.db.plans || initial.plans;
        this.db.promoCodes = this.db.promoCodes || initial.promoCodes;
        this.db.adminAiSettings = this.db.adminAiSettings || initial.adminAiSettings;
        this.db.homepageStats = this.db.homepageStats || initial.homepageStats;
        this.db.publicLinkViews = this.db.publicLinkViews || initial.publicLinkViews;
        this.db.complianceRequirements = this.db.complianceRequirements || initial.complianceRequirements;
        this.db.regulatoryUpdates = this.db.regulatoryUpdates || initial.regulatoryUpdates;
        this.db.complaints = this.db.complaints || initial.complaints;
        this.db.siteRegulatoryNotices = this.db.siteRegulatoryNotices || initial.siteRegulatoryNotices;
        this.db.documentRetentionSettings = this.db.documentRetentionSettings || initial.documentRetentionSettings;

        // Auto-clean any old mock users (e.g. usr_guide_tamer)
        this.db.users = (this.db.users || []).filter(u => u.id !== 'usr_guide_tamer' && u.email !== 'tamer.guide@tourvia.app');
        
        // Auto-clean mock demo trips
        this.db.trips = (this.db.trips || []).filter(t => t.id !== 'trip_egypt_classic_5d' && t.guideId !== 'usr_guide_tamer');
        this.db.tripVersions = (this.db.tripVersions || []).filter(tv => tv.tripId !== 'trip_egypt_classic_5d');
        this.db.inquiries = (this.db.inquiries || []).filter(i => i.id !== 'inq_1' && i.guideId !== 'usr_guide_tamer');
        this.db.reviews = (this.db.reviews || []).filter(r => r.id !== 'rev_1' && r.id !== 'rev_2' && r.guideId !== 'usr_guide_tamer');
        this.db.paymentRequests = (this.db.paymentRequests || []).filter(p => p.id !== 'pay_init_1' && p.userId !== 'usr_guide_tamer');
        this.db.complaints = (this.db.complaints || []).filter(c => c.id !== 'cmp_demo_1' && c.guideId !== 'usr_guide_tamer');
        delete this.db.aiUsage['usr_guide_tamer'];
        delete this.db.publicLinkViews['tv_demo_egypt_explorer_2026'];

        // Ensure administrator accounts are present and elevated
        const targetEmail = 'mohamedseo2002@gmail.com'.toLowerCase();
        const existingAdmin = this.db.users.find(u => u.email.toLowerCase() === targetEmail);
        if (existingAdmin) {
          existingAdmin.role = 'admin';
          existingAdmin.accountType = 'admin';
          existingAdmin.verificationStatus = 'VERIFIED';
          // Only set PIN if not already set (don't override on every restart)
          if (!this.db.userPins[existingAdmin.id]) {
            this.db.userPins[existingAdmin.id] = hashPin('123456');
          }
        } else {
          this.db.users.unshift(INITIAL_PRIMARY_ADMIN);
          this.db.userPins[INITIAL_PRIMARY_ADMIN.id] = hashPin('123456');
        }

        const masterAdmin = this.db.users.find(u => u.id === INITIAL_ADMIN.id || u.email === INITIAL_ADMIN.email);
        if (masterAdmin) {
          masterAdmin.role = 'admin';
          masterAdmin.accountType = 'admin';
          masterAdmin.verificationStatus = 'VERIFIED';
          // Only set PIN if not already set (don't override on every restart)
          if (!this.db.userPins[masterAdmin.id]) {
            this.db.userPins[masterAdmin.id] = hashPin('123456');
          }
        } else {
          this.db.users.push(INITIAL_ADMIN);
          this.db.userPins[INITIAL_ADMIN.id] = hashPin('123456');
        }

        // Ensure AI usage and subscription for all admins
        this.db.users.filter(u => u.role === 'admin').forEach(adminUser => {
          if (!this.db.aiUsage[adminUser.id]) {
            this.db.aiUsage[adminUser.id] = {
              userId: adminUser.id,
              lifetimeUsed: 0,
              lifetimeLimit: 99999,
              currentPlanAiLimit: 99999,
              isUnlimited: true,
              history: [],
            };
          }
          const hasSub = this.db.subscriptions.some(s => s.userId === adminUser.id && s.status === 'ACTIVE');
          if (!hasSub) {
            this.db.subscriptions.push({
              id: `sub_admin_${adminUser.id}`,
              userId: adminUser.id,
              planId: 'plan_premium',
              planCode: 'PREMIUM',
              status: 'ACTIVE',
              startDate: new Date().toISOString(),
              amountPaid: 0,
              currency: 'EGP',
              provider: 'ADMIN_GRANT',
            });
          }
        });

        this.save();
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

export function clearAllMockData(): { removedUsers: number; removedTrips: number } {
  const nonAdminUsers = db.users.filter(u => u.role !== 'admin' && u.email !== 'mohamedseo2002@gmail.com' && u.email !== 'admin@tourvia.app');
  const removedUsers = nonAdminUsers.length;
  const removedTrips = db.trips.length;

  db.trips = [];
  db.tripVersions = [];
  db.inquiries = [];
  db.reviews = [];
  db.paymentRequests = [];
  db.campaigns = [];
  db.complaints = [];
  db.publicLinkViews = {};
  db.notifications = [];

  const newAiUsage: Record<string, AiUsageData> = {};
  db.users.filter(u => u.role === 'admin').forEach(a => {
    newAiUsage[a.id] = db.aiUsage[a.id] || {
      userId: a.id,
      lifetimeUsed: 0,
      lifetimeLimit: 99999,
      currentPlanAiLimit: 99999,
      isUnlimited: true,
      history: [],
    };
  });
  db.aiUsage = newAiUsage;

  db.auditLogs.push({
    id: `log_${generateSecureToken('l')}`,
    userId: INITIAL_PRIMARY_ADMIN.id,
    userEmail: INITIAL_PRIMARY_ADMIN.email,
    action: 'PURGE_MOCK_DATA',
    details: `Admin purged all mock data (${removedUsers} users and ${removedTrips} trips cleaned).`,
    timestamp: new Date().toISOString(),
  });

  saveDb();
  return { removedUsers, removedTrips };
}

// Compliance Helper Functions
export function getComplianceReadinessReport(): ComplianceReadinessReport {
  const reqs = db.complianceRequirements || [];
  const totalReqs = reqs.length;
  const compliantCount = reqs.filter(r => r.status === 'COMPLIANT').length;
  const inReviewCount = reqs.filter(r => r.status === 'IN_REVIEW').length;
  const needsUpdateCount = reqs.filter(r => r.status === 'NEEDS_UPDATE').length;
  const nonCompliantCount = reqs.filter(r => r.status === 'NON_COMPLIANT').length;
  const notApplicableCount = reqs.filter(r => r.status === 'NOT_APPLICABLE').length;

  const applicableTotal = totalReqs - notApplicableCount;
  const overallReadinessScore = applicableTotal > 0
    ? Math.round(((compliantCount + inReviewCount * 0.5) / applicableTotal) * 100)
    : 100;

  // Group by category
  const categoriesMap = new Map<string, {
    category: any;
    categoryNameAr: string;
    total: number;
    compliant: number;
    inReview: number;
    needsUpdate: number;
    nonCompliant: number;
    riskLevel: any;
  }>();

  reqs.forEach(r => {
    if (!categoriesMap.has(r.category)) {
      categoriesMap.set(r.category, {
        category: r.category,
        categoryNameAr: r.categoryNameAr,
        total: 0,
        compliant: 0,
        inReview: 0,
        needsUpdate: 0,
        nonCompliant: 0,
        riskLevel: 'LOW',
      });
    }
    const cat = categoriesMap.get(r.category)!;
    cat.total++;
    if (r.status === 'COMPLIANT') cat.compliant++;
    else if (r.status === 'IN_REVIEW') {
      cat.inReview++;
      if (cat.riskLevel === 'LOW') cat.riskLevel = 'MEDIUM';
    } else if (r.status === 'NEEDS_UPDATE') {
      cat.needsUpdate++;
      if (cat.riskLevel !== 'LEGAL_REVIEW_REQUIRED') cat.riskLevel = 'HIGH';
    } else if (r.status === 'NON_COMPLIANT') {
      cat.nonCompliant++;
      cat.riskLevel = 'LEGAL_REVIEW_REQUIRED';
    }
    if (r.riskLevel === 'LEGAL_REVIEW_REQUIRED') {
      cat.riskLevel = 'LEGAL_REVIEW_REQUIRED';
    }
  });

  const allGuides = (db.users || []).filter(u => u.accountType === 'guide' || u.role === 'user');
  const now = new Date();
  const thirtyDaysFromNow = new Date(Date.now() + 30 * 86400000);

  let expiringCount = 0;
  let expiredCount = 0;
  let verifiedLicensedCount = 0;
  let pendingCount = 0;

  allGuides.forEach(g => {
    if (g.verificationStatus === 'LICENSED_GUIDE_VERIFIED' || g.verificationStatus === 'VERIFIED') {
      verifiedLicensedCount++;
      if (g.licenseInfo?.expiryDate) {
        const exp = new Date(g.licenseInfo.expiryDate);
        if (exp < now) {
          expiredCount++;
        } else if (exp <= thirtyDaysFromNow) {
          expiringCount++;
        }
      }
    } else if (g.verificationStatus === 'PENDING_VERIFICATION' || g.verificationStatus === 'NEW') {
      pendingCount++;
    }
  });

  const openComplaints = (db.complaints || []).filter(c => c.status === 'OPEN' || c.status === 'INVESTIGATING').length;
  const legalReviewFlags = reqs.filter(r => r.riskLevel === 'LEGAL_REVIEW_REQUIRED' || r.status === 'NEEDS_UPDATE').length;

  return {
    overallReadinessScore,
    statusDistribution: {
      compliant: compliantCount,
      inReview: inReviewCount,
      needsUpdate: needsUpdateCount,
      nonCompliant: nonCompliantCount,
      notApplicable: notApplicableCount,
    },
    totalRequirements: totalReqs,
    categories: Array.from(categoriesMap.values()),
    activeGuidesCount: allGuides.length,
    verifiedLicensedGuidesCount: verifiedLicensedCount,
    pendingVerificationGuidesCount: pendingCount,
    expiringLicensesCount: expiringCount,
    expiredLicensesCount: expiredCount,
    openComplaintsCount: openComplaints,
    legalReviewFlagsCount: legalReviewFlags,
    lastAuditDate: new Date().toISOString(),
  };
}
