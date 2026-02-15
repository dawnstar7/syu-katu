'use client';

import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import type { InterviewLog, InterviewerInfo, InterviewQuestion } from '@/types';

interface InterviewLogManagerProps {
  interviewLogs: InterviewLog[];
  onInterviewLogsChange: (logs: InterviewLog[]) => void;
  webTestType: string;
  onWebTestTypeChange: (value: string) => void;
}

export default function InterviewLogManager({
  interviewLogs,
  onInterviewLogsChange,
  webTestType,
  onWebTestTypeChange,
}: InterviewLogManagerProps) {
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // 新規面接ログフォーム
  const [newRound, setNewRound] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [newReaction, setNewReaction] = useState('');
  const [tempQuestions, setTempQuestions] = useState<InterviewQuestion[]>([]);
  const [newReverseQuestions, setNewReverseQuestions] = useState('');
  const [newImpression, setNewImpression] = useState('');

  // 面接官情報
  const [newInterviewerName, setNewInterviewerName] = useState('');
  const [newInterviewerPosition, setNewInterviewerPosition] = useState('');
  const [newInterviewerDept, setNewInterviewerDept] = useState('');
  const [newInterviewerImpression, setNewInterviewerImpression] = useState('');
  const [tempInterviewers, setTempInterviewers] = useState<InterviewerInfo[]>([]);

  const handleAddQuestionToTemp = () => {
    if (!newQuestion.trim() || !newAnswer.trim()) return;

    const question: InterviewQuestion = {
      id: Date.now().toString(),
      question: newQuestion,
      answer: newAnswer,
      reaction: newReaction,
      order: tempQuestions.length,
    };

    setTempQuestions([...tempQuestions, question]);
    setNewQuestion('');
    setNewAnswer('');
    setNewReaction('');
  };

  const handleRemoveQuestionFromTemp = (id: string) => {
    setTempQuestions(tempQuestions.filter((q) => q.id !== id));
  };

  const handleAddInterviewerToTemp = () => {
    if (!newInterviewerName.trim() && !newInterviewerPosition.trim()) return;

    const interviewer: InterviewerInfo = {
      id: Date.now().toString(),
      name: newInterviewerName,
      position: newInterviewerPosition,
      department: newInterviewerDept,
      impression: newInterviewerImpression,
    };

    setTempInterviewers([...tempInterviewers, interviewer]);
    setNewInterviewerName('');
    setNewInterviewerPosition('');
    setNewInterviewerDept('');
    setNewInterviewerImpression('');
  };

  const handleRemoveInterviewerFromTemp = (id: string) => {
    setTempInterviewers(tempInterviewers.filter((i) => i.id !== id));
  };

  const handleSaveInterviewLog = () => {
    if (!newRound.trim()) return;

    const log: InterviewLog = {
      id: Date.now().toString(),
      round: newRound,
      date: newDate ? new Date(newDate) : undefined,
      interviewers: tempInterviewers,
      questions: tempQuestions,
      reverseQuestions: newReverseQuestions,
      impression: newImpression,
    };

    onInterviewLogsChange([...interviewLogs, log]);

    // リセット
    setNewRound('');
    setNewDate('');
    setTempQuestions([]);
    setTempInterviewers([]);
    setNewReverseQuestions('');
    setNewImpression('');
    setShowAddForm(false);
  };

  const handleDeleteLog = (id: string) => {
    onInterviewLogsChange(interviewLogs.filter((log) => log.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Webテスト種類 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Webテスト</h3>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            テストの種類
          </label>
          <input
            type="text"
            value={webTestType}
            onChange={(e) => onWebTestTypeChange(e.target.value)}
            className="w-full px-4 py-3 text-base text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="SPI、玉手箱、TG-WEB、GAB等"
          />
        </div>
      </div>

      {/* 面接ログ */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">面接ログ</h3>
          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            面接を追加
          </button>
        </div>

        {/* 既存の面接ログリスト */}
        {interviewLogs.length > 0 && (
          <div className="space-y-3 mb-4">
            {interviewLogs.map((log) => (
              <div key={log.id} className="border border-gray-200 rounded-lg bg-white">
                <button
                  type="button"
                  onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">{log.round}</p>
                      {log.date && (
                        <p className="text-sm text-gray-500">
                          {new Date(log.date).toLocaleDateString('ja-JP')}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteLog(log.id);
                      }}
                      className="text-red-600 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {expandedLog === log.id ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>

                {expandedLog === log.id && (
                  <div className="px-4 pb-4 space-y-4 border-t border-gray-100">
                    {/* 面接官情報 */}
                    {log.interviewers.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-gray-900 mb-2">面接官</p>
                        <div className="space-y-2">
                          {log.interviewers.map((interviewer) => (
                            <div
                              key={interviewer.id}
                              className="p-2 bg-gray-50 rounded text-sm"
                            >
                              <p className="font-medium text-gray-900">
                                {interviewer.name || '名前なし'}
                                {interviewer.position && ` - ${interviewer.position}`}
                                {interviewer.department && ` (${interviewer.department})`}
                              </p>
                              {interviewer.impression && (
                                <p className="text-gray-600 mt-1">{interviewer.impression}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 質問と回答 */}
                    {log.questions.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-gray-900 mb-2">質問と回答</p>
                        <div className="space-y-3">
                          {log.questions.map((q) => (
                            <div key={q.id} className="p-3 bg-blue-50 rounded-lg">
                              <p className="text-sm font-medium text-gray-900 mb-1">
                                Q: {q.question}
                              </p>
                              <p className="text-sm text-gray-700 mb-1">A: {q.answer}</p>
                              {q.reaction && (
                                <p className="text-xs text-gray-500">反応: {q.reaction}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 逆質問 */}
                    {log.reverseQuestions && (
                      <div>
                        <p className="text-sm font-semibold text-gray-900 mb-1">逆質問</p>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {log.reverseQuestions}
                        </p>
                      </div>
                    )}

                    {/* 全体の印象 */}
                    {log.impression && (
                      <div>
                        <p className="text-sm font-semibold text-gray-900 mb-1">全体の印象</p>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {log.impression}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 新規面接ログ追加フォーム */}
        {showAddForm && (
          <div className="p-4 border border-blue-200 rounded-lg bg-blue-50 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  面接回 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newRound}
                  onChange={(e) => setNewRound(e.target.value)}
                  className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="一次面接、二次面接等"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  面接日
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* 面接官追加 */}
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-2">面接官情報</p>
              {tempInterviewers.length > 0 && (
                <div className="space-y-2 mb-3">
                  {tempInterviewers.map((interviewer) => (
                    <div
                      key={interviewer.id}
                      className="flex items-start justify-between p-2 bg-white rounded"
                    >
                      <div className="text-sm">
                        <p className="font-medium">
                          {interviewer.name || '名前なし'}
                          {interviewer.position && ` - ${interviewer.position}`}
                        </p>
                        {interviewer.department && (
                          <p className="text-gray-600">{interviewer.department}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveInterviewerFromTemp(interviewer.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={newInterviewerName}
                  onChange={(e) => setNewInterviewerName(e.target.value)}
                  className="px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="名前"
                />
                <input
                  type="text"
                  value={newInterviewerPosition}
                  onChange={(e) => setNewInterviewerPosition(e.target.value)}
                  className="px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="役職"
                />
                <input
                  type="text"
                  value={newInterviewerDept}
                  onChange={(e) => setNewInterviewerDept(e.target.value)}
                  className="px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="部署"
                />
                <input
                  type="text"
                  value={newInterviewerImpression}
                  onChange={(e) => setNewInterviewerImpression(e.target.value)}
                  className="px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="印象"
                />
              </div>
              <button
                type="button"
                onClick={handleAddInterviewerToTemp}
                className="mt-2 text-sm text-blue-600 hover:text-blue-700"
              >
                + 面接官を追加
              </button>
            </div>

            {/* 質問・回答追加 */}
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-2">質問と回答</p>
              {tempQuestions.length > 0 && (
                <div className="space-y-2 mb-3">
                  {tempQuestions.map((q) => (
                    <div
                      key={q.id}
                      className="flex items-start justify-between p-2 bg-white rounded"
                    >
                      <div className="flex-1 text-sm">
                        <p className="font-medium">Q: {q.question}</p>
                        <p className="text-gray-700">A: {q.answer}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestionFromTemp(q.id)}
                        className="text-red-600 hover:text-red-700 ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <input
                  type="text"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="質問内容"
                />
                <textarea
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="回答内容"
                />
                <input
                  type="text"
                  value={newReaction}
                  onChange={(e) => setNewReaction(e.target.value)}
                  className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="面接官の反応（任意）"
                />
                <button
                  type="button"
                  onClick={handleAddQuestionToTemp}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  + 質問を追加
                </button>
              </div>
            </div>

            {/* 逆質問 */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                逆質問（任意）
              </label>
              <textarea
                value={newReverseQuestions}
                onChange={(e) => setNewReverseQuestions(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="自分からした質問を記録"
              />
            </div>

            {/* 全体の印象 */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                全体の印象（任意）
              </label>
              <textarea
                value={newImpression}
                onChange={(e) => setNewImpression(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="面接全体の雰囲気や感想"
              />
            </div>

            {/* 保存ボタン */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSaveInterviewLog}
                disabled={!newRound.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                保存
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setNewRound('');
                  setNewDate('');
                  setTempQuestions([]);
                  setTempInterviewers([]);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
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
