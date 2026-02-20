'use client';

import { useState } from 'react';
import { Plus, Trash2, FileText, Sparkles } from 'lucide-react';
import type { ESQuestion, SubmittedDocument, SelfAnalysisData, Company } from '@/types';
import ESGenerator from './ESGenerator';

interface ESManagerProps {
  esQuestions: ESQuestion[];
  onEsQuestionsChange: (questions: ESQuestion[]) => void;
  submittedDocuments: SubmittedDocument[];
  onSubmittedDocumentsChange: (documents: SubmittedDocument[]) => void;
  selfAnalysis?: SelfAnalysisData;
  company?: Partial<Company>;
}

export default function ESManager({
  esQuestions,
  onEsQuestionsChange,
  submittedDocuments,
  onSubmittedDocumentsChange,
  selfAnalysis,
  company,
}: ESManagerProps) {
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [newCharLimit, setNewCharLimit] = useState('');
  const [showGenerator, setShowGenerator] = useState(false);

  const [newDocName, setNewDocName] = useState('');
  const [newDocType, setNewDocType] = useState('');
  const [newDocNotes, setNewDocNotes] = useState('');

  const handleAddQuestion = () => {
    if (!newQuestion.trim() || !newAnswer.trim()) return;

    const question: ESQuestion = {
      id: Date.now().toString(),
      question: newQuestion,
      answer: newAnswer,
      characterLimit: newCharLimit ? parseInt(newCharLimit) : undefined,
      order: esQuestions.length,
    };

    onEsQuestionsChange([...esQuestions, question]);
    setNewQuestion('');
    setNewAnswer('');
    setNewCharLimit('');
  };

  const handleDeleteQuestion = (id: string) => {
    onEsQuestionsChange(esQuestions.filter((q) => q.id !== id));
  };

  const handleAddDocument = () => {
    if (!newDocName.trim()) return;

    const document: SubmittedDocument = {
      id: Date.now().toString(),
      name: newDocName,
      type: newDocType || 'ES',
      submittedDate: new Date(),
      notes: newDocNotes,
    };

    onSubmittedDocumentsChange([...submittedDocuments, document]);
    setNewDocName('');
    setNewDocType('');
    setNewDocNotes('');
  };

  const handleDeleteDocument = (id: string) => {
    onSubmittedDocumentsChange(submittedDocuments.filter((d) => d.id !== id));
  };

  const handleUseGenerated = (text: string) => {
    setNewAnswer(text);
    setShowGenerator(false);
    // 新規設問追加フォームまでスクロール
    document.getElementById('es-question-input')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      {/* ES設問と回答 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">ES設問と回答</h3>
          {selfAnalysis && (
            <button
              type="button"
              onClick={() => setShowGenerator(!showGenerator)}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                showGenerator
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'border-purple-400 text-purple-700 hover:bg-purple-50'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              AIでES生成
            </button>
          )}
        </div>

        {/* AIジェネレーター */}
        {showGenerator && selfAnalysis && company && (
          <div className="mb-6 p-4 border border-purple-200 rounded-lg bg-purple-50/30">
            <ESGenerator
              company={company}
              selfAnalysis={selfAnalysis}
              onUseGenerated={handleUseGenerated}
            />
          </div>
        )}

        {/* 既存の設問リスト */}
        {esQuestions.length > 0 && (
          <div className="space-y-4 mb-4">
            {esQuestions.map((q) => (
              <div key={q.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 mb-1">{q.question}</p>
                    {q.characterLimit && (
                      <p className="text-xs text-gray-500">文字数制限: {q.characterLimit}文字</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteQuestion(q.id)}
                    className="text-red-600 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{q.answer}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {q.answer.length}文字
                    {q.characterLimit && ` / ${q.characterLimit}文字`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 新規設問追加フォーム */}
        <div id="es-question-input" className="p-4 border border-blue-200 rounded-lg bg-blue-50">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                設問内容
              </label>
              <input
                type="text"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: 学生時代に最も力を入れたことを教えてください"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                回答内容
              </label>
              <textarea
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                rows={5}
                className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="回答を入力してください..."
              />
              <p className="text-xs text-gray-600 mt-1">{newAnswer.length}文字</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                文字数制限（任意）
              </label>
              <input
                type="number"
                value={newCharLimit}
                onChange={(e) => setNewCharLimit(e.target.value)}
                className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="400"
              />
            </div>

            <button
              type="button"
              onClick={handleAddQuestion}
              disabled={!newQuestion.trim() || !newAnswer.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              設問を追加
            </button>
          </div>
        </div>
      </div>

      {/* 提出書類管理 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">提出書類管理</h3>

        {/* 既存の書類リスト */}
        {submittedDocuments.length > 0 && (
          <div className="space-y-2 mb-4">
            {submittedDocuments.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">{doc.name}</p>
                    <p className="text-xs text-gray-500">
                      {doc.type}
                      {doc.submittedDate &&
                        ` · 提出日: ${new Date(doc.submittedDate).toLocaleDateString('ja-JP')}`}
                    </p>
                    {doc.notes && <p className="text-xs text-gray-600 mt-1">{doc.notes}</p>}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteDocument(doc.id)}
                  className="text-red-600 hover:text-red-700 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 新規書類追加フォーム */}
        <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                ファイル名
              </label>
              <input
                type="text"
                value={newDocName}
                onChange={(e) => setNewDocName(e.target.value)}
                className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ES_最終版.pdf"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                種類
              </label>
              <input
                type="text"
                value={newDocType}
                onChange={(e) => setNewDocType(e.target.value)}
                className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ES、履歴書、ポートフォリオ等"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-900 mb-1">
                メモ（任意）
              </label>
              <input
                type="text"
                value={newDocNotes}
                onChange={(e) => setNewDocNotes(e.target.value)}
                className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="修正履歴やバージョンなど"
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="button"
                onClick={handleAddDocument}
                disabled={!newDocName.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                書類を追加
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
