'use client';

import { useState } from 'react';
import { Plus, Trash2, Edit2, TrendingUp, TrendingDown } from 'lucide-react';
import type { StrengthAndWeakness } from '@/types';

interface StrengthsManagerProps {
  strengths: StrengthAndWeakness[];
  weaknesses: StrengthAndWeakness[];
  onStrengthsChange: (strengths: StrengthAndWeakness[]) => void;
  onWeaknessesChange: (weaknesses: StrengthAndWeakness[]) => void;
}

export default function StrengthsManager({
  strengths,
  weaknesses,
  onStrengthsChange,
  onWeaknessesChange,
}: StrengthsManagerProps) {
  const [activeType, setActiveType] = useState<'strength' | 'weakness'>('strength');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    evidence: '',
    tags: '',
  });

  const currentList = activeType === 'strength' ? strengths : weaknesses;
  const setCurrentList =
    activeType === 'strength' ? onStrengthsChange : onWeaknessesChange;

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      evidence: '',
      tags: '',
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  const handleEdit = (item: StrengthAndWeakness) => {
    setFormData({
      name: item.name,
      description: item.description,
      evidence: item.evidence,
      tags: item.tags.join(', '),
    });
    setEditingId(item.id);
    setShowAddForm(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) return;

    const tagsArray = formData.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    if (editingId) {
      // 編集
      setCurrentList(
        currentList.map((item) =>
          item.id === editingId
            ? {
                ...item,
                ...formData,
                tags: tagsArray,
                updatedAt: new Date(),
              }
            : item
        )
      );
    } else {
      // 新規追加
      const newItem: StrengthAndWeakness = {
        id: Date.now().toString(),
        type: activeType,
        ...formData,
        tags: tagsArray,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setCurrentList([...currentList, newItem]);
    }

    resetForm();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('削除してもよろしいですか？')) {
      setCurrentList(currentList.filter((item) => item.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">強み・弱み</h2>
        <p className="text-sm text-gray-600 mt-1">
          具体的な事実や根拠とセットで管理しましょう
        </p>
      </div>

      {/* タブ切り替え */}
      <div className="flex gap-2">
        <button
          onClick={() => {
            setActiveType('strength');
            resetForm();
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            activeType === 'strength'
              ? 'bg-green-600 text-white'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          強み ({strengths.length})
        </button>
        <button
          onClick={() => {
            setActiveType('weakness');
            resetForm();
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            activeType === 'weakness'
              ? 'bg-orange-600 text-white'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <TrendingDown className="w-4 h-4" />
          弱み ({weaknesses.length})
        </button>
      </div>

      {/* 追加ボタン */}
      <button
        onClick={() => setShowAddForm(!showAddForm)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-colors ${
          activeType === 'strength'
            ? 'bg-green-600 hover:bg-green-700'
            : 'bg-orange-600 hover:bg-orange-700'
        }`}
      >
        <Plus className="w-4 h-4" />
        {activeType === 'strength' ? '強みを追加' : '弱みを追加'}
      </button>

      {/* 追加・編集フォーム */}
      {showAddForm && (
        <div
          className={`p-6 border-2 rounded-lg ${
            activeType === 'strength'
              ? 'border-green-200 bg-green-50'
              : 'border-orange-200 bg-orange-50'
          }`}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingId
              ? activeType === 'strength'
                ? '強みを編集'
                : '弱みを編集'
              : activeType === 'strength'
              ? '新しい強み'
              : '新しい弱み'}
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                名前 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="例: 論理的思考力、忍耐力、計画性など"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">説明</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="どういう特性か、どんな場面で発揮されるか"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                裏付けとなる具体的な事実・エピソード
              </label>
              <textarea
                value={formData.evidence}
                onChange={(e) => setFormData({ ...formData, evidence: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="この特性を裏付ける具体的なエピソードや実績"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                タグ（カンマ区切り）
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="例: ビジネススキル, コミュニケーション"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={!formData.name.trim()}
                className={`px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  activeType === 'strength'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-orange-600 hover:bg-orange-700'
                }`}
              >
                {editingId ? '更新' : '保存'}
              </button>
              <button
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      {/* リスト */}
      {currentList.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
          {activeType === 'strength' ? (
            <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          ) : (
            <TrendingDown className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          )}
          <p className="text-gray-600">
            {activeType === 'strength' ? '強みがまだありません' : '弱みがまだありません'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {currentList.map((item) => (
            <div
              key={item.id}
              className={`p-4 border-2 rounded-lg ${
                activeType === 'strength'
                  ? 'border-green-200 bg-green-50'
                  : 'border-orange-200 bg-orange-50'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900 text-lg">{item.name}</h3>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {item.description && (
                <p className="text-sm text-gray-700 mb-2">{item.description}</p>
              )}

              {item.evidence && (
                <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                  <p className="text-xs font-semibold text-gray-900 mb-1">根拠・エピソード</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{item.evidence}</p>
                </div>
              )}

              {item.tags.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap mt-3">
                  {item.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-white text-gray-600 rounded text-xs border border-gray-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
