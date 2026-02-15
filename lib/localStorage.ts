// ローカルストレージを使ったデータ管理
// 後でFirebaseに移行する際は、この部分を置き換えるだけでOK

import type { Company } from '@/types';

const STORAGE_KEY = 'job_hunt_companies';

// 日付のシリアライズとデシリアライズ
const serializeCompany = (company: Company): string => {
  return JSON.stringify(company, (key, value) => {
    if (value instanceof Date) {
      return { __type: 'Date', value: value.toISOString() };
    }
    return value;
  });
};

const deserializeCompany = (json: string): Company => {
  return JSON.parse(json, (key, value) => {
    if (value && typeof value === 'object' && value.__type === 'Date') {
      return new Date(value.value);
    }
    return value;
  });
};

export const saveCompanies = (companies: Company[]): void => {
  try {
    const serialized = companies.map(serializeCompany);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
  } catch (error) {
    console.error('Failed to save companies:', error);
  }
};

export const loadCompanies = (): Company[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const serialized = JSON.parse(stored) as string[];
    return serialized.map(deserializeCompany);
  } catch (error) {
    console.error('Failed to load companies:', error);
    return [];
  }
};

export const clearCompanies = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear companies:', error);
  }
};
