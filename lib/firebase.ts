// Firebase設定ファイル
// Firebaseコンソールで取得した設定情報を.env.localに設定してください

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Firebaseアプリの初期化（複数回初期化されないようにチェック）
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// FirestoreとAuthのインスタンスをエクスポート
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
