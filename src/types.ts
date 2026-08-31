export type AccountType = 'guide' | 'company' | 'admin';

export type VerificationStatus =
  | 'NEW'
  | 'PENDING_VERIFICATION'
  | 'IDENTITY_VERIFIED'
  | 'LICENSED_GUIDE_VERIFIED'
  | 'NEEDS_UPDATE'
  | 'LICENSE_EXPIRED'
  | 'SUSPENDED'
  | 'NOT_ELIGIBLE'
  // Backward compatibility aliases
  | 'VERIFIED'
  | 'REJECTED';

export type ProfessionalScope = 'GENERAL_PLANNER' | 'LICENSED_GUIDE' | 'TOURISM_COMPANY';

export interface GuideLicenseInfo {
  fullLegalName?: string;
  nationalIdMasked?: string; // Encrypted or masked for privacy (e.g. *******1234)
  licenseNumber?: string; // رقم ترخيص مزاولة الإرشاد السياحي
  syndicateNumber?: string; // رقم القيد بنقابة المرشدين السياحيين
  issuingAuthority?: string; // e.g. "وزارة السياحة والآثار - جمهورية مصر العربية"
  issueDate?: string;
  expiryDate?: string; // تاريخ الانتهاء / التجديد الدوري
  authorizedLanguages?: string[]; // اللغات المعتمدة رسميًا في الترخيص
  isLicenseExpiringSoon?: boolean; // ينتهي خلال 30 يوم
  isLicenseExpired?: boolean;
  licenseValidityStatus?: 'VALID' | 'EXPIRING_SOON' | 'EXPIRED' | 'SUSPENDED' | 'NOT_APPLICABLE';
  verifiedAt?: string;
  verifiedByAdminId?: string;
  verifiedByAdminEmail?: string;
  verificationNotes?: string;
  documentRetentionPolicy?: 'RETAIN_DURING_ACTIVE_STATUS' | 'PURGE_AFTER_1_YEAR' | 'PURGED_SECURELY';
  commercialEntityStatus?: 'INDIVIDUAL_GUIDE' | 'VERIFIED_COMPANY' | 'UNVERIFIED_CLAIM';
  prohibitedClaimsDetected?: string[];
  requiresLegalReview?: boolean;
}

export type WorkingLanguage = 'ar' | 'en' | 'de' | 'ru' | 'pl' | 'it' | 'fr' | 'es' | 'zh' | string;

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  accountType: AccountType;
  workingLanguages: WorkingLanguage[];
  authorizedLanguages?: string[]; // Verified on official license documents
  verificationStatus: VerificationStatus;
  verificationNote?: string;
  proofDocumentUrl?: string; // Internal protected storage reference
  proofDocumentType?: 'MINISTRY_LICENSE' | 'SYNDICATE_CARD' | 'TAX_CARD' | 'COMMERCIAL_REGISTER';
  syndicateNumber?: string;
  licenseNumber?: string;
  licenseInfo?: GuideLicenseInfo;
  bio?: string;
  recoveryCode: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
  companyName?: string;
  companyTagline?: string;
  companyBrandColor?: string;
  companyLogoUrl?: string;
}

export interface AuthSession {
  token: string;
  user: User;
  expiresAt: string;
}

export type TravelerType = 'solo' | 'couple' | 'family' | 'group' | 'vip' | 'honeymoon' | 'seniors';
export type BudgetTier = 'budget' | 'standard' | 'luxury' | 'ultra_luxury';
export type TravelPace = 'relaxed' | 'moderate' | 'fast_paced' | 'intensive';
export type WalkingLevel = 'minimal' | 'light' | 'moderate' | 'high';
export type TripStatus = 'draft' | 'published' | 'archived';

export interface DestinationCoords {
  lat: number;
  lng: number;
}

export interface TripDestination {
  id: string;
  name: string;
  nameAr?: string;
  coordinates?: DestinationCoords;
  description?: string;
  imageUrl?: string;
  order?: number;
  arrivalDay?: number;
  departureDay?: number;
  nightsCount?: number;
  highlightAttractions?: string[];
  suggestedActivities?: string[];
  notes?: string;
}

export interface TripStation {
  id: string;
  dayNumber?: number;
  name: string;
  nameAr?: string;
  description?: string;
  time?: string; // e.g. "09:00"
  startTime?: string;
  endTime?: string;
  durationMinutes?: number;
  activityType?: 'sightseeing' | 'museum' | 'historical' | 'adventure' | 'culinary' | 'shopping' | 'relaxation' | 'transit' | 'photo_stop' | string;
  locationName?: string;
  notes?: string;
  order?: number;
}

export interface Station extends TripStation {}

export interface TripTransportation {
  id: string;
  fromDestination: string;
  toDestination: string;
  type: 'car' | 'bus' | 'train' | 'flight' | 'boat' | 'walking' | 'other' | string;
  departureTime?: string;
  meetingPoint?: string;
  distanceKm: number;
  estimatedDurationMinutes: number;
  estimatedCost: number;
  notes?: string;
}

export interface TransportationLeg extends TripTransportation {}

export interface TripDay {
  id?: string;
  dayNumber: number;
  date?: string;
  title: string;
  destinationId?: string;
  destinationName: string;
  morningActivity?: string;
  afternoonActivity?: string;
  eveningActivity?: string;
  stations?: TripStation[];
  mealsIncluded?: {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
  };
  notes?: string;
}

export interface TripCosts {
  accommodation: number;
  transportation: number;
  activities: number;
  guideFee: number;
  food: number;
  otherCosts: number;
  accommodationCost?: number;
  transportationCost?: number;
  activitiesTicketsCost?: number;
  guideFees?: number;
  mealsCost?: number;
  totalCost: number;
  sellingPrice: number;
  calculatedProfit: number;
  profitMarginPercent: number;
  currency: string;
}

export interface TripVersion {
  id: string;
  tripId: string;
  versionNumber: number;
  changeSummary: string;
  createdAt: string;
  createdBy: string;
  snapshot: any;
}

export interface Trip {
  id: string;
  guideId: string;
  guideName: string;
  guidePhone?: string;
  guideEmail?: string;
  name: string;
  summary: string;
  startCity?: string;
  season?: string;
  durationDays: number;
  nightsCount: number;
  travelerType: TravelerType;
  travelersCount: number;
  budgetTier: BudgetTier;
  travelPace: TravelPace;
  walkingPreference: WalkingLevel;
  interests: string[];
  restrictions: string[];
  notes: string;
  status: TripStatus;
  isArchived: boolean;
  coverImage?: string;
  destinations: TripDestination[];
  days: TripDay[];
  transportation: TripTransportation[];
  costs: TripCosts;
  publicToken?: string;
  publicLinkUrl?: string;
  isPublicPriceVisible: boolean;
  sellingPrice?: number;
  currency?: string;
  publicNotes?: string;
  inclusions: string[];
  exclusions: string[];
  currentVersion: number;
  createdAt: string;
  updatedAt: string;
}

export interface PublicTripData {
  token: string;
  tripId: string;
  name: string;
  summary: string;
  durationDays: number;
  nightsCount: number;
  travelerType: TravelerType;
  travelersCount: number;
  travelPace: TravelPace;
  interests: string[];
  coverImage?: string;
  destinations: TripDestination[];
  days: TripDay[];
  transportation: {
    fromDestination: string;
    toDestination: string;
    type: string;
    distanceKm: number;
    estimatedDurationMinutes: number;
  }[];
  inclusions?: string[];
  exclusions?: string[];
  publicNotes?: string;
  sellingPrice?: number;
  currency?: string;
  isPublicPriceVisible: boolean;
  guide: {
    name: string;
    companyName?: string;
    companyTagline?: string;
    brandColor?: string;
    logoUrl?: string;
    phone?: string;
    email?: string;
    languages?: string[];
    isVerified?: boolean;
  };
  viewsCount: number;
  averageRating: number;
  reviewsCount: number;
}

export interface PublicTripPayload {
  trip: any;
  guide: {
    id?: string;
    name: string;
    companyName?: string;
    companyTagline?: string;
    companyLogoUrl?: string;
    companyBrandColor?: string;
    brandColor?: string;
    logoUrl?: string;
    phone?: string;
    email?: string;
    verificationStatus?: string;
    verificationLabelAr?: string;
    workingLanguages?: string[];
    authorizedLanguages?: string[];
    languages?: string[];
    isVerified?: boolean;
    isLicensedGuideVerified?: boolean;
    commercialScope?: 'INDIVIDUAL_GUIDE' | 'VERIFIED_COMPANY' | 'UNVERIFIED_CLAIM';
    commercialScopeLabelAr?: string;
  };
  reviews: TripReview[];
  regulatoryDisclaimer?: string;
  siteNotices?: SiteRegulatoryNotice[];
}

export interface TripReview {
  id: string;
  tripId: string;
  guideId: string;
  clientName: string;
  clientCountry?: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
}

export interface CustomerInquiry {
  id: string;
  tripId: string;
  tripName?: string;
  guideId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  travelDate?: string;
  preferredDate?: string;
  groupSize?: number;
  numberOfTravelers?: number;
  message: string;
  status: 'NEW' | 'CONTACTED' | 'BOOKED' | 'IN_PROGRESS' | 'RESOLVED' | 'ARCHIVED';
  createdAt: string;
}

export type NotificationType =
  | 'VERIFICATION'
  | 'SYSTEM'
  | 'TRIP'
  | 'AI'
  | 'BILLING'
  | 'SUBSCRIPTION'
  | 'PROMO'
  | 'INQUIRY'
  | 'REVIEW'
  | 'ADMIN';

export interface NotificationItem {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

export interface SubscriptionPlan {
  id: string;
  code: 'FREE' | 'BASIC' | 'PRO' | 'PREMIUM' | 'AGENCY' | string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr?: string;
  price: number;
  currency: string;
  billingPeriod?: 'lifetime' | 'monthly' | 'yearly';
  billingCycle?: 'lifetime' | 'monthly' | 'yearly';
  aiLimit: number;
  aiUnlimited: boolean;
  features: string[];
  featuresAr?: string[];
  maxDestinations?: number;
  exportsAllowed?: boolean;
  brandingAllowed?: boolean;
  teamMembers?: number;
  isActive: boolean;
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  planCode: string;
  status: 'ACTIVE' | 'PENDING' | 'EXPIRED' | 'CANCELLED' | 'SUSPENDED';
  startDate: string;
  endDate?: string;
  amountPaid: number;
  currency: string;
  provider?: string;
}

export type PaymentMethod = 'INSTAPAY' | 'VODAFONE_CASH' | 'WHATSAPP' | 'BANK_TRANSFER' | 'CARD' | string;

export interface PaymentRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  planId: string;
  planName?: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  transactionReference?: string;
  transactionRef?: string;
  proofImageUrl?: string;
  receiptUrl?: string;
  receiptImageUrl?: string;
  promoCodeUsed?: any;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNote?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface PromoCode {
  id: string;
  code: string;
  discountPercent?: number;
  fixedDiscount?: number;
  startDate?: string;
  expiryDate?: string;
  maxUses?: number;
  usedCount: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  isActive: boolean;
}

export interface AiUsageData {
  userId: string;
  lifetimeUsed: number;
  lifetimeLimit: number;
  currentPlanAiLimit: number;
  isUnlimited: boolean;
  history: {
    id: string;
    tripName: string;
    destinations: string[];
    durationDays: number;
    isDayRegen?: boolean;
    timestamp: string;
    success: boolean;
  }[];
}

export interface AuditLogItem {
  id: string;
  userId?: string;
  userEmail?: string;
  action: string;
  details: string;
  ipAddress?: string;
  timestamp: string;
}

export interface Campaign {
  id: string;
  title: string;
  targetSegment?: 'all' | 'free_users' | 'paid_users' | 'verified_guides' | string;
  message: string;
  promoCode?: string;
  status?: 'draft' | 'active' | 'completed' | string;
  sentCount: number;
  createdAt: string;
}

export interface AdminAiSettings {
  freeAiLifetimeLimit: number;
  aiProvider: string;
  aiModel: string;
  allowDayRegeneration: boolean;
  dayRegenConsumesQuota: boolean;
  fallbackEnabled: boolean;
}

// -------------------------------------------------------------
// Egyptian Tourism Regulatory Compliance & Legal Readiness Models
// -------------------------------------------------------------

export type ComplianceCategory =
  | 'GUIDE_REQUIREMENTS'
  | 'VERIFICATION_STATUS'
  | 'DOCUMENTS_SECURITY'
  | 'AUTHORIZED_LANGUAGES'
  | 'PROFESSIONAL_SCOPE'
  | 'ITINERARIES_SITES'
  | 'AI_CONTENT_SAFETY'
  | 'PRIVACY_MINIMIZATION'
  | 'COMPLAINTS_INTEGRITY'
  | 'AUDIT_LOGS'
  | 'REGULATORY_REVIEW';

export type ComplianceRequirementStatus =
  | 'COMPLIANT' // مستوفى
  | 'NON_COMPLIANT' // غير مستوفى
  | 'IN_REVIEW' // قيد المراجعة
  | 'NEEDS_UPDATE' // يحتاج تحديث
  | 'NOT_APPLICABLE'; // غير منطبق

export interface ComplianceRequirement {
  id: string;
  category: ComplianceCategory;
  categoryNameAr: string;
  title: string;
  titleAr: string;
  legalBasis: string; // e.g. "القانون رقم 121 لسنة 1983 ولائحته التنفيذية وقرارات وزارة السياحة والآثار"
  description: string;
  descriptionAr: string;
  status: ComplianceRequirementStatus;
  statusAr: 'مستوفى' | 'غير مستوفى' | 'قيد المراجعة' | 'يحتاج تحديث' | 'غير منطبق';
  evidenceNote: string;
  lastReviewedAt: string;
  reviewedBy: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'LEGAL_REVIEW_REQUIRED';
  actionRequired?: string;
}

export interface RegulatoryUpdate {
  id: string;
  regulationName: string;
  regulationNameAr: string;
  source: string; // e.g. "وزارة السياحة والآثار / الجريدة الرسمية"
  decreeNumber?: string; // e.g. "قرار وزاري رقم 82 لسنة 2024"
  publishedDate: string;
  effectiveDate: string;
  summaryAr: string;
  affectedPlatformFeature: string;
  requiredSystemChange: string;
  reviewStatus: 'PENDING_LEGAL_REVIEW' | 'IMPLEMENTED' | 'MONITORING';
  reviewedBy?: string;
  notes?: string;
  updatedAt: string;
}

export type ComplaintType =
  | 'MISLEADING_GUIDE_STATUS'
  | 'FALSE_COMMERCIAL_CLAIM'
  | 'INACCURATE_SITE_INFO'
  | 'INAPPROPRIATE_CONTENT'
  | 'PRICING_DISCREPANCY'
  | 'UNAUTHORIZED_ACTIVITY'
  | 'OTHER';

export type ComplaintStatus =
  | 'OPEN'
  | 'INVESTIGATING'
  | 'INFO_REQUESTED'
  | 'RESOLVED'
  | 'DISMISSED'
  | 'ESCALATED';

export interface PlatformComplaint {
  id: string;
  tripId?: string;
  tripName?: string;
  guideId?: string;
  guideName?: string;
  reporterName: string;
  reporterEmail: string;
  reporterPhone?: string;
  reporterRole: 'traveler' | 'guide' | 'public_visitor' | 'other';
  complaintType: ComplaintType;
  description: string;
  evidenceUrl?: string;
  status: ComplaintStatus;
  adminNotes?: string;
  resolutionSummary?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SiteRegulatoryNotice {
  siteKey: string;
  nameAr: string;
  nameEn: string;
  category: 'ARCHAEOLOGICAL_SITE' | 'MUSEUM' | 'NATURAL_RESERVE' | 'GENERAL_ATTRACTION';
  requiresOfficialLicensedGuide: boolean;
  photographyPermitNotice: string; // "تصاريح التصوير التجاري والسينمائي تتطلب موافقة المجلس الأعلى للآثار"
  officialTicketingNotice: string; // "تخضع الأسعار والمواعيد لضوابط وزارة السياحة والآثار"
  openingHoursNotice: string;
  officialSourceUrl: string;
}

export interface ComplianceReadinessReport {
  overallReadinessScore: number; // 0-100%
  statusDistribution: {
    compliant: number;
    inReview: number;
    needsUpdate: number;
    nonCompliant: number;
    notApplicable: number;
  };
  totalRequirements: number;
  categories: {
    category: ComplianceCategory;
    categoryNameAr: string;
    total: number;
    compliant: number;
    inReview: number;
    needsUpdate: number;
    nonCompliant: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'LEGAL_REVIEW_REQUIRED';
  }[];
  activeGuidesCount: number;
  verifiedLicensedGuidesCount: number;
  pendingVerificationGuidesCount: number;
  expiringLicensesCount: number;
  expiredLicensesCount: number;
  openComplaintsCount: number;
  legalReviewFlagsCount: number;
  lastAuditDate: string;
}

export interface HomepageCustomStats {
  mode: 'auto' | 'custom';
  usersCountOverride: number;
  usersCountDisplay: string;
  usersCountLabelAr: string;
  usersCountLabelEn: string;
  tripsCountOverride: number;
  tripsCountDisplay: string;
  tripsCountLabelAr: string;
  tripsCountLabelEn: string;
  monumentsCountDisplay: string;
  monumentsLabelAr: string;
  monumentsLabelEn: string;
  satisfactionRateDisplay: string;
  satisfactionLabelAr: string;
  satisfactionLabelEn: string;
  heroTaglineAr?: string;
  heroTaglineEn?: string;
  updatedAt?: string;
}

export interface PublicStatsMetricItem {
  display: string;
  labelAr: string;
  labelEn: string;
}

export interface PublicStatsResponse {
  stats: HomepageCustomStats & {
    effectiveUsersDisplay?: string;
    effectiveTripsDisplay?: string;
  };
  users: PublicStatsMetricItem;
  trips: PublicStatsMetricItem;
  monuments: PublicStatsMetricItem;
  satisfaction: PublicStatsMetricItem;
  realCounts: {
    totalUsers: number;
    totalTrips: number;
    publishedTrips: number;
    verifiedGuides: number;
  };
}

