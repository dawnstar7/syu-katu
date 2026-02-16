'use client';

// ログイン・ログアウトボタンのコンポーネント
// ログイン状態に応じて表示を切り替えます

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { signInWithGoogle, logout } from '@/lib/auth';
import { LogIn, LogOut, User } from 'lucide-react';

export default function AuthButton() {
  const { user, loading } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Googleログイン処理
  const handleLogin = async () => {
    setIsLoggingIn(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message);
      console.error('ログインエラー:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // ログアウト処理
  const handleLogout = async () => {
    try {
      await logout();
    } catch (err: any) {
      setError(err.message);
      console.error('ログアウトエラー:', err);
    }
  };

  // 認証状態確認中はローディング表示
  if (loading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 text-gray-500">
        <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        <span className="text-sm">読み込み中...</span>
      </div>
    );
  }

  // ログインしていない場合：Googleログインボタンを表示
  if (!user) {
    return (
      <div>
        <button
          onClick={handleLogin}
          disabled={isLoggingIn}
          className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LogIn className="w-5 h-5 text-gray-700" />
          <span className="text-gray-700 font-medium">
            {isLoggingIn ? 'ログイン中...' : 'Googleでログイン'}
          </span>
        </button>
        {error && (
          <p className="text-xs text-red-600 mt-1">{error}</p>
        )}
      </div>
    );
  }

  // ログイン済みの場合：ユーザー情報とログアウトボタンを表示
  return (
    <div className="flex items-center gap-3">
      {/* ユーザーアイコンと名前 */}
      <div className="flex items-center gap-2">
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || 'ユーザー'}
            className="w-8 h-8 rounded-full border border-gray-300"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
        )}
        <span className="text-sm font-medium text-gray-700 hidden sm:inline">
          {user.displayName || user.email}
        </span>
      </div>

      {/* ログアウトボタン */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <LogOut className="w-4 h-4" />
        <span className="hidden sm:inline">ログアウト</span>
      </button>

      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
