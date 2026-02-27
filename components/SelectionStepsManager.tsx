'use client';

import { useState } from 'react';
import { Plus, X, Check, Calendar, Clock } from 'lucide-react';
import type { SelectionStep } from '@/types';

interface SelectionStepsManagerProps {
  steps: SelectionStep[];
  onChange: (steps: SelectionStep[]) => void;
}

const STEP_TYPES = [
  { label: 'ES締切',     color: 'red',    isDeadline: true  },
  { label: '書類提出',   color: 'red',    isDeadline: true  },
  { label: 'Webテスト',  color: 'orange', isDeadline: false },
  { label: '説明会',     color: 'blue',   isDeadline: false },
  { label: '一次面接',   color: 'purple', isDeadline: false },
  { label: '二次面接',   color: 'purple', isDeadline: false },
  { label: '最終面接',   color: 'purple', isDeadline: false },
  { label: 'OB・OG訪問', color: 'teal',   isDeadline: false },
  { label: 'その他',     color: 'gray',   isDeadline: false },
];

const COLOR_CLASSES: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  red:    { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200',    dot: 'bg-red-500'    },
  orange: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' },
  blue:   { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   dot: 'bg-blue-500'   },
  purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' },
  teal:   { bg: 'bg-teal-50',   text: 'text-teal-700',   border: 'border-teal-200',   dot: 'bg-teal-500'   },
  gray:   { bg: 'bg-gray-50',   text: 'text-gray-600',   border: 'border-gray-200',   dot: 'bg-gray-400'   },
};

function getStepColor(name: string): string {
  const type = STEP_TYPES.find(t => name.includes(t.label) || t.label.includes(name));
  if (type) return type.color;
  if (name.includes('面接')) return 'purple';
  if (name.includes('締切') || name.includes('提出')) return 'red';
  if (name.includes('説明会')) return 'blue';
  return 'gray';
}

function formatDate(date: Date | undefined | null): string {
  if (!date) return '';
  const d = new Date(date);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diff = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const dayNames = ['日','月','火','水','木','金','土'];
  const dateStr = `${d.getMonth() + 1}/${d.getDate()}(${dayNames[d.getDay()]})`;
  if (diff < 0) return dateStr;
  if (diff === 0) return `${dateStr} 今日`;
  if (diff <= 7) return `${dateStr} あと${diff}日`;
  return dateStr;
}

export default function SelectionStepsManager({ steps, onChange }: SelectionStepsManagerProps) {
  const [newType, setNewType] = useState(STEP_TYPES[0].label);
  const [newDate, setNewDate] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getStepDate = (step: SelectionStep): Date | undefined =>
    step.deadline || step.scheduledDate || undefined;

  const getStepDateString = (step: SelectionStep): string => {
    const date = getStepDate(step);
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
  };

  const handleAdd = () => {
    if (!newDate) return;
    const typeInfo = STEP_TYPES.find(t => t.label === newType) || STEP_TYPES[STEP_TYPES.length - 1];
    const date = new Date(newDate);
    const newStep: SelectionStep = {
      id: Date.now().toString(),
      name: newType,
      status: 'pending',
      order: steps.length,
      deadline: typeInfo.isDeadline ? date : undefined,
      scheduledDate: !typeInfo.isDeadline ? date : undefined,
    };
    onChange([...steps, newStep]);
    setNewDate('');
  };

  const handleToggleDone = (id: string) => {
    onChange(steps.map(s => s.id === id
      ? { ...s, status: s.status === 'completed' ? 'pending' : 'completed', completedDate: s.status !== 'completed' ? new Date() : undefined }
      : s
    ));
  };

  const handleDateChange = (id: string, dateStr: string) => {
    const step = steps.find(s => s.id === id);
    if (!step) return;
    const date = dateStr ? new Date(dateStr) : undefined;
    const typeInfo = STEP_TYPES.find(t => t.label === step.name);
    const isDeadline = typeInfo?.isDeadline ?? (step.name.includes('締切') || step.name.includes('提出'));
    onChange(steps.map(s => s.id === id
      ? { ...s, deadline: isDeadline ? date : undefined, scheduledDate: !isDeadline ? date : undefined }
      : s
    ));
  };

  const handleNoteChange = (id: string, note: string) => {
    onChange(steps.map(s => s.id === id ? { ...s, notes: note || undefined } : s));
  };

  const handleDelete = (id: string) => {
    onChange(steps.filter(s => s.id !== id));
  };

  const sortedSteps = [...steps].sort((a, b) => {
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (a.status !== 'completed' && b.status === 'completed') return -1;
    return (getStepDate(a)?.getTime() ?? 0) - (getStepDate(b)?.getTime() ?? 0);
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-semibold text-gray-800">スケジュール</span>
        {steps.length > 0 && (
          <span className="text-xs text-gray-400">
            {steps.filter(s => s.status === 'completed').length}/{steps.length} 完了
          </span>
        )}
      </div>

      {/* 追加フォーム */}
      <div className="flex gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <select
          value={newType}
          onChange={e => setNewType(e.target.value)}
          className="flex-shrink-0 px-2 py-1.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {STEP_TYPES.map(t => (
            <option key={t.label} value={t.label}>{t.label}</option>
          ))}
        </select>
        <input
          type="date"
          value={newDate}
          onChange={e => setNewDate(e.target.value)}
          className="flex-1 min-w-0 px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!newDate}
          className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          追加
        </button>
      </div>

      {/* 一覧 */}
      {sortedSteps.length > 0 && (
        <div className="space-y-1.5">
          {sortedSteps.map(step => {
            const color = getStepColor(step.name);
            const cls = COLOR_CLASSES[color] || COLOR_CLASSES.gray;
            const date = getStepDate(step);
            const isDone = step.status === 'completed';
            const isExpanded = expandedId === step.id;

            return (
              <div key={step.id} className={`rounded-lg border transition-all ${isDone ? 'border-gray-100 bg-gray-50' : `${cls.border} ${cls.bg}`}`}>
                <div className="flex items-center gap-2.5 px-3 py-2">
                  {/* 完了ボタン */}
                  <button
                    type="button"
                    onClick={() => handleToggleDone(step.id)}
                    className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isDone ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-green-400'
                    }`}
                  >
                    {isDone && <Check className="w-3 h-3 text-white" />}
                  </button>

                  <span className={`flex-shrink-0 w-2 h-2 rounded-full ${isDone ? 'bg-gray-300' : cls.dot}`} />

                  <span className={`text-sm font-medium flex-shrink-0 ${isDone ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                    {step.name}
                  </span>

                  <span className={`text-xs flex-1 min-w-0 ${isDone ? 'text-gray-400' : cls.text}`}>
                    {date ? formatDate(date) : '日付未設定'}
                  </span>

                  {/* メモ展開 */}
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : step.id)}
                    className={`flex-shrink-0 p-1 transition-colors ${isExpanded ? 'text-blue-500' : 'text-gray-300 hover:text-gray-500'}`}
                    title="日付・メモを編集"
                  >
                    <Clock className="w-3.5 h-3.5" />
                  </button>

                  {/* 削除 */}
                  <button
                    type="button"
                    onClick={() => handleDelete(step.id)}
                    className="flex-shrink-0 p-1 text-gray-300 hover:text-red-400 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 展開エリア */}
                {isExpanded && (
                  <div className="px-3 pb-3 pt-1 border-t border-gray-100 space-y-2">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">日付を変更</label>
                      <input
                        type="date"
                        value={getStepDateString(step)}
                        onChange={e => handleDateChange(step.id, e.target.value)}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">メモ</label>
                      <input
                        type="text"
                        value={step.notes || ''}
                        onChange={e => handleNoteChange(step.id, e.target.value)}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="場所・URL・持ち物など"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {steps.length === 0 && (
        <p className="text-xs text-gray-400 text-center py-3">
          ES締切や面接の予定を追加するとカレンダーに反映されます
        </p>
      )}
    </div>
  );
}
