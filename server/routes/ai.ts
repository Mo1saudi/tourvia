import { Router, Response } from 'express';
import { db, saveDb, generateSecureToken } from '../db';
import { authMiddleware, AuthenticatedRequest } from '../auth';
import { generateSmartTripItinerary, regenerateSingleDay } from '../gemini';
import { AiUsageData } from '../../src/types';

export const aiRouter = Router();

// Helper to check user AI quota
function checkAiQuota(userId: string): { allowed: boolean; reason?: string; isUnlimited: boolean; remaining: number } {
  const subscription = db.subscriptions.find(s => s.userId === userId && s.status === 'ACTIVE');
  const plan = db.plans.find(p => p.id === subscription?.planId);

  let usage = db.aiUsage[userId];
  if (!usage) {
    usage = {
      userId,
      lifetimeUsed: 0,
      lifetimeLimit: db.adminAiSettings?.freeAiLifetimeLimit || 3,
      currentPlanAiLimit: plan?.aiLimit || 3,
      isUnlimited: plan?.aiUnlimited || false,
      history: [],
    };
    db.aiUsage[userId] = usage;
    saveDb();
  }

  // If user is on an unlimited plan
  if (plan?.aiUnlimited || usage.isUnlimited) {
    return { allowed: true, isUnlimited: true, remaining: 999999 };
  }

  const limit = plan?.aiLimit || usage.lifetimeLimit || 3;
  const remaining = Math.max(0, limit - usage.lifetimeUsed);

  if (remaining <= 0) {
    return {
      allowed: false,
      reason: `You have reached your AI generation limit (${usage.lifetimeUsed}/${limit}). Please upgrade your plan to unlock more generations.`,
      isUnlimited: false,
      remaining: 0,
    };
  }

  return { allowed: true, isUnlimited: false, remaining };
}

// 1. AI Readiness Check
aiRouter.post('/readiness-check', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { durationDays, destinations, travelerType } = req.body;

  const missingFields: string[] = [];
  if (!durationDays || Number(durationDays) < 1) missingFields.push('Trip duration (days)');
  if (!destinations || !Array.isArray(destinations) || destinations.length === 0) missingFields.push('At least 1 destination');
  if (!travelerType) missingFields.push('Traveler profile');

  const quota = checkAiQuota(user.id);

  res.json({
    isReady: missingFields.length === 0 && quota.allowed,
    missingFields,
    quota,
  });
});

// 2. Generate Full Smart Itinerary
aiRouter.post('/generate', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const {
    name,
    durationDays,
    nightsCount,
    destinations,
    travelerType,
    travelersCount,
    budgetTier,
    travelPace,
    walkingPreference,
    interests,
    restrictions,
    notes,
    language,
  } = req.body;

  // 1. Quota Check
  const quota = checkAiQuota(user.id);
  if (!quota.allowed) {
    res.status(403).json({
      error: 'AI_QUOTA_EXHAUSTED',
      message: quota.reason,
      quota,
    });
    return;
  }

  // 2. Validate essential inputs
  const parsedDays = Math.max(1, Math.min(30, Number(durationDays) || 3));
  const parsedNights = Math.max(0, Number(nightsCount) || parsedDays - 1);
  const destArray = Array.isArray(destinations) && destinations.length > 0
    ? destinations
    : [{ name: 'Cairo' }, { name: 'Luxor' }];

  try {
    const result = await generateSmartTripItinerary({
      name,
      durationDays: parsedDays,
      nightsCount: parsedNights,
      destinations: destArray,
      travelerType: travelerType || 'family',
      travelersCount: Math.max(1, Number(travelersCount) || 2),
      budgetTier: budgetTier || 'standard',
      travelPace: travelPace || 'moderate',
      walkingPreference: walkingPreference || 'moderate',
      interests: Array.isArray(interests) && interests.length > 0 ? interests : ['Sightseeing', 'History', 'Culture'],
      restrictions: Array.isArray(restrictions) ? restrictions : [],
      notes,
      language: language || (user.workingLanguages?.[0] === 'ar' ? 'ar' : 'en'),
    });

    // 3. Increment quota & record usage ONLY upon successful generation
    const usage = db.aiUsage[user.id];
    usage.lifetimeUsed += 1;
    usage.history.unshift({
      id: `gen_${generateSecureToken('g')}`,
      tripName: name || 'Custom Tour',
      destinations: destArray.map((d: any) => d.name || 'Destination'),
      durationDays: parsedDays,
      timestamp: new Date().toISOString(),
      success: true,
    });

    // Audit log
    db.auditLogs.push({
      id: `log_${generateSecureToken('l')}`,
      userId: user.id,
      userEmail: user.email,
      action: 'AI_GENERATION',
      details: `Generated ${parsedDays}-day itinerary for "${name || 'Custom Tour'}". Lifetime used: ${usage.lifetimeUsed}`,
      timestamp: new Date().toISOString(),
    });

    saveDb();

    res.json({
      success: true,
      tripSummary: result.tripSummary,
      days: result.days,
      transportation: result.transportation,
      isFallback: result.isFallback,
      quotaRemaining: quota.isUnlimited ? 999999 : Math.max(0, (quota.remaining || 1) - 1),
      message: result.isFallback
        ? 'Trip generated using high-fidelity travel template.'
        : 'Smart itinerary synthesized successfully with Gemini AI.',
    });
  } catch (err: any) {
    console.error('AI Generation API failure:', err);
    res.status(500).json({
      error: 'AI_GENERATION_FAILED',
      message: 'Failed to generate itinerary. No AI quota was deducted. Please try again.',
    });
  }
});

// 3. Regenerate Single Day
aiRouter.post('/regenerate-day', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { dayNumber, destinationName, interests, language } = req.body;

  try {
    const result = await regenerateSingleDay(
      Number(dayNumber) || 1,
      destinationName || 'Destination',
      Array.isArray(interests) ? interests : ['Sightseeing'],
      language || 'ar'
    );

    res.json({
      success: true,
      day: result.day,
      isFallback: result.isFallback,
    });
  } catch (err) {
    console.error('Single day regen error:', err);
    res.status(500).json({ error: 'Failed to regenerate day.' });
  }
});
