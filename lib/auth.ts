// Firebase Authentication関連の関数
// Googleログイン・ログアウト機能を提供

import { auth } from './firebase';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';

/**
 * Googleアカウントでログインする
 * ポップアップウィンドウが開き、Googleアカウントを選択できます
 */
export const signInWithGoogle = async () => {
  if (!auth) {
    throw new Error('Firebase認証が初期化されていません。環境変数を確認してください。');
  }

  try {
    const provider = new GoogleAuthProvider();
    // 日本語で表示
    provider.setCustomParameters({
      prompt: 'select_account', // 毎回アカウント選択画面を表示
    });

    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error: any) {
    console.error('ログインエラー:', error);
    throw new Error(`ログインに失敗しました: ${error.message}`);
  }
};

/**
 * ログアウトする
 */
export const logout = async () => {
  if (!auth) {
    throw new Error('Firebase認証が初期化されていません。');
  }

  try {
    await signOut(auth);
  } catch (error: any) {
    console.error('ログアウトエラー:', error);
    throw new Error(`ログアウトに失敗しました: ${error.message}`);
  }
};

/**
 * 認証状態の変化を監視する
 * ログイン・ログアウト時に自動でコールバック関数が呼ばれます
 *
 * @param callback - ユーザー情報が変わった時に呼ばれる関数
 * @returns 監視を解除する関数（コンポーネントのクリーンアップ時に使用）
 */
export const onAuthChange = (callback: (user: User | null) => void) => {
  if (!auth) {
    // Firebaseが未初期化の場合は、常にnullを返す（ログインしていない状態）
    callback(null);
    return () => {}; // 空の解除関数を返す
  }

  return onAuthStateChanged(auth, callback);
};
