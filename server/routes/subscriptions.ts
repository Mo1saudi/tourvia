import { Router, Response } from 'express';
import { db, saveDb, generateSecureToken } from '../db';
import { authMiddleware, AuthenticatedRequest } from '../auth';
import { PaymentRequest, UserSubscription } from '../../src/types';

export const subscriptionsRouter = Router();

// 1. Get available plans
subscriptionsRouter.get('/plans', (req, res) => {
  const plans = db.plans.filter(p => p.isActive);
  res.json({ plans });
});

// 2. Get user current subscription & usage
subscriptionsRouter.get('/my-subscription', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const subscription = db.subscriptions.find(s => s.userId === user.id && s.status === 'ACTIVE') || {
    id: 'sub_default',
    userId: user.id,
    planId: 'plan_free',
    planCode: 'FREE',
    status: 'ACTIVE',
    startDate: user.createdAt,
    amountPaid: 0,
    currency: 'EGP',
  };

  const plan = db.plans.find(p => p.id === subscription.planId) || db.plans[0];
  const aiUsage = db.aiUsage[user.id] || {
    userId: user.id,
    lifetimeUsed: 0,
    lifetimeLimit: 3,
    currentPlanAiLimit: 3,
    isUnlimited: false,
    history: [],
  };

  res.json({ subscription, plan, aiUsage });
});

// 3. Validate Promo Code
subscriptionsRouter.post('/validate-promo', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { code, planId } = req.body;

  if (!code || !planId) {
    res.status(400).json({ error: 'Please provide promo code and plan.' });
    return;
  }

  const cleanCode = String(code).trim().toUpperCase();
  const promo = db.promoCodes.find(p => p.code.toUpperCase() === cleanCode && p.isActive);

  if (!promo) {
    res.status(404).json({ error: 'Invalid or expired promo code.' });
    return;
  }

  const now = new Date().toISOString();
  if (promo.startDate && promo.startDate > now) {
    res.status(400).json({ error: 'This promo code is not active yet.' });
    return;
  }
  if (promo.expiryDate && promo.expiryDate < now) {
    res.status(400).json({ error: 'This promo code has expired.' });
    return;
  }
  if (promo.maxUses && promo.usedCount >= promo.maxUses) {
    res.status(400).json({ error: 'This promo code has reached maximum usage limit.' });
    return;
  }

  const plan = db.plans.find(p => p.id === planId);
  if (!plan) {
    res.status(404).json({ error: 'Plan not found.' });
    return;
  }

  let discountAmount = 0;
  if (promo.discountPercent) {
    discountAmount = (plan.price * promo.discountPercent) / 100;
    if (promo.maxDiscountAmount && discountAmount > promo.maxDiscountAmount) {
      discountAmount = promo.maxDiscountAmount;
    }
  } else if (promo.fixedDiscount) {
    discountAmount = Math.min(plan.price, promo.fixedDiscount);
  }

  const finalPrice = Math.max(0, plan.price - discountAmount);

  res.json({
    valid: true,
    promo: {
      id: promo.id,
      code: promo.code,
      discountPercent: promo.discountPercent,
      fixedDiscount: promo.fixedDiscount,
    },
    originalPrice: plan.price,
    discountAmount,
    finalPrice,
    currency: plan.currency,
  });
});

// 4. Submit Payment Request (InstaPay / Vodafone Cash / WhatsApp)
subscriptionsRouter.post('/pay-request', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { planId, paymentMethod, transactionReference, promoCode, receiptImageUrl } = req.body;

  if (!planId || !paymentMethod) {
    res.status(400).json({ error: 'Please select a plan and payment method.' });
    return;
  }

  const plan = db.plans.find(p => p.id === planId);
  if (!plan) {
    res.status(404).json({ error: 'Selected plan was not found.' });
    return;
  }

  let finalAmount = plan.price;
  let validatedPromo: string | undefined;

  if (promoCode) {
    const promo = db.promoCodes.find(p => p.code.toUpperCase() === String(promoCode).trim().toUpperCase() && p.isActive);
    if (promo) {
      validatedPromo = promo.code;
      if (promo.discountPercent) {
        finalAmount = Math.max(0, plan.price - (plan.price * promo.discountPercent) / 100);
      } else if (promo.fixedDiscount) {
        finalAmount = Math.max(0, plan.price - promo.fixedDiscount);
      }
      promo.usedCount += 1;
    }
  }

  const newPayment: PaymentRequest = {
    id: `pay_${generateSecureToken('p')}`,
    userId: user.id,
    userEmail: user.email,
    userName: user.name,
    planId: plan.id,
    planName: plan.name,
    amount: finalAmount,
    currency: plan.currency,
    paymentMethod,
    transactionReference: transactionReference?.trim(),
    receiptImageUrl,
    promoCodeUsed: validatedPromo,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  };

  db.paymentRequests.push(newPayment);

  // Notify User
  db.notifications.push({
    id: `notif_${generateSecureToken('n')}`,
    userId: user.id,
    type: 'SUBSCRIPTION',
    title: 'تم استلام طلب ترقية الباقة',
    message: `تم إرسال طلب تفعيل ${plan.nameAr || plan.name} للمراجعة. سيتم التفعيل في غضون وقت قصير.`,
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  // Audit log
  db.auditLogs.push({
    id: `log_${generateSecureToken('l')}`,
    userId: user.id,
    userEmail: user.email,
    action: 'PAYMENT_REQUEST',
    details: `Submitted payment request for plan ${plan.name} via ${paymentMethod}. Reference: ${transactionReference || 'N/A'}.`,
    timestamp: new Date().toISOString(),
  });

  saveDb();

  res.status(201).json({
    success: true,
    paymentRequest: newPayment,
    message: 'Payment request submitted successfully. Our team will verify and activate your subscription.',
  });
});

// 5. List user payments
subscriptionsRouter.get('/payments', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const payments = db.paymentRequests.filter(p => p.userId === user.id);
  payments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json({ payments });
});
