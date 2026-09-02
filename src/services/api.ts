import {
  User,
  Trip,
  TripVersion,
  CustomerInquiry,
  TripReview,
  NotificationItem,
  SubscriptionPlan,
  UserSubscription,
  PaymentRequest,
  PromoCode,
  AiUsageData,
  AdminAiSettings,
  AuditLogItem,
  Campaign,
  PublicTripPayload,
  HomepageCustomStats,
  PublicStatsResponse
} from '../types';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('tourvia_token');
  }

  public setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('tourvia_token', token);
    } else {
      localStorage.removeItem('tourvia_token');
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(endpoint, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      this.setToken(null);
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(data.message || data.error || `Request failed with status ${response.status}`);
      (error as any).data = data;
      (error as any).status = response.status;
      throw error;
    }

    return data as T;
  }

  // Auth
  public async register(payload: any): Promise<{ user: User; token: string; recoveryCode: string; subscription: UserSubscription; aiUsage: AiUsageData }> {
    const res = await this.request<any>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    this.setToken(res.token);
    return res;
  }

  public async login(payload: any): Promise<{ user: User; token: string; subscription: UserSubscription; aiUsage: AiUsageData }> {
    const res = await this.request<any>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    this.setToken(res.token);
    return res;
  }

  public async getMe(): Promise<{ user: User; subscription: UserSubscription; aiUsage: AiUsageData; unreadNotificationsCount: number }> {
    return this.request('/api/auth/me');
  }

  public async recoverPin(payload: { identifier: string; recoveryCode: string; newPin: string }): Promise<{ success: boolean; message: string; newRecoveryCode: string }> {
    return this.request('/api/auth/recover-pin', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async updateProfile(payload: Partial<User>): Promise<{ user: User; message: string }> {
    return this.request('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  public async requestVerification(payload: { syndicateNumber?: string; licenseNumber?: string; proofDocumentUrl?: string }): Promise<{ user: User; message: string }> {
    return this.request('/api/auth/request-verification', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async logout(): Promise<void> {
    await this.request('/api/auth/logout', { method: 'POST' }).catch(() => {});
    this.setToken(null);
  }

  // Trips
  public async getTrips(params?: { status?: string; includeArchived?: boolean; search?: string }): Promise<{ trips: Trip[]; count: number }> {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.includeArchived) query.append('includeArchived', 'true');
    if (params?.search) query.append('search', params.search);
    return this.request(`/api/trips?${query.toString()}`);
  }

  public async getTrip(id: string): Promise<{ trip: Trip; versions: TripVersion[]; publicViews: number }> {
    return this.request(`/api/trips/${id}`);
  }

  public async createTrip(payload: Partial<Trip>): Promise<{ trip: Trip; message: string }> {
    return this.request('/api/trips', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async updateTrip(id: string, payload: Partial<Trip>): Promise<{ trip: Trip; message: string }> {
    return this.request(`/api/trips/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  public async publishTrip(id: string): Promise<{ trip: Trip; publicToken: string; publicLinkUrl: string; warnings: string[]; message: string }> {
    return this.request(`/api/trips/${id}/publish`, { method: 'POST' });
  }

  public async unpublishTrip(id: string): Promise<{ trip: Trip; message: string }> {
    return this.request(`/api/trips/${id}/unpublish`, { method: 'POST' });
  }

  public async duplicateTrip(id: string): Promise<{ trip: Trip; message: string }> {
    return this.request(`/api/trips/${id}/duplicate`, { method: 'POST' });
  }

  public async archiveTrip(id: string): Promise<{ trip: Trip; message: string }> {
    return this.request(`/api/trips/${id}/archive`, { method: 'POST' });
  }

  public async deleteTrip(id: string): Promise<{ success: boolean; message: string }> {
    return this.request(`/api/trips/${id}`, { method: 'DELETE' });
  }

  public async getTripVersions(id: string): Promise<{ versions: TripVersion[] }> {
    return this.request(`/api/trips/${id}/versions`);
  }

  public async restoreTripVersion(tripId: string, versionId: string): Promise<{ trip: Trip; message: string }> {
    return this.request(`/api/trips/${tripId}/restore-version/${versionId}`, { method: 'POST' });
  }

  // Public Trip
  public async getPublicTrip(token: string): Promise<PublicTripPayload> {
    return this.request(`/api/public/trip/${token}`);
  }

  public async sendPublicInquiry(token: string, payload: any): Promise<{ success: boolean; message: string }> {
    return this.request(`/api/public/trip/${token}/inquiry`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async submitPublicReview(token: string, payload: any): Promise<{ success: boolean; review: TripReview; message: string }> {
    return this.request(`/api/public/trip/${token}/review`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // AI Service
  public async checkAiReadiness(payload: any): Promise<{ isReady: boolean; missingFields: string[]; quota: any }> {
    return this.request('/api/ai/readiness-check', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async generateAiTrip(payload: any): Promise<{ success: boolean; tripSummary: string; days: any[]; transportation: any[]; isFallback?: boolean; quotaRemaining: number; message: string }> {
    return this.request('/api/ai/generate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async regenerateAiDay(payload: any): Promise<{ success: boolean; day: any; isFallback?: boolean }> {
    return this.request('/api/ai/regenerate-day', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Subscriptions & Payments
  public async getPlans(): Promise<{ plans: SubscriptionPlan[] }> {
    return this.request('/api/subscriptions/plans');
  }

  public async getMySubscription(): Promise<{ subscription: UserSubscription; plan: SubscriptionPlan; aiUsage: AiUsageData }> {
    return this.request('/api/subscriptions/my-subscription');
  }

  public async validatePromoCode(code: string, planId: string): Promise<any> {
    return this.request('/api/subscriptions/validate-promo', {
      method: 'POST',
      body: JSON.stringify({ code, planId }),
    });
  }

  public async submitPaymentRequest(payload: any): Promise<{ success: boolean; paymentRequest: PaymentRequest; message: string }> {
    return this.request('/api/subscriptions/pay-request', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async getMyPayments(): Promise<{ payments: PaymentRequest[] }> {
    return this.request('/api/subscriptions/payments');
  }

  // Analytics & Inquiries
  public async getAnalyticsSummary(): Promise<any> {
    return this.request('/api/summary');
  }

  public async getInquiries(): Promise<{ inquiries: CustomerInquiry[] }> {
    return this.request('/api/inquiries');
  }

  public async updateInquiryStatus(id: string, status: string): Promise<{ inquiry: CustomerInquiry }> {
    return this.request(`/api/inquiries/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  public async getReviews(): Promise<{ reviews: TripReview[] }> {
    return this.request('/api/reviews');
  }

  public async getNotifications(): Promise<{ notifications: NotificationItem[]; unreadCount: number }> {
    return this.request('/api/notifications');
  }

  public async markNotificationRead(id: string): Promise<void> {
    await this.request(`/api/notifications/${id}/read`, { method: 'POST' });
  }

  public async markAllNotificationsRead(): Promise<void> {
    await this.request('/api/notifications/read-all', { method: 'POST' });
  }

  // Admin
  public async getAdminOverview(): Promise<any> {
    return this.request('/api/admin/overview');
  }

  public async getAdminUsers(params?: any): Promise<{ users: any[] }> {
    const query = new URLSearchParams(params || {}).toString();
    return this.request(`/api/admin/users?${query}`);
  }

  public async verifyAdminGuide(id: string, note?: string): Promise<{ user: User }> {
    return this.request(`/api/admin/users/${id}/verify`, {
      method: 'POST',
      body: JSON.stringify({ note }),
    });
  }

  public async rejectAdminGuide(id: string, reason: string): Promise<{ user: User }> {
    return this.request(`/api/admin/users/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  public async grantAdminPlan(id: string, planId: string, durationDays: number): Promise<any> {
    return this.request(`/api/admin/users/${id}/grant-plan`, {
      method: 'POST',
      body: JSON.stringify({ planId, durationDays }),
    });
  }

  public async getAdminPayments(status?: string): Promise<{ payments: PaymentRequest[] }> {
    const query = status ? `?status=${status}` : '';
    return this.request(`/api/admin/payments${query}`);
  }

  public async approveAdminPayment(id: string, adminNote?: string): Promise<any> {
    return this.request(`/api/admin/payments/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ adminNote }),
    });
  }

  public async rejectAdminPayment(id: string, adminNote: string): Promise<any> {
    return this.request(`/api/admin/payments/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ adminNote }),
    });
  }

  public async getAdminPromos(): Promise<{ promoCodes: PromoCode[] }> {
    return this.request('/api/admin/promos');
  }

  public async createAdminPromo(payload: any): Promise<{ promo: PromoCode }> {
    return this.request('/api/admin/promos', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async updateAdminPromo(id: string, payload: any): Promise<{ promo: PromoCode }> {
    return this.request(`/api/admin/promos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  public async deleteAdminPromo(id: string): Promise<void> {
    await this.request(`/api/admin/promos/${id}`, { method: 'DELETE' });
  }

  public async getAdminAiSettings(): Promise<{ aiSettings: AdminAiSettings }> {
    return this.request('/api/admin/ai-settings');
  }

  public async updateAdminAiSettings(payload: Partial<AdminAiSettings>): Promise<{ aiSettings: AdminAiSettings }> {
    return this.request('/api/admin/ai-settings', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  public async getAdminCampaigns(): Promise<{ campaigns: Campaign[] }> {
    return this.request('/api/admin/campaigns');
  }

  public async createAdminCampaign(payload: any): Promise<{ campaign: Campaign }> {
    return this.request('/api/admin/campaigns', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async getAdminAuditLogs(): Promise<{ auditLogs: AuditLogItem[] }> {
    return this.request('/api/admin/audit-logs');
  }

  public async getAdminTrips(params?: any): Promise<{ trips: any[] }> {
    const query = new URLSearchParams(params || {}).toString();
    return this.request(`/api/admin/trips?${query}`);
  }

  public async toggleArchiveAdminTrip(id: string): Promise<{ trip: any; message: string }> {
    return this.request(`/api/admin/trips/${id}/toggle-archive`, { method: 'POST' });
  }

  public async getAdminPlans(): Promise<{ plans: any[] }> {
    return this.request('/api/admin/plans');
  }

  public async getAdminAiUsage(): Promise<{ totalGenerations: number; usersWithUsage: number; settings: any; recentGenerations: any[] }> {
    return this.request('/api/admin/ai-usage');
  }

  public async updateAdminUser(id: string, payload: any): Promise<{ user: User; message: string }> {
    return this.request(`/api/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  // Compliance Center & Regulatory Readiness
  public async getComplianceOverview(): Promise<{
    report: any;
    recentComplaints: any[];
    recentUpdates: any[];
    siteNoticesCount: number;
    retentionSettings: any;
  }> {
    return this.request('/api/admin/compliance/overview');
  }

  public async getComplianceRequirements(params?: { category?: string; status?: string }): Promise<{ requirements: any[] }> {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.status) query.append('status', params.status);
    return this.request(`/api/admin/compliance/requirements?${query.toString()}`);
  }

  public async updateComplianceRequirement(id: string, payload: any): Promise<{ requirement: any; message: string }> {
    return this.request(`/api/admin/compliance/requirements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  public async getRegulatoryUpdates(): Promise<{ updates: any[] }> {
    return this.request('/api/admin/compliance/regulatory-updates');
  }

  public async createRegulatoryUpdate(payload: any): Promise<{ update: any; message: string }> {
    return this.request('/api/admin/compliance/regulatory-updates', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async updateRegulatoryUpdate(id: string, payload: any): Promise<{ update: any; message: string }> {
    return this.request(`/api/admin/compliance/regulatory-updates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  public async deleteRegulatoryUpdate(id: string): Promise<{ message: string }> {
    return this.request(`/api/admin/compliance/regulatory-updates/${id}`, {
      method: 'DELETE',
    });
  }

  public async getAdminComplaints(params?: { status?: string; type?: string }): Promise<{ complaints: any[] }> {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.type) query.append('type', params.type);
    return this.request(`/api/admin/compliance/complaints?${query.toString()}`);
  }

  public async updateAdminComplaint(id: string, payload: any): Promise<{ complaint: any; message: string }> {
    return this.request(`/api/admin/compliance/complaints/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  public async verifyGuideLicense(id: string, payload: any): Promise<{ user: User; message: string }> {
    return this.request(`/api/admin/compliance/users/${id}/verify-license`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async getSiteRegulatoryNotices(): Promise<{ siteNotices: any[] }> {
    return this.request('/api/admin/compliance/site-notices');
  }

  public async updateSiteRegulatoryNotice(key: string, payload: any): Promise<{ notice: any; message: string }> {
    return this.request(`/api/admin/compliance/site-notices/${key}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  public async purgeRetentionDocs(): Promise<{ purgedCount: number; lastPurgeRunAt: string; message: string }> {
    return this.request('/api/admin/compliance/purge-retention-docs', {
      method: 'POST',
    });
  }

  public async submitPublicComplaint(token: string, payload: any): Promise<{ success: boolean; complaintId: string; message: string }> {
    return this.request(`/api/public/trip/${token}/complaint`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Homepage Stats & Configuration
  public async getPublicStats(): Promise<PublicStatsResponse> {
    return this.request<PublicStatsResponse>('/api/public/stats');
  }

  public async getAdminHomepageStats(): Promise<{ stats: HomepageCustomStats; realCounts: { totalUsers: number; totalTrips: number; publishedTrips: number; verifiedGuides: number } }> {
    return this.request('/api/admin/homepage-stats');
  }

  public async updateAdminHomepageStats(stats: Partial<HomepageCustomStats>): Promise<{ stats: HomepageCustomStats; realCounts: any; message: string }> {
    return this.request('/api/admin/homepage-stats', {
      method: 'PUT',
      body: JSON.stringify(stats),
    });
  }

  public async clearAllMockData(): Promise<{ success: boolean; removedUsers: number; removedTrips: number; message: string }> {
    return this.request('/api/admin/clear-mock-data', {
      method: 'POST',
    });
  }
}

export const api = new ApiService();

