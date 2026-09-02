import { Router, Request, Response } from 'express';
import {
  db,
  saveDb,
  hashPin,
  generateRecoveryCode,
  generateSecureToken,
} from '../db';
import {
  createSession,
  authMiddleware,
  AuthenticatedRequest,
} from '../auth';
import { User, WorkingLanguage } from '../../src/types';

export const authRouter = Router();

// 1. Register
authRouter.post('/register', (req: Request, res: Response) => {
  const {
    name,
    email,
    phone,
    pin,
    accountType,
    workingLanguages,
    proofDocumentUrl,
    companyName,
    companyTagline,
    companyBrandColor,
  } = req.body;

  // Validate Required Fields
  if (!name || !email || !phone || !pin) {
    res.status(400).json({ error: 'Please provide full name, email, phone number, and 6-digit PIN.' });
    return;
  }

  // Validate PIN length (6 digits)
  const normalizedPin = String(pin).replace(/[٠-٩]/g, d => '0123456789'['٠١٢٣٤٥٦٧٨٩'.indexOf(d)]);
  if (!/^\d{6}$/.test(normalizedPin)) {
    res.status(400).json({ error: 'PIN must consist of exactly 6 digits.' });
    return;
  }

  // Check Email / Phone uniqueness
  const cleanEmail = email.trim().toLowerCase();
  const cleanPhone = phone.trim();
  const existingUser = db.users.find(u => u.email.toLowerCase() === cleanEmail || u.phone === cleanPhone);
  if (existingUser) {
    res.status(400).json({ error: 'An account with this email address or phone number already exists.' });
    return;
  }

  const userId = `usr_${generateSecureToken('g')}`;
  const recoveryCode = generateRecoveryCode();

  const newUser: User = {
    id: userId,
    name: name.trim(),
    email: cleanEmail,
    phone: cleanPhone,
    accountType: accountType === 'company' ? 'company' : 'guide',
    workingLanguages: Array.isArray(workingLanguages) && workingLanguages.length > 0 ? workingLanguages : ['ar', 'en'],
    verificationStatus: 'PENDING_VERIFICATION',
    proofDocumentUrl: proofDocumentUrl || '',
    recoveryCode,
    role: 'user',
    companyName: companyName?.trim(),
    companyTagline: companyTagline?.trim(),
    companyBrandColor: companyBrandColor || '#f59e0b',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  db.userPins[userId] = hashPin(normalizedPin);

  // Initialize Free Plan Subscription
  db.subscriptions.push({
    id: `sub_${generateSecureToken('s')}`,
    userId,
    planId: 'plan_free',
    planCode: 'FREE',
    status: 'ACTIVE',
    startDate: new Date().toISOString(),
    amountPaid: 0,
    currency: 'EGP',
  });

  // Initialize Free AI Lifetime Quota (3 Free generations lifetime)
  db.aiUsage[userId] = {
    userId,
    lifetimeUsed: 0,
    lifetimeLimit: db.adminAiSettings?.freeAiLifetimeLimit || 3,
    currentPlanAiLimit: 3,
    isUnlimited: false,
    history: [],
  };

  // Create welcome notification
  db.notifications.push({
    id: `notif_${generateSecureToken('n')}`,
    userId,
    type: 'SYSTEM',
    title: 'مرحبًا بك في TOURVIA!',
    message: 'تم إنشاء حسابك بنجاح. لقد حصلت على 3 برامج سياحية بالذكاء الاصطناعي مجانًا مدى الحياة لتجربة المنصة.',
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  // Audit Log
  db.auditLogs.push({
    id: `log_${generateSecureToken('l')}`,
    userId,
    userEmail: cleanEmail,
    action: 'USER_REGISTER',
    details: `New ${newUser.accountType} account registered with 3 free lifetime AI programs.`,
    timestamp: new Date().toISOString(),
  });

  saveDb();

  const session = createSession(userId);
  res.cookie('tourvia_token', session.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 86400 * 1000,
    sameSite: 'lax',
  });

  res.status(201).json({
    user: newUser,
    token: session.token,
    recoveryCode,
    subscription: db.subscriptions.find(s => s.userId === userId && s.status === 'ACTIVE'),
    aiUsage: db.aiUsage[userId],
  });
});

// 3. Login
authRouter.post('/login', (req: Request, res: Response) => {
  try {
    const { identifier, pin, rememberDevice } = req.body;

    if (!identifier || !pin) {
      res.status(400).json({ error: 'يرجى إدخال البريد الإلكتروني أو الهاتف والرمز السري.' });
      return;
    }

    const cleanId = String(identifier).trim().toLowerCase();
    const normalizedPin = String(pin).replace(/[٠-٩]/g, d => '0123456789'['٠١٢٣٤٥٦٧٨٩'.indexOf(d)]);
    const user = db.users.find(u => u.email.toLowerCase() === cleanId || u.phone === cleanId);

    if (!user) {
      res.status(401).json({ error: 'البريد الإلكتروني أو الرمز السري غير صحيح.' });
      return;
    }

    const expectedHash = db.userPins[user.id];
    if (!expectedHash) {
      console.error('[LOGIN] No PIN hash found for user:', user.id);
      res.status(500).json({ error: 'حدث خطأ في حساب المستخدم. يرجى التواصل مع الدعم.' });
      return;
    }

    const actualHash = hashPin(normalizedPin);

    if (expectedHash !== actualHash) {
      res.status(401).json({ error: 'البريد الإلكتروني أو الرمز السري غير صحيح.' });
      return;
    }

    const session = createSession(user.id);
    res.cookie('tourvia_token', session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: rememberDevice ? 90 * 86400 * 1000 : 30 * 86400 * 1000,
      sameSite: 'lax',
    });

    // Log audit
    db.auditLogs.push({
      id: `log_${generateSecureToken('l')}`,
      userId: user.id,
      userEmail: user.email,
      action: 'USER_LOGIN',
      details: `User logged in from ${req.ip || 'web'}.`,
      timestamp: new Date().toISOString(),
    });
    saveDb();

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

    const aiUsage = db.aiUsage[user.id] || {
      userId: user.id,
      lifetimeUsed: 0,
      lifetimeLimit: 3,
      currentPlanAiLimit: 3,
      isUnlimited: false,
      history: [],
    };

    res.json({
      user,
      token: session.token,
      subscription,
      aiUsage,
    });
  } catch (err) {
    console.error('[LOGIN] Unexpected error:', err);
    res.status(500).json({ error: 'حدث خطأ مؤقت أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.' });
  }
});

// 4. Current User info
authRouter.get('/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
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

  const aiUsage = db.aiUsage[user.id] || {
    userId: user.id,
    lifetimeUsed: 0,
    lifetimeLimit: 3,
    currentPlanAiLimit: 3,
    isUnlimited: false,
    history: [],
  };

  const unreadNotificationsCount = db.notifications.filter(n => n.userId === user.id && !n.isRead).length;

  res.json({
    user,
    subscription,
    aiUsage,
    unreadNotificationsCount,
  });
});

// 5. Recover PIN with Recovery Code
authRouter.post('/recover-pin', (req: Request, res: Response) => {
  const { identifier, recoveryCode, newPin } = req.body;

  if (!identifier || !recoveryCode || !newPin) {
    res.status(400).json({ error: 'Please provide identifier, recovery code, and new 6-digit PIN.' });
    return;
  }

  const cleanId = String(identifier).trim().toLowerCase();
  const cleanRecovery = String(recoveryCode).trim().toUpperCase();

  const user = db.users.find(
    u => (u.email.toLowerCase() === cleanId || u.phone === cleanId) && u.recoveryCode.toUpperCase() === cleanRecovery
  );

  if (!user) {
    res.status(400).json({ error: 'Invalid identifier or recovery code. Please double-check your recovery code.' });
    return;
  }

  const normalizedPin = String(newPin).replace(/[٠-٩]/g, d => '0123456789'['٠١٢٣٤٥٦٧٨٩'.indexOf(d)]);
  if (!/^\d{6}$/.test(normalizedPin)) {
    res.status(400).json({ error: 'PIN must consist of exactly 6 digits.' });
    return;
  }

  // Update PIN and generate new recovery code
  db.userPins[user.id] = hashPin(normalizedPin);
  user.recoveryCode = generateRecoveryCode();
  user.updatedAt = new Date().toISOString();

  // Audit log
  db.auditLogs.push({
    id: `log_${generateSecureToken('l')}`,
    userId: user.id,
    userEmail: user.email,
    action: 'PIN_RECOVERED',
    details: 'User successfully reset PIN using recovery code.',
    timestamp: new Date().toISOString(),
  });

  saveDb();

  res.json({
    success: true,
    message: 'PIN has been reset successfully. Please log in with your new PIN.',
    newRecoveryCode: user.recoveryCode,
  });
});

// 6. Update Profile
authRouter.put('/profile', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { name, phone, workingLanguages, proofDocumentUrl, companyName, companyTagline, companyBrandColor, companyLogoUrl } = req.body;

  if (name) user.name = name.trim();
  if (phone) user.phone = phone.trim();
  if (Array.isArray(workingLanguages)) user.workingLanguages = workingLanguages;
  if (proofDocumentUrl !== undefined) {
    user.proofDocumentUrl = proofDocumentUrl;
    // If updating proof, move status back to PENDING_VERIFICATION if it was REJECTED
    if (user.verificationStatus === 'REJECTED') {
      user.verificationStatus = 'PENDING_VERIFICATION';
      user.verificationNote = 'Updated document uploaded for review.';
    }
  }
  if (companyName !== undefined) user.companyName = companyName;
  if (companyTagline !== undefined) user.companyTagline = companyTagline;
  if (companyBrandColor !== undefined) user.companyBrandColor = companyBrandColor;
  if (companyLogoUrl !== undefined) user.companyLogoUrl = companyLogoUrl;

  user.updatedAt = new Date().toISOString();
  saveDb();

  res.json({ user, message: 'Profile updated successfully.' });
});

// 7. Logout
authRouter.post('/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  let token: string | undefined;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.cookies && req.cookies.tourvia_token) {
    token = req.cookies.tourvia_token;
  }

  if (token && db.sessions[token]) {
    delete db.sessions[token];
    saveDb();
  }

  res.clearCookie('tourvia_token');
  res.json({ success: true, message: 'Logged out successfully.' });
});
