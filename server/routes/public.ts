import { Router, Request, Response } from 'express';
import { db, saveDb, generateSecureToken } from '../db';
import { CustomerInquiry, TripReview, PublicTripPayload } from '../../src/types';

export const publicRouter = Router();

// Anti-spam in-memory IP rate limiter for public forms
const inquiryRateLimits: Record<string, { count: number; resetAt: number }> = {};

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
      workingLanguages: guide?.workingLanguages || ['ar', 'en'],
      companyName: guide?.companyName,
      companyTagline: guide?.companyTagline,
      companyLogoUrl: guide?.companyLogoUrl,
      companyBrandColor: guide?.companyBrandColor || '#f59e0b',
    },
    reviews,
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
