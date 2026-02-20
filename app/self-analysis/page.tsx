'use client';

import { useState, useEffect } from 'react';
import { Lightbulb, Sparkles, Target, TrendingUp, StickyNote, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { SelfAnalysisData } from '@/types';
import { loadSelfAnalysisData, saveSelfAnalysisData } from '@/lib/selfAnalysisStorage';
import EpisodesManager from '@/components/self-analysis/EpisodesManager';
import ValuesManager from '@/components/self-analysis/ValuesManager';
import StrengthsManager from '@/components/self-analysis/StrengthsManager';
import VisionManager from '@/components/self-analysis/VisionManager';
import FreeNotesManager from '@/components/self-analysis/FreeNotesManager';

type TabType = 'episodes' | 'values' | 'strengths' | 'vision' | 'free-notes';

export default function SelfAnalysisPage() {
  const [activeTab, setActiveTab] = useState<TabType>('episodes');
  const [selfAnalysisData, setSelfAnalysisData] = useState<SelfAnalysisData>({
    episodes: [],
    values: null,
    strengths: [],
    weaknesses: [],
    vision: null,
    freeNotes: [],
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // データ読み込み
  useEffect(() => {
    const data = loadSelfAnalysisData();
    setSelfAnalysisData(data);
    setIsLoaded(true);
  }, []);

  // データ保存
  useEffect(() => {
    if (isLoaded) {
      saveSelfAnalysisData(selfAnalysisData);
    }
  }, [selfAnalysisData, isLoaded]);

  const tabs = [
    { id: 'episodes' as TabType, label: 'エピソード', icon: Lightbulb, description: 'ガクチカ・成功体験・挫折' },
    { id: 'values' as TabType, label: '価値観', icon: Sparkles, description: 'モチベーション・人生の軸' },
    { id: 'strengths' as TabType, label: '強み・弱み', icon: TrendingUp, description: '具体的な根拠とセット' },
    { id: 'vision' as TabType, label: '将来ビジョン', icon: Target, description: 'キャリアプラン' },
    { id: 'free-notes' as TabType, label: '自由メモ', icon: StickyNote, description: '思考・気づき・何でも' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <Lightbulb className="w-8 h-8 text-purple-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">自己分析</h1>
                <p className="text-sm text-gray-600">あなたの「素材」を体系的に管理</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* タブナビゲーション */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-px bg-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`p-4 text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-purple-50 border-b-2 border-purple-600'
                      : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-purple-600' : 'text-gray-400'}`} />
                    <span className={`font-medium ${activeTab === tab.id ? 'text-purple-600' : 'text-gray-900'}`}>
                      {tab.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{tab.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* タブコンテンツ */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {activeTab === 'episodes' && (
            <EpisodesManager
              episodes={selfAnalysisData.episodes}
              onChange={(episodes) =>
                setSelfAnalysisData({ ...selfAnalysisData, episodes })
              }
            />
          )}

          {activeTab === 'values' && (
            <ValuesManager
              values={selfAnalysisData.values}
              onChange={(values) =>
                setSelfAnalysisData({ ...selfAnalysisData, values })
              }
            />
          )}

          {activeTab === 'strengths' && (
            <StrengthsManager
              strengths={selfAnalysisData.strengths}
              weaknesses={selfAnalysisData.weaknesses}
              onStrengthsChange={(strengths) =>
                setSelfAnalysisData({ ...selfAnalysisData, strengths })
              }
              onWeaknessesChange={(weaknesses) =>
                setSelfAnalysisData({ ...selfAnalysisData, weaknesses })
              }
            />
          )}

          {activeTab === 'vision' && (
            <VisionManager
              vision={selfAnalysisData.vision}
              onChange={(vision) =>
                setSelfAnalysisData({ ...selfAnalysisData, vision })
              }
            />
          )}

          {activeTab === 'free-notes' && (
            <FreeNotesManager
              notes={selfAnalysisData.freeNotes || []}
              onChange={(freeNotes) =>
                setSelfAnalysisData({ ...selfAnalysisData, freeNotes })
              }
            />
          )}
        </div>
      </main>
    </div>
  );
}
