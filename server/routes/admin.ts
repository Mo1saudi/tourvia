import { Router, Response } from 'express';
import { db, saveDb, generateSecureToken, getComplianceReadinessReport, clearAllMockData, DEFAULT_HOMEPAGE_STATS } from '../db';
import { adminOnlyMiddleware, AuthenticatedRequest } from '../auth';
import { PromoCode, Campaign, ComplianceRequirement, RegulatoryUpdate, PlatformComplaint, SiteRegulatoryNotice, HomepageCustomStats } from '../../src/types';

export const adminRouter = Router();

// Protect ALL routes in adminRouter with adminOnlyMiddleware
adminRouter.use(adminOnlyMiddleware);

// 1. Admin System Overview Metrics
adminRouter.get('/overview', (req: AuthenticatedRequest, res: Response) => {
  const totalUsers = db.users.length;
  const verifiedGuides = db.users.filter(u => u.verificationStatus === 'VERIFIED').length;
  const pendingVerifications = db.users.filter(u => u.verificationStatus === 'PENDING_VERIFICATION').length;

  const totalTrips = db.trips.length;
  const publishedTrips = db.trips.filter(t => t.status === 'published' && !t.isArchived).length;

  const totalAiGenerations = Object.values(db.aiUsage).reduce((acc, curr) => acc + (curr.lifetimeUsed || 0), 0);

  const approvedPayments = db.paymentRequests.filter(p => p.status === 'APPROVED');
  const totalRevenue = approvedPayments.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const pendingPayments = db.paymentRequests.filter(p => p.status === 'PENDING').length;

  const totalInquiries = db.inquiries.length;
  const totalReviews = db.reviews.length;

  res.json({
    metrics: {
      totalUsers,
      verifiedGuides,
      pendingVerifications,
      totalTrips,
      publishedTrips,
      totalAiGenerations,
      totalRevenue,
      pendingPayments,
      totalInquiries,
      totalReviews,
      currency: 'EGP',
    },
    recentAuditLogs: db.auditLogs.slice(-10).reverse(),
    recentPayments: db.paymentRequests.slice(-5).reverse(),
  });
});

// 2. List Users
adminRouter.get('/users', (req: AuthenticatedRequest, res: Response) => {
  const { status, role, search } = req.query;

  let users = [...db.users];

  if (status) {
    users = users.filter(u => u.verificationStatus === status);
  }
  if (role) {
    users = users.filter(u => u.accountType === role || u.role === role);
  }
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    users = users.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.phone.includes(q));
  }

  users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Attach subscription & AI usage info
  const enrichedUsers = users.map(u => {
    const sub = db.subscriptions.find(s => s.userId === u.id && s.status === 'ACTIVE');
    const ai = db.aiUsage[u.id] || { lifetimeUsed: 0, lifetimeLimit: 3 };
    const tripCount = db.trips.filter(t => t.guideId === u.id).length;
    return {
      ...u,
      activeSubscription: sub,
      aiUsage: ai,
      tripsCount: tripCount,
    };
  });

  res.json({ users: enrichedUsers });
});

// 3. Verify Guide
adminRouter.post('/users/:id/verify', (req: AuthenticatedRequest, res: Response) => {
  const admin = req.user!;
  const user = db.users.find(u => u.id === req.params.id);

  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  const { note } = req.body;

  user.verificationStatus = 'VERIFIED';
  user.verificationNote = note || 'Official tourism credentials verified and approved by TOURVIA Admin.';
  user.updatedAt = new Date().toISOString();

  // Send Notification to Guide
  db.notifications.push({
    id: `notif_${generateSecureToken('n')}`,
    userId: user.id,
    type: 'VERIFICATION',
    title: 'تهانينا! تم توثيق حسابك السياحي',
    message: 'تمت مراجعة بياناتك وإثبات العمل السياحي والموافقة عليها رسميًا. حسابك الآن يحمل شارة التوثيق الرسمية.',
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  // Audit
  db.auditLogs.push({
    id: `log_${generateSecureToken('l')}`,
    userId: admin.id,
    userEmail: admin.email,
    action: 'GUIDE_VERIFIED',
    details: `Approved verification for guide ${user.name} (${user.email}).`,
    timestamp: new Date().toISOString(),
  });

  saveDb();

  res.json({ user, message: 'Guide verified successfully.' });
});

// 4. Reject Guide Verification
adminRouter.post('/users/:id/reject', (req: AuthenticatedRequest, res: Response) => {
  const admin = req.user!;
  const user = db.users.find(u => u.id === req.params.id);

  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  const { reason } = req.body;
  if (!reason) {
    res.status(400).json({ error: 'Rejection reason is required.' });
    return;
  }

  user.verificationStatus = 'REJECTED';
  user.verificationNote = reason;
  user.updatedAt = new Date().toISOString();

  // Notification
  db.notifications.push({
    id: `notif_${generateSecureToken('n')}`,
    userId: user.id,
    type: 'VERIFICATION',
    title: 'تنبيه: تم رفض ملف التوثيق',
    message: `تم رفض إثبات العمل السياحي للسبب التالي: ${reason}. يرجى تحديث المستند في صفحة الملف الشخصي.`,
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  // Audit
  db.auditLogs.push({
    id: `log_${generateSecureToken('l')}`,
    userId: admin.id,
    userEmail: admin.email,
    action: 'GUIDE_REJECTED',
    details: `Rejected verification for guide ${user.name} (${user.email}). Reason: ${reason}`,
    timestamp: new Date().toISOString(),
  });

  saveDb();

  res.json({ user, message: 'Verification rejected and guide notified.' });
});

// 5. Grant Plan to User
adminRouter.post('/users/:id/grant-plan', (req: AuthenticatedRequest, res: Response) => {
  const admin = req.user!;
  const user = db.users.find(u => u.id === req.params.id);
  const { planId, durationDays } = req.body;

  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  const plan = db.plans.find(p => p.id === planId);
  if (!plan) {
    res.status(404).json({ error: 'Plan not found.' });
    return;
  }

  // Deactivate prior subscriptions
  db.subscriptions.forEach(s => {
    if (s.userId === user.id && s.status === 'ACTIVE') {
      s.status = 'EXPIRED';
    }
  });

  const days = Number(durationDays) || 30;
  const startDate = new Date().toISOString();
  const endDate = new Date(Date.now() + days * 86400 * 1000).toISOString();

  const newSub = {
    id: `sub_${generateSecureToken('s')}`,
    userId: user.id,
    planId: plan.id,
    planCode: plan.code,
    status: 'ACTIVE' as const,
    startDate,
    endDate,
    amountPaid: plan.price,
    currency: plan.currency,
    provider: 'ADMIN_GRANT',
  };

  db.subscriptions.push(newSub);

  // Update AI Quota
  let usage = db.aiUsage[user.id];
  if (!usage) {
    usage = {
      userId: user.id,
      lifetimeUsed: 0,
      lifetimeLimit: plan.aiLimit,
      currentPlanAiLimit: plan.aiLimit,
      isUnlimited: plan.aiUnlimited,
      history: [],
    };
    db.aiUsage[user.id] = usage;
  } else {
    usage.currentPlanAiLimit = plan.aiLimit;
    usage.isUnlimited = plan.aiUnlimited;
    usage.lifetimeLimit = Math.max(usage.lifetimeLimit, usage.lifetimeUsed + plan.aiLimit);
  }

  // Notification
  db.notifications.push({
    id: `notif_${generateSecureToken('n')}`,
    userId: user.id,
    type: 'SUBSCRIPTION',
    title: `تم تفعيل باقة: ${plan.nameAr || plan.name}`,
    message: `تم منحك باقة ${plan.nameAr || plan.name} لمدة ${days} يومًا مع رصيد ذكاء اصطناعي إضافي.`,
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  // Audit
  db.auditLogs.push({
    id: `log_${generateSecureToken('l')}`,
    userId: admin.id,
    userEmail: admin.email,
    action: 'ADMIN_GRANT_PLAN',
    details: `Granted plan ${plan.name} to user ${user.email} for ${days} days.`,
    timestamp: new Date().toISOString(),
  });

  saveDb();

  res.json({ subscription: newSub, aiUsage: usage, message: 'Plan granted successfully.' });
});

// 6. List Payments
adminRouter.get('/payments', (req: AuthenticatedRequest, res: Response) => {
  const { status } = req.query;
  let payments = [...db.paymentRequests];

  if (status) {
    payments = payments.filter(p => p.status === status);
  }

  payments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json({ payments });
});

// 7. Approve Payment Request
adminRouter.post('/payments/:id/approve', (req: AuthenticatedRequest, res: Response) => {
  const admin = req.user!;
  const payment = db.paymentRequests.find(p => p.id === req.params.id);

  if (!payment) {
    res.status(404).json({ error: 'Payment request not found.' });
    return;
  }

  if (payment.status !== 'PENDING') {
    res.status(400).json({ error: `Payment already ${payment.status.toLowerCase()}.` });
    return;
  }

  const user = db.users.find(u => u.id === payment.userId);
  const plan = db.plans.find(p => p.id === payment.planId);

  if (!user || !plan) {
    res.status(404).json({ error: 'User or Plan associated with this payment was not found.' });
    return;
  }

  const { adminNote } = req.body;

  payment.status = 'APPROVED';
  payment.adminNote = adminNote || 'Payment confirmed and plan activated.';
  payment.resolvedAt = new Date().toISOString();

  // Expire previous active subscriptions
  db.subscriptions.forEach(s => {
    if (s.userId === user.id && s.status === 'ACTIVE') {
      s.status = 'EXPIRED';
    }
  });

  // Create new active subscription (30 days)
  const newSub = {
    id: `sub_${generateSecureToken('s')}`,
    userId: user.id,
    planId: plan.id,
    planCode: plan.code,
    status: 'ACTIVE' as const,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 86400 * 1000).toISOString(),
    amountPaid: payment.amount,
    currency: payment.currency,
    provider: payment.paymentMethod,
  };
  db.subscriptions.push(newSub);

  // Update AI Quota
  let usage = db.aiUsage[user.id];
  if (!usage) {
    usage = {
      userId: user.id,
      lifetimeUsed: 0,
      lifetimeLimit: plan.aiLimit,
      currentPlanAiLimit: plan.aiLimit,
      isUnlimited: plan.aiUnlimited,
      history: [],
    };
    db.aiUsage[user.id] = usage;
  } else {
    usage.currentPlanAiLimit = plan.aiLimit;
    usage.isUnlimited = plan.aiUnlimited;
    usage.lifetimeLimit = Math.max(usage.lifetimeLimit, usage.lifetimeUsed + plan.aiLimit);
  }

  // Notification
  db.notifications.push({
    id: `notif_${generateSecureToken('n')}`,
    userId: user.id,
    type: 'SUBSCRIPTION',
    title: 'تمت الموافقة على الدفع وتفعيل الباقة!',
    message: `تم اعتماد عملية الدفع وتفعيل ${plan.nameAr || plan.name} بنجاح. استمتع بمميزاتك الجديدة!`,
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  // Audit
  db.auditLogs.push({
    id: `log_${generateSecureToken('l')}`,
    userId: admin.id,
    userEmail: admin.email,
    action: 'PAYMENT_APPROVED',
    details: `Approved payment ${payment.id} for ${payment.amount} ${payment.currency} from user ${user.email}.`,
    timestamp: new Date().toISOString(),
  });

  saveDb();

  res.json({ payment, subscription: newSub, message: 'Payment approved and plan activated successfully.' });
});

// 8. Reject Payment Request
adminRouter.post('/payments/:id/reject', (req: AuthenticatedRequest, res: Response) => {
  const admin = req.user!;
  const payment = db.paymentRequests.find(p => p.id === req.params.id);

  if (!payment) {
    res.status(404).json({ error: 'Payment request not found.' });
    return;
  }

  const { adminNote } = req.body;
  if (!adminNote) {
    res.status(400).json({ error: 'Please provide a note/reason for rejection.' });
    return;
  }

  payment.status = 'REJECTED';
  payment.adminNote = adminNote;
  payment.resolvedAt = new Date().toISOString();

  // Notification
  db.notifications.push({
    id: `notif_${generateSecureToken('n')}`,
    userId: payment.userId,
    type: 'SUBSCRIPTION',
    title: 'تنبيه بخصوص طلب الدفع',
    message: `تم رفض طلب الدفع للسبب التالي: ${adminNote}. يمكنك المحاولة مرة أخرى أو التواصل مع الدعم.`,
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  // Audit
  db.auditLogs.push({
    id: `log_${generateSecureToken('l')}`,
    userId: admin.id,
    userEmail: admin.email,
    action: 'PAYMENT_REJECTED',
    details: `Rejected payment ${payment.id} for user ${payment.userEmail}. Reason: ${adminNote}`,
    timestamp: new Date().toISOString(),
  });

  saveDb();

  res.json({ payment, message: 'Payment rejected.' });
});

// 9. Promo Codes CRUD
adminRouter.get('/promos', (req, res) => {
  res.json({ promoCodes: db.promoCodes });
});

adminRouter.post('/promos', (req: AuthenticatedRequest, res: Response) => {
  const { code, discountPercent, fixedDiscount, startDate, expiryDate, maxUses, minOrderAmount, maxDiscountAmount } = req.body;

  if (!code || (!discountPercent && !fixedDiscount)) {
    res.status(400).json({ error: 'Please specify promo code and discount percentage or fixed amount.' });
    return;
  }

  const cleanCode = String(code).trim().toUpperCase();
  if (db.promoCodes.some(p => p.code.toUpperCase() === cleanCode)) {
    res.status(400).json({ error: 'A promo code with this exact code already exists.' });
    return;
  }

  const newPromo: PromoCode = {
    id: `promo_${generateSecureToken('pr')}`,
    code: cleanCode,
    discountPercent: discountPercent ? Number(discountPercent) : undefined,
    fixedDiscount: fixedDiscount ? Number(fixedDiscount) : undefined,
    startDate: startDate || new Date().toISOString(),
    expiryDate,
    maxUses: maxUses ? Number(maxUses) : undefined,
    usedCount: 0,
    minOrderAmount: minOrderAmount ? Number(minOrderAmount) : undefined,
    maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : undefined,
    isActive: true,
  };

  db.promoCodes.push(newPromo);
  saveDb();

  res.status(201).json({ promo: newPromo, message: 'Promo code created successfully.' });
});

adminRouter.put('/promos/:id', (req: AuthenticatedRequest, res: Response) => {
  const promo = db.promoCodes.find(p => p.id === req.params.id);
  if (!promo) {
    res.status(404).json({ error: 'Promo code not found.' });
    return;
  }

  const { isActive, maxUses, expiryDate, discountPercent, fixedDiscount } = req.body;
  if (isActive !== undefined) promo.isActive = Boolean(isActive);
  if (maxUses !== undefined) promo.maxUses = Number(maxUses);
  if (expiryDate !== undefined) promo.expiryDate = expiryDate;
  if (discountPercent !== undefined) promo.discountPercent = Number(discountPercent);
  if (fixedDiscount !== undefined) promo.fixedDiscount = Number(fixedDiscount);

  saveDb();
  res.json({ promo, message: 'Promo code updated.' });
});

adminRouter.delete('/promos/:id', (req: AuthenticatedRequest, res: Response) => {
  const index = db.promoCodes.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Promo code not found.' });
    return;
  }
  db.promoCodes.splice(index, 1);
  saveDb();
  res.json({ success: true, message: 'Promo code deleted.' });
});

// 10. AI Settings
adminRouter.get('/ai-settings', (req, res) => {
  res.json({ aiSettings: db.adminAiSettings });
});

adminRouter.put('/ai-settings', (req: AuthenticatedRequest, res: Response) => {
  const { freeAiLifetimeLimit, allowDayRegeneration, dayRegenConsumesQuota, fallbackEnabled } = req.body;

  if (freeAiLifetimeLimit !== undefined) db.adminAiSettings.freeAiLifetimeLimit = Number(freeAiLifetimeLimit);
  if (allowDayRegeneration !== undefined) db.adminAiSettings.allowDayRegeneration = Boolean(allowDayRegeneration);
  if (dayRegenConsumesQuota !== undefined) db.adminAiSettings.dayRegenConsumesQuota = Boolean(dayRegenConsumesQuota);
  if (fallbackEnabled !== undefined) db.adminAiSettings.fallbackEnabled = Boolean(fallbackEnabled);

  saveDb();
  res.json({ aiSettings: db.adminAiSettings, message: 'AI settings updated successfully.' });
});

// 11. Marketing Campaigns Broadcast
adminRouter.get('/campaigns', (req, res) => {
  res.json({ campaigns: db.campaigns });
});

adminRouter.post('/campaigns', (req: AuthenticatedRequest, res: Response) => {
  const { title, message, promoCode, targetSegment } = req.body;

  if (!title || !message) {
    res.status(400).json({ error: 'Title and message are required for campaigns.' });
    return;
  }

  const campaignId = `cmp_${generateSecureToken('c')}`;
  let targetedUsers = [...db.users];

  if (targetSegment === 'guides') {
    targetedUsers = targetedUsers.filter(u => u.accountType === 'guide');
  } else if (targetSegment === 'companies') {
    targetedUsers = targetedUsers.filter(u => u.accountType === 'company');
  }

  // Dispatch Notification to each targeted user
  targetedUsers.forEach(u => {
    db.notifications.push({
      id: `notif_${generateSecureToken('n')}`,
      userId: u.id,
      type: 'PROMO',
      title,
      message,
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  });

  const newCampaign: Campaign = {
    id: campaignId,
    title,
    message,
    promoCode,
    targetSegment: targetSegment || 'all',
    status: 'active',
    sentCount: targetedUsers.length,
    createdAt: new Date().toISOString(),
  };

  db.campaigns.push(newCampaign);
  saveDb();

  res.status(201).json({ campaign: newCampaign, message: `Campaign broadcasted to ${targetedUsers.length} users successfully.` });
});

// 12. Audit Logs
adminRouter.get('/audit-logs', (req, res) => {
  const logs = [...db.auditLogs].reverse();
  res.json({ auditLogs: logs });
});

// 13. List All Trips / Itineraries (Admin View)
adminRouter.get('/trips', (req: AuthenticatedRequest, res: Response) => {
  const { status, search, guideId } = req.query;
  let trips = [...db.trips];

  if (status === 'published') {
    trips = trips.filter(t => t.status === 'published' && !t.isArchived);
  } else if (status === 'draft') {
    trips = trips.filter(t => t.status === 'draft' && !t.isArchived);
  } else if (status === 'archived') {
    trips = trips.filter(t => t.isArchived);
  }

  if (guideId && typeof guideId === 'string') {
    trips = trips.filter(t => t.guideId === guideId);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    trips = trips.filter(
      t =>
        t.name.toLowerCase().includes(q) ||
        (t.guideName && t.guideName.toLowerCase().includes(q)) ||
        (t.summary && t.summary.toLowerCase().includes(q)) ||
        t.destinations.some(d => d.name.toLowerCase().includes(q) || (d.nameAr && d.nameAr.includes(q)))
    );
  }

  trips.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Attach public view statistics
  const enrichedTrips = trips.map(trip => {
    const views = trip.publicToken && db.publicLinkViews[trip.publicToken] ? db.publicLinkViews[trip.publicToken].count : 0;
    return {
      ...trip,
      viewCount: views,
      stationsCount: trip.days?.reduce((sum, day) => sum + (day.stations?.length || 0), 0) || 0,
    };
  });

  res.json({ trips: enrichedTrips });
});

// 14. Archive / Unarchive Trip
adminRouter.post('/trips/:id/toggle-archive', (req: AuthenticatedRequest, res: Response) => {
  const admin = req.user!;
  const trip = db.trips.find(t => t.id === req.params.id);

  if (!trip) {
    res.status(404).json({ error: 'Trip not found.' });
    return;
  }

  trip.isArchived = !trip.isArchived;
  trip.updatedAt = new Date().toISOString();

  // Audit Log
  db.auditLogs.push({
    id: `log_${generateSecureToken('l')}`,
    userId: admin.id,
    userEmail: admin.email,
    action: trip.isArchived ? 'ADMIN_TRIP_ARCHIVED' : 'ADMIN_TRIP_UNARCHIVED',
    details: `Trip "${trip.name}" (${trip.id}) was ${trip.isArchived ? 'archived' : 'unarchived'} by admin.`,
    timestamp: new Date().toISOString(),
  });

  saveDb();
  res.json({ trip, message: `Trip ${trip.isArchived ? 'archived' : 'unarchived'} successfully.` });
});

// 15. List Plans with Subscriber Counts
adminRouter.get('/plans', (req: AuthenticatedRequest, res: Response) => {
  const plansWithCounts = db.plans.map(p => {
    const activeSubscribers = db.subscriptions.filter(s => s.planId === p.id && s.status === 'ACTIVE').length;
    return {
      ...p,
      activeSubscribers,
    };
  });

  res.json({ plans: plansWithCounts });
});

// 16. Detailed AI Usage & Statistics
adminRouter.get('/ai-usage', (req: AuthenticatedRequest, res: Response) => {
  const allUsage = Object.values(db.aiUsage);
  const totalGenerations = allUsage.reduce((acc, curr) => acc + (curr.lifetimeUsed || 0), 0);
  
  // Collect all generation history
  const allHistory: any[] = [];
  allUsage.forEach(u => {
    const user = db.users.find(usr => usr.id === u.userId);
    (u.history || []).forEach(h => {
      allHistory.push({
        ...h,
        userId: u.userId,
        userName: user?.name || 'Unknown Guide',
        userEmail: user?.email || 'N/A',
      });
    });
  });

  allHistory.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  res.json({
    totalGenerations,
    usersWithUsage: allUsage.length,
    settings: db.adminAiSettings,
    recentGenerations: allHistory.slice(0, 50),
  });
});

// 17. Update User Profile & Role from Admin
adminRouter.put('/users/:id', (req: AuthenticatedRequest, res: Response) => {
  const admin = req.user!;
  const user = db.users.find(u => u.id === req.params.id);

  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  const { name, phone, role, accountType, verificationStatus, verificationNote } = req.body;

  if (name) user.name = name.trim();
  if (phone) user.phone = phone.trim();
  if (role) {
    // Safety check: ensure at least one active super admin remains
    if (user.id === admin.id && role !== 'admin') {
      const otherAdmins = db.users.filter(u => u.role === 'admin' && u.id !== user.id);
      if (otherAdmins.length === 0) {
        res.status(400).json({ error: 'Cannot demote the only remaining administrator account.' });
        return;
      }
    }
    user.role = role;
  }
  if (accountType) user.accountType = accountType;
  if (verificationStatus) user.verificationStatus = verificationStatus;
  if (verificationNote !== undefined) user.verificationNote = verificationNote;

  user.updatedAt = new Date().toISOString();

  // Audit
  db.auditLogs.push({
    id: `log_${generateSecureToken('l')}`,
    userId: admin.id,
    userEmail: admin.email,
    action: 'ADMIN_USER_UPDATED',
    details: `Admin updated details for user ${user.name} (${user.email}).`,
    timestamp: new Date().toISOString(),
  });

  saveDb();
  res.json({ user, message: 'User updated successfully.' });
});

// ============================================================================
// COMPLIANCE CENTER & EGYPTIAN REGULATORY READINESS ENDPOINTS
// ============================================================================

// 18. Compliance Center Overview & Readiness Report
adminRouter.get('/compliance/overview', (req: AuthenticatedRequest, res: Response) => {
  const report = getComplianceReadinessReport();
  const complaints = db.complaints || [];
  const regulatoryUpdates = db.regulatoryUpdates || [];
  const siteNotices = db.siteRegulatoryNotices || [];
  const retentionSettings = db.documentRetentionSettings || {
    maxDaysUnverifiedDocs: 90,
    autoPurgeRejectedDocs: true,
    lastPurgeRunAt: new Date().toISOString(),
  };

  res.json({
    report,
    recentComplaints: complaints.slice(-5).reverse(),
    recentUpdates: regulatoryUpdates.slice(-5).reverse(),
    siteNoticesCount: siteNotices.length,
    retentionSettings,
  });
});

// 19. List Compliance Requirements
adminRouter.get('/compliance/requirements', (req: AuthenticatedRequest, res: Response) => {
  const { category, status } = req.query;
  let reqs = [...(db.complianceRequirements || [])];

  if (category) {
    reqs = reqs.filter(r => r.category === category);
  }
  if (status) {
    reqs = reqs.filter(r => r.status === status);
  }

  res.json({ requirements: reqs });
});

// 20. Update Compliance Requirement Status & Evidence
adminRouter.put('/compliance/requirements/:id', (req: AuthenticatedRequest, res: Response) => {
  const admin = req.user!;
  const reqItem = (db.complianceRequirements || []).find(r => r.id === req.params.id);

  if (!reqItem) {
    res.status(404).json({ error: 'Compliance requirement not found.' });
    return;
  }

  const { status, statusAr, evidenceNote, riskLevel, actionRequired } = req.body;

  if (status) reqItem.status = status;
  if (statusAr) reqItem.statusAr = statusAr;
  if (evidenceNote !== undefined) reqItem.evidenceNote = evidenceNote;
  if (riskLevel) reqItem.riskLevel = riskLevel;
  if (actionRequired !== undefined) reqItem.actionRequired = actionRequired;

  reqItem.lastReviewedAt = new Date().toISOString();
  reqItem.reviewedBy = `${admin.name} (${admin.email})`;

  // Audit
  db.auditLogs.push({
    id: `log_${generateSecureToken('l')}`,
    userId: admin.id,
    userEmail: admin.email,
    action: 'COMPLIANCE_REQUIREMENT_UPDATED',
    details: `Admin updated compliance item ${reqItem.id} to status ${reqItem.status} (Risk: ${reqItem.riskLevel}).`,
    timestamp: new Date().toISOString(),
  });

  saveDb();
  res.json({ requirement: reqItem, message: 'Compliance requirement updated successfully.' });
});

// 21. Regulatory Updates Registry
adminRouter.get('/compliance/regulatory-updates', (req: AuthenticatedRequest, res: Response) => {
  const updates = [...(db.regulatoryUpdates || [])];
  updates.sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());
  res.json({ updates });
});

adminRouter.post('/compliance/regulatory-updates', (req: AuthenticatedRequest, res: Response) => {
  const admin = req.user!;
  const {
    regulationName,
    regulationNameAr,
    source,
    decreeNumber,
    publishedDate,
    effectiveDate,
    summaryAr,
    affectedPlatformFeature,
    requiredSystemChange,
    reviewStatus,
    notes,
  } = req.body;

  if (!regulationNameAr || !summaryAr) {
    res.status(400).json({ error: 'Regulation name and Arabic summary are required.' });
    return;
  }

  const newUpdate: RegulatoryUpdate = {
    id: `reg_upd_${generateSecureToken('r')}`,
    regulationName: regulationName || regulationNameAr,
    regulationNameAr,
    source: source || 'وزارة السياحة والآثار / الجريدة الرسمية',
    decreeNumber: decreeNumber || undefined,
    publishedDate: publishedDate || new Date().toISOString().split('T')[0],
    effectiveDate: effectiveDate || new Date().toISOString().split('T')[0],
    summaryAr,
    affectedPlatformFeature: affectedPlatformFeature || 'إجراءات الامتثال',
    requiredSystemChange: requiredSystemChange || 'مراجعة المعايير',
    reviewStatus: reviewStatus || 'PENDING_LEGAL_REVIEW',
    reviewedBy: `${admin.name} (${admin.email})`,
    notes: notes || '',
    updatedAt: new Date().toISOString(),
  };

  db.regulatoryUpdates.push(newUpdate);

  // Audit
  db.auditLogs.push({
    id: `log_${generateSecureToken('l')}`,
    userId: admin.id,
    userEmail: admin.email,
    action: 'REGULATORY_UPDATE_ADDED',
    details: `Admin added regulatory update: ${newUpdate.regulationNameAr}`,
    timestamp: new Date().toISOString(),
  });

  saveDb();
  res.status(201).json({ update: newUpdate, message: 'Regulatory update recorded successfully.' });
});

adminRouter.put('/compliance/regulatory-updates/:id', (req: AuthenticatedRequest, res: Response) => {
  const admin = req.user!;
  const update = (db.regulatoryUpdates || []).find(u => u.id === req.params.id);

  if (!update) {
    res.status(404).json({ error: 'Regulatory update not found.' });
    return;
  }

  const {
    regulationName,
    regulationNameAr,
    source,
    decreeNumber,
    publishedDate,
    effectiveDate,
    summaryAr,
    affectedPlatformFeature,
    requiredSystemChange,
    reviewStatus,
    notes,
  } = req.body;

  if (regulationName) update.regulationName = regulationName;
  if (regulationNameAr) update.regulationNameAr = regulationNameAr;
  if (source) update.source = source;
  if (decreeNumber !== undefined) update.decreeNumber = decreeNumber;
  if (publishedDate) update.publishedDate = publishedDate;
  if (effectiveDate) update.effectiveDate = effectiveDate;
  if (summaryAr) update.summaryAr = summaryAr;
  if (affectedPlatformFeature) update.affectedPlatformFeature = affectedPlatformFeature;
  if (requiredSystemChange) update.requiredSystemChange = requiredSystemChange;
  if (reviewStatus) update.reviewStatus = reviewStatus;
  if (notes !== undefined) update.notes = notes;

  update.reviewedBy = `${admin.name} (${admin.email})`;
  update.updatedAt = new Date().toISOString();

  saveDb();
  res.json({ update, message: 'Regulatory update updated successfully.' });
});

adminRouter.delete('/compliance/regulatory-updates/:id', (req: AuthenticatedRequest, res: Response) => {
  const admin = req.user!;
  const idx = (db.regulatoryUpdates || []).findIndex(u => u.id === req.params.id);

  if (idx === -1) {
    res.status(404).json({ error: 'Regulatory update not found.' });
    return;
  }

  db.regulatoryUpdates.splice(idx, 1);

  db.auditLogs.push({
    id: `log_${generateSecureToken('l')}`,
    userId: admin.id,
    userEmail: admin.email,
    action: 'REGULATORY_UPDATE_DELETED',
    details: `Admin deleted regulatory update ${req.params.id}`,
    timestamp: new Date().toISOString(),
  });

  saveDb();
  res.json({ message: 'Regulatory update deleted.' });
});

// 22. Platform Complaints & Reporting Queue
adminRouter.get('/compliance/complaints', (req: AuthenticatedRequest, res: Response) => {
  const { status, type } = req.query;
  let list = [...(db.complaints || [])];

  if (status) {
    list = list.filter(c => c.status === status);
  }
  if (type) {
    list = list.filter(c => c.complaintType === type);
  }

  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json({ complaints: list });
});

adminRouter.put('/compliance/complaints/:id', (req: AuthenticatedRequest, res: Response) => {
  const admin = req.user!;
  const complaint = (db.complaints || []).find(c => c.id === req.params.id);

  if (!complaint) {
    res.status(404).json({ error: 'Complaint not found.' });
    return;
  }

  const { status, adminNotes, resolutionSummary } = req.body;

  if (status) complaint.status = status;
  if (adminNotes !== undefined) complaint.adminNotes = adminNotes;
  if (resolutionSummary !== undefined) complaint.resolutionSummary = resolutionSummary;

  if (status === 'RESOLVED' || status === 'DISMISSED') {
    complaint.resolvedBy = `${admin.name} (${admin.email})`;
    complaint.resolvedAt = new Date().toISOString();
  }

  complaint.updatedAt = new Date().toISOString();

  // Audit
  db.auditLogs.push({
    id: `log_${generateSecureToken('l')}`,
    userId: admin.id,
    userEmail: admin.email,
    action: 'COMPLAINT_INVESTIGATED',
    details: `Admin updated complaint ${complaint.id} status to ${complaint.status}.`,
    timestamp: new Date().toISOString(),
  });

  saveDb();
  res.json({ complaint, message: 'Complaint record updated successfully.' });
});

// 23. Granular Tourist Guide License Verification
adminRouter.post('/compliance/users/:id/verify-license', (req: AuthenticatedRequest, res: Response) => {
  const admin = req.user!;
  const user = db.users.find(u => u.id === req.params.id);

  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  const {
    fullLegalName,
    licenseNumber,
    syndicateNumber,
    issuingAuthority,
    issueDate,
    expiryDate,
    authorizedLanguages,
    verificationNotes,
    verificationStatus,
    commercialEntityStatus,
    requiresLegalReview,
  } = req.body;

  const validStatus = verificationStatus || 'LICENSED_GUIDE_VERIFIED';

  // Check validity
  const now = new Date();
  let isValid = true;
  let isExpiringSoon = false;
  let isExpired = false;

  if (expiryDate) {
    const exp = new Date(expiryDate);
    if (exp < now) {
      isValid = false;
      isExpired = true;
    } else if (exp <= new Date(Date.now() + 30 * 86400000)) {
      isExpiringSoon = true;
    }
  }

  const validityStatus = isExpired ? 'EXPIRED' : isExpiringSoon ? 'EXPIRING_SOON' : 'VALID';

  // Apply to User
  user.verificationStatus = isExpired ? 'LICENSE_EXPIRED' : validStatus;
  user.licenseNumber = licenseNumber || user.licenseNumber;
  user.syndicateNumber = syndicateNumber || user.syndicateNumber;
  if (Array.isArray(authorizedLanguages)) {
    user.authorizedLanguages = authorizedLanguages;
  }
  user.verificationNote = verificationNotes || 'تم مراجعة وتدقيق ترخيص الإرشاد السياحي وبطاقة النقابة.';

  user.licenseInfo = {
    fullLegalName: fullLegalName || user.name,
    licenseNumber: licenseNumber || user.licenseNumber,
    syndicateNumber: syndicateNumber || user.syndicateNumber,
    issuingAuthority: issuingAuthority || 'وزارة السياحة والآثار - جمهورية مصر العربية',
    issueDate: issueDate || user.licenseInfo?.issueDate,
    expiryDate: expiryDate || user.licenseInfo?.expiryDate,
    authorizedLanguages: user.authorizedLanguages || user.workingLanguages,
    isLicenseExpiringSoon: isExpiringSoon,
    isLicenseExpired: isExpired,
    licenseValidityStatus: validityStatus,
    verifiedAt: new Date().toISOString(),
    verifiedByAdminId: admin.id,
    verifiedByAdminEmail: admin.email,
    verificationNotes: verificationNotes || '',
    commercialEntityStatus: commercialEntityStatus || 'INDIVIDUAL_GUIDE',
    prohibitedClaimsDetected: [],
    requiresLegalReview: Boolean(requiresLegalReview),
  };

  user.updatedAt = new Date().toISOString();

  // Send Notification to Guide
  db.notifications.push({
    id: `notif_${generateSecureToken('n')}`,
    userId: user.id,
    type: 'VERIFICATION',
    title: isExpired ? 'تنبيه: ترخيص مزاولة الإرشاد السياحي منتهي الصلاحية' : 'تم التحقق من ترخيص الإرشاد السياحي بنجاح',
    message: isExpired
      ? 'تبين انتهاء تاريخ سريان الترخيص المسجل. يرجى تجديد الترخيص ورفع المستند المحدث لاستعادة شارة التوثيق.'
      : `تم التحقق من بيانات ترخيص الإرشاد رقم (${user.licenseNumber || 'N/A'}) والقيد النقابي واللغات المعتمدة.`,
    isRead: false,
    actionUrl: '/profile',
    createdAt: new Date().toISOString(),
  });

  // Audit Log
  db.auditLogs.push({
    id: `log_${generateSecureToken('l')}`,
    userId: admin.id,
    userEmail: admin.email,
    action: 'GUIDE_LICENSE_VERIFIED',
    details: `Admin verified guide ${user.name} (${user.email}). License: ${user.licenseNumber}, Syndicate: ${user.syndicateNumber}, Status: ${user.verificationStatus}`,
    timestamp: new Date().toISOString(),
  });

  saveDb();
  res.json({ user, message: 'Guide license verification completed successfully.' });
});

// 24. Archaeological Site Regulatory Notices
adminRouter.get('/compliance/site-notices', (req: AuthenticatedRequest, res: Response) => {
  res.json({ siteNotices: db.siteRegulatoryNotices || [] });
});

adminRouter.put('/compliance/site-notices/:key', (req: AuthenticatedRequest, res: Response) => {
  const admin = req.user!;
  const notice = (db.siteRegulatoryNotices || []).find(n => n.siteKey === req.params.key);

  if (!notice) {
    res.status(404).json({ error: 'Site notice not found.' });
    return;
  }

  const {
    requiresOfficialLicensedGuide,
    photographyPermitNotice,
    officialTicketingNotice,
    openingHoursNotice,
    officialSourceUrl,
  } = req.body;

  if (requiresOfficialLicensedGuide !== undefined) notice.requiresOfficialLicensedGuide = Boolean(requiresOfficialLicensedGuide);
  if (photographyPermitNotice) notice.photographyPermitNotice = photographyPermitNotice;
  if (officialTicketingNotice) notice.officialTicketingNotice = officialTicketingNotice;
  if (openingHoursNotice) notice.openingHoursNotice = openingHoursNotice;
  if (officialSourceUrl) notice.officialSourceUrl = officialSourceUrl;

  // Audit
  db.auditLogs.push({
    id: `log_${generateSecureToken('l')}`,
    userId: admin.id,
    userEmail: admin.email,
    action: 'SITE_REGULATORY_NOTICE_UPDATED',
    details: `Admin updated regulatory notices for archaeological site ${notice.nameAr}`,
    timestamp: new Date().toISOString(),
  });

  saveDb();
  res.json({ notice, message: 'Site regulatory notice updated.' });
});

// 25. Secure Document Retention Purging
adminRouter.post('/compliance/purge-retention-docs', (req: AuthenticatedRequest, res: Response) => {
  const admin = req.user!;
  let purgedCount = 0;

  db.users.forEach(u => {
    if (u.verificationStatus === 'REJECTED' || u.verificationStatus === 'NOT_ELIGIBLE') {
      if (u.proofDocumentUrl) {
        u.proofDocumentUrl = undefined;
        purgedCount++;
      }
    }
  });

  db.documentRetentionSettings = db.documentRetentionSettings || {
    maxDaysUnverifiedDocs: 90,
    autoPurgeRejectedDocs: true,
    lastPurgeRunAt: new Date().toISOString(),
  };
  db.documentRetentionSettings.lastPurgeRunAt = new Date().toISOString();

  // Audit
  db.auditLogs.push({
    id: `log_${generateSecureToken('l')}`,
    userId: admin.id,
    userEmail: admin.email,
    action: 'DOCUMENT_RETENTION_PURGE',
    details: `Admin triggered secure document purging. Purged unverified/rejected documents for ${purgedCount} users.`,
    timestamp: new Date().toISOString(),
  });

  saveDb();
  res.json({ purgedCount, lastPurgeRunAt: db.documentRetentionSettings.lastPurgeRunAt, message: `Successfully purged ${purgedCount} rejected/unverified documents securely.` });
});

// 26. Get Homepage Stats Settings
adminRouter.get('/homepage-stats', (req: AuthenticatedRequest, res: Response) => {
  const statsConfig = db.homepageStats || DEFAULT_HOMEPAGE_STATS;
  const realUsersCount = db.users.filter(u => u.accountType !== 'admin').length;
  const realTripsCount = db.trips.length;
  const realPublishedTrips = db.trips.filter(t => t.status === 'published' && !t.isArchived).length;
  const realVerifiedGuides = db.users.filter(u => u.verificationStatus === 'LICENSED_GUIDE_VERIFIED' || u.verificationStatus === 'VERIFIED').length;

  res.json({
    stats: statsConfig,
    realCounts: {
      totalUsers: realUsersCount,
      totalTrips: realTripsCount,
      publishedTrips: realPublishedTrips,
      verifiedGuides: realVerifiedGuides,
    },
  });
});

// 27. Update Homepage Stats Settings
adminRouter.put('/homepage-stats', (req: AuthenticatedRequest, res: Response) => {
  const admin = req.user!;
  const updateData: Partial<HomepageCustomStats> = req.body;

  const currentStats = db.homepageStats || DEFAULT_HOMEPAGE_STATS;
  const updatedStats: HomepageCustomStats = {
    ...currentStats,
    ...updateData,
    updatedAt: new Date().toISOString(),
  };

  db.homepageStats = updatedStats;

  // Audit
  db.auditLogs.push({
    id: `log_${generateSecureToken('l')}`,
    userId: admin.id,
    userEmail: admin.email,
    action: 'HOMEPAGE_STATS_UPDATED',
    details: `Admin updated homepage stats configuration. Mode: ${updatedStats.mode}, Users: ${updatedStats.usersCountDisplay}, Trips: ${updatedStats.tripsCountDisplay}`,
    timestamp: new Date().toISOString(),
  });

  saveDb();

  const realUsersCount = db.users.filter(u => u.accountType !== 'admin').length;
  const realTripsCount = db.trips.length;

  res.json({
    stats: updatedStats,
    realCounts: {
      totalUsers: realUsersCount,
      totalTrips: realTripsCount,
    },
    message: 'تم تحديث وحفظ إعدادات إحصائيات الصفحة الرئيسية بنجاح.',
  });
});

// 28. Clear All Mock / Dummy Data
adminRouter.post('/clear-mock-data', (req: AuthenticatedRequest, res: Response) => {
  const result = clearAllMockData();
  res.json({
    success: true,
    ...result,
    message: `تم تطهير وحذف كافة البيانات الافتراضية بنجاح (${result.removedUsers} مستخدم و ${result.removedTrips} برنامج). الحسابات الإدارية مؤمنة.`,
  });
});


