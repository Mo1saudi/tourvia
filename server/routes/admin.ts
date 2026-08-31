import { Router, Response } from 'express';
import { db, saveDb, generateSecureToken } from '../db';
import { adminOnlyMiddleware, AuthenticatedRequest } from '../auth';
import { PromoCode, Campaign } from '../../src/types';

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
