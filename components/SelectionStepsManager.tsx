'use client';

import { useState } from 'react';
import { Plus, Trash2, Calendar, CheckCircle2, Circle, XCircle } from 'lucide-react';
import type { SelectionStep } from '@/types';
import { format } from 'date-fns';

interface SelectionStepsManagerProps {
  steps: SelectionStep[];
  onChange: (steps: SelectionStep[]) => void;
}

// よくある選考ステップのプリセット
const PRESET_STEPS = [
  'ES提出',
  '書類選考',
  'Webテスト',
  '適性検査',
  '説明会',
  '一次面接',
  '二次面接',
  '三次面接',
  '最終面接',
  'グループディスカッション',
  'インターンシップ',
  'OB・OG訪問',
  'ケース面接',
  '技術面接',
  '役員面接',
];

export default function SelectionStepsManager({ steps, onChange }: SelectionStepsManagerProps) {
  const [newStepName, setNewStepName] = useState('');
  const [showPresets, setShowPresets] = useState(true);
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleAddStep = (stepName?: string) => {
    const name = stepName || newStepName;
    if (!name.trim()) return;

    const newStep: SelectionStep = {
      id: Date.now().toString(),
      name: name,
      status: 'pending',
      order: steps.length,
    };

    onChange([...steps, newStep]);
    setNewStepName('');
  };

  const handleAddPresetStep = (presetName: string) => {
    handleAddStep(presetName);
    setShowCustomInput(false);
  };

  const handleDeleteStep = (stepId: string) => {
    onChange(steps.filter((s) => s.id !== stepId));
  };

  const handleUpdateStep = (stepId: string, updates: Partial<SelectionStep>) => {
    onChange(
      steps.map((s) => (s.id === stepId ? { ...s, ...updates } : s))
    );
  };

  const handleStatusChange = (stepId: string, status: SelectionStep['status']) => {
    handleUpdateStep(stepId, {
      status,
      completedDate: status === 'completed' ? new Date() : undefined,
    });
  };

  const sortedSteps = [...steps].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">選考ステップ</h3>
        {steps.length === 0 && (
          <button
            type="button"
            onClick={() => setShowPresets(!showPresets)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            {showPresets ? 'プリセットを隠す' : 'プリセットを表示'}
          </button>
        )}
      </div>

      {/* プリセットボタン（ステップが0件の時のみ表示） */}
      {steps.length === 0 && showPresets && (
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-sm font-medium text-gray-900 mb-3">よく使われる選考ステップ</p>
          <div className="flex flex-wrap gap-2">
            {PRESET_STEPS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handleAddPresetStep(preset)}
                className="px-3 py-1.5 text-sm bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
              >
                + {preset}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 既存のステップ */}
      {sortedSteps.length > 0 && (
        <div className="space-y-3">
          {sortedSteps.map((step, index) => (
            <div
              key={step.id}
              className="bg-gray-50 rounded-lg p-4 border border-gray-200"
            >
              <div className="flex items-start gap-3">
                {/* ステータスアイコン */}
                <div className="flex-shrink-0 mt-1">
                  {step.status === 'completed' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : step.status === 'failed' ? (
                    <XCircle className="w-5 h-5 text-red-500" />
                  ) : step.status === 'scheduled' ? (
                    <Calendar className="w-5 h-5 text-blue-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={step.name}
                      onChange={(e) => handleUpdateStep(step.id, { name: e.target.value })}
                      className="flex-1 px-2 py-1 text-gray-900 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="ステップ名"
                    />
                    <select
                      value={step.status}
                      onChange={(e) => handleStatusChange(step.id, e.target.value as SelectionStep['status'])}
                      className="px-2 py-1 text-gray-900 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="pending">未実施</option>
                      <option value="scheduled">実施予定</option>
                      <option value="completed">完了</option>
                      <option value="failed">不合格</option>
                    </select>
                    <button
                      onClick={() => handleDeleteStep(step.id)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">締切日</label>
                      <input
                        type="datetime-local"
                        value={step.deadline ? format(step.deadline, "yyyy-MM-dd'T'HH:mm") : ''}
                        onChange={(e) =>
                          handleUpdateStep(step.id, {
                            deadline: e.target.value ? new Date(e.target.value) : undefined,
                          })
                        }
                        className="w-full px-2 py-1 text-gray-900 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">実施予定日</label>
                      <input
                        type="datetime-local"
                        value={step.scheduledDate ? format(step.scheduledDate, "yyyy-MM-dd'T'HH:mm") : ''}
                        onChange={(e) =>
                          handleUpdateStep(step.id, {
                            scheduledDate: e.target.value ? new Date(e.target.value) : undefined,
                          })
                        }
                        className="w-full px-2 py-1 text-gray-900 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">完了日</label>
                      <input
                        type="datetime-local"
                        value={step.completedDate ? format(step.completedDate, "yyyy-MM-dd'T'HH:mm") : ''}
                        onChange={(e) =>
                          handleUpdateStep(step.id, {
                            completedDate: e.target.value ? new Date(e.target.value) : undefined,
                          })
                        }
                        className="w-full px-2 py-1 text-gray-900 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-900 mb-1">メモ</label>
                    <textarea
                      value={step.notes || ''}
                      onChange={(e) => handleUpdateStep(step.id, { notes: e.target.value })}
                      placeholder="面接の感想、質問内容など"
                      rows={2}
                      className="w-full px-2 py-1 text-gray-900 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 新しいステップを追加 */}
      <div className="space-y-2">
        {/* プリセット選択 */}
        {steps.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              選考ステップを追加
            </label>
            <select
              onChange={(e) => {
                if (e.target.value === 'custom') {
                  setShowCustomInput(true);
                  setNewStepName('');
                } else if (e.target.value) {
                  handleAddPresetStep(e.target.value);
                  e.target.value = '';
                }
              }}
              className="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">選択してください</option>
              {PRESET_STEPS.map((preset) => (
                <option key={preset} value={preset}>
                  {preset}
                </option>
              ))}
              <option value="custom">その他（カスタム）</option>
            </select>
          </div>
        )}

        {/* カスタム入力（「その他」選択時のみ表示） */}
        {steps.length > 0 && showCustomInput && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              カスタムステップ名を入力
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newStepName}
                onChange={(e) => setNewStepName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddStep()}
                placeholder="例: 特別選考、面談"
                className="flex-1 px-3 py-2 text-gray-900 placeholder:text-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <button
                type="button"
                onClick={() => {
                  handleAddStep();
                  setShowCustomInput(false);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>追加</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCustomInput(false);
                  setNewStepName('');
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
