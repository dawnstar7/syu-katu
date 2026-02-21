'use client';

import { useState } from 'react';
import { Search, ChevronDown, ChevronUp, ExternalLink, RefreshCw, Clock } from 'lucide-react';
import type { CompanyAnalysis, AIResearchResult } from '@/types';
import CompanyResearch from './CompanyResearch';

interface CompanyAnalysisFormProps {
  analysis: CompanyAnalysis;
  onChange: (analysis: CompanyAnalysis) => void;
  companyName?: string;
}

export default function CompanyAnalysisForm({ analysis, onChange, companyName }: CompanyAnalysisFormProps) {
  const [showResearch, setShowResearch] = useState(false);
  const [activeSection, setActiveSection] = useState<'ai' | 'personal'>('ai');
  const [openAiSections, setOpenAiSections] = useState<Record<string, boolean>>({
    overview: true,
    culture: false,
    recruitment: false,
    strategy: false,
    interview: false,
  });

  const toggleAiSection = (key: string) => {
    setOpenAiSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // AI研究結果を保存
  const handleSaveResearch = (result: AIResearchResult) => {
    onChange({ ...analysis, aiResearch: result });
    setShowResearch(false);
    setActiveSection('ai');
  };

  const aiResearch = analysis.aiResearch;

  return (
    <div className="space-y-4">

      {/* セクション切り替えタブ */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
        <button
          type="button"
          onClick={() => setActiveSection('ai')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            activeSection === 'ai'
              ? 'bg-white text-indigo-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Search className="w-4 h-4" />
          AI企業研究
          {aiResearch && (
            <span className="ml-1 w-2 h-2 rounded-full bg-green-500" title="保存済み" />
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('personal')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            activeSection === 'personal'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          ✏️ 自分の分析
        </button>
      </div>

      {/* AI企業研究セクション */}
      {activeSection === 'ai' && (
        <div className="space-y-4">
          {/* 調査実行 / 再調査ボタン */}
          <button
            type="button"
            onClick={() => setShowResearch(!showResearch)}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-colors text-sm font-medium ${
              showResearch
                ? 'bg-indigo-600 text-white border-indigo-600'
                : aiResearch
                  ? 'border-indigo-300 text-indigo-700 hover:bg-indigo-50'
                  : 'border-indigo-400 text-indigo-700 hover:bg-indigo-50'
            }`}
          >
            {aiResearch ? (
              <>
                <RefreshCw className="w-4 h-4" />
                再調査する
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                AIで企業研究を開始する
              </>
            )}
          </button>

          {/* 調査パネル */}
          {showResearch && (
            <div className="p-4 border border-indigo-200 rounded-lg bg-indigo-50/30">
              <CompanyResearch
                companyName={companyName || ''}
                onApplyToAnalysis={() => {}}
                onSaveResearch={handleSaveResearch}
              />
            </div>
          )}

          {/* 保存済みAI研究結果の表示 */}
          {aiResearch && !showResearch && (
            <div className="space-y-3">
              {/* 調査日時 */}
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Clock className="w-3.5 h-3.5" />
                最終調査: {new Date(aiResearch.researchedAt).toLocaleDateString('ja-JP', {
                  year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                })}
              </div>

              {/* 事業概要 */}
              <AiSection title="🏢 事業概要" isOpen={openAiSections.overview} onToggle={() => toggleAiSection('overview')}>
                {aiResearch.companyOverview.summary && (
                  <p className="text-sm text-gray-700 mb-3">{aiResearch.companyOverview.summary}</p>
                )}
                {aiResearch.companyOverview.businessAreas.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-gray-500 mb-1">主要事業</p>
                    <div className="flex flex-wrap gap-1">
                      {aiResearch.companyOverview.businessAreas.map((a, i) => (
                        <span key={i} className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">{a}</span>
                      ))}
                    </div>
                  </div>
                )}
                {aiResearch.companyOverview.strengths.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-gray-500 mb-1">強み</p>
                    <ul className="space-y-1">
                      {aiResearch.companyOverview.strengths.map((s, i) => (
                        <li key={i} className="text-sm text-gray-700 flex items-start gap-1.5">
                          <span className="text-green-500 mt-0.5">✓</span>{s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiResearch.companyOverview.challenges.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">課題・リスク</p>
                    <ul className="space-y-1">
                      {aiResearch.companyOverview.challenges.map((c, i) => (
                        <li key={i} className="text-sm text-gray-700 flex items-start gap-1.5">
                          <span className="text-orange-500 mt-0.5">△</span>{c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </AiSection>

              {/* 企業文化 */}
              <AiSection title="💡 企業理念・カルチャー" isOpen={openAiSections.culture} onToggle={() => toggleAiSection('culture')}>
                {aiResearch.culture.philosophy && (
                  <div className="mb-3 p-3 bg-purple-50 rounded-lg border-l-4 border-purple-400">
                    <p className="text-xs font-medium text-purple-700 mb-1">理念・ミッション</p>
                    <p className="text-sm text-gray-800">{aiResearch.culture.philosophy}</p>
                  </div>
                )}
                {aiResearch.culture.values.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-gray-500 mb-1">大切にしている価値観</p>
                    <div className="flex flex-wrap gap-1">
                      {aiResearch.culture.values.map((v, i) => (
                        <span key={i} className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full">{v}</span>
                      ))}
                    </div>
                  </div>
                )}
                {aiResearch.culture.workStyle && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">働き方・職場環境</p>
                    <p className="text-sm text-gray-700">{aiResearch.culture.workStyle}</p>
                  </div>
                )}
              </AiSection>

              {/* 採用情報 */}
              <AiSection title="👤 求める人物像・採用情報" isOpen={openAiSections.recruitment} onToggle={() => toggleAiSection('recruitment')}>
                {aiResearch.recruitment.targetPersonality && (
                  <div className="mb-3 p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                    <p className="text-xs font-medium text-green-700 mb-1">求める人物像</p>
                    <p className="text-sm text-gray-800">{aiResearch.recruitment.targetPersonality}</p>
                  </div>
                )}
                {aiResearch.recruitment.requiredSkills.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-gray-500 mb-1">求められるスキル・素質</p>
                    <ul className="space-y-1">
                      {aiResearch.recruitment.requiredSkills.map((s, i) => (
                        <li key={i} className="text-sm text-gray-700 flex items-start gap-1.5">
                          <span className="text-green-500 mt-0.5">•</span>{s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiResearch.recruitment.careerPath && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-gray-500 mb-1">キャリアパス</p>
                    <p className="text-sm text-gray-700">{aiResearch.recruitment.careerPath}</p>
                  </div>
                )}
                {aiResearch.recruitment.appealPoints && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">この会社で働く魅力</p>
                    <p className="text-sm text-gray-700">{aiResearch.recruitment.appealPoints}</p>
                  </div>
                )}
              </AiSection>

              {/* 戦略 */}
              <AiSection title="🚀 今後の戦略・方向性" isOpen={openAiSections.strategy} onToggle={() => toggleAiSection('strategy')}>
                {aiResearch.strategy.futureDirection && (
                  <p className="text-sm text-gray-700 mb-3">{aiResearch.strategy.futureDirection}</p>
                )}
                {aiResearch.strategy.growthAreas.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">注力領域</p>
                    <div className="flex flex-wrap gap-1">
                      {aiResearch.strategy.growthAreas.map((a, i) => (
                        <span key={i} className="px-2 py-0.5 bg-orange-100 text-orange-800 text-xs rounded-full">{a}</span>
                      ))}
                    </div>
                  </div>
                )}
              </AiSection>

              {/* 面接対策 */}
              <AiSection title="🎤 面接対策" isOpen={openAiSections.interview} onToggle={() => toggleAiSection('interview')}>
                {aiResearch.interviewPrep.likelyQuestions.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-gray-500 mb-2">聞かれそうな質問</p>
                    <ul className="space-y-2">
                      {aiResearch.interviewPrep.likelyQuestions.map((q, i) => (
                        <li key={i} className="text-sm text-gray-700 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                          Q. {q}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiResearch.interviewPrep.keywordsToUse.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">使うべきキーワード</p>
                    <div className="flex flex-wrap gap-1">
                      {aiResearch.interviewPrep.keywordsToUse.map((k, i) => (
                        <span key={i} className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">{k}</span>
                      ))}
                    </div>
                  </div>
                )}
              </AiSection>

              {/* 参照ソース */}
              {aiResearch.sources.length > 0 && (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 mb-2">📎 参照ソース</p>
                  <ul className="space-y-1">
                    {aiResearch.sources.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                        <ExternalLink className="w-3 h-3 flex-shrink-0 mt-0.5 text-gray-400" />
                        <div>
                          <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                            {s.title || s.url}
                          </a>
                          {s.usedFor && <span className="text-gray-400 ml-1">→ {s.usedFor}</span>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* まだ調査していない場合 */}
          {!aiResearch && !showResearch && (
            <div className="text-center py-8 text-gray-400">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">まだ企業研究を実施していません</p>
              <p className="text-xs mt-1">上のボタンからAI企業研究を開始してください</p>
            </div>
          )}
        </div>
      )}

      {/* 自分の分析セクション */}
      {activeSection === 'personal' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            AI調査の内容をもとに、自分なりの考えを言語化しましょう。面接で直接使える内容になります。
          </p>

          {/* なぜこの会社か */}
          <div>
            <label className="block text-base font-medium text-gray-900 mb-1">
              なぜこの会社か？
            </label>
            <p className="text-xs text-gray-500 mb-2">
              競合他社と比較した際の、自分なりの決定打を言語化
            </p>
            <textarea
              value={analysis.whyThisCompany || ''}
              onChange={(e) => onChange({ ...analysis, whyThisCompany: e.target.value })}
              rows={5}
              className="w-full px-4 py-3 text-base text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例: 他社と比較して、〇〇な点に魅力を感じた。特に△△という事業領域で..."
            />
          </div>

          {/* 社員の印象 */}
          <div>
            <label className="block text-base font-medium text-gray-900 mb-1">
              社員の印象メモ
            </label>
            <p className="text-xs text-gray-500 mb-2">
              説明会やOB・OG訪問で感じた「人」の雰囲気
            </p>
            <textarea
              value={analysis.employeeImpression || ''}
              onChange={(e) => onChange({ ...analysis, employeeImpression: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 text-base text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例: 〇〇さんの働き方に憧れた。説明会で感じた雰囲気は..."
            />
          </div>

          {/* 自分とのマッチ度 */}
          <div>
            <label className="block text-base font-medium text-gray-900 mb-1">
              自分とのマッチ度分析
            </label>
            <p className="text-xs text-gray-500 mb-2">
              自分の強みがその企業のどういう場面で活かせそうか
            </p>
            <textarea
              value={analysis.matchingPoints || ''}
              onChange={(e) => onChange({ ...analysis, matchingPoints: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 text-base text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例: 自分の〇〇という強みは、この企業の△△という場面で活かせると考える..."
            />
          </div>

          {/* 懸念点 */}
          <div>
            <label className="block text-base font-medium text-gray-900 mb-1">
              懸念点・確認したいこと
            </label>
            <p className="text-xs text-gray-500 mb-2">
              給与、残業、配属リスクなど、聞きにくいけれど整理しておきたい点
            </p>
            <textarea
              value={analysis.concerns || ''}
              onChange={(e) => onChange({ ...analysis, concerns: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 text-base text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例: 配属リスクについて確認したい。残業時間の実態は..."
            />
          </div>
        </div>
      )}
    </div>
  );
}

// アコーディオンセクション
function AiSection({ title, isOpen, onToggle, children }: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <span className="text-sm font-medium text-gray-800">{title}</span>
        {isOpen ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
      </button>
      {isOpen && <div className="p-4 space-y-2">{children}</div>}
    </div>
  );
}
