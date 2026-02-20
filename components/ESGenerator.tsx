'use client';

import { useState } from 'react';
import { Sparkles, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import type {
  SelfAnalysisData,
  SelfAnalysisEpisode,
  StrengthAndWeakness,
  Company,
  ESGenerationRequest,
} from '@/types';
import { TONE_LABELS, EPISODE_CATEGORY_LABELS } from '@/types';

interface ESGeneratorProps {
  company: Partial<Company>;
  selfAnalysis: SelfAnalysisData;
  onUseGenerated: (text: string) => void;
}

export default function ESGenerator({ company, selfAnalysis, onUseGenerated }: ESGeneratorProps) {
  const [question, setQuestion] = useState('');
  const [characterLimit, setCharacterLimit] = useState('400');
  const [tone, setTone] = useState<ESGenerationRequest['tone']>('logical');
  const [selectedEpisodeIds, setSelectedEpisodeIds] = useState<string[]>([]);
  const [selectedStrengthIds, setSelectedStrengthIds] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState('');
  const [copied, setCopied] = useState(false);
  const [showSelfAnalysis, setShowSelfAnalysis] = useState(false);
  const [error, setError] = useState('');

  const hasEpisodes = selfAnalysis.episodes.length > 0;
  const hasStrengths = selfAnalysis.strengths.length > 0;

  const toggleEpisode = (id: string) => {
    setSelectedEpisodeIds(prev =>
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  const toggleStrength = (id: string) => {
    setSelectedStrengthIds(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleGenerate = async () => {
    if (!question.trim()) return;

    setIsGenerating(true);
    setError('');
    setGeneratedText('');

    const selectedEpisodes = selfAnalysis.episodes.filter(e =>
      selectedEpisodeIds.includes(e.id)
    );
    const selectedStrengths = selfAnalysis.strengths.filter(s =>
      selectedStrengthIds.includes(s.id)
    );

    try {
      const response = await fetch('/api/es-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          characterLimit: characterLimit ? parseInt(characterLimit) : null,
          tone,
          companyName: company.name,
          companyDescription: company.description,
          companyIndustry: company.industry,
          jobType: company.jobType,
          companyAnalysis: company.companyAnalysis,
          selectedEpisodes,
          selectedStrengths,
          values: selfAnalysis.values,
          vision: selfAnalysis.vision,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'ES生成に失敗しました');
        return;
      }

      setGeneratedText(data.generatedText);
    } catch {
      setError('通信エラーが発生しました。もう一度お試しください。');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUse = () => {
    onUseGenerated(generatedText);
    setGeneratedText('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
        <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0" />
        <p className="text-sm text-purple-800">
          自己分析データをもとに、この企業向けのES文章をAIが生成します
        </p>
      </div>

      {/* 自己分析データの確認 */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => setShowSelfAnalysis(!showSelfAnalysis)}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <span>自己分析データを確認する</span>
          {showSelfAnalysis ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showSelfAnalysis && (
          <div className="p-4 space-y-3 text-sm">
            {!hasEpisodes && !hasStrengths && !selfAnalysis.values && !selfAnalysis.vision && (
              <p className="text-gray-500 text-center py-4">
                自己分析データがありません。<br />
                先に「自己分析」ページでデータを入力してください。
              </p>
            )}
            {hasEpisodes && (
              <div>
                <p className="font-medium text-gray-700 mb-1">エピソード ({selfAnalysis.episodes.length}件)</p>
                <div className="space-y-1">
                  {selfAnalysis.episodes.map(ep => (
                    <p key={ep.id} className="text-gray-600">・{ep.title}（{EPISODE_CATEGORY_LABELS[ep.category]}）</p>
                  ))}
                </div>
              </div>
            )}
            {hasStrengths && (
              <div>
                <p className="font-medium text-gray-700 mb-1">強み ({selfAnalysis.strengths.length}件)</p>
                <div className="space-y-1">
                  {selfAnalysis.strengths.map(s => (
                    <p key={s.id} className="text-gray-600">・{s.name}</p>
                  ))}
                </div>
              </div>
            )}
            {selfAnalysis.values && (
              <div>
                <p className="font-medium text-gray-700">価値観・モチベーション ✅</p>
              </div>
            )}
            {selfAnalysis.vision && (
              <div>
                <p className="font-medium text-gray-700">将来ビジョン ✅</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 設問入力 */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">
          ES設問 <span className="text-red-500">*</span>
        </label>
        <textarea
          value={question}
          onChange={e => setQuestion(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="例: 学生時代に最も力を入れたことを教えてください（400字以内）"
        />
      </div>

      {/* 文字数・トーン */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">文字数制限</label>
          <input
            type="number"
            value={characterLimit}
            onChange={e => setCharacterLimit(e.target.value)}
            className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">文体・トーン</label>
          <select
            value={tone}
            onChange={e => setTone(e.target.value as ESGenerationRequest['tone'])}
            className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {Object.entries(TONE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* エピソード選択 */}
      {hasEpisodes && (
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            使用するエピソードを選択（複数可）
          </label>
          <div className="space-y-2">
            {selfAnalysis.episodes.map(ep => (
              <label
                key={ep.id}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedEpisodeIds.includes(ep.id)
                    ? 'border-purple-400 bg-purple-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedEpisodeIds.includes(ep.id)}
                  onChange={() => toggleEpisode(ep.id)}
                  className="mt-0.5 accent-purple-600"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{ep.title}</p>
                  <p className="text-xs text-gray-500">{EPISODE_CATEGORY_LABELS[ep.category]}</p>
                  {ep.what && <p className="text-xs text-gray-600 mt-1 line-clamp-2">{ep.what}</p>}
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* 強み選択 */}
      {hasStrengths && (
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            使用する強みを選択（複数可）
          </label>
          <div className="flex flex-wrap gap-2">
            {selfAnalysis.strengths.map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => toggleStrength(s.id)}
                className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                  selectedStrengthIds.includes(s.id)
                    ? 'border-purple-400 bg-purple-100 text-purple-800'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 生成ボタン */}
      <button
        type="button"
        onClick={handleGenerate}
        disabled={!question.trim() || isGenerating}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        <Sparkles className="w-5 h-5" />
        {isGenerating ? 'AI生成中...' : 'ES文章を生成する'}
      </button>

      {/* エラー */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* 生成結果 */}
      {generatedText && (
        <div className="space-y-3">
          <div className="p-4 bg-white border-2 border-purple-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-700">生成されたES文章</p>
              <p className="text-xs text-gray-500">{generatedText.length}文字</p>
            </div>
            <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">{generatedText}</p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              {copied ? 'コピーしました！' : 'コピー'}
            </button>
            <button
              type="button"
              onClick={handleUse}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
            >
              この文章を回答欄に使う
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
