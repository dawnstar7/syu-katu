'use client';

import { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X, Tag, StickyNote } from 'lucide-react';
import type { FreeNote } from '@/types';

interface FreeNotesManagerProps {
  notes: FreeNote[];
  onChange: (notes: FreeNote[]) => void;
}

const COLOR_OPTIONS: { value: FreeNote['color']; label: string; bg: string; border: string }[] = [
  { value: 'white', label: '白', bg: 'bg-white', border: 'border-gray-200' },
  { value: 'yellow', label: '黄', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  { value: 'blue', label: '青', bg: 'bg-blue-50', border: 'border-blue-200' },
  { value: 'green', label: '緑', bg: 'bg-green-50', border: 'border-green-200' },
  { value: 'pink', label: 'ピンク', bg: 'bg-pink-50', border: 'border-pink-200' },
];

const getColorStyle = (color: FreeNote['color']) =>
  COLOR_OPTIONS.find(c => c.value === color) || COLOR_OPTIONS[0];

interface NoteFormProps {
  initial?: Partial<FreeNote>;
  onSave: (data: { title: string; content: string; tags: string[]; color: FreeNote['color'] }) => void;
  onCancel: () => void;
}

function NoteForm({ initial, onSave, onCancel }: NoteFormProps) {
  const [title, setTitle] = useState(initial?.title || '');
  const [content, setContent] = useState(initial?.content || '');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(initial?.tags || []);
  const [color, setColor] = useState<FreeNote['color']>(initial?.color || 'white');

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setTagInput('');
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  return (
    <div className="space-y-4">
      {/* タイトル */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">タイトル</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="メモのタイトル（例: 自分の大切にしていること、モヤモヤしていること）"
          autoFocus
        />
      </div>

      {/* 内容 */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">内容</label>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={8}
          className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-y"
          placeholder="自由に書いてください。
・自分のこと、思考パターン
・気づいたこと、感じたこと
・やりたいこと、嫌なこと
・就活に関係ないことでも何でもOK"
        />
        <p className="text-xs text-gray-500 mt-1">{content.length}文字</p>
      </div>

      {/* タグ */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">タグ（任意）</label>
        <div className="flex gap-2 mb-2 flex-wrap">
          {tags.map(tag => (
            <span key={tag} className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
              #{tag}
              <button type="button" onClick={() => handleRemoveTag(tag)}>
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            className="flex-1 px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="タグを入力してEnter（例: 価値観、モヤモヤ、気づき）"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm hover:bg-purple-200"
          >
            追加
          </button>
        </div>
      </div>

      {/* カード色 */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">カードの色</label>
        <div className="flex gap-2">
          {COLOR_OPTIONS.map(c => (
            <button
              key={c.value}
              type="button"
              onClick={() => setColor(c.value)}
              className={`w-8 h-8 rounded-full border-2 ${c.bg} ${
                color === c.value ? 'border-purple-600 scale-110' : c.border
              } transition-transform`}
              title={c.label}
            />
          ))}
        </div>
      </div>

      {/* ボタン */}
      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={() => onSave({ title: title || '無題', content, tags, color })}
          disabled={!content.trim()}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          <Check className="w-4 h-4" />
          保存
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
        >
          <X className="w-4 h-4" />
          キャンセル
        </button>
      </div>
    </div>
  );
}

export default function FreeNotesManager({ notes, onChange }: FreeNotesManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterTag, setFilterTag] = useState<string | null>(null);

  const allTags = Array.from(new Set(notes.flatMap(n => n.tags)));

  const filteredNotes = filterTag
    ? notes.filter(n => n.tags.includes(filterTag))
    : notes;

  const handleAdd = (data: { title: string; content: string; tags: string[]; color: FreeNote['color'] }) => {
    const newNote: FreeNote = {
      id: Date.now().toString(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    onChange([newNote, ...notes]);
    setIsAdding(false);
  };

  const handleEdit = (id: string, data: { title: string; content: string; tags: string[]; color: FreeNote['color'] }) => {
    onChange(notes.map(n =>
      n.id === id ? { ...n, ...data, updatedAt: new Date() } : n
    ));
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('このメモを削除してもよろしいですか？')) {
      onChange(notes.filter(n => n.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">自由メモ</h3>
        <p className="text-sm text-gray-600">
          分野に関係なく、思ったこと・気づいたこと・考えたことを何でも自由に書き留めてください。
        </p>
      </div>

      {/* 新規追加ボタン */}
      {!isAdding && (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-purple-300 rounded-lg text-purple-600 hover:bg-purple-50 transition-colors"
        >
          <Plus className="w-5 h-5" />
          新しいメモを追加
        </button>
      )}

      {/* 追加フォーム */}
      {isAdding && (
        <div className="p-4 border border-purple-200 rounded-lg bg-purple-50/30">
          <h4 className="text-sm font-medium text-purple-700 mb-4">新しいメモ</h4>
          <NoteForm
            onSave={handleAdd}
            onCancel={() => setIsAdding(false)}
          />
        </div>
      )}

      {/* タグフィルター */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Tag className="w-3 h-3" />
            絞り込み:
          </span>
          <button
            onClick={() => setFilterTag(null)}
            className={`px-2 py-1 text-xs rounded-full border transition-colors ${
              !filterTag
                ? 'bg-purple-600 text-white border-purple-600'
                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            すべて
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setFilterTag(filterTag === tag ? null : tag)}
              className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                filterTag === tag
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* メモ一覧 */}
      {filteredNotes.length === 0 && !isAdding && (
        <div className="text-center py-12">
          <StickyNote className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">まだメモがありません</p>
          <p className="text-sm text-gray-400">
            就活に関係ないことでも、頭の中を整理したいことがあれば<br />
            何でも書いてみましょう！
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredNotes.map(note => {
          const colorStyle = getColorStyle(note.color);
          return (
            <div key={note.id}>
              {editingId === note.id ? (
                <div className={`p-4 border rounded-lg ${colorStyle.bg} ${colorStyle.border}`}>
                  <NoteForm
                    initial={note}
                    onSave={(data) => handleEdit(note.id, data)}
                    onCancel={() => setEditingId(null)}
                  />
                </div>
              ) : (
                <div className={`p-4 border rounded-lg ${colorStyle.bg} ${colorStyle.border} group relative`}>
                  {/* 操作ボタン */}
                  <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setEditingId(note.id)}
                      className="p-1.5 rounded-lg bg-white/80 hover:bg-white text-gray-600 hover:text-gray-900 shadow-sm"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="p-1.5 rounded-lg bg-white/80 hover:bg-white text-red-500 hover:text-red-700 shadow-sm"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* タイトル */}
                  <h4 className="font-semibold text-gray-900 mb-2 pr-16">{note.title}</h4>

                  {/* 内容 */}
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed mb-3">
                    {note.content}
                  </p>

                  {/* タグ */}
                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {note.tags.map(tag => (
                        <span
                          key={tag}
                          onClick={() => setFilterTag(tag)}
                          className="px-2 py-0.5 bg-white/70 text-gray-600 text-xs rounded-full border border-gray-200 cursor-pointer hover:bg-purple-100 hover:text-purple-700"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* 日付 */}
                  <p className="text-xs text-gray-400">
                    {new Date(note.updatedAt).toLocaleDateString('ja-JP', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
