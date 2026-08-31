import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Trip, User, WorkingLanguage } from '../types';
import {
  translateTripText,
  translateDestinationName,
  translateInclusion,
  translateExclusion,
} from '../i18n/tripTranslator';

export interface PdfExportOptions {
  guide?: Partial<User> | null;
  language?: WorkingLanguage;
  companyName?: string;
  phone?: string;
  email?: string;
  sellingPrice?: number;
  currency?: string;
  notes?: string;
}

export async function exportTripToPdf(trip: Trip, options: PdfExportOptions = {}): Promise<void> {
  const lang = options.language || 'ar';
  const isRtl = lang === 'ar';
  const guide = options.guide;

  const tripName = translateTripText(trip.name, lang);
  const tripSummary = translateTripText(trip.summary, lang);
  const safeFileName = `Tourvia_${tripName.replace(/[^a-zA-Z0-9\u0600-\u06FF_-]/g, '_')}_${lang}.pdf`;

  // Localized strings for PDF
  const labels: Record<WorkingLanguage, Record<string, string>> = {
    ar: {
      verifiedGuide: 'مرشد سياحي معتمد ومُرخّص',
      tripOverview: 'نظرة عامة على البرنامج السياحي',
      duration: 'المدة',
      days: 'أيام',
      nights: 'ليالٍ',
      startCity: 'مدينة الانطلاق',
      season: 'الموسم المفضل',
      destinations: 'الوجهات والمحطات الرئيسية',
      dailySchedule: 'الجدول الزمني المفصل يومًا بيوم',
      day: 'اليوم',
      morning: 'الفترة الصباحية',
      afternoon: 'فترة الظهيرة',
      evening: 'الفترة المسائية',
      stations: 'المحطات المجدولة',
      inclusions: 'الخدمات المشمولة في الباقة',
      exclusions: 'الخدمات غير المشمولة',
      importantNotes: 'ملاحظات هامة وإرشادات الرحلة',
      price: 'السعر الإجمالي للباقة',
      contactInfo: 'معلومات التواصل والحجز',
      footerText: 'تم إنشاء هذا البرنامج السياحي الرسمي عبر منصة تورفيا TOURVIA للخدمات السياحية',
      page: 'صفحة',
      of: 'من',
    },
    en: {
      verifiedGuide: 'Certified & Licensed Tour Guide',
      tripOverview: 'Tour Package Overview',
      duration: 'Duration',
      days: 'Days',
      nights: 'Nights',
      startCity: 'Starting City',
      season: 'Season',
      destinations: 'Key Destinations & Stops',
      dailySchedule: 'Detailed Day-by-Day Itinerary',
      day: 'Day',
      morning: 'Morning',
      afternoon: 'Afternoon',
      evening: 'Evening',
      stations: 'Scheduled Stops',
      inclusions: 'Included in the Package',
      exclusions: 'Excluded from the Package',
      importantNotes: 'Important Travel Notes & Guidelines',
      price: 'Total Package Price',
      contactInfo: 'Contact & Booking Information',
      footerText: 'Official itinerary generated via TOURVIA Tourism Operating Platform',
      page: 'Page',
      of: 'of',
    },
    de: {
      verifiedGuide: 'Zertifizierter & lizenzierter Reiseleiter',
      tripOverview: 'Übersicht über das Reisepaket',
      duration: 'Dauer',
      days: 'Tage',
      nights: 'Nächte',
      startCity: 'Startstadt',
      season: 'Saison',
      destinations: 'Hauptreiseziele & Stationen',
      dailySchedule: 'Detaillierter Tagesablauf',
      day: 'Tag',
      morning: 'Vormittag',
      afternoon: 'Nachmittag',
      evening: 'Abend',
      stations: 'Geplante Stationen',
      inclusions: 'Im Paket enthaltene Leistungen',
      exclusions: 'Nicht enthaltene Leistungen',
      importantNotes: 'Wichtige Reisehinweise',
      price: 'Gesamtpreis des Pakets',
      contactInfo: 'Kontakt & Buchungsinformationen',
      footerText: 'Offizieller Reiseplan erstellt über TOURVIA Tourism Platform',
      page: 'Seite',
      of: 'von',
    },
    fr: {
      verifiedGuide: 'Guide touristique certifié et agréé',
      tripOverview: 'Aperçu du forfait de voyage',
      duration: 'Durée',
      days: 'Jours',
      nights: 'Nuits',
      startCity: 'Ville de départ',
      season: 'Saison',
      destinations: 'Destinations et étapes clés',
      dailySchedule: 'Itinéraire détaillé jour par jour',
      day: 'Jour',
      morning: 'Matin',
      afternoon: 'Après-midi',
      evening: 'Soir',
      stations: 'Étapes planifiées',
      inclusions: 'Prestations incluses',
      exclusions: 'Prestations non incluses',
      importantNotes: 'Notes importantes pour le voyage',
      price: 'Prix total du forfait',
      contactInfo: 'Contact et informations de réservation',
      footerText: 'Programme officiel généré via la plateforme TOURVIA',
      page: 'Page',
      of: 'sur',
    },
    es: {
      verifiedGuide: 'Guía turístico certificado y autorizado',
      tripOverview: 'Resumen del paquete de viaje',
      duration: 'Duración',
      days: 'Días',
      nights: 'Noches',
      startCity: 'Ciudad de salida',
      season: 'Temporada',
      destinations: 'Destinos y paradas principales',
      dailySchedule: 'Itinerario detallado día a día',
      day: 'Día',
      morning: 'Mañana',
      afternoon: 'Tarde',
      evening: 'Noche',
      stations: 'Paradas programadas',
      inclusions: 'Servicios incluidos',
      exclusions: 'Servicios no incluidos',
      importantNotes: 'Notas importantes del viaje',
      price: 'Precio total del paquete',
      contactInfo: 'Contacto e información de reserva',
      footerText: 'Programa oficial generado mediante la plataforma TOURVIA',
      page: 'Página',
      of: 'de',
    },
    it: {
      verifiedGuide: 'Guida turistica certificata e autorizzata',
      tripOverview: 'Panoramica del pacchetto viaggio',
      duration: 'Durata',
      days: 'Giorni',
      nights: 'Notti',
      startCity: 'Città di partenza',
      season: 'Stagione',
      destinations: 'Destinazioni e tappe principali',
      dailySchedule: 'Itinerario dettagliato giorno per giorno',
      day: 'Giorno',
      morning: 'Mattina',
      afternoon: 'Pomeriggio',
      evening: 'Sera',
      stations: 'Tappe programmate',
      inclusions: 'Servizi inclusi',
      exclusions: 'Servizi non inclusi',
      importantNotes: 'Note importanti di viaggio',
      price: 'Prezzo totale del pacchetto',
      contactInfo: 'Contatti e prenotazioni',
      footerText: 'Programma ufficiale generato tramite la piattaforma TOURVIA',
      page: 'Pagina',
      of: 'di',
    },
    pl: {
      verifiedGuide: 'Certyfikowany i licencjonowany przewodnik',
      tripOverview: 'Przegląd pakietu turystycznego',
      duration: 'Czas trwania',
      days: 'Dni',
      nights: 'Nocy',
      startCity: 'Miasto wyjazdu',
      season: 'Sezon',
      destinations: 'Główne cele podróży i przystanki',
      dailySchedule: 'Szczegółowy plan dzień po dniu',
      day: 'Dzień',
      morning: 'Rano',
      afternoon: 'Popołudnie',
      evening: 'Wieczór',
      stations: 'Zaplanowane przystanki',
      inclusions: 'Usługi wliczone w cenę',
      exclusions: 'Usługi niewliczone w cenę',
      importantNotes: 'Ważne informacje podróżne',
      price: 'Całkowita cena pakietu',
      contactInfo: 'Kontakt i rezerwacja',
      footerText: 'Oficjalny plan podróży wygenerowany przez platformę TOURVIA',
      page: 'Strona',
      of: 'z',
    },
    ru: {
      verifiedGuide: 'Сертифицированный и лицензированный гид',
      tripOverview: 'Обзор туристического пакета',
      duration: 'Продолжительность',
      days: 'дней',
      nights: 'ночей',
      startCity: 'Город отправления',
      season: 'Сезон',
      destinations: 'Основные направления и остановки',
      dailySchedule: 'Подробный маршрут по дням',
      day: 'День',
      morning: 'Утро',
      afternoon: 'День',
      evening: 'Вечер',
      stations: 'Запланированные остановки',
      inclusions: 'В стоимость включено',
      exclusions: 'В стоимость не включено',
      importantNotes: 'Важные примечания к поездке',
      price: 'Итоговая стоимость пакета',
      contactInfo: 'Контакты и бронирование',
      footerText: 'Официальная программа путешествия создана на платформе TOURVIA',
      page: 'Страница',
      of: 'из',
    },
    zh: {
      verifiedGuide: '官方认证持牌专业导游',
      tripOverview: '行程套餐概览',
      duration: '行程天数',
      days: '天',
      nights: '晚',
      startCity: '出发城市',
      season: '适宜季节',
      destinations: '主要目的地与游览站点',
      dailySchedule: '每日详细行程安排',
      day: '第',
      morning: '上午',
      afternoon: '下午',
      evening: '晚上',
      stations: '游览站点',
      inclusions: '费用包含项目',
      exclusions: '费用不包含项目',
      importantNotes: '重要出行须知与提示',
      price: '套餐总价',
      contactInfo: '联系与预订信息',
      footerText: '本行程单由 TOURVIA 埃及旅游运营平台官方生成',
      page: '页',
      of: '/',
    },
  };

  const str = labels[lang] || labels.en;

  const guideName = guide?.name || options.companyName || 'Tourvia Tour Guide';
  const guideCompany = guide?.companyName || options.companyName || 'Tourvia Egypt Excursions';
  const guidePhone = guide?.phone || options.phone || '+20 100 000 0000';
  const guideEmail = guide?.email || options.email || 'info@tourvia.travel';
  const price = options.sellingPrice || trip.sellingPrice || trip.costs?.sellingPrice || 0;
  const currency = options.currency || trip.currency || trip.costs?.currency || 'EGP';

  // Create an isolated iframe to completely isolate rendering and avoid Tailwind v4 oklch styles
  const iframe = document.createElement('iframe');
  iframe.id = 'tourvia-pdf-render-frame';
  iframe.style.position = 'fixed';
  iframe.style.left = '-9999px';
  iframe.style.top = '0';
  iframe.style.width = '794px';
  iframe.style.height = '1200px';
  iframe.style.border = 'none';
  iframe.style.opacity = '0';
  iframe.style.pointerEvents = 'none';
  iframe.style.zIndex = '-9999';

  document.body.appendChild(iframe);

  try {
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
      throw new Error('Unable to create PDF render target');
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html dir="${isRtl ? 'rtl' : 'ltr'}" lang="${lang}">
      <head>
        <meta charset="utf-8">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
        <style>
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          body {
            background-color: #ffffff;
            color: #0f172a;
            font-family: 'Cairo', system-ui, -apple-system, sans-serif;
            width: 794px;
            margin: 0;
            padding: 0;
          }
        </style>
      </head>
      <body>
        <div style="width: 794px; background: #ffffff; padding: 36px 40px; box-sizing: border-box; color: #0f172a;">
          <!-- TOP HEADER / BRAND BAR -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #F59E0B; padding-bottom: 18px; margin-bottom: 24px;">
            <div>
              <div style="display: flex; align-items: center; gap: 10px;">
                <div style="width: 36px; height: 36px; background: #0B1736; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #F59E0B; font-weight: 900; font-size: 18px;">
                  T
                </div>
                <div>
                  <div style="font-size: 20px; font-weight: 900; color: #0B1736; letter-spacing: 0.5px;">${guideCompany}</div>
                  <div style="font-size: 11px; color: #64748b; font-weight: 600;">${guideName} • ${str.verifiedGuide}</div>
                </div>
              </div>
            </div>

            <div style="text-align: ${isRtl ? 'left' : 'right'}; font-size: 11px; color: #475569; line-height: 1.5;">
              <div style="font-weight: 800; color: #0B1736;">📞 ${guidePhone}</div>
              <div>✉️ ${guideEmail}</div>
              <div style="color: #F59E0B; font-weight: 700; font-size: 10px; margin-top: 2px;">TOURVIA VERIFIED PARTNER</div>
            </div>
          </div>

          <!-- TRIP HERO BANNER -->
          <div style="background: #0B1736; color: #ffffff; border-radius: 16px; padding: 24px 28px; margin-bottom: 24px; position: relative;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <span style="background: #F59E0B; color: #0B1736; font-weight: 800; font-size: 11px; padding: 4px 12px; border-radius: 20px; text-transform: uppercase;">
                ${trip.durationDays} ${str.days} • ${trip.nightsCount} ${str.nights}
              </span>
              <span style="font-size: 11px; color: #cbd5e1; font-weight: 600;">
                📍 ${trip.destinations.map(d => translateDestinationName(d.name, lang)).join(' • ')}
              </span>
            </div>

            <h1 style="font-size: 26px; font-weight: 900; margin: 0 0 10px 0; color: #ffffff; line-height: 1.3;">
              ${tripName}
            </h1>

            <p style="font-size: 12px; line-height: 1.6; color: #cbd5e1; margin: 0;">
              ${tripSummary}
            </p>

            <div style="display: flex; gap: 20px; margin-top: 16px; padding-top: 14px; border-top: 1px solid rgba(255,255,255,0.15); font-size: 11px; color: #94a3b8;">
              <div><strong>${str.startCity}:</strong> <span style="color: #f1f5f9;">${translateDestinationName(trip.startCity || 'القاهرة', lang)}</span></div>
              <div><strong>${str.season}:</strong> <span style="color: #f1f5f9;">${trip.season || (isRtl ? 'طوال العام' : 'All Year')}</span></div>
              ${price > 0 ? `<div><strong>${str.price}:</strong> <span style="color: #FBBF24; font-weight: 800; font-size: 12px;">${price.toLocaleString()} ${currency}</span></div>` : ''}
            </div>
          </div>

          <!-- DESTINATIONS SUMMARY -->
          <div style="margin-bottom: 24px;">
            <h2 style="font-size: 15px; font-weight: 800; color: #0B1736; margin: 0 0 12px 0; border-${isRtl ? 'right' : 'left'}: 4px solid #F59E0B; padding-${isRtl ? 'right' : 'left'}: 10px;">
              ${str.destinations}
            </h2>
            <div style="display: grid; grid-template-columns: repeat(${Math.min(trip.destinations.length, 3)}, 1fr); gap: 12px;">
              ${trip.destinations.map((d, i) => `
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 14px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <span style="font-weight: 900; font-size: 13px; color: #0B1736;">${i + 1}. ${translateDestinationName(d.name, lang)}</span>
                    <span style="background: #e2e8f0; color: #475569; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 6px;">${d.nightsCount} ${str.nights}</span>
                  </div>
                  ${d.highlightAttractions && d.highlightAttractions.length > 0 ? `
                    <div style="font-size: 10px; color: #64748b; line-height: 1.4;">
                      ${d.highlightAttractions.slice(0, 3).map(a => `• ${a}`).join('<br/>')}
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          </div>

          <!-- DAILY ITINERARY -->
          <div style="margin-bottom: 24px;">
            <h2 style="font-size: 15px; font-weight: 800; color: #0B1736; margin: 0 0 14px 0; border-${isRtl ? 'right' : 'left'}: 4px solid #F59E0B; padding-${isRtl ? 'right' : 'left'}: 10px;">
              ${str.dailySchedule}
            </h2>

            <div style="display: flex; flex-direction: column; gap: 14px;">
              ${trip.days.map((day) => `
                <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 14px; padding: 14px 18px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
                  <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; margin-bottom: 10px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span style="background: #F59E0B; color: #0B1736; font-weight: 900; font-size: 11px; width: 22px; height: 22px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center;">
                        ${day.dayNumber}
                      </span>
                      <span style="font-weight: 800; font-size: 13px; color: #0B1736;">
                        ${translateTripText(day.title, lang)}
                      </span>
                    </div>
                    <span style="font-size: 11px; font-weight: 600; color: #d97706;">
                      📍 ${translateDestinationName(day.destinationName, lang)}
                    </span>
                  </div>

                  <!-- Activities -->
                  <div style="font-size: 11px; line-height: 1.6; color: #334155; margin-bottom: 8px;">
                    ${day.morningActivity ? `<div style="margin-bottom: 4px;"><strong>🌅 ${str.morning}:</strong> ${day.morningActivity}</div>` : ''}
                    ${day.afternoonActivity ? `<div style="margin-bottom: 4px;"><strong>☀️ ${str.afternoon}:</strong> ${day.afternoonActivity}</div>` : ''}
                    ${day.eveningActivity ? `<div><strong>🌙 ${str.evening}:</strong> ${day.eveningActivity}</div>` : ''}
                  </div>

                  <!-- Stations Timeline -->
                  ${day.stations && day.stations.length > 0 ? `
                    <div style="background: #f8fafc; border-radius: 8px; padding: 8px 12px; margin-top: 8px; display: flex; flex-wrap: wrap; gap: 10px;">
                      ${day.stations.map(st => `
                        <span style="font-size: 10px; color: #1e293b; background: #ffffff; border: 1px solid #e2e8f0; padding: 3px 8px; border-radius: 6px;">
                          <strong style="color: #d97706;">${st.time || '09:00'}</strong> ${st.name} ${st.durationMinutes ? `<span style="color: #94a3b8;">(${st.durationMinutes}m)</span>` : ''}
                        </span>
                      `).join('')}
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          </div>

          <!-- INCLUSIONS & EXCLUSIONS -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
            <!-- Inclusions -->
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 14px; padding: 16px 18px;">
              <h3 style="font-size: 13px; font-weight: 800; color: #166534; margin: 0 0 10px 0;">
                ✓ ${str.inclusions}
              </h3>
              <ul style="margin: 0; padding: 0; list-style: none; font-size: 11px; color: #14532d; line-height: 1.6;">
                ${trip.inclusions.map(inc => `
                  <li style="margin-bottom: 6px; display: flex; align-items: flex-start; gap: 6px;">
                    <span style="color: #16a34a; font-weight: bold;">✔</span>
                    <span>${translateInclusion(inc, lang)}</span>
                  </li>
                `).join('')}
              </ul>
            </div>

            <!-- Exclusions -->
            <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 14px; padding: 16px 18px;">
              <h3 style="font-size: 13px; font-weight: 800; color: #991b1b; margin: 0 0 10px 0;">
                ✕ ${str.exclusions}
              </h3>
              <ul style="margin: 0; padding: 0; list-style: none; font-size: 11px; color: #7f1d1d; line-height: 1.6;">
                ${trip.exclusions.map(exc => `
                  <li style="margin-bottom: 6px; display: flex; align-items: flex-start; gap: 6px;">
                    <span style="color: #dc2626; font-weight: bold;">✕</span>
                    <span>${translateExclusion(exc, lang)}</span>
                  </li>
                `).join('')}
              </ul>
            </div>
          </div>

          ${trip.notes ? `
            <!-- NOTES -->
            <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 12px 16px; margin-bottom: 24px; font-size: 11px; color: #92400e; line-height: 1.5;">
              <strong>ℹ️ ${str.importantNotes}:</strong> ${trip.notes}
            </div>
          ` : ''}

          <!-- FOOTER / CONTACT BAR -->
          <div style="border-top: 2px solid #e2e8f0; padding-top: 16px; display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #64748b;">
            <div>
              <strong>${guideCompany}</strong> • ${guidePhone} • ${guideEmail}
            </div>
            <div style="text-align: ${isRtl ? 'left' : 'right'}; font-weight: 600;">
              ${str.footerText}
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    iframeDoc.open();
    iframeDoc.write(htmlContent);
    iframeDoc.close();

    // Give the browser and font loader a moment to settle inside iframe
    if (iframeDoc.fonts && iframeDoc.fonts.ready) {
      await iframeDoc.fonts.ready;
    }
    await new Promise((resolve) => setTimeout(resolve, 150));

    const canvas = await html2canvas(iframeDoc.body, {
      scale: 2, // High resolution for crisp print
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 794,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF('p', 'mm', 'a4');

    const pageWidth = 210; // mm
    const pageHeight = 297; // mm
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;
    }

    pdf.save(safeFileName);
  } finally {
    if (iframe.parentNode) {
      iframe.parentNode.removeChild(iframe);
    }
  }
}
