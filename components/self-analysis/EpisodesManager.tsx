'use client';

import { useState } from 'react';
import { Plus, Trash2, Edit2, ChevronDown, ChevronUp, Tag, Lightbulb } from 'lucide-react';
import type { SelfAnalysisEpisode } from '@/types';
import { EPISODE_CATEGORY_LABELS } from '@/types';

interface EpisodesManagerProps {
  episodes: SelfAnalysisEpisode[];
  onChange: (episodes: SelfAnalysisEpisode[]) => void;
}

export default function EpisodesManager({ episodes, onChange }: EpisodesManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'gakunika' as SelfAnalysisEpisode['category'],
    what: '',
    why: '',
    how: '',
    result: '',
    learning: '',
    tags: '',
  });

  const resetForm = () => {
    setFormData({
      title: '',
      category: 'gakunika',
      what: '',
      why: '',
      how: '',
      result: '',
      learning: '',
      tags: '',
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  const handleEdit = (episode: SelfAnalysisEpisode) => {
    setFormData({
      title: episode.title,
      category: episode.category,
      what: episode.what,
      why: episode.why,
      how: episode.how,
      result: episode.result,
      learning: episode.learning,
      tags: episode.tags.join(', '),
    });
    setEditingId(episode.id);
    setShowAddForm(true);
  };

  const handleSave = () => {
    if (!formData.title.trim() || !formData.what.trim()) return;

    const tagsArray = formData.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    if (editingId) {
      // 編集
      onChange(
        episodes.map((ep) =>
          ep.id === editingId
            ? {
                ...ep,
                ...formData,
                tags: tagsArray,
                updatedAt: new Date(),
              }
            : ep
        )
      );
    } else {
      // 新規追加
      const newEpisode: SelfAnalysisEpisode = {
        id: Date.now().toString(),
        ...formData,
        tags: tagsArray,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      onChange([...episodes, newEpisode]);
    }

    resetForm();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('このエピソードを削除してもよろしいですか？')) {
      onChange(episodes.filter((ep) => ep.id !== id));
    }
  };

  const getCategoryColor = (category: SelfAnalysisEpisode['category']) => {
    const colors = {
      gakunika: 'bg-blue-100 text-blue-700',
      success: 'bg-green-100 text-green-700',
      failure: 'bg-red-100 text-red-700',
      challenge: 'bg-orange-100 text-orange-700',
      other: 'bg-gray-100 text-gray-700',
    };
    return colors[category];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">エピソード集</h2>
          <p className="text-sm text-gray-600 mt-1">
            「何を、なぜ、どのように」の構造で、あなたの経験をストック
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          エピソードを追加
        </button>
      </div>

      {/* 新規追加・編集フォーム */}
      {showAddForm && (
        <div className="p-6 border-2 border-purple-200 rounded-lg bg-purple-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingId ? 'エピソードを編集' : '新しいエピソード'}
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  タイトル <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="例: サークルで新入生獲得プロジェクトをリード"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  カテゴリ
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value as SelfAnalysisEpisode['category'],
                    })
                  }
                  className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {Object.entries(EPISODE_CATEGORY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                何をしたか <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.what}
                onChange={(e) => setFormData({ ...formData, what: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="具体的に何をしたかを記述"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                なぜそれをしたか
              </label>
              <textarea
                value={formData.why}
                onChange={(e) => setFormData({ ...formData, why: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="動機や背景"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                どのように行ったか
              </label>
              <textarea
                value={formData.how}
                onChange={(e) => setFormData({ ...formData, how: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="工夫した点、アプローチ方法"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                結果どうなったか
              </label>
              <textarea
                value={formData.result}
                onChange={(e) => setFormData({ ...formData, result: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="成果や結果"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                学んだこと
              </label>
              <textarea
                value={formData.learning}
                onChange={(e) => setFormData({ ...formData, learning: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="この経験から得た気づきや学び"
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
                placeholder="例: リーダーシップ, チームワーク, 課題解決"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={!formData.title.trim() || !formData.what.trim()}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* エピソードリスト */}
      {episodes.length === 0 ? (
        <div className="text-center py-12">
          <Lightbulb className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">エピソードがまだありません</p>
          <p className="text-sm text-gray-500 mt-1">
            「エピソードを追加」ボタンから登録しましょう
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {episodes.map((episode) => (
            <div
              key={episode.id}
              className="border border-gray-200 rounded-lg bg-white overflow-hidden"
            >
              <button
                onClick={() => setExpandedId(expandedId === episode.id ? null : episode.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(
                        episode.category
                      )}`}
                    >
                      {EPISODE_CATEGORY_LABELS[episode.category]}
                    </span>
                    <h3 className="font-semibold text-gray-900">{episode.title}</h3>
                  </div>
                  {episode.tags.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap mt-2">
                      <Tag className="w-3 h-3 text-gray-400" />
                      {episode.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(episode);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(episode.id);
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {expandedId === episode.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              {expandedId === episode.id && (
                <div className="px-4 pb-4 space-y-3 border-t border-gray-100">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">何をしたか</p>
                    <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                      {episode.what}
                    </p>
                  </div>
                  {episode.why && (
                    <div>
                      <p className="text-sm font-semibold text-gray-900">なぜそれをしたか</p>
                      <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                        {episode.why}
                      </p>
                    </div>
                  )}
                  {episode.how && (
                    <div>
                      <p className="text-sm font-semibold text-gray-900">どのように行ったか</p>
                      <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                        {episode.how}
                      </p>
                    </div>
                  )}
                  {episode.result && (
                    <div>
                      <p className="text-sm font-semibold text-gray-900">結果</p>
                      <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                        {episode.result}
                      </p>
                    </div>
                  )}
                  {episode.learning && (
                    <div>
                      <p className="text-sm font-semibold text-gray-900">学んだこと</p>
                      <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                        {episode.learning}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
