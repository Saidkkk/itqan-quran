import { INITIAL_COUNTRIES, INITIAL_ENROLLMENTS, INITIAL_HALAQAT, INITIAL_SESSIONS, INITIAL_USERS } from '../data/mockData';
import { Country, Halaqah, HalaqahSession, StudentEnrollment, User } from '../types';

const STORAGE_KEYS = {
  USERS: 'itqan_users_v2',
  COUNTRIES: 'itqan_countries_v2',
  HALAQAT: 'itqan_halaqat_v2',
  ENROLLMENTS: 'itqan_enrollments_v2',
  SESSIONS: 'itqan_sessions_v2',
  CURRENT_USER_ID: 'itqan_current_user_id_v2',
  ACTIVE_TAB: 'itqan_active_tab_v2',
};

export const getStoredUsers = (): User[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : INITIAL_USERS;
  } catch {
    return INITIAL_USERS;
  }
};

export const setStoredUsers = (users: User[]) => {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
};

export const getStoredCountries = (): Country[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.COUNTRIES);
    return data ? JSON.parse(data) : INITIAL_COUNTRIES;
  } catch {
    return INITIAL_COUNTRIES;
  }
};

export const setStoredCountries = (countries: Country[]) => {
  localStorage.setItem(STORAGE_KEYS.COUNTRIES, JSON.stringify(countries));
};

export const getStoredHalaqat = (): Halaqah[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.HALAQAT);
    return data ? JSON.parse(data) : INITIAL_HALAQAT;
  } catch {
    return INITIAL_HALAQAT;
  }
};

export const setStoredHalaqat = (halaqat: Halaqah[]) => {
  localStorage.setItem(STORAGE_KEYS.HALAQAT, JSON.stringify(halaqat));
};

export const getStoredEnrollments = (): StudentEnrollment[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ENROLLMENTS);
    return data ? JSON.parse(data) : INITIAL_ENROLLMENTS;
  } catch {
    return INITIAL_ENROLLMENTS;
  }
};

export const setStoredEnrollments = (enrollments: StudentEnrollment[]) => {
  localStorage.setItem(STORAGE_KEYS.ENROLLMENTS, JSON.stringify(enrollments));
};

export const getStoredSessions = (): HalaqahSession[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    return data ? JSON.parse(data) : INITIAL_SESSIONS;
  } catch {
    return INITIAL_SESSIONS;
  }
};

export const setStoredSessions = (sessions: HalaqahSession[]) => {
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
};

export const resetAllData = () => {
  localStorage.removeItem(STORAGE_KEYS.USERS);
  localStorage.removeItem(STORAGE_KEYS.COUNTRIES);
  localStorage.removeItem(STORAGE_KEYS.HALAQAT);
  localStorage.removeItem(STORAGE_KEYS.ENROLLMENTS);
  localStorage.removeItem(STORAGE_KEYS.SESSIONS);
};
