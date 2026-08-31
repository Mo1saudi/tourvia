import { GoogleGenAI, Type } from '@google/genai';
import { Trip, TripDay, TripDestination, TripTransportation } from '../src/types';

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

export interface GenerateTripPromptParams {
  name?: string;
  durationDays: number;
  nightsCount: number;
  destinations: { name: string; description?: string }[];
  travelerType: string;
  travelersCount: number;
  budgetTier: string;
  travelPace: string;
  walkingPreference: string;
  interests: string[];
  restrictions: string[];
  notes?: string;
  language?: string;
}

export async function generateSmartTripItinerary(
  params: GenerateTripPromptParams
): Promise<{ tripSummary: string; days: TripDay[]; transportation: TripTransportation[]; isFallback?: boolean }> {
  const ai = getAiClient();

  if (!ai) {
    console.warn('GEMINI_API_KEY is not available in environment. Using safe high-fidelity generator fallback.');
    return generateFallbackItinerary(params);
  }

  const langInstruction = params.language === 'ar'
    ? 'أجب باللغة العربية بأسلوب سياحي احترافي وجذاب.'
    : 'Respond in English with professional tourism styling.';

  const destinationNames = params.destinations.map(d => d.name).join(', ');
  const prompt = `
You are TOURVIA's master AI travel program architect.
Create an authentic, practical, hour-by-hour multi-destination itinerary for tour guides.

Trip Parameters:
- Trip Title/Theme: ${params.name || 'Custom Tour'}
- Duration: ${params.durationDays} Days / ${params.nightsCount} Nights
- Destinations: ${destinationNames}
- Traveler Profile: ${params.travelerType} (${params.travelersCount} travelers)
- Budget Level: ${params.budgetTier}
- Travel Pace: ${params.travelPace}
- Walking Preference: ${params.walkingPreference}
- Interests: ${params.interests.join(', ')}
- Restrictions: ${params.restrictions.join(', ') || 'None'}
- Special Guide Notes: ${params.notes || 'None'}

Instructions:
1. Provide a captivating 2-sentence tripSummary highlighting the tour signature moments.
2. Structure exactly ${params.durationDays} days.
3. For each day, include 2 to 4 detailed stations with realistic start/end times (24h format like "09:00", "11:30"), duration in minutes, activity type (sightseeing, museum, historical, adventure, culinary, shopping, relaxation, transit, photo_stop), location name, and rich description.
4. For inter-destination transportation between consecutive destinations, provide transit type (car, bus, train, flight, boat, walking), estimated distance in km, duration in minutes, and estimated cost.
5. ${langInstruction}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tripSummary: {
              type: Type.STRING,
              description: 'Captivating overview of the entire journey',
            },
            days: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  dayNumber: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  destinationName: { type: Type.STRING },
                  stations: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        description: { type: Type.STRING },
                        startTime: { type: Type.STRING },
                        endTime: { type: Type.STRING },
                        durationMinutes: { type: Type.INTEGER },
                        activityType: { type: Type.STRING },
                        locationName: { type: Type.STRING },
                        notes: { type: Type.STRING },
                      },
                      required: ['name', 'description', 'startTime', 'endTime', 'durationMinutes', 'activityType'],
                    },
                  },
                  notes: { type: Type.STRING },
                },
                required: ['dayNumber', 'title', 'destinationName', 'stations'],
              },
            },
            transportation: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  fromDestination: { type: Type.STRING },
                  toDestination: { type: Type.STRING },
                  type: { type: Type.STRING },
                  distanceKm: { type: Type.NUMBER },
                  estimatedDurationMinutes: { type: Type.INTEGER },
                  estimatedCost: { type: Type.NUMBER },
                  meetingPoint: { type: Type.STRING },
                },
                required: ['fromDestination', 'toDestination', 'type', 'distanceKm', 'estimatedDurationMinutes', 'estimatedCost'],
              },
            },
          },
          required: ['tripSummary', 'days', 'transportation'],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    if (!parsed.days || !Array.isArray(parsed.days) || parsed.days.length === 0) {
      throw new Error('Malformed AI response schema');
    }

    // Format stations with unique IDs and mapped types
    const days: TripDay[] = parsed.days.map((d: any, dayIdx: number) => ({
      dayNumber: d.dayNumber || dayIdx + 1,
      title: d.title || `Day ${dayIdx + 1}`,
      destinationId: `dest_${dayIdx % Math.max(1, params.destinations.length)}`,
      destinationName: d.destinationName || params.destinations[dayIdx % params.destinations.length]?.name || 'Destination',
      stations: (d.stations || []).map((st: any, stIdx: number) => ({
        id: `st_${dayIdx + 1}_${stIdx + 1}`,
        dayNumber: d.dayNumber || dayIdx + 1,
        name: st.name,
        description: st.description || '',
        startTime: st.startTime || '09:00',
        endTime: st.endTime || '11:00',
        durationMinutes: st.durationMinutes || 120,
        activityType: (st.activityType as any) || 'sightseeing',
        locationName: st.locationName || '',
        notes: st.notes || '',
        order: stIdx + 1,
      })),
      mealsIncluded: { breakfast: true, lunch: true, dinner: dayIdx === 0 || dayIdx === parsed.days.length - 1 },
      notes: d.notes || '',
    }));

    const transportation: TripTransportation[] = (parsed.transportation || []).map((tr: any, trIdx: number) => ({
      id: `tr_${trIdx + 1}`,
      fromDestination: tr.fromDestination || 'Origin',
      toDestination: tr.toDestination || 'Destination',
      type: (tr.type as any) || 'car',
      departureTime: '08:00',
      meetingPoint: tr.meetingPoint || 'Hotel Lobby / Station',
      distanceKm: tr.distanceKm || 150,
      estimatedDurationMinutes: tr.estimatedDurationMinutes || 120,
      estimatedCost: tr.estimatedCost || 1200,
    }));

    return {
      tripSummary: parsed.tripSummary,
      days,
      transportation,
      isFallback: false,
    };
  } catch (err) {
    console.error('Gemini generation error, falling back to local engine:', err);
    return generateFallbackItinerary(params);
  }
}

export async function regenerateSingleDay(
  dayNumber: number,
  destinationName: string,
  interests: string[],
  language = 'ar'
): Promise<{ day: TripDay; isFallback?: boolean }> {
  const ai = getAiClient();

  if (!ai) {
    return {
      day: createFallbackDay(dayNumber, destinationName, interests, language),
      isFallback: true,
    };
  }

  const prompt = `
Regenerate a single day itinerary for Day ${dayNumber} visiting ${destinationName}.
Interests: ${interests.join(', ')}.
Language: ${language === 'ar' ? 'Arabic' : 'English'}.
Generate 3 fresh and distinct stations with realistic times and rich descriptions.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            stations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  startTime: { type: Type.STRING },
                  endTime: { type: Type.STRING },
                  durationMinutes: { type: Type.INTEGER },
                  activityType: { type: Type.STRING },
                  locationName: { type: Type.STRING },
                },
                required: ['name', 'description', 'startTime', 'endTime', 'durationMinutes', 'activityType'],
              },
            },
          },
          required: ['title', 'stations'],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    const stations = (parsed.stations || []).map((st: any, idx: number) => ({
      id: `st_regen_${dayNumber}_${idx + 1}_${Date.now()}`,
      dayNumber,
      name: st.name,
      description: st.description || '',
      startTime: st.startTime || '09:00',
      endTime: st.endTime || '11:00',
      durationMinutes: st.durationMinutes || 120,
      activityType: (st.activityType as any) || 'sightseeing',
      locationName: st.locationName || '',
      order: idx + 1,
    }));

    return {
      day: {
        dayNumber,
        title: parsed.title || `Day ${dayNumber} in ${destinationName}`,
        destinationId: `dest_${dayNumber}`,
        destinationName,
        stations,
        mealsIncluded: { breakfast: true, lunch: true, dinner: false },
      },
      isFallback: false,
    };
  } catch (err) {
    console.error('Day regeneration AI error:', err);
    return {
      day: createFallbackDay(dayNumber, destinationName, interests, language),
      isFallback: true,
    };
  }
}

function createFallbackDay(dayNumber: number, destinationName: string, interests: string[], language: string): TripDay {
  const isAr = language === 'ar';
  return {
    dayNumber,
    title: isAr ? `اليوم ${dayNumber}: استكشاف معالم ${destinationName}` : `Day ${dayNumber}: Exploring ${destinationName}`,
    destinationId: `dest_${dayNumber}`,
    destinationName,
    stations: [
      {
        id: `st_fb_${dayNumber}_1`,
        dayNumber,
        name: isAr ? `جولة صباحية مميزة في معالم ${destinationName}` : `Morning Guided Highlights Tour in ${destinationName}`,
        description: isAr ? `زيارة أبرز المعالم التاريخية والتراثية مع شرح مفصل من المرشد السياحي.` : `Visiting prime historical monuments with comprehensive Egyptologist commentary.`,
        startTime: '09:00',
        endTime: '12:00',
        durationMinutes: 180,
        activityType: 'sightseeing',
        order: 1,
      },
      {
        id: `st_fb_${dayNumber}_2`,
        dayNumber,
        name: isAr ? `غداء تقليدي وتذوق المأكولات المحلية` : `Authentic Local Gastronomy & Lunch Experience`,
        description: isAr ? `استراحة غداء في مطعم عريق لتذوق أشهى الأطباق المحلية والمشروبات المنعشة.` : `Relaxing lunch at a curated restaurant with authentic culinary tasting.`,
        startTime: '12:30',
        endTime: '14:00',
        durationMinutes: 90,
        activityType: 'culinary',
        order: 2,
      },
      {
        id: `st_fb_${dayNumber}_3`,
        dayNumber,
        name: isAr ? `جولة ثقافية مسائية والأسواق التراثية` : `Evening Cultural Walk & Historic Heritage Market`,
        description: isAr ? `استكشاف الأسواق الشعبية والحرف اليدوية مع فرصة لشراء التذكارات والتقاط الصور.` : `Strolling through heritage markets and artisan crafts with photo opportunities.`,
        startTime: '16:00',
        endTime: '18:30',
        durationMinutes: 150,
        activityType: 'shopping',
        order: 3,
      },
    ],
    mealsIncluded: { breakfast: true, lunch: true, dinner: false },
    notes: isAr ? 'يرجى ارتداء ملابس وأحذية مريحة.' : 'Comfortable walking gear recommended.',
  };
}

function generateFallbackItinerary(params: GenerateTripPromptParams): {
  tripSummary: string;
  days: TripDay[];
  transportation: TripTransportation[];
  isFallback: boolean;
} {
  const isAr = params.language === 'ar';
  const destList = params.destinations.length > 0
    ? params.destinations
    : [{ name: isAr ? 'القاهرة' : 'Cairo' }, { name: isAr ? 'الأقصر' : 'Luxor' }];

  const days: TripDay[] = [];
  const daysPerDest = Math.max(1, Math.floor(params.durationDays / destList.length));

  for (let i = 1; i <= params.durationDays; i++) {
    const destIdx = Math.min(destList.length - 1, Math.floor((i - 1) / daysPerDest));
    const destName = destList[destIdx].name;
    days.push(createFallbackDay(i, destName, params.interests, params.language || 'ar'));
  }

  const transportation: TripTransportation[] = [];
  for (let d = 0; d < destList.length - 1; d++) {
    transportation.push({
      id: `tr_fb_${d + 1}`,
      fromDestination: destList[d].name,
      toDestination: destList[d + 1].name,
      type: 'car',
      departureTime: '08:30',
      meetingPoint: isAr ? 'بهو الفندق' : 'Hotel Lobby',
      distanceKm: 220,
      estimatedDurationMinutes: 160,
      estimatedCost: 1500,
    });
  }

  const tripSummary = isAr
    ? `برنامج سياحي متكامل ومخصص يمتد على مدار ${params.durationDays} أيام لاستكشاف روائع ${destList.map(d => d.name).join(' و ')}، مصمم وفق أرقى معايير الإرشاد السياحي والراحة.`
    : `A comprehensive ${params.durationDays}-day curated tour program exploring the highlights of ${destList.map(d => d.name).join(' & ')}, designed with top comfort and pacing.`;

  return {
    tripSummary,
    days,
    transportation,
    isFallback: true,
  };
}
