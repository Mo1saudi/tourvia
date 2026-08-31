import { Router, Response } from 'express';
import { db, saveDb, generateSecureToken } from '../db';
import { authMiddleware, AuthenticatedRequest } from '../auth';
import { Trip, TripVersion, TripCosts } from '../../src/types';

export const tripsRouter = Router();

// Server-side cost recalculation helper
export function calculateTripCosts(costs: Partial<TripCosts>): TripCosts {
  const accommodation = Math.max(0, Number(costs.accommodation) || 0);
  const transportation = Math.max(0, Number(costs.transportation) || 0);
  const activities = Math.max(0, Number(costs.activities) || 0);
  const guideFee = Math.max(0, Number(costs.guideFee) || 0);
  const food = Math.max(0, Number(costs.food) || 0);
  const otherCosts = Math.max(0, Number(costs.otherCosts) || 0);

  const totalCost = accommodation + transportation + activities + guideFee + food + otherCosts;
  const sellingPrice = Math.max(0, Number(costs.sellingPrice) || totalCost);
  const calculatedProfit = sellingPrice - totalCost;
  const profitMarginPercent = sellingPrice > 0 ? Number(((calculatedProfit / sellingPrice) * 100).toFixed(2)) : 0;

  return {
    accommodation,
    transportation,
    activities,
    guideFee,
    food,
    otherCosts,
    totalCost,
    sellingPrice,
    calculatedProfit,
    profitMarginPercent,
    currency: costs.currency || 'EGP',
  };
}

// 1. List user trips
tripsRouter.get('/', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { status, includeArchived, search } = req.query;

  let trips = db.trips.filter(t => t.guideId === user.id);

  if (includeArchived !== 'true') {
    trips = trips.filter(t => !t.isArchived);
  }

  if (status && status !== 'all') {
    trips = trips.filter(t => t.status === status);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    trips = trips.filter(t => t.name.toLowerCase().includes(q) || t.summary?.toLowerCase().includes(q));
  }

  // Sort by updatedAt desc
  trips.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  res.json({ trips, count: trips.length });
});

// 2. Get trip by ID
tripsRouter.get('/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const trip = db.trips.find(t => t.id === req.params.id && t.guideId === user.id);

  if (!trip) {
    res.status(404).json({ error: 'Trip not found or you do not have permission to view it.' });
    return;
  }

  const versions = db.tripVersions.filter(v => v.tripId === trip.id);
  const views = trip.publicToken && db.publicLinkViews[trip.publicToken] ? db.publicLinkViews[trip.publicToken].count : 0;

  res.json({ trip, versions, publicViews: views });
});

// 3. Create new Trip
tripsRouter.post('/', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const {
    name,
    summary,
    durationDays,
    nightsCount,
    travelerType,
    travelersCount,
    budgetTier,
    travelPace,
    walkingPreference,
    interests,
    restrictions,
    notes,
    destinations,
    days,
    transportation,
    costs,
    inclusions,
    exclusions,
    publicNotes,
    isPublicPriceVisible,
  } = req.body;

  const tripId = `trip_${generateSecureToken('t')}`;
  const calculatedCosts = calculateTripCosts(costs || {});

  const newTrip: Trip = {
    id: tripId,
    guideId: user.id,
    guideName: user.name,
    guidePhone: user.phone,
    guideEmail: user.email,
    name: name?.trim() || 'New Itinerary / برنامج سياحي جديد',
    summary: summary?.trim() || '',
    durationDays: Math.max(1, Number(durationDays) || 3),
    nightsCount: Math.max(0, Number(nightsCount) || Math.max(0, (Number(durationDays) || 3) - 1)),
    travelerType: travelerType || 'family',
    travelersCount: Math.max(1, Number(travelersCount) || 2),
    budgetTier: budgetTier || 'standard',
    travelPace: travelPace || 'moderate',
    walkingPreference: walkingPreference || 'moderate',
    interests: Array.isArray(interests) ? interests : ['Sightseeing', 'Culture'],
    restrictions: Array.isArray(restrictions) ? restrictions : [],
    notes: notes || '',
    status: 'draft',
    isArchived: false,
    destinations: Array.isArray(destinations) ? destinations : [],
    days: Array.isArray(days) ? days : [],
    transportation: Array.isArray(transportation) ? transportation : [],
    costs: calculatedCosts,
    isPublicPriceVisible: isPublicPriceVisible !== undefined ? Boolean(isPublicPriceVisible) : true,
    inclusions: Array.isArray(inclusions) ? inclusions : ['Professional Tour Guide Service', 'Private transportation'],
    exclusions: Array.isArray(exclusions) ? exclusions : ['Personal expenses', 'Gratuities'],
    publicNotes: publicNotes || '',
    currentVersion: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.trips.push(newTrip);

  // Initial version snapshot
  db.tripVersions.push({
    id: `ver_${generateSecureToken('v')}`,
    tripId,
    versionNumber: 1,
    changeSummary: 'Initial trip creation',
    createdAt: newTrip.createdAt,
    createdBy: user.id,
    snapshot: newTrip,
  });

  saveDb();

  res.status(201).json({ trip: newTrip, message: 'Trip created successfully.' });
});

// 4. Update Trip
tripsRouter.put('/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const tripIndex = db.trips.findIndex(t => t.id === req.params.id && t.guideId === user.id);

  if (tripIndex === -1) {
    res.status(404).json({ error: 'Trip not found or unauthorized.' });
    return;
  }

  const existingTrip = db.trips[tripIndex];
  const payload = req.body;

  const updatedCosts = calculateTripCosts(payload.costs || existingTrip.costs);

  const updatedTrip: Trip = {
    ...existingTrip,
    name: payload.name !== undefined ? payload.name : existingTrip.name,
    summary: payload.summary !== undefined ? payload.summary : existingTrip.summary,
    durationDays: payload.durationDays !== undefined ? Math.max(1, Number(payload.durationDays)) : existingTrip.durationDays,
    nightsCount: payload.nightsCount !== undefined ? Math.max(0, Number(payload.nightsCount)) : existingTrip.nightsCount,
    travelerType: payload.travelerType || existingTrip.travelerType,
    travelersCount: payload.travelersCount !== undefined ? Math.max(1, Number(payload.travelersCount)) : existingTrip.travelersCount,
    budgetTier: payload.budgetTier || existingTrip.budgetTier,
    travelPace: payload.travelPace || existingTrip.travelPace,
    walkingPreference: payload.walkingPreference || existingTrip.walkingPreference,
    interests: Array.isArray(payload.interests) ? payload.interests : existingTrip.interests,
    restrictions: Array.isArray(payload.restrictions) ? payload.restrictions : existingTrip.restrictions,
    notes: payload.notes !== undefined ? payload.notes : existingTrip.notes,
    coverImage: payload.coverImage !== undefined ? payload.coverImage : existingTrip.coverImage,
    destinations: Array.isArray(payload.destinations) ? payload.destinations : existingTrip.destinations,
    days: Array.isArray(payload.days) ? payload.days : existingTrip.days,
    transportation: Array.isArray(payload.transportation) ? payload.transportation : existingTrip.transportation,
    costs: updatedCosts,
    isPublicPriceVisible: payload.isPublicPriceVisible !== undefined ? Boolean(payload.isPublicPriceVisible) : existingTrip.isPublicPriceVisible,
    inclusions: Array.isArray(payload.inclusions) ? payload.inclusions : existingTrip.inclusions,
    exclusions: Array.isArray(payload.exclusions) ? payload.exclusions : existingTrip.exclusions,
    publicNotes: payload.publicNotes !== undefined ? payload.publicNotes : existingTrip.publicNotes,
    currentVersion: (existingTrip.currentVersion || 1) + 1,
    updatedAt: new Date().toISOString(),
  };

  db.trips[tripIndex] = updatedTrip;

  // Create version snapshot
  db.tripVersions.push({
    id: `ver_${generateSecureToken('v')}`,
    tripId: updatedTrip.id,
    versionNumber: updatedTrip.currentVersion,
    changeSummary: payload.changeSummary || `Version update ${updatedTrip.currentVersion}`,
    createdAt: updatedTrip.updatedAt,
    createdBy: user.id,
    snapshot: updatedTrip,
  });

  saveDb();

  res.json({ trip: updatedTrip, message: 'Trip saved and version recorded.' });
});

// 5. Publish Trip & Generate Secure Public Token
tripsRouter.post('/:id/publish', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const trip = db.trips.find(t => t.id === req.params.id && t.guideId === user.id);

  if (!trip) {
    res.status(404).json({ error: 'Trip not found.' });
    return;
  }

  // Operational Review Checklist
  const warnings: string[] = [];
  if (trip.destinations.length < 2) {
    warnings.push('Trip has fewer than 2 destinations. Multi-destination itineraries typically feature 2-5 destinations.');
  }
  if (trip.days.length === 0) {
    warnings.push('Itinerary has no days created yet.');
  }
  const emptyDays = trip.days.filter(d => !d.stations || d.stations.length === 0);
  if (emptyDays.length > 0) {
    warnings.push(`${emptyDays.length} day(s) have no activity stations assigned.`);
  }
  if (trip.costs.totalCost <= 0) {
    warnings.push('Operating costs are zero. Make sure you calculated transport, accommodation, and guide fees.');
  }

  if (!trip.publicToken) {
    trip.publicToken = `tv_${generateSecureToken('pub')}`;
    trip.publicLinkUrl = `/trip/public/${trip.publicToken}`;
  }

  trip.status = 'published';
  trip.updatedAt = new Date().toISOString();

  // Initialize view counter
  if (!db.publicLinkViews[trip.publicToken]) {
    db.publicLinkViews[trip.publicToken] = {
      token: trip.publicToken,
      tripId: trip.id,
      count: 0,
      firstViewAt: new Date().toISOString(),
      lastViewAt: new Date().toISOString(),
    };
  }

  // Audit
  db.auditLogs.push({
    id: `log_${generateSecureToken('l')}`,
    userId: user.id,
    userEmail: user.email,
    action: 'TRIP_PUBLISHED',
    details: `Trip "${trip.name}" published with token ${trip.publicToken}.`,
    timestamp: new Date().toISOString(),
  });

  saveDb();

  res.json({
    trip,
    publicToken: trip.publicToken,
    publicLinkUrl: trip.publicLinkUrl,
    warnings,
    message: 'Trip published successfully with secure client link.',
  });
});

// 6. Unpublish (Draft)
tripsRouter.post('/:id/unpublish', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const trip = db.trips.find(t => t.id === req.params.id && t.guideId === user.id);

  if (!trip) {
    res.status(404).json({ error: 'Trip not found.' });
    return;
  }

  trip.status = 'draft';
  trip.updatedAt = new Date().toISOString();
  saveDb();

  res.json({ trip, message: 'Trip unpublished and returned to draft mode.' });
});

// 7. Duplicate Trip
tripsRouter.post('/:id/duplicate', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const sourceTrip = db.trips.find(t => t.id === req.params.id && t.guideId === user.id);

  if (!sourceTrip) {
    res.status(404).json({ error: 'Trip not found.' });
    return;
  }

  const newTripId = `trip_${generateSecureToken('t')}`;
  const clonedTrip: Trip = {
    ...sourceTrip,
    id: newTripId,
    name: `${sourceTrip.name} (Copy / نسخة)`,
    status: 'draft',
    publicToken: undefined,
    publicLinkUrl: undefined,
    currentVersion: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.trips.push(clonedTrip);
  saveDb();

  res.status(201).json({ trip: clonedTrip, message: 'Trip duplicated successfully.' });
});

// 8. Archive / Restore Trip
tripsRouter.post('/:id/archive', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const trip = db.trips.find(t => t.id === req.params.id && t.guideId === user.id);

  if (!trip) {
    res.status(404).json({ error: 'Trip not found.' });
    return;
  }

  trip.isArchived = !trip.isArchived;
  trip.updatedAt = new Date().toISOString();
  saveDb();

  res.json({ trip, message: trip.isArchived ? 'Trip archived.' : 'Trip restored from archive.' });
});

// 9. Delete Trip
tripsRouter.delete('/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const tripIndex = db.trips.findIndex(t => t.id === req.params.id && t.guideId === user.id);

  if (tripIndex === -1) {
    res.status(404).json({ error: 'Trip not found.' });
    return;
  }

  const deletedTrip = db.trips[tripIndex];
  db.trips.splice(tripIndex, 1);

  // Clean up versions
  db.tripVersions = db.tripVersions.filter(v => v.tripId !== deletedTrip.id);
  saveDb();

  res.json({ success: true, message: 'Trip deleted permanently.' });
});

// 10. List Trip Versions
tripsRouter.get('/:id/versions', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const trip = db.trips.find(t => t.id === req.params.id && t.guideId === user.id);

  if (!trip) {
    res.status(404).json({ error: 'Trip not found.' });
    return;
  }

  const versions = db.tripVersions.filter(v => v.tripId === trip.id);
  res.json({ versions });
});

// 11. Restore Version
tripsRouter.post('/:id/restore-version/:versionId', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const trip = db.trips.find(t => t.id === req.params.id && t.guideId === user.id);
  const version = db.tripVersions.find(v => v.id === req.params.versionId && v.tripId === req.params.id);

  if (!trip || !version) {
    res.status(404).json({ error: 'Trip or version snapshot not found.' });
    return;
  }

  // Restore snapshot data while maintaining current ID
  const restoredSnapshot = version.snapshot;
  trip.name = restoredSnapshot.name;
  trip.summary = restoredSnapshot.summary;
  trip.destinations = restoredSnapshot.destinations;
  trip.days = restoredSnapshot.days;
  trip.transportation = restoredSnapshot.transportation;
  trip.costs = restoredSnapshot.costs;
  trip.inclusions = restoredSnapshot.inclusions;
  trip.exclusions = restoredSnapshot.exclusions;
  trip.publicNotes = restoredSnapshot.publicNotes;
  trip.currentVersion = (trip.currentVersion || 1) + 1;
  trip.updatedAt = new Date().toISOString();

  saveDb();

  res.json({ trip, message: `Restored to version ${version.versionNumber} successfully.` });
});
