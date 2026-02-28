'use client';

import { useState, useEffect } from 'react';
import { Lightbulb, BookOpen, StickyNote, ArrowLeft, ChevronDown, ChevronUp, Sparkles, TrendingUp, Target, Calendar as CalendarIcon, Building2 } from 'lucide-react';
import Link from 'next/link';
import type { SelfAnalysisData } from '@/types';
import { loadSelfAnalysisData, saveSelfAnalysisData } from '@/lib/selfAnalysisStorage';
import EpisodesManager from '@/components/self-analysis/EpisodesManager';
import ValuesManager from '@/components/self-analysis/ValuesManager';
import StrengthsManager from '@/components/self-analysis/StrengthsManager';
import VisionManager from '@/components/self-analysis/VisionManager';
import FreeNotesManager from '@/components/self-analysis/FreeNotesManager';

type TabType = 'self-understanding' | 'episodes' | 'notes';

export default function SelfAnalysisPage() {
  const [activeTab, setActiveTab] = useState<TabType>('self-understanding');
  const [selfAnalysisData, setSelfAnalysisData] = useState<SelfAnalysisData>({
    episodes: [],
    values: null,
    strengths: [],
    weaknesses: [],
    vision: null,
    freeNotes: [],
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // 自己理解タブ内の折りたたみ状態
  const [openSections, setOpenSections] = useState({
    values: true,
    strengths: false,
    vision: false,
  });

  useEffect(() => {
    const data = loadSelfAnalysisData();
    setSelfAnalysisData(data);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveSelfAnalysisData(selfAnalysisData);
    }
  }, [selfAnalysisData, isLoaded]);

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const tabs = [
    { id: 'self-understanding' as TabType, label: '自己理解', icon: Sparkles, description: '価値観・強み弱み・ビジョン' },
    { id: 'episodes' as TabType, label: 'エピソード', icon: BookOpen, description: 'ガクチカ・成功体験・挫折' },
    { id: 'notes' as TabType, label: 'メモ', icon: StickyNote, description: '思考・気づき・何でも' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="hidden sm:flex text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <Lightbulb className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600" />
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">自己分析</h1>
              <p className="text-xs text-gray-500 hidden sm:block">あなたの「素材」を体系的に管理</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-6 pb-24 md:pb-6">

        {/* タブ */}
        <div className="flex gap-1 p-1 bg-white rounded-xl shadow-sm border border-gray-200 mb-3 sm:mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 sm:flex-col sm:gap-1 py-2 sm:py-3 px-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-sm font-medium">{tab.label}</span>
                <span className={`text-xs hidden sm:block ${activeTab === tab.id ? 'text-purple-100' : 'text-gray-400'}`}>
                  {tab.description}
                </span>
              </button>
            );
          })}
        </div>

        {/* コンテンツ */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">

          {/* ===== 自己理解タブ ===== */}
          {activeTab === 'self-understanding' && (
            <div className="divide-y divide-gray-100">

              {/* 価値観・モチベーション */}
              <div>
                <button
                  type="button"
                  onClick={() => toggleSection('values')}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">価値観・モチベーション</p>
                      <p className="text-xs text-gray-500">大切にしていること・人生の軸</p>
                    </div>
                  </div>
                  {openSections.values ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </button>
                {openSections.values && (
                  <div className="px-6 pb-6">
                    <ValuesManager
                      values={selfAnalysisData.values}
                      onChange={(values) => setSelfAnalysisData({ ...selfAnalysisData, values })}
                    />
                  </div>
                )}
              </div>

              {/* 強み・弱み */}
              <div>
                <button
                  type="button"
                  onClick={() => toggleSection('strengths')}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">強み・弱み</p>
                      <p className="text-xs text-gray-500">具体的な根拠とセットで整理</p>
                    </div>
                  </div>
                  {openSections.strengths ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </button>
                {openSections.strengths && (
                  <div className="px-6 pb-6">
                    <StrengthsManager
                      strengths={selfAnalysisData.strengths}
                      weaknesses={selfAnalysisData.weaknesses}
                      onStrengthsChange={(strengths) => setSelfAnalysisData({ ...selfAnalysisData, strengths })}
                      onWeaknessesChange={(weaknesses) => setSelfAnalysisData({ ...selfAnalysisData, weaknesses })}
                    />
                  </div>
                )}
              </div>

              {/* 将来ビジョン */}
              <div>
                <button
                  type="button"
                  onClick={() => toggleSection('vision')}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                      <Target className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">将来ビジョン</p>
                      <p className="text-xs text-gray-500">短期・中期・長期のキャリアプラン</p>
                    </div>
                  </div>
                  {openSections.vision ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </button>
                {openSections.vision && (
                  <div className="px-6 pb-6">
                    <VisionManager
                      vision={selfAnalysisData.vision}
                      onChange={(vision) => setSelfAnalysisData({ ...selfAnalysisData, vision })}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===== エピソードタブ ===== */}
          {activeTab === 'episodes' && (
            <div className="p-6">
              <EpisodesManager
                episodes={selfAnalysisData.episodes}
                onChange={(episodes) => setSelfAnalysisData({ ...selfAnalysisData, episodes })}
              />
            </div>
          )}

          {/* ===== メモタブ ===== */}
          {activeTab === 'notes' && (
            <div className="p-6">
              <FreeNotesManager
                notes={selfAnalysisData.freeNotes || []}
                onChange={(freeNotes) => setSelfAnalysisData({ ...selfAnalysisData, freeNotes })}
              />
            </div>
          )}
        </div>
      </main>

      {/* ボトムナビゲーション（スマホのみ） */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-200 md:hidden">
        <div className="flex">
          <Link
            href="/"
            className="flex-1 flex flex-col items-center gap-1 py-3 text-gray-500 transition-colors hover:text-blue-600"
          >
            <CalendarIcon className="w-5 h-5" />
            <span className="text-xs font-medium">スケジュール</span>
          </Link>
          <Link
            href="/?view=list"
            className="flex-1 flex flex-col items-center gap-1 py-3 text-gray-500 transition-colors hover:text-blue-600"
          >
            <Building2 className="w-5 h-5" />
            <span className="text-xs font-medium">企業</span>
          </Link>
          <span className="flex-1 flex flex-col items-center gap-1 py-3 text-purple-600">
            <Lightbulb className="w-5 h-5" />
            <span className="text-xs font-medium">自己分析</span>
          </span>
        </div>
      </nav>
    </div>
  );
}
