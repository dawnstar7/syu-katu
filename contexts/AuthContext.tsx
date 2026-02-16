'use client';

// 認証状態をアプリ全体で共有するためのContext
// どのコンポーネントからでも「今ログインしているか」を確認できます

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { onAuthChange } from '@/lib/auth';

// Context の型定義
interface AuthContextType {
  user: User | null; // ログイン中のユーザー情報（ログインしていなければnull）
  loading: boolean; // 認証状態を確認中かどうか
}

// Contextの作成（初期値はundefined）
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider: 認証状態を管理し、子コンポーネントに提供する
 * アプリ全体をこのProviderで囲むことで、どこからでも認証状態にアクセスできる
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Firebaseの認証状態を監視
    // ログイン・ログアウトが発生すると自動的にuserが更新される
    const unsubscribe = onAuthChange((user) => {
      setUser(user);
      setLoading(false);
    });

    // コンポーネントがアンマウントされたら監視を解除（メモリリーク防止）
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * useAuth: 認証状態を取得するカスタムフック
 * コンポーネント内で `const { user, loading } = useAuth()` のように使う
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
