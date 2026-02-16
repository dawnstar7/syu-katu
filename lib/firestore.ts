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
import type { Company } from '@/types';

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
