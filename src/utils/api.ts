import { Country, User, Halaqah, HalaqahSession } from '../types';
import { INITIAL_COUNTRIES, INITIAL_USERS, INITIAL_HALAQAT, INITIAL_SESSIONS } from '../data/mockData';

// API Base URL
const API_BASE = '/api/v1';

// Helper for fetch with fallback to initial/localStorage
export const api = {
  // Countries
  async getCountries(): Promise<Country[]> {
    try {
      const res = await fetch(`${API_BASE}/countries`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch (e) {
      console.warn('API fetch failed, falling back to local data', e);
    }
    const local = localStorage.getItem('itqan_countries_v2');
    return local ? JSON.parse(local) : INITIAL_COUNTRIES;
  },

  async createCountry(country: Partial<Country>): Promise<Country> {
    try {
      const res = await fetch(`${API_BASE}/countries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(country),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.error('API createCountry error:', e);
    }
    // Fallback
    const id = `cnt-${Date.now()}`;
    const newCountry: Country = {
      id,
      nameAr: country.nameAr || '',
      nameEn: country.nameEn || '',
      code: country.code || `C${Date.now().toString().slice(-4)}`,
      dialects: country.dialects || []
    };
    return newCountry;
  },

  async deleteCountry(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/countries/${id}`, { method: 'DELETE' });
      if (res.ok) return true;
    } catch (e) {
      console.error('API deleteCountry error:', e);
    }
    return true;
  },

  // Users
  async getUsers(): Promise<User[]> {
    try {
      const res = await fetch(`${API_BASE}/users`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch (e) {
      console.warn('API fetch users failed, falling back to local', e);
    }
    const local = localStorage.getItem('itqan_users_v2');
    return local ? JSON.parse(local) : INITIAL_USERS;
  },

  async createUser(user: Partial<User> & { password?: string }): Promise<User> {
    try {
      const res = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.error('API createUser error:', e);
    }
    const id = `usr-${Date.now()}`;
    const newUser: User = {
      id,
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'STUDENT',
      countryId: user.countryId || 'cnt-sa',
      dialectId: user.dialectId || 'dia-hejaz',
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
      currentJuz: user.currentJuz || 1,
      totalMemorizedAyahs: user.totalMemorizedAyahs || 0
    };
    return newUser;
  },

  // Halaqat
  async getHalaqat(): Promise<Halaqah[]> {
    try {
      const res = await fetch(`${API_BASE}/halaqat`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch (e) {
      console.warn('API fetch halaqat failed', e);
    }
    const local = localStorage.getItem('itqan_halaqat_v2');
    return local ? JSON.parse(local) : INITIAL_HALAQAT;
  },

  async createHalaqah(hlq: Partial<Halaqah>): Promise<Halaqah> {
    try {
      const res = await fetch(`${API_BASE}/halaqat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hlq),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.error('API createHalaqah error:', e);
    }
    const id = `hlq-${Date.now()}`;
    const newHlq: Halaqah = {
      id,
      name: hlq.name || '',
      code: hlq.code || `HLQ-${Date.now().toString().slice(-4)}`,
      teacherId: hlq.teacherId || '',
      supervisorId: hlq.supervisorId || '',
      scheduleDays: hlq.scheduleDays || ['الأحد', 'الثلاثاء', 'الخميس'],
      timeSlot: hlq.timeSlot || 'بعد العصر',
      targetJuz: hlq.targetJuz || 3,
      level: hlq.level || 'متوسط',
      maxStudents: hlq.maxStudents || 15,
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0]
    };
    return newHlq;
  },

  // Sessions
  async getSessions(): Promise<HalaqahSession[]> {
    try {
      const res = await fetch(`${API_BASE}/sessions`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch (e) {
      console.warn('API fetch sessions failed', e);
    }
    const local = localStorage.getItem('itqan_sessions_v2');
    return local ? JSON.parse(local) : INITIAL_SESSIONS;
  },

  async saveSession(session: HalaqahSession): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(session),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.error('API saveSession error:', e);
    }
    return { status: 'success', session_id: session.id };
  },

  // Auth Login (Phone or Email + Password)
  async login(identifier: string, password?: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) return data;
      }
    } catch (e) {
      console.warn('Backend login fallback to local check', e);
    }
    // Fallback: match by phone or email in local storage
    const users = await api.getUsers();
    const cleanId = identifier.trim().toLowerCase();
    const cleanPhone = identifier.replace(/[^0-9+]/g, '');
    const found = users.find(u => 
      u.email.toLowerCase() === cleanId || 
      u.phone === identifier ||
      (cleanPhone.length >= 7 && u.phone.includes(cleanPhone))
    );
    if (found) {
      return { success: true, user: found };
    }
    return { success: false, error: 'رقم الهاتف أو البريد الإلكتروني غير مسجل في النظام' };
  }
};
