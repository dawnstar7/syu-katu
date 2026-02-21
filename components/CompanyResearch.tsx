'use client';

import { useState } from 'react';
import {
  Search, Plus, X, ExternalLink, ChevronDown, ChevronUp,
  Sparkles, AlertCircle, CheckCircle, ArrowRight, Wand2,
  Globe, Users, BarChart2, Building2, Newspaper
} from 'lucide-react';

interface SuggestedUrl {
  url: string;
  type: 'recruit' | 'about' | 'ir' | 'business' | 'news';
  label: string;
  description: string;
  alive: boolean;
}

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

const TYPE_ICONS: Record<string, any> = {
  recruit: Users,
  about: Building2,
  ir: BarChart2,
  business: Globe,
  news: Newspaper,
};

const TYPE_COLORS: Record<string, string> = {
  recruit: 'bg-blue-100 text-blue-700 border-blue-200',
  about: 'bg-purple-100 text-purple-700 border-purple-200',
  ir: 'bg-orange-100 text-orange-700 border-orange-200',
  business: 'bg-green-100 text-green-700 border-green-200',
  news: 'bg-gray-100 text-gray-700 border-gray-200',
};

export default function CompanyResearch({ companyName, onApplyToAnalysis }: CompanyResearchProps) {
  const [urls, setUrls] = useState<string[]>(['']);
  const [suggestedUrls, setSuggestedUrls] = useState<SuggestedUrl[]>([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(new Set());
  const [isFetchingUrls, setIsFetchingUrls] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [fetchedPages, setFetchedPages] = useState<{ url: string; title: string }[]>([]);
  const [failedPages, setFailedPages] = useState<{ url: string; error: string }[]>([]);
  const [error, setError] = useState('');
  const [urlError, setUrlError] = useState('');
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

  // AIでURLを自動検索
  const handleFetchUrls = async () => {
    if (!companyName.trim()) return;
    setIsFetchingUrls(true);
    setUrlError('');
    setSuggestedUrls([]);
    setSelectedSuggestions(new Set());

    try {
      const response = await fetch('/api/company-urls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName }),
      });

      const data = await response.json();

      if (!response.ok) {
        setUrlError(data.error || 'URL検索に失敗しました');
        return;
      }

      setSuggestedUrls(data.urls || []);
      // 生存確認済みのURLをデフォルト選択
      const aliveUrls = new Set<string>(
        (data.urls || []).filter((u: SuggestedUrl) => u.alive).map((u: SuggestedUrl) => u.url)
      );
      setSelectedSuggestions(aliveUrls);
    } catch {
      setUrlError('URL検索中にエラーが発生しました');
    } finally {
      setIsFetchingUrls(false);
    }
  };

  // 候補URLの選択トグル
  const toggleSuggestion = (url: string) => {
    setSelectedSuggestions(prev => {
      const next = new Set(prev);
      if (next.has(url)) {
        next.delete(url);
      } else {
        next.add(url);
      }
      return next;
    });
  };

  // 選択した候補URLをURL入力欄に反映
  const applySelectedUrls = () => {
    const selected = suggestedUrls
      .filter(u => selectedSuggestions.has(u.url))
      .map(u => u.url);
    if (selected.length > 0) {
      setUrls(selected);
    }
  };

  // 企業研究を実行
  const handleResearch = async () => {
    const validUrls = urls.map(u => u.trim()).filter(Boolean);
    if (validUrls.length === 0) return;

    setIsAnalyzing(true);
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
      setIsAnalyzing(false);
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
            AIが採用ページ・IR・企業理念などのURLを自動で探します。URLを確認してから企業研究を開始してください。
          </p>
        </div>
      </div>

      {/* STEP 1: URL自動検索 */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 bg-indigo-600 text-white text-xs font-bold rounded-full">1</span>
          <p className="text-sm font-medium text-gray-900">AIが関連URLを自動検索</p>
        </div>

        <button
          type="button"
          onClick={handleFetchUrls}
          disabled={isFetchingUrls || !companyName.trim()}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border-2 border-indigo-400 text-indigo-700 rounded-lg hover:bg-indigo-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          <Wand2 className="w-4 h-4" />
          {isFetchingUrls
            ? `「${companyName}」のURLを検索中...`
            : `「${companyName}」の関連URLを自動検索`}
        </button>

        {urlError && (
          <p className="text-xs text-red-600 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />{urlError}
          </p>
        )}

        {/* 候補URL一覧 */}
        {suggestedUrls.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-gray-500">
              ✅ = アクセス確認済み　❓ = 要確認（クリックで開いて確認してください）
            </p>
            {suggestedUrls.map((item) => {
              const Icon = TYPE_ICONS[item.type] || Globe;
              const colorClass = TYPE_COLORS[item.type] || TYPE_COLORS.news;
              const isSelected = selectedSuggestions.has(item.url);

              return (
                <div
                  key={item.url}
                  className={`flex items-start gap-3 p-3 rounded-lg border-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-indigo-400 bg-indigo-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                  onClick={() => toggleSuggestion(item.url)}
                >
                  {/* チェックボックス */}
                  <div className={`flex-shrink-0 w-5 h-5 rounded border-2 mt-0.5 flex items-center justify-center ${
                    isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'
                  }`}>
                    {isSelected && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`flex items-center gap-1 px-2 py-0.5 text-xs rounded-full border ${colorClass}`}>
                        <Icon className="w-3 h-3" />
                        {item.label}
                      </span>
                      {item.alive ? (
                        <span className="text-xs text-green-600 flex items-center gap-0.5">
                          <CheckCircle className="w-3 h-3" />確認済
                        </span>
                      ) : (
                        <span className="text-xs text-amber-600 flex items-center gap-0.5">
                          <AlertCircle className="w-3 h-3" />要確認
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-500 mb-1">{item.description}</p>

                    {/* URLリンク（クリックで新しいタブで開く） */}
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-600 hover:underline flex items-center gap-1 truncate"
                      onClick={e => e.stopPropagation()}
                    >
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{item.url}</span>
                    </a>
                  </div>
                </div>
              );
            })}

            <button
              type="button"
              onClick={applySelectedUrls}
              disabled={selectedSuggestions.size === 0}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              <CheckCircle className="w-4 h-4" />
              選択したURL（{selectedSuggestions.size}件）を使用する
            </button>
          </div>
        )}
      </div>

      {/* STEP 2: URL確認・編集 */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 bg-indigo-600 text-white text-xs font-bold rounded-full">2</span>
          <p className="text-sm font-medium text-gray-900">URLを確認・追加（手動でも入力可）</p>
        </div>

        <div className="space-y-2">
          {urls.map((url, i) => (
            <div key={i} className="flex gap-2 items-center">
              <div className="flex-1 flex gap-1">
                <input
                  type="url"
                  value={url}
                  onChange={e => updateUrl(i, e.target.value)}
                  className="flex-1 px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="https://..."
                />
                {url && (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 flex items-center justify-center w-9 h-9 border border-gray-300 rounded-lg text-gray-500 hover:text-indigo-600 hover:border-indigo-400 transition-colors"
                    title="このURLを開いて確認"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
              {urls.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeUrl(i)}
                  className="flex-shrink-0 p-1.5 text-gray-400 hover:text-red-500"
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
            className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800"
          >
            <Plus className="w-4 h-4" />
            URLを追加（最大5つ）
          </button>
        )}
      </div>

      {/* STEP 3: 企業研究実行 */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 bg-indigo-600 text-white text-xs font-bold rounded-full">3</span>
          <p className="text-sm font-medium text-gray-900">AIが読み込んで構造化</p>
        </div>

        <button
          type="button"
          onClick={handleResearch}
          disabled={isAnalyzing || !urls.some(u => u.trim())}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          <Sparkles className="w-5 h-5" />
          {isAnalyzing ? 'AIが読み込み・分析中...' : '企業研究を開始する'}
        </button>

        {isAnalyzing && (
          <div className="text-center py-2">
            <div className="inline-flex items-center gap-2 text-sm text-gray-600">
              <div className="animate-spin w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full" />
              ページを読み込んでAIが分析しています（30秒ほどかかる場合があります）
            </div>
          </div>
        )}
      </div>

      {/* エラー */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* 取得結果のソース一覧 */}
      {(fetchedPages.length > 0 || failedPages.length > 0) && !isAnalyzing && (
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
          <Section title="🏢 事業概要" isOpen={openSections.overview} onToggle={() => toggleSection('overview')}>
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
          <Section title="💡 企業理念・カルチャー" isOpen={openSections.culture} onToggle={() => toggleSection('culture')}>
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
          <Section title="👤 求める人物像・採用情報" isOpen={openSections.recruitment} onToggle={() => toggleSection('recruitment')}>
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

          {/* 戦略 */}
          <Section title="🚀 今後の戦略・方向性" isOpen={openSections.strategy} onToggle={() => toggleSection('strategy')}>
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
          <Section title="🎤 面接対策" isOpen={openSections.interview} onToggle={() => toggleSection('interview')}>
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

          {/* ソース */}
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

function Section({ title, isOpen, onToggle, children }: {
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
