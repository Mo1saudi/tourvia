import { WorkingLanguage } from '../types';
import { ar } from './locales/ar';
import { en } from './locales/en';
import { de } from './locales/de';
import { fr } from './locales/fr';
import { es } from './locales/es';
import { it } from './locales/it';
import { pl } from './locales/pl';
import { ru } from './locales/ru';
import { zh } from './locales/zh';

export interface Translations {
  appName: string;
  tagline: string;
  subheadline: string;
  ctaCreateTrip: string;
  ctaGuideLogin: string;
  ctaExplore: string;
  ctaRegister: string;
  ctaViewPlans: string;
  navDashboard: string;
  navTrips: string;
  navBuilder: string;
  navAnalytics: string;
  navSubscriptions: string;
  navAdmin: string;
  navNotifications: string;
  navLogout: string;
  navProfile: string;

  // Public Navigation & Homepage Experience
  navHome: string;
  navPlans: string;
  navPrograms: string;
  navAbout: string;
  ctaStartNow: string;

  // Program Preview & Customer Experience
  programsSectionTitle: string;
  programsSectionSubtitle: string;
  liveClientExperience: string;
  interactiveItinerary: string;
  exploreDemoProgram: string;
  customerLinkHeader: string;
  customerLinkDesc: string;
  guideStep1: string;
  guideStep2: string;
  guideStep3: string;
  guideStep4: string;
  travelerValueQuote: string;

  // Product Slideshow
  slideshowSectionTitle: string;
  slideshowSectionSubtitle: string;
  slide1Title: string;
  slide1Desc: string;
  slide2Title: string;
  slide2Desc: string;
  slide3Title: string;
  slide3Desc: string;
  slide4Title: string;
  slide4Desc: string;
  slide5Title: string;
  slide5Desc: string;
  slide6Title: string;
  slide6Desc: string;

  // About TOURVIA
  aboutTourviaTitle: string;
  aboutTourviaSubtitle: string;
  aboutMissionText: string;
  aboutPoint1Title: string;
  aboutPoint1Desc: string;
  aboutPoint2Title: string;
  aboutPoint2Desc: string;
  aboutPoint3Title: string;
  aboutPoint3Desc: string;

  // Plans Section
  plansSectionTitle: string;
  plansSectionSubtitle: string;
  freePlanName: string;
  basicPlanName: string;
  proPlanName: string;
  agencyPlanName: string;
  mostPopular: string;
  startFree: string;

  // Theme
  themeLight: string;
  themeDark: string;
  themeToggle: string;

  // Auth & Pin
  loginTitle: string;
  registerTitle: string;
  fullName: string;
  emailOrPhone: string;
  email: string;
  phone: string;
  pin: string;
  pinHint: string;
  rememberDevice: string;
  accountType: string;
  guideAccount: string;
  companyAccount: string;
  workingLanguages: string;
  tourismProof: string;
  tourismProofHint: string;
  mathChallenge: string;
  mathChallengePlaceholder: string;
  mathChallengeExpired: string;
  mathChallengeWrong: string;
  forgotPin: string;
  recoverPin: string;
  recoveryCode: string;
  recoveryCodeHint: string;
  haveAccount: string;
  noAccount: string;
  loginSuccess: string;
  registerSuccess: string;

  // Verification
  statusPending: string;
  statusVerified: string;
  statusRejected: string;
  verificationBannerTitle: string;
  verificationPendingMsg: string;
  verificationVerifiedMsg: string;
  verificationRejectedMsg: string;

  // AI Free Quota
  aiBadge: string;
  aiFreeCounterTitle: string;
  aiFreeRemaining: string;
  aiFreeLimitReached: string;
  aiGenerateSuccess: string;
  aiRegenerateDay: string;
  aiReadinessCheck: string;
  aiReadyDesc: string;
  aiNotReadyDesc: string;
  aiGenerating: string;
  aiGeneratingDesc: string;
  aiFallbackUsed: string;

  // Trip Builder Steps
  stepBasicInfo: string;
  stepDestinations: string;
  stepAiGenerate: string;
  stepItinerary: string;
  stepTransportation: string;
  stepCosts: string;
  stepReview: string;

  tripName: string;
  durationDays: string;
  nightsCount: string;
  travelerType: string;
  travelersCount: string;
  budgetTier: string;
  travelPace: string;
  walkingPreference: string;
  interests: string;
  restrictions: string;
  notes: string;
  destinationsTitle: string;
  addDestination: string;
  destinationOrder: string;
  stationsTitle: string;
  addStation: string;
  stationName: string;
  stationTime: string;
  stationDuration: string;
  stationType: string;
  transportationTitle: string;
  transitType: string;
  transitDistance: string;
  transitDuration: string;
  transitCost: string;

  // Cost & Profit
  costAccommodation: string;
  costTransportation: string;
  costActivities: string;
  costGuide: string;
  costFood: string;
  costOther: string;
  costTotal: string;
  sellingPrice: string;
  calculatedProfit: string;
  profitMargin: string;
  publishTrip: string;
  publishReady: string;
  publishWarnings: string;
  publicLinkCreated: string;
  copyPublicLink: string;
  openPublicLink: string;

  // Public View
  publicOverview: string;
  publicDestinations: string;
  publicItinerary: string;
  publicMap: string;
  publicInclusions: string;
  publicExclusions: string;
  publicNotes: string;
  publicContactGuide: string;
  publicSendInquiry: string;
  publicInquirySuccess: string;
  publicRateTrip: string;
  publicRateSuccess: string;

  // Presentation & PDF
  presentationTitle: string;
  nextSlide: string;
  prevSlide: string;
  exportPdf: string;
  exportCsv: string;

  // Plans & Payment
  plansTitle: string;
  choosePlan: string;
  planFree: string;
  planBasic: string;
  planPro: string;
  planPremium: string;
  promoCode: string;
  applyPromo: string;
  promoApplied: string;
  payWithInstaPay: string;
  payWithVodafoneCash: string;
  payWithWhatsApp: string;
  submitPaymentRequest: string;
  paymentPendingNotice: string;

  // Common UI
  save: string;
  cancel: string;
  edit: string;
  delete: string;
  archive: string;
  restore: string;
  duplicate: string;
  loading: string;
  error: string;
  close: string;
  search: string;
  filterAll: string;
  filterDraft: string;
  filterPublished: string;
  filterArchived: string;
  actions: string;

  // Extended features & Landing
  heroBadgeText: string;
  heroHeadlineMain: string;
  heroHeadlineGradient: string;
  liveClientPreview: string;
  verifiedGuideTag: string;
  demoTripLocations: string;
  openPublicClientLink: string;
  openSlidePresentation: string;
  featuresHeadline: string;
  featuresSubheadline: string;
  featureAiTitle: string;
  featureAiDesc: string;
  featureMultiDestTitle: string;
  featureMultiDestDesc: string;
  featureCostProfitTitle: string;
  featureCostProfitDesc: string;
  featurePublicPagesTitle: string;
  featurePublicPagesDesc: string;
  featurePresentationTitle: string;
  featurePresentationDesc: string;
  featureVerificationTitle: string;
  featureVerificationDesc: string;
  profitSimulatorSubtitle: string;
  profitSimulatorTitle: string;
  simDaysLabel: string;
  simTravelersLabel: string;
  simCostPerDayLabel: string;
  simMarkupLabel: string;
  simTotalCostLabel: string;
  simSellingPriceLabel: string;
  simNetProfitLabel: string;
  simStartFreeCta: string;
  footerTagline: string;
  footerRights: string;
  footerPoweredBy: string;

  // Dashboard
  welcomeUser: string;
  dashboardSubheader: string;
  upgradePlan: string;
  statTotalTrips: string;
  statActivePublished: string;
  statTotalInquiries: string;
  statAvgRating: string;
  recentTripsTitle: string;
  viewAllTrips: string;
  noTripsYet: string;
  createFirstTrip: string;
  daysUnit: string;
  nightsUnit: string;
  personsUnit: string;
  statusDraft: string;
  statusPublished: string;
  statusArchived: string;
  unlimitedQuota: string;
  markAllRead: string;
  noNotifications: string;
  myProfile: string;
  manageSubscription: string;

  // Trips List
  tripsSearchPlaceholder: string;
  tripsEmptyFilter: string;
  createNewProgram: string;
  copyLinkSuccess: string;
  deleteConfirm: string;
  archiveConfirm: string;

  // Subscriptions
  plansSubtitle: string;
  currentPlan: string;
  renewPlan: string;
  upgradeNow: string;
  activeFeatures: string;
  monthlyBilling: string;
  yearlyBilling: string;
  freeTierNotice: string;
  unlimitedAiBadge: string;
  transferDetails: string;
  instapayAccount: string;
  vodafoneCashNumber: string;
  uploadTransferReceipt: string;
  senderPhoneOrAccount: string;
  transferRefNumber: string;

  // Analytics
  analyticsTitle: string;
  analyticsSubtitle: string;
  totalPageViews: string;
  inquiryRate: string;
  inquiriesListTitle: string;
  clientName: string;
  clientContact: string;
  clientNotes: string;
  inquiryDate: string;
  inquiryStatus: string;
  inquiryStatusNew: string;
  inquiryStatusContacted: string;
  inquiryStatusBooked: string;
  inquiryStatusCancelled: string;
  noInquiriesYet: string;

  // Profile
  profileTitle: string;
  profileSubtitle: string;
  personalInfo: string;
  companyName: string;
  bioSummary: string;
  whatsappNumber: string;
  saveProfile: string;
  profileSavedSuccess: string;
  changePin: string;
  newPin: string;
  confirmNewPin: string;
  pinChangedSuccess: string;
  appAppearance: string;
  themeDescription: string;

  // Admin
  adminPanelTitle: string;
  adminPanelSubtitle: string;
  guidesManagement: string;
  paymentsManagement: string;
  approveVerification: string;
  rejectVerification: string;
  approvePayment: string;
  rejectPayment: string;

  // Trip Days
  itineraryDay: string;
  dayTheme: string;
  morningActivity: string;
  afternoonActivity: string;
  eveningActivity: string;
  costBreakdown: string;
  currencyEGP: string;
  currencyUSD: string;
  currencyEUR: string;
  currencySAR: string;
  currencyAED: string;
  profitabilitySummary: string;
  backToDashboard: string;
  regenerateWithAi: string;
  savingDraft: string;
  savedDraft: string;

  // Detailed Public & Presentation
  itineraryDetailedTitle: string;
  departureCityLabel: string;
  seasonLabel: string;
  totalPriceLabel: string;
  minutesUnit: string;
  bookInquiryTitle: string;
  bookInquiryDesc: string;
  travelDateLabel: string;
  groupSizeLabel: string;
  specialRequestsLabel: string;
  sendInquiryBtn: string;
  sendingInquiry: string;
  inquiryReceivedTitle: string;
  inquiryReceivedDesc: string;
  reviewsTitle: string;
  beFirstToReview: string;
  addYourReview: string;
  reviewPlaceholder: string;
  submitReviewBtn: string;
  countryNationality: string;
  slideCountText: string;
  slideDetailsTitle: string;
  slideIncludedExcludedTitle: string;
  slideReadyToCreateMemories: string;
  slideReadyDesc: string;
  selectLanguage: string;
  tripNotFound: string;
  downloadPdf: string;
  downloadPdfItinerary: string;
  generatingPdf: string;
  pdfExportSuccess: string;
  pdfExportError: string;
}

export const translations: Record<WorkingLanguage, Translations> = {
  ar,
  en,
  de,
  fr,
  es,
  it,
  pl,
  ru,
  zh,
};
