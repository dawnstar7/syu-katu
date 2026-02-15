'use client';

import { X } from 'lucide-react';
import type { CalendarEvent } from '@/types';
import { EVENT_TYPE_LABELS } from '@/types';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface EventDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: CalendarEvent | null;
  onEditCompany?: () => void;
}

export default function EventDetailModal({ isOpen, onClose, event, onEditCompany }: EventDetailModalProps) {
  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">予定の詳細</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* コンテンツ */}
        <div className="p-6 space-y-4">
          {/* イベントタイプ */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">種類</label>
            <span className="text-base font-semibold text-gray-900">
              {EVENT_TYPE_LABELS[event.type]}
            </span>
          </div>

          {/* 企業名 */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">企業名</label>
            <p className="text-base font-semibold text-gray-900">{event.companyName}</p>
          </div>

          {/* タイトル */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">内容</label>
            <p className="text-base text-gray-900">{event.title}</p>
          </div>

          {/* 日時 */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">日時</label>
            <p className="text-base text-gray-900">
              {format(new Date(event.date), 'yyyy年M月d日(E) HH:mm', { locale: ja })}
            </p>
          </div>

          {/* メモ */}
          {event.notes && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">メモ</label>
              <p className="text-base text-gray-700 whitespace-pre-wrap">{event.notes}</p>
            </div>
          )}
        </div>

        {/* ボタン */}
        <div className="flex gap-3 justify-end p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            閉じる
          </button>
          {onEditCompany && (
            <button
              onClick={() => {
                onEditCompany();
                onClose();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              企業情報を編集
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
