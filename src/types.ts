export type AccountType = 'guide' | 'company' | 'admin';
export type VerificationStatus = 'PENDING_VERIFICATION' | 'VERIFIED' | 'REJECTED';
export type WorkingLanguage = 'ar' | 'en' | 'de' | 'ru' | 'pl' | 'it' | 'fr' | 'es' | 'zh' | string;

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  accountType: AccountType;
  workingLanguages: WorkingLanguage[];
  verificationStatus: VerificationStatus;
  verificationNote?: string;
  proofDocumentUrl?: string;
  syndicateNumber?: string;
  licenseNumber?: string;
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
    workingLanguages?: string[];
    languages?: string[];
    isVerified?: boolean;
  };
  reviews: TripReview[];
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
