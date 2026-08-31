import { Router, Response } from 'express';
import { db, saveDb } from '../db';
import { authMiddleware, AuthenticatedRequest } from '../auth';

export const analyticsRouter = Router();

// 1. Get Guide Analytics Summary
analyticsRouter.get('/summary', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const userTrips = db.trips.filter(t => t.guideId === user.id);

  const publishedTrips = userTrips.filter(t => t.status === 'published' && !t.isArchived);
  const totalPublicViews = publishedTrips.reduce((acc, t) => {
    const views = (t.publicToken && db.publicLinkViews[t.publicToken]) ? db.publicLinkViews[t.publicToken].count : 0;
    return acc + views;
  }, 0);

  const userInquiries = db.inquiries.filter(i => i.guideId === user.id);
  const userReviews = db.reviews.filter(r => r.guideId === user.id);

  const avgRating = userReviews.length > 0
    ? Number((userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length).toFixed(1))
    : 5.0;

  const totalCalculatedRevenue = publishedTrips.reduce((sum, t) => sum + (t.costs?.sellingPrice || 0), 0);
  const totalEstimatedProfit = publishedTrips.reduce((sum, t) => sum + (t.costs?.calculatedProfit || 0), 0);

  const aiUsage = db.aiUsage[user.id] || { lifetimeUsed: 0, lifetimeLimit: 3 };

  res.json({
    metrics: {
      totalTrips: userTrips.length,
      publishedTrips: publishedTrips.length,
      totalViews: totalPublicViews,
      totalInquiries: userInquiries.length,
      totalReviews: userReviews.length,
      averageRating: avgRating,
      totalRevenue: totalCalculatedRevenue,
      totalProfit: totalEstimatedProfit,
      aiGeneratedTrips: aiUsage.lifetimeUsed,
      currency: 'EGP',
    },
    topTrips: userTrips.slice(0, 5).map(t => ({
      id: t.id,
      name: t.name,
      views: (t.publicToken && db.publicLinkViews[t.publicToken]) ? db.publicLinkViews[t.publicToken].count : 0,
      inquiriesCount: db.inquiries.filter(i => i.tripId === t.id).length,
      sellingPrice: t.costs.sellingPrice,
      profit: t.costs.calculatedProfit,
      status: t.status,
    })),
  });
});

// 2. Export Analytics / Trips to CSV
analyticsRouter.get('/export-csv', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const userTrips = db.trips.filter(t => t.guideId === user.id);

  const headers = [
    'Trip ID',
    'Trip Name',
    'Status',
    'Duration (Days)',
    'Nights',
    'Destinations Count',
    'Selling Price (EGP)',
    'Total Cost (EGP)',
    'Net Profit (EGP)',
    'Profit Margin (%)',
    'Public Link Views',
    'Created At',
  ];

  const rows = userTrips.map(t => [
    `"${t.id}"`,
    `"${t.name.replace(/"/g, '""')}"`,
    `"${t.status}"`,
    t.durationDays,
    t.nightsCount,
    t.destinations.length,
    t.costs.sellingPrice,
    t.costs.totalCost,
    t.costs.calculatedProfit,
    `${t.costs.profitMarginPercent}%`,
    (t.publicToken && db.publicLinkViews[t.publicToken]) ? db.publicLinkViews[t.publicToken].count : 0,
    `"${t.createdAt}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename=tourvia_trips_export_${Date.now()}.csv`);
  res.send('\uFEFF' + csvContent); // Add UTF-8 BOM for Arabic Excel support
});

// 3. User Inquiries
analyticsRouter.get('/inquiries', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const inquiries = db.inquiries.filter(i => i.guideId === user.id);
  inquiries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json({ inquiries });
});

// 4. Update Inquiry Status
analyticsRouter.put('/inquiries/:id/status', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const inquiry = db.inquiries.find(i => i.id === req.params.id && i.guideId === user.id);

  if (!inquiry) {
    res.status(404).json({ error: 'Inquiry not found.' });
    return;
  }

  const { status } = req.body;
  if (['NEW', 'CONTACTED', 'BOOKED', 'ARCHIVED'].includes(status)) {
    inquiry.status = status;
    saveDb();
  }

  res.json({ inquiry });
});

// 5. User Reviews
analyticsRouter.get('/reviews', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const reviews = db.reviews.filter(r => r.guideId === user.id);
  reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json({ reviews });
});

// 6. User Notifications
analyticsRouter.get('/notifications', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const notifications = db.notifications.filter(n => n.userId === user.id);
  notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const unreadCount = notifications.filter(n => !n.isRead).length;
  res.json({ notifications, unreadCount });
});

analyticsRouter.post('/notifications/:id/read', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const notif = db.notifications.find(n => n.id === req.params.id && n.userId === user.id);
  if (notif) {
    notif.isRead = true;
    saveDb();
  }
  res.json({ success: true });
});

analyticsRouter.post('/notifications/read-all', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  db.notifications.forEach(n => {
    if (n.userId === user.id) n.isRead = true;
  });
  saveDb();
  res.json({ success: true });
});
