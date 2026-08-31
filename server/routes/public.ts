import { Router, Request, Response } from 'express';
import { db, saveDb, generateSecureToken } from '../db';
import { CustomerInquiry, TripReview, PublicTripPayload, PlatformComplaint, SiteRegulatoryNotice } from '../../src/types';

export const publicRouter = Router();

// Anti-spam in-memory IP rate limiter for public forms
const inquiryRateLimits: Record<string, { count: number; resetAt: number }> = {};
const complaintRateLimits: Record<string, { count: number; resetAt: number }> = {};

// 1. Get Public Trip by Token
publicRouter.get('/trip/:token', (req: Request, res: Response) => {
  const { token } = req.params;

  const trip = db.trips.find(t => t.publicToken === token && t.status === 'published' && !t.isArchived);

  if (!trip) {
    res.status(404).json({
      error: 'TRIP_NOT_FOUND',
      message: 'This travel program is either private, unpublished, or the link has expired.',
    });
    return;
  }

  // Increment view counter
  if (!db.publicLinkViews[token]) {
    db.publicLinkViews[token] = {
      token,
      tripId: trip.id,
      count: 1,
      firstViewAt: new Date().toISOString(),
      lastViewAt: new Date().toISOString(),
    };
  } else {
    db.publicLinkViews[token].count += 1;
    db.publicLinkViews[token].lastViewAt = new Date().toISOString();
  }
  saveDb();

  const guide = db.users.find(u => u.id === trip.guideId);
  const reviews = db.reviews.filter(r => r.tripId === trip.id);

  // Match relevant archaeological site notices based on trip destinations & stations
  const tripText = `${trip.name} ${trip.summary || ''} ${trip.destinations.map(d => `${d.name} ${d.nameAr || ''}`).join(' ')} ${trip.days.map(d => d.stations.map(s => `${s.name} ${s.nameAr || ''}`).join(' ')).join(' ')}`.toLowerCase();

  const matchedSiteNotices: SiteRegulatoryNotice[] = (db.siteRegulatoryNotices || []).filter(sn => {
    const keyMatch = tripText.includes(sn.siteKey.replace('_', ' '));
    const nameEnMatch = tripText.includes(sn.nameEn.toLowerCase().slice(0, 5));
    const nameArMatch = tripText.includes(sn.nameAr.slice(0, 6));
    return keyMatch || nameEnMatch || nameArMatch;
  });

  const isLicensed = guide?.verificationStatus === 'LICENSED_GUIDE_VERIFIED' || guide?.verificationStatus === 'VERIFIED';

  const verificationLabelAr = isLicensed
    ? 'مرشد سياحي تم التحقق من ترخيصه لدى TOURVIA'
    : 'بيانات الحساب قيد المراجعة الإدارية';

  const commercialScope = guide?.licenseInfo?.commercialEntityStatus || 'INDIVIDUAL_GUIDE';
  const commercialScopeLabelAr = commercialScope === 'VERIFIED_COMPANY'
    ? 'شركة سياحة مسجلة'
    : 'مرشد سياحي فردي مستقل';

  // SANITIZE: Do not expose private operating costs or internal guide notes to client!
  const sanitizedTrip: PublicTripPayload = {
    trip: {
      id: trip.id,
      name: trip.name,
      summary: trip.summary,
      durationDays: trip.durationDays,
      nightsCount: trip.nightsCount,
      coverImage: trip.coverImage,
      destinations: trip.destinations,
      days: trip.days,
      transportation: trip.transportation,
      inclusions: trip.inclusions,
      exclusions: trip.exclusions,
      publicNotes: trip.publicNotes,
      isPublicPriceVisible: trip.isPublicPriceVisible,
      sellingPrice: trip.isPublicPriceVisible ? trip.costs.sellingPrice : undefined,
      currency: trip.costs.currency || 'EGP',
    },
    guide: {
      id: guide?.id || trip.guideId,
      name: guide?.name || trip.guideName || 'Verified Tour Guide',
      email: guide?.email || trip.guideEmail || '',
      phone: guide?.phone || trip.guidePhone || '',
      verificationStatus: guide?.verificationStatus || 'PENDING_VERIFICATION',
      verificationLabelAr,
      workingLanguages: guide?.workingLanguages || ['ar', 'en'],
      authorizedLanguages: guide?.authorizedLanguages || (isLicensed ? ['ar', 'en'] : []),
      isVerified: isLicensed,
      isLicensedGuideVerified: isLicensed,
      commercialScope,
      commercialScopeLabelAr,
      companyName: guide?.companyName,
      companyTagline: guide?.companyTagline,
      companyLogoUrl: guide?.companyLogoUrl,
      companyBrandColor: guide?.companyBrandColor || '#f59e0b',
    },
    reviews,
    regulatoryDisclaimer: 'تعمل منصة TOURVIA كأداة تقنية لتنظيم وتصميم البرامج السياحية. لا تمثل المنصة جهة ترخيص حكومية ولا تحل محل التراخيص الرسمية الصادرة من وزارة السياحة والآثار المصرية.',
    siteNotices: matchedSiteNotices.length > 0 ? matchedSiteNotices : (db.siteRegulatoryNotices || []).slice(0, 2),
  };

  res.json(sanitizedTrip);
});

// 2. Submit Client Inquiry / Booking Request
publicRouter.post('/trip/:token/inquiry', (req: Request, res: Response) => {
  const { token } = req.params;
  const { clientName, clientEmail, clientPhone, message, preferredDate, numberOfTravelers } = req.body;

  const ip = req.ip || 'anonymous_ip';
  const now = Date.now();

  // Basic IP Rate limiting (max 10 requests per 10 mins)
  if (!inquiryRateLimits[ip] || inquiryRateLimits[ip].resetAt < now) {
    inquiryRateLimits[ip] = { count: 1, resetAt: now + 10 * 60 * 1000 };
  } else {
    inquiryRateLimits[ip].count += 1;
    if (inquiryRateLimits[ip].count > 10) {
      res.status(429).json({ error: 'Too many inquiries sent. Please wait a few moments before trying again.' });
      return;
    }
  }

  if (!clientName || (!clientEmail && !clientPhone) || !message) {
    res.status(400).json({ error: 'Please provide your name, contact information (email or phone), and inquiry message.' });
    return;
  }

  const trip = db.trips.find(t => t.publicToken === token);
  if (!trip) {
    res.status(404).json({ error: 'Trip not found.' });
    return;
  }

  const newInquiry: CustomerInquiry = {
    id: `inq_${generateSecureToken('iq')}`,
    tripId: trip.id,
    tripName: trip.name,
    guideId: trip.guideId,
    clientName: clientName.trim(),
    clientEmail: clientEmail?.trim(),
    clientPhone: clientPhone?.trim(),
    message: message.trim(),
    preferredDate,
    numberOfTravelers: numberOfTravelers ? Number(numberOfTravelers) : undefined,
    status: 'NEW',
    createdAt: new Date().toISOString(),
  };

  db.inquiries.push(newInquiry);

  // Send Notification to Guide
  db.notifications.push({
    id: `notif_${generateSecureToken('n')}`,
    userId: trip.guideId,
    type: 'INQUIRY',
    title: `استفسار عميل جديد: ${clientName.trim()}`,
    message: `تلقيت طلب استفسار جديد بخصوص برنامج "${trip.name}" من العميل ${clientName.trim()}.`,
    isRead: false,
    actionUrl: `/inquiries`,
    createdAt: new Date().toISOString(),
  });

  saveDb();

  res.status(201).json({
    success: true,
    message: 'Your inquiry has been delivered directly to the tour guide. They will get in touch with you shortly!',
  });
});

// 3. Submit Trip Review
publicRouter.post('/trip/:token/review', (req: Request, res: Response) => {
  const { token } = req.params;
  const { clientName, clientCountry, rating, comment } = req.body;

  if (!clientName || !rating || !comment) {
    res.status(400).json({ error: 'Please provide your name, rating (1-5), and review feedback.' });
    return;
  }

  const parsedRating = Math.min(5, Math.max(1, Number(rating) || 5));
  const trip = db.trips.find(t => t.publicToken === token);
  if (!trip) {
    res.status(404).json({ error: 'Trip not found.' });
    return;
  }

  const newReview: TripReview = {
    id: `rev_${generateSecureToken('r')}`,
    tripId: trip.id,
    guideId: trip.guideId,
    clientName: clientName.trim(),
    clientCountry: clientCountry?.trim() || 'Traveler',
    rating: parsedRating,
    comment: comment.trim(),
    createdAt: new Date().toISOString(),
  };

  db.reviews.push(newReview);

  // Notify Guide
  db.notifications.push({
    id: `notif_${generateSecureToken('n')}`,
    userId: trip.guideId,
    type: 'REVIEW',
    title: `تقييم جديد للرحلة (${parsedRating} نجوم)`,
    message: `قام العميل ${clientName.trim()} بترك تقييم لبرنامج "${trip.name}".`,
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  saveDb();

  res.status(201).json({
    success: true,
    review: newReview,
    message: 'Thank you for your feedback! Your review has been recorded.',
  });
});

// 4. Submit Complaint / Misrepresentation Report from Public Trip View
publicRouter.post('/trip/:token/complaint', (req: Request, res: Response) => {
  const { token } = req.params;
  const { reporterName, reporterEmail, reporterPhone, reporterRole, complaintType, description, evidenceUrl } = req.body;

  const ip = req.ip || 'anonymous_ip';
  const now = Date.now();

  // Basic IP Rate limiting (max 5 complaints per 10 mins)
  if (!complaintRateLimits[ip] || complaintRateLimits[ip].resetAt < now) {
    complaintRateLimits[ip] = { count: 1, resetAt: now + 10 * 60 * 1000 };
  } else {
    complaintRateLimits[ip].count += 1;
    if (complaintRateLimits[ip].count > 5) {
      res.status(429).json({ error: 'Too many reports submitted. Please wait before submitting another report.' });
      return;
    }
  }

  if (!reporterName || !reporterEmail || !description) {
    res.status(400).json({ error: 'Please provide your name, email address, and a description of the issue.' });
    return;
  }

  const trip = db.trips.find(t => t.publicToken === token);
  if (!trip) {
    res.status(404).json({ error: 'Trip not found.' });
    return;
  }

  const guide = db.users.find(u => u.id === trip.guideId);

  const newComplaint: PlatformComplaint = {
    id: `cmp_${generateSecureToken('c')}`,
    tripId: trip.id,
    tripName: trip.name,
    guideId: trip.guideId,
    guideName: guide?.name || trip.guideName || 'Guide',
    reporterName: reporterName.trim(),
    reporterEmail: reporterEmail.trim(),
    reporterPhone: reporterPhone?.trim(),
    reporterRole: reporterRole || 'traveler',
    complaintType: complaintType || 'MISLEADING_GUIDE_STATUS',
    description: description.trim(),
    evidenceUrl: evidenceUrl?.trim(),
    status: 'OPEN',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.complaints = db.complaints || [];
  db.complaints.push(newComplaint);

  // Notify Admins in audit log
  db.auditLogs.push({
    id: `log_${generateSecureToken('l')}`,
    action: 'PUBLIC_COMPLAINT_RECEIVED',
    details: `Complaint submitted by ${reporterName} regarding trip "${trip.name}" (Guide: ${newComplaint.guideName}). Type: ${newComplaint.complaintType}`,
    timestamp: new Date().toISOString(),
  });

  saveDb();

  res.status(201).json({
    success: true,
    complaintId: newComplaint.id,
    message: 'تم استلام بلاغك بنجاح وسيقوم فريق الامتثال والرقابة بمراجعته والتحقيق الفوري.',
  });
});

// 5. Get Public Homepage Stats & Config
publicRouter.get('/stats', (req: Request, res: Response) => {
  const statsConfig = db.homepageStats || {
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
    monumentsLabelEn: 'Egyptian Monuments & Sites',
    satisfactionRateDisplay: '99.8%',
    satisfactionLabelAr: 'دقة التوقيتات ورضا المسافرين',
    satisfactionLabelEn: 'Timetable Precision & Rating',
    heroTaglineAr: 'المنصة الذكية الرائدة لتصميم البرامج السياحية بالذكاء الاصطناعي للمرشدين والشركات السياحية في مصر',
    heroTaglineEn: 'The Smart Operating System for Egyptian Tour Guides & Agencies',
  };

  const realUsersCount = db.users.filter(u => u.accountType !== 'admin').length;
  const realTripsCount = db.trips.length;
  const realPublishedTrips = db.trips.filter(t => t.status === 'published' && !t.isArchived).length;
  const realVerifiedGuides = db.users.filter(u => u.verificationStatus === 'LICENSED_GUIDE_VERIFIED' || u.verificationStatus === 'VERIFIED').length;

  const effectiveUsersDisplay = statsConfig.mode === 'custom'
    ? (statsConfig.usersCountDisplay || `${statsConfig.usersCountOverride || 250}+`)
    : `${realUsersCount}`;

  const effectiveTripsDisplay = statsConfig.mode === 'custom'
    ? (statsConfig.tripsCountDisplay || `${statsConfig.tripsCountOverride || 1200}+`)
    : `${realTripsCount}`;

  res.json({
    stats: {
      ...statsConfig,
      effectiveUsersDisplay,
      effectiveTripsDisplay,
    },
    users: {
      display: effectiveUsersDisplay,
      labelAr: statsConfig.usersCountLabelAr || 'مرشد سياحي وشركة معتمدة',
      labelEn: statsConfig.usersCountLabelEn || 'Licensed Guides & Agencies',
    },
    trips: {
      display: effectiveTripsDisplay,
      labelAr: statsConfig.tripsCountLabelAr || 'برنامج سياحي مصمم بالذكاء الاصطناعي',
      labelEn: statsConfig.tripsCountLabelEn || 'AI Travel Itineraries Created',
    },
    monuments: {
      display: statsConfig.monumentsCountDisplay || '50+',
      labelAr: statsConfig.monumentsLabelAr || 'معلم أثري وموقع سياحي مصري',
      labelEn: statsConfig.monumentsLabelEn || 'Egyptian Monuments & Sites',
    },
    satisfaction: {
      display: statsConfig.satisfactionRateDisplay || '99.8%',
      labelAr: statsConfig.satisfactionLabelAr || 'دقة التوقيتات ورضا المسافرين',
      labelEn: statsConfig.satisfactionLabelEn || 'Timetable Precision & Rating',
    },
    realCounts: {
      totalUsers: realUsersCount,
      totalTrips: realTripsCount,
      publishedTrips: realPublishedTrips,
      verifiedGuides: realVerifiedGuides,
    },
  });
});

