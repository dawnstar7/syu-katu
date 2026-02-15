'use client';

import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import type { AdministrativeInfo } from '@/types';

interface AdministrativeInfoFormProps {
  info: AdministrativeInfo;
  onChange: (info: AdministrativeInfo) => void;
}

export default function AdministrativeInfoForm({ info, onChange }: AdministrativeInfoFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">事務管理情報</h3>
        <p className="text-sm text-gray-600 mb-4">
          マイページへのアクセスや連絡先を一元管理
        </p>

        <div className="space-y-4">
          {/* マイページ情報 */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800 mb-3">
              ⚠️ パスワード情報はブラウザのローカルストレージに保存されます。重要な情報の管理には十分ご注意ください。
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  マイページURL
                </label>
                <input
                  type="url"
                  value={info.myPageUrl || ''}
                  onChange={(e) => onChange({ ...info, myPageUrl: e.target.value })}
                  className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/mypage"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  マイページID / ユーザー名
                </label>
                <input
                  type="text"
                  value={info.myPageId || ''}
                  onChange={(e) => onChange({ ...info, myPageId: e.target.value })}
                  className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="user@example.com"
                  autoComplete="off"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  マイページパスワード
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={info.myPagePassword || ''}
                    onChange={(e) => onChange({ ...info, myPagePassword: e.target.value })}
                    className="w-full px-3 py-2 pr-10 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 連絡先情報 */}
          <div>
            <h4 className="text-base font-semibold text-gray-900 mb-3">採用担当者連絡先</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  担当者名
                </label>
                <input
                  type="text"
                  value={info.contactName || ''}
                  onChange={(e) => onChange({ ...info, contactName: e.target.value })}
                  className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="山田太郎"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  メールアドレス
                </label>
                <input
                  type="email"
                  value={info.contactEmail || ''}
                  onChange={(e) => onChange({ ...info, contactEmail: e.target.value })}
                  className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="recruit@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  電話番号
                </label>
                <input
                  type="tel"
                  value={info.contactPhone || ''}
                  onChange={(e) => onChange({ ...info, contactPhone: e.target.value })}
                  className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="03-1234-5678"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
