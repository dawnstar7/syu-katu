import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Company, SelfAnalysisData } from '@/types';

/**
 * Firestoreのデータ操作ユーティリティ
 * ユーザーごとにデータを管理
 */

// CompanyをFirestore用に変換
const companyToFirestore = (company: Company) => {
  return {
    ...company,
    createdAt: Timestamp.fromDate(new Date(company.createdAt)),
    updatedAt: Timestamp.fromDate(new Date(company.updatedAt)),
    selectionSteps: company.selectionSteps.map(step => ({
      ...step,
      deadline: step.deadline ? Timestamp.fromDate(new Date(step.deadline)) : null,
      scheduledDate: step.scheduledDate ? Timestamp.fromDate(new Date(step.scheduledDate)) : null,
      completedDate: step.completedDate ? Timestamp.fromDate(new Date(step.completedDate)) : null,
    })),
    interviewLogs: (company.interviewLogs || []).map(log => ({
      ...log,
      date: log.date ? Timestamp.fromDate(new Date(log.date)) : null,
    })),
    companyAnalysis: {
      ...company.companyAnalysis,
      aiResearch: company.companyAnalysis?.aiResearch
        ? {
            ...company.companyAnalysis.aiResearch,
            researchedAt: Timestamp.fromDate(new Date(company.companyAnalysis.aiResearch.researchedAt)),
          }
        : undefined,
    },
  };
};

// FirestoreデータをCompanyに変換
const firestoreToCompany = (data: any): Company => {
  return {
    ...data,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
    selectionSteps: data.selectionSteps?.map((step: any) => ({
      ...step,
      deadline: step.deadline?.toDate() || null,
      scheduledDate: step.scheduledDate?.toDate() || null,
      completedDate: step.completedDate?.toDate() || null,
    })) || [],
    interviewLogs: data.interviewLogs?.map((log: any) => ({
      ...log,
      date: log.date?.toDate() || null,
    })) || [],
    companyAnalysis: {
      ...data.companyAnalysis,
      aiResearch: data.companyAnalysis?.aiResearch
        ? {
            ...data.companyAnalysis.aiResearch,
            researchedAt: data.companyAnalysis.aiResearch.researchedAt?.toDate() || new Date(),
          }
        : undefined,
    },
  };
};

/**
 * ユーザーの全企業データを取得
 */
export const getCompanies = async (userId: string): Promise<Company[]> => {
  if (!db) {
    console.error('Firestore is not initialized');
    return [];
  }

  try {
    const companiesRef = collection(db, 'users', userId, 'companies');
    const q = query(companiesRef, orderBy('updatedAt', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => firestoreToCompany({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching companies:', error);
    return [];
  }
};

/**
 * 特定の企業データを取得
 */
export const getCompany = async (userId: string, companyId: string): Promise<Company | null> => {
  if (!db) {
    console.error('Firestore is not initialized');
    return null;
  }

  try {
    const companyRef = doc(db, 'users', userId, 'companies', companyId);
    const snapshot = await getDoc(companyRef);

    if (snapshot.exists()) {
      return firestoreToCompany({ id: snapshot.id, ...snapshot.data() });
    }
    return null;
  } catch (error) {
    console.error('Error fetching company:', error);
    return null;
  }
};

/**
 * 企業データを保存（新規作成または更新）
 */
export const saveCompany = async (userId: string, company: Company): Promise<void> => {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  try {
    const companyRef = doc(db, 'users', userId, 'companies', company.id);
    const firestoreData = companyToFirestore(company);
    await setDoc(companyRef, firestoreData);
  } catch (error) {
    console.error('Error saving company:', error);
    throw error;
  }
};

/**
 * 複数の企業データを一括保存
 */
export const saveCompanies = async (userId: string, companies: Company[]): Promise<void> => {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  try {
    const savePromises = companies.map(company => saveCompany(userId, company));
    await Promise.all(savePromises);
  } catch (error) {
    console.error('Error saving companies:', error);
    throw error;
  }
};

// =========================================================
// 自己分析データ
// =========================================================

// Null/undefinedも安全に変換するヘルパー
const toTs = (d: Date | string | null | undefined) =>
  d ? Timestamp.fromDate(new Date(d)) : null;
const fromTs = (ts: any) => ts?.toDate() || null;

// SelfAnalysisDataをFirestore用に変換
const selfAnalysisToFirestore = (data: SelfAnalysisData) => ({
  episodes: (data.episodes || []).map(ep => ({
    ...ep,
    createdAt: toTs(ep.createdAt),
    updatedAt: toTs(ep.updatedAt),
  })),
  values: data.values ? {
    ...data.values,
    createdAt: toTs(data.values.createdAt),
    updatedAt: toTs(data.values.updatedAt),
  } : null,
  strengths: (data.strengths || []).map(s => ({
    ...s,
    createdAt: toTs(s.createdAt),
    updatedAt: toTs(s.updatedAt),
  })),
  weaknesses: (data.weaknesses || []).map(w => ({
    ...w,
    createdAt: toTs(w.createdAt),
    updatedAt: toTs(w.updatedAt),
  })),
  vision: data.vision ? {
    ...data.vision,
    createdAt: toTs(data.vision.createdAt),
    updatedAt: toTs(data.vision.updatedAt),
  } : null,
  freeNotes: (data.freeNotes || []).map(n => ({
    ...n,
    createdAt: toTs(n.createdAt),
    updatedAt: toTs(n.updatedAt),
  })),
});

// FirestoreデータをSelfAnalysisDataに変換
const firestoreToSelfAnalysis = (data: any): SelfAnalysisData => ({
  episodes: (data.episodes || []).map((ep: any) => ({
    ...ep,
    createdAt: fromTs(ep.createdAt) ?? new Date(),
    updatedAt: fromTs(ep.updatedAt) ?? new Date(),
  })),
  values: data.values ? {
    ...data.values,
    createdAt: fromTs(data.values.createdAt) ?? new Date(),
    updatedAt: fromTs(data.values.updatedAt) ?? new Date(),
  } : null,
  strengths: (data.strengths || []).map((s: any) => ({
    ...s,
    createdAt: fromTs(s.createdAt) ?? new Date(),
    updatedAt: fromTs(s.updatedAt) ?? new Date(),
  })),
  weaknesses: (data.weaknesses || []).map((w: any) => ({
    ...w,
    createdAt: fromTs(w.createdAt) ?? new Date(),
    updatedAt: fromTs(w.updatedAt) ?? new Date(),
  })),
  vision: data.vision ? {
    ...data.vision,
    createdAt: fromTs(data.vision.createdAt) ?? new Date(),
    updatedAt: fromTs(data.vision.updatedAt) ?? new Date(),
  } : null,
  freeNotes: (data.freeNotes || []).map((n: any) => ({
    ...n,
    createdAt: fromTs(n.createdAt) ?? new Date(),
    updatedAt: fromTs(n.updatedAt) ?? new Date(),
  })),
});

/**
 * 自己分析データを取得
 */
export const getSelfAnalysis = async (userId: string): Promise<SelfAnalysisData | null> => {
  if (!db) return null;
  try {
    const docRef = doc(db, 'users', userId, 'selfAnalysis', 'data');
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return firestoreToSelfAnalysis(snapshot.data());
    }
    return null;
  } catch (error) {
    console.error('Error fetching selfAnalysis:', error);
    return null;
  }
};

/**
 * 自己分析データを保存
 */
export const saveSelfAnalysis = async (userId: string, data: SelfAnalysisData): Promise<void> => {
  if (!db) throw new Error('Firestore is not initialized');
  try {
    const docRef = doc(db, 'users', userId, 'selfAnalysis', 'data');
    await setDoc(docRef, selfAnalysisToFirestore(data));
  } catch (error) {
    console.error('Error saving selfAnalysis:', error);
    throw error;
  }
};

/**
 * 企業データを削除
 */
export const deleteCompany = async (userId: string, companyId: string): Promise<void> => {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  try {
    const companyRef = doc(db, 'users', userId, 'companies', companyId);
    await deleteDoc(companyRef);
  } catch (error) {
    console.error('Error deleting company:', error);
    throw error;
  }
};
