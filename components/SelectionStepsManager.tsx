'use client';

import { useState } from 'react';
import { Plus, Trash2, Calendar, CheckCircle2, Circle, XCircle } from 'lucide-react';
import type { SelectionStep } from '@/types';
import { format } from 'date-fns';

interface SelectionStepsManagerProps {
  steps: SelectionStep[];
  onChange: (steps: SelectionStep[]) => void;
}

export default function SelectionStepsManager({ steps, onChange }: SelectionStepsManagerProps) {
  const [newStepName, setNewStepName] = useState('');

  const handleAddStep = () => {
    if (!newStepName.trim()) return;

    const newStep: SelectionStep = {
      id: Date.now().toString(),
      name: newStepName,
      status: 'pending',
      order: steps.length,
    };

    onChange([...steps, newStep]);
    setNewStepName('');
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
      </div>

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
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="ステップ名"
                    />
                    <select
                      value={step.status}
                      onChange={(e) => handleStatusChange(step.id, e.target.value as SelectionStep['status'])}
                      className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      <label className="block text-xs text-gray-600 mb-1">締切日</label>
                      <input
                        type="date"
                        value={step.deadline ? format(step.deadline, 'yyyy-MM-dd') : ''}
                        onChange={(e) =>
                          handleUpdateStep(step.id, {
                            deadline: e.target.value ? new Date(e.target.value) : undefined,
                          })
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-600 mb-1">実施予定日</label>
                      <input
                        type="date"
                        value={step.scheduledDate ? format(step.scheduledDate, 'yyyy-MM-dd') : ''}
                        onChange={(e) =>
                          handleUpdateStep(step.id, {
                            scheduledDate: e.target.value ? new Date(e.target.value) : undefined,
                          })
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-600 mb-1">完了日</label>
                      <input
                        type="date"
                        value={step.completedDate ? format(step.completedDate, 'yyyy-MM-dd') : ''}
                        onChange={(e) =>
                          handleUpdateStep(step.id, {
                            completedDate: e.target.value ? new Date(e.target.value) : undefined,
                          })
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {step.notes !== undefined && (
                    <div className="mt-2">
                      <textarea
                        value={step.notes}
                        onChange={(e) => handleUpdateStep(step.id, { notes: e.target.value })}
                        placeholder="メモ（面接の感想、質問内容など）"
                        rows={2}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 新しいステップを追加 */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newStepName}
          onChange={(e) => setNewStepName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddStep()}
          placeholder="新しいステップを追加（例: 書類選考、一次面接）"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleAddStep}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>追加</span>
        </button>
      </div>
    </div>
  );
}
