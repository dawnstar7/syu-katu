'use client';

import { useState } from 'react';
import { Search, Plus, X, ExternalLink, ChevronDown, ChevronUp, Sparkles, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';

interface ResearchSource {
  url: string;
  title: string;
  usedFor: string;
}

interface AnalysisResult {
  companyOverview: {
    summary: string;
    strengths: string[];
    challenges: string[];
    businessAreas: string[];
  };
  culture: {
    philosophy: string;
    values: string[];
    workStyle: string;
  };
  recruitment: {
    targetPersonality: string;
    requiredSkills: string[];
    careerPath: string;
    appealPoints: string;
  };
  strategy: {
    futureDirection: string;
    growthAreas: string[];
  };
  interviewPrep: {
    likelyQuestions: string[];
    keywordsToUse: string[];
  };
  sources: ResearchSource[];
  rawSummaryForAnalysis: string;
}

interface CompanyResearchProps {
  companyName: string;
  onApplyToAnalysis: (summary: string) => void;
}

export default function CompanyResearch({ companyName, onApplyToAnalysis }: CompanyResearchProps) {
  const [urls, setUrls] = useState<string[]>(['']);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [fetchedPages, setFetchedPages] = useState<{ url: string; title: string }[]>([]);
  const [failedPages, setFailedPages] = useState<{ url: string; error: string }[]>([]);
  const [error, setError] = useState('');
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    overview: true,
    culture: false,
    recruitment: false,
    strategy: false,
    interview: false,
  });

  const toggleSection = (key: string) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const addUrl = () => setUrls([...urls, '']);
  const removeUrl = (i: number) => setUrls(urls.filter((_, idx) => idx !== i));
  const updateUrl = (i: number, val: string) => {
    const next = [...urls];
    next[i] = val;
    setUrls(next);
  };

  const handleResearch = async () => {
    const validUrls = urls.map(u => u.trim()).filter(Boolean);
    if (validUrls.length === 0) return;

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/company-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: validUrls, companyName }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || '企業研究に失敗しました');
        return;
      }

      setResult(data.analysis);
      setFetchedPages(data.fetchedPages || []);
      setFailedPages(data.failedPages || []);
    } catch {
      setError('通信エラーが発生しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* ヘッダー説明 */}
      <div className="flex items-start gap-3 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
        <Search className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-indigo-900">企業研究を自動化</p>
          <p className="text-xs text-indigo-700 mt-1">
            採用ページ・IR資料・企業理念ページなどのURLを入力すると、AIが自動で読み込んで構造化します。ソース元も明示します。
          </p>
        </div>
      </div>

      {/* URL入力 */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          読み込むURL（複数可）
        </label>
        <div className="space-y-2">
          {urls.map((url, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={e => updateUrl(i, e.target.value)}
                className="flex-1 px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder={
                  i === 0 ? '例: https://example.co.jp/recruit' :
                  i === 1 ? '例: https://example.co.jp/ir/library' :
                  '例: https://example.co.jp/about/philosophy'
                }
              />
              {urls.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeUrl(i)}
                  className="p-2 text-gray-400 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {urls.length < 5 && (
          <button
            type="button"
            onClick={addUrl}
            className="mt-2 flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800"
          >
            <Plus className="w-4 h-4" />
            URLを追加（最大5つ）
          </button>
        )}

        <p className="text-xs text-gray-500 mt-2">
          💡 採用ページ・会社概要・IR・中期経営計画・理念ページなど複数入力するほど精度が上がります
        </p>
      </div>

      {/* 実行ボタン */}
      <button
        type="button"
        onClick={handleResearch}
        disabled={isLoading || !urls.some(u => u.trim())}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        <Sparkles className="w-5 h-5" />
        {isLoading ? 'AIが読み込み中...' : '企業研究を開始する'}
      </button>

      {isLoading && (
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-2 text-sm text-gray-600">
            <div className="animate-spin w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full" />
            URLを読み込んでAIが分析中です（30秒ほどかかる場合があります）
          </div>
        </div>
      )}

      {/* エラー */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* 取得結果のソース一覧 */}
      {(fetchedPages.length > 0 || failedPages.length > 0) && !isLoading && (
        <div className="space-y-1">
          {fetchedPages.map(p => (
            <div key={p.url} className="flex items-center gap-2 text-xs text-green-700">
              <CheckCircle className="w-3 h-3 flex-shrink-0" />
              <a href={p.url} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">
                {p.title || p.url}
              </a>
            </div>
          ))}
          {failedPages.map(p => (
            <div key={p.url} className="flex items-center gap-2 text-xs text-red-600">
              <AlertCircle className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{p.url}（取得失敗: {p.error}）</span>
            </div>
          ))}
        </div>
      )}

      {/* 分析結果 */}
      {result && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900">📊 分析結果</h4>
            <button
              type="button"
              onClick={() => onApplyToAnalysis(result.rawSummaryForAnalysis)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              企業分析メモに反映
            </button>
          </div>

          {/* 事業概要 */}
          <Section
            title="🏢 事業概要"
            isOpen={openSections.overview}
            onToggle={() => toggleSection('overview')}
          >
            {result.companyOverview.summary && (
              <p className="text-sm text-gray-700 mb-3">{result.companyOverview.summary}</p>
            )}
            {result.companyOverview.businessAreas.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-medium text-gray-500 mb-1">主要事業</p>
                <div className="flex flex-wrap gap-1">
                  {result.companyOverview.businessAreas.map((a, i) => (
                    <span key={i} className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">{a}</span>
                  ))}
                </div>
              </div>
            )}
            {result.companyOverview.strengths.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-medium text-gray-500 mb-1">強み</p>
                <ul className="space-y-1">
                  {result.companyOverview.strengths.map((s, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start gap-1.5">
                      <span className="text-green-500 mt-0.5">✓</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {result.companyOverview.challenges.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">課題・リスク</p>
                <ul className="space-y-1">
                  {result.companyOverview.challenges.map((c, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start gap-1.5">
                      <span className="text-orange-500 mt-0.5">△</span>{c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Section>

          {/* 企業文化 */}
          <Section
            title="💡 企業理念・カルチャー"
            isOpen={openSections.culture}
            onToggle={() => toggleSection('culture')}
          >
            {result.culture.philosophy && (
              <div className="mb-3 p-3 bg-purple-50 rounded-lg border-l-4 border-purple-400">
                <p className="text-xs font-medium text-purple-700 mb-1">理念・ミッション</p>
                <p className="text-sm text-gray-800">{result.culture.philosophy}</p>
              </div>
            )}
            {result.culture.values.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-medium text-gray-500 mb-1">大切にしている価値観</p>
                <div className="flex flex-wrap gap-1">
                  {result.culture.values.map((v, i) => (
                    <span key={i} className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full">{v}</span>
                  ))}
                </div>
              </div>
            )}
            {result.culture.workStyle && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">働き方・職場環境</p>
                <p className="text-sm text-gray-700">{result.culture.workStyle}</p>
              </div>
            )}
          </Section>

          {/* 採用情報 */}
          <Section
            title="👤 求める人物像・採用情報"
            isOpen={openSections.recruitment}
            onToggle={() => toggleSection('recruitment')}
          >
            {result.recruitment.targetPersonality && (
              <div className="mb-3 p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                <p className="text-xs font-medium text-green-700 mb-1">求める人物像</p>
                <p className="text-sm text-gray-800">{result.recruitment.targetPersonality}</p>
              </div>
            )}
            {result.recruitment.requiredSkills.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-medium text-gray-500 mb-1">求められるスキル・素質</p>
                <ul className="space-y-1">
                  {result.recruitment.requiredSkills.map((s, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start gap-1.5">
                      <span className="text-green-500 mt-0.5">•</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {result.recruitment.careerPath && (
              <div className="mb-3">
                <p className="text-xs font-medium text-gray-500 mb-1">キャリアパス</p>
                <p className="text-sm text-gray-700">{result.recruitment.careerPath}</p>
              </div>
            )}
            {result.recruitment.appealPoints && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">この会社で働く魅力</p>
                <p className="text-sm text-gray-700">{result.recruitment.appealPoints}</p>
              </div>
            )}
          </Section>

          {/* 戦略・方向性 */}
          <Section
            title="🚀 今後の戦略・方向性"
            isOpen={openSections.strategy}
            onToggle={() => toggleSection('strategy')}
          >
            {result.strategy.futureDirection && (
              <p className="text-sm text-gray-700 mb-3">{result.strategy.futureDirection}</p>
            )}
            {result.strategy.growthAreas.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">注力領域</p>
                <div className="flex flex-wrap gap-1">
                  {result.strategy.growthAreas.map((a, i) => (
                    <span key={i} className="px-2 py-0.5 bg-orange-100 text-orange-800 text-xs rounded-full">{a}</span>
                  ))}
                </div>
              </div>
            )}
          </Section>

          {/* 面接対策 */}
          <Section
            title="🎤 面接対策"
            isOpen={openSections.interview}
            onToggle={() => toggleSection('interview')}
          >
            {result.interviewPrep.likelyQuestions.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-medium text-gray-500 mb-2">聞かれそうな質問</p>
                <ul className="space-y-2">
                  {result.interviewPrep.likelyQuestions.map((q, i) => (
                    <li key={i} className="text-sm text-gray-700 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                      Q. {q}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {result.interviewPrep.keywordsToUse.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">使うべきキーワード</p>
                <div className="flex flex-wrap gap-1">
                  {result.interviewPrep.keywordsToUse.map((k, i) => (
                    <span key={i} className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">{k}</span>
                  ))}
                </div>
              </div>
            )}
          </Section>

          {/* ソース一覧 */}
          {result.sources && result.sources.length > 0 && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-xs font-medium text-gray-500 mb-2">📎 参照ソース</p>
              <ul className="space-y-1">
                {result.sources.map((s, i) => (
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
    </div>
  );
}

// アコーディオンセクションコンポーネント
function Section({
  title,
  isOpen,
  onToggle,
  children,
}: {
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
