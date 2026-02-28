'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Filter, Building2, Calendar as CalendarIcon, List, Lightbulb, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import type { Company, SelectionStatus, CalendarEvent, SelfAnalysisData, CompanyAnalysis } from '@/types';
import { STATUS_LABELS, STATUS_COLORS } from '@/types';
import CompanyModal from '@/components/CompanyModal';
import Calendar from '@/components/Calendar';
import ScheduleTimeline from '@/components/ScheduleTimeline';
import UpcomingEvents from '@/components/UpcomingEvents';
import EventDetailModal from '@/components/EventDetailModal';
import AuthButton from '@/components/AuthButton';
import { useAuth } from '@/contexts/AuthContext';
import { getCompanies, saveCompany, deleteCompany as deleteCompanyFromFirestore, getSelfAnalysis } from '@/lib/firestore';
import { loadSelfAnalysisData } from '@/lib/selfAnalysisStorage';
import { format } from 'date-fns';

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selfAnalysis, setSelfAnalysis] = useState<SelfAnalysisData>({
    episodes: [],
    values: null,
    strengths: [],
    weaknesses: [],
    vision: null,
    freeNotes: [],
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<SelectionStatus | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | undefined>(undefined);
  const [currentView, setCurrentView] = useState<'schedule' | 'list' | 'calendar'>(() => {
    if (typeof window !== 'undefined') {
      const v = new URLSearchParams(window.location.search).get('view');
      if (v === 'list' || v === 'calendar') return v;
    }
    return 'schedule';
  });
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Firestoreからデータを読み込む
  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setCompanies([]);
        setIsLoaded(true);
        return;
      }

      try {
        // 企業データと自己分析データを並行取得
        const [loadedCompanies, loadedSelfAnalysis] = await Promise.all([
          getCompanies(user.uid),
          getSelfAnalysis(user.uid),
        ]);
        setCompanies(loadedCompanies);
        setSelfAnalysis(loadedSelfAnalysis ?? loadSelfAnalysisData());
      } catch (error) {
        console.error('データの読み込みに失敗しました:', error);
        setSelfAnalysis(loadSelfAnalysisData());
      } finally {
        setIsLoaded(true);
      }
    };

    if (!authLoading) {
      loadData();
    }
  }, [user, authLoading]);

  const handleSaveCompany = async (companyData: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;

    try {
      let updatedCompany: Company;

      if (selectedCompany) {
        // 既存企業の更新
        updatedCompany = {
          ...companyData,
          id: selectedCompany.id,
          createdAt: selectedCompany.createdAt,
          updatedAt: new Date(),
        };
        await saveCompany(user.uid, updatedCompany);
        setCompanies(companies.map(c => c.id === selectedCompany.id ? updatedCompany : c));
      } else {
        // 新規企業の追加
        updatedCompany = {
          ...companyData,
          id: Date.now().toString(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await saveCompany(user.uid, updatedCompany);
        setCompanies([...companies, updatedCompany]);
      }

      setSelectedCompany(undefined);
    } catch (error) {
      console.error('保存に失敗しました:', error);
      alert('保存に失敗しました。もう一度お試しください。');
    }
  };

  // AI企業研究完了時の即時自動保存
  const handleAutoSaveAnalysis = async (companyId: string, analysis: CompanyAnalysis) => {
    if (!user) return;
    const target = companies.find(c => c.id === companyId);
    if (!target) return;
    try {
      const updated: Company = {
        ...target,
        companyAnalysis: analysis,
        updatedAt: new Date(),
      };
      await saveCompany(user.uid, updated);
      setCompanies(prev => prev.map(c => c.id === companyId ? updated : c));
      setSelectedCompany(updated);
    } catch (error) {
      console.error('自動保存に失敗しました:', error);
    }
  };

  const handleAddCompany = () => {
    setSelectedCompany(undefined);
    setIsModalOpen(true);
  };

  const handleEditCompany = (company: Company) => {
    setSelectedCompany(company);
    setIsModalOpen(true);
  };

  const handleDeleteCompany = async (companyId: string) => {
    if (!user) return;

    if (window.confirm('この企業を削除してもよろしいですか？')) {
      try {
        await deleteCompanyFromFirestore(user.uid, companyId);
        setCompanies(companies.filter(c => c.id !== companyId));
        setIsModalOpen(false);
        setSelectedCompany(undefined);
      } catch (error) {
        console.error('削除に失敗しました:', error);
        alert('削除に失敗しました。もう一度お試しください。');
      }
    }
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  };

  const handleEditCompanyFromEvent = () => {
    if (selectedEvent) {
      const company = companies.find(c => c.id === selectedEvent.companyId);
      if (company) {
        handleEditCompany(company);
      }
    }
  };

  // フィルタリングされた企業リスト
  const filteredCompanies = companies.filter((company) => {
    const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.industry?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || company.currentStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // 統計
  const inProgressCount = companies.filter((c) =>
    ['es_writing', 'es_submitted', 'document_screening', 'interview_1', 'interview_2', 'interview_3', 'interview_final'].includes(c.currentStatus)
  ).length;
  const offerCount = companies.filter((c) => c.currentStatus === 'offer').length;
  const rejectedCount = companies.filter((c) => c.currentStatus === 'rejected').length;

  // カレンダーイベントを生成
  const calendarEvents = useMemo(() => {
    const events: CalendarEvent[] = [];

    companies.forEach(company => {
      company.selectionSteps.forEach(step => {
        // 締切日のイベント
        if (step.deadline) {
          events.push({
            id: `${company.id}-${step.id}-deadline`,
            companyId: company.id,
            companyName: company.name,
            title: `${step.name} 締切`,
            date: new Date(step.deadline),
            type: 'deadline',
            stepId: step.id,
            notes: step.notes,
          });
        }

        // 実施予定日のイベント
        if (step.scheduledDate) {
          events.push({
            id: `${company.id}-${step.id}-scheduled`,
            companyId: company.id,
            companyName: company.name,
            title: step.name,
            date: new Date(step.scheduledDate),
            type: step.name.includes('面接') ? 'interview' : 'event',
            stepId: step.id,
            notes: step.notes,
          });
        }
      });
    });

    return events;
  }, [companies]);

  // ログイン画面
  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <Building2 className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">就活管理アプリ</h1>
            <p className="text-gray-600">
              就職活動を効率的に管理しましょう
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <h2 className="font-semibold text-gray-900 mb-2">📊 主な機能</h2>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• 企業情報の一括管理</li>
                <li>• 選考ステップの進捗管理</li>
                <li>• カレンダーでスケジュール確認</li>
                <li>• AI自己分析コーチ</li>
              </ul>
            </div>

            <div className="pt-4">
              <AuthButton />
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              ログインすることで、すべてのデバイスから<br />
              データにアクセスできます
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ローディング画面
  if (authLoading || !isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">就活管理</h1>
            </div>
            <div className="flex items-center gap-3">
              <AuthButton />
              <Link
                href="/self-analysis"
                className="hidden sm:flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Lightbulb className="w-5 h-5" />
                <span className="hidden sm:inline">自己分析</span>
              </Link>
              <button
                onClick={handleAddCompany}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">企業を追加</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        {/* ビュー切り替えタブ（デスクトップのみ） */}
        <div className="hidden md:flex gap-2 mb-6">
          <button
            onClick={() => setCurrentView('schedule')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              currentView === 'schedule'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <CalendarIcon className="w-5 h-5" />
            スケジュール
          </button>
          <button
            onClick={() => setCurrentView('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              currentView === 'list'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <List className="w-5 h-5" />
            企業リスト
          </button>
          <button
            onClick={() => setCurrentView('calendar')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              currentView === 'calendar'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <CalendarIcon className="w-5 h-5" />
            カレンダー
          </button>
        </div>

        {/* 検索とフィルター（リストビューのみ） */}
        {currentView === 'list' && (
          <div className="flex gap-2 mb-3">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="企業名・業界で検索"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as SelectionStatus | 'all')}
              className="px-2 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">すべて</option>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        )}

        {/* 統計情報（リストビューのみ） */}
        {currentView === 'list' && (
          <>
            {/* モバイル：1行コンパクト */}
            <div className="flex items-center gap-2 text-xs mb-3 sm:hidden">
              <span className="text-gray-500">全 <span className="font-bold text-gray-800">{companies.length}</span> 社</span>
              <span className="text-gray-300">|</span>
              <span className="text-gray-500">選考中 <span className="font-bold text-blue-600">{inProgressCount}</span></span>
              <span className="text-gray-300">|</span>
              <span className="text-gray-500">内定 <span className="font-bold text-green-600">{offerCount}</span></span>
              <span className="text-gray-300">|</span>
              <span className="text-gray-500">不合格 <span className="font-bold text-red-500">{rejectedCount}</span></span>
            </div>
            {/* デスクトップ：4カード */}
            <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <p className="text-sm text-gray-600 mb-1">総企業数</p>
                <p className="text-2xl font-bold text-gray-900">{companies.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <p className="text-sm text-gray-600 mb-1">選考中</p>
                <p className="text-2xl font-bold text-blue-600">{inProgressCount}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <p className="text-sm text-gray-600 mb-1">内定</p>
                <p className="text-2xl font-bold text-green-600">{offerCount}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <p className="text-sm text-gray-600 mb-1">不合格</p>
                <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
              </div>
            </div>
          </>
        )}

        {/* スケジュールビュー */}
        {currentView === 'schedule' && (
          <ScheduleTimeline events={calendarEvents} onEventClick={handleEventClick} />
        )}

        {/* カレンダービュー */}
        {currentView === 'calendar' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Calendar
                events={calendarEvents}
                onEventClick={handleEventClick}
              />
            </div>
            <div>
              <UpcomingEvents
                events={calendarEvents}
                onEventClick={handleEventClick}
              />
            </div>
          </div>
        )}

        {/* 企業リスト（リストビューのみ） */}
        {currentView === 'list' && (
          filteredCompanies.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {companies.length === 0 ? '企業がありません' : '該当する企業がありません'}
            </h3>
            <p className="text-gray-600 mb-6">
              {companies.length === 0
                ? '「企業を追加」ボタンから企業情報を登録しましょう'
                : '検索条件を変更してみてください'
              }
            </p>
          </div>
        ) : (
          <>
            {/* モバイル：コンパクトリスト */}
            <div className="sm:hidden bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100">
              {filteredCompanies.map((company) => {
                const upcomingStep = company.selectionSteps
                  .filter(step => step.scheduledDate && new Date(step.scheduledDate) >= new Date())
                  .sort((a, b) => new Date(a.scheduledDate!).getTime() - new Date(b.scheduledDate!).getTime())[0];
                const subText = [company.industry, upcomingStep?.name].filter(Boolean).join(' · ');
                return (
                  <button
                    key={company.id}
                    type="button"
                    onClick={() => handleEditCompany(company)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left active:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-gray-900 truncate flex-1">{company.name}</span>
                        <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[company.currentStatus]}`}>
                          {STATUS_LABELS[company.currentStatus]}
                        </span>
                      </div>
                      {subText && (
                        <p className="text-xs text-gray-400 mt-0.5 truncate">{subText}</p>
                      )}
                    </div>
                    <ChevronRight className="flex-shrink-0 w-4 h-4 text-gray-300" />
                  </button>
                );
              })}
            </div>

            {/* デスクトップ：カードグリッド */}
            <div className="hidden sm:grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredCompanies.map((company) => {
                const upcomingStep = company.selectionSteps
                  .filter(step => step.scheduledDate && new Date(step.scheduledDate) >= new Date())
                  .sort((a, b) => new Date(a.scheduledDate!).getTime() - new Date(b.scheduledDate!).getTime())[0];
                return (
                  <div
                    key={company.id}
                    onClick={() => handleEditCompany(company)}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className="text-base font-bold text-gray-900 line-clamp-2 flex-1">{company.name}</h3>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${STATUS_COLORS[company.currentStatus]}`}>
                        {STATUS_LABELS[company.currentStatus]}
                      </span>
                    </div>
                    <div className="space-y-1 mb-3">
                      {company.industry && (
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <span className="text-gray-400">📊</span>{company.industry}
                        </p>
                      )}
                      {company.jobType && (
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <span className="text-gray-400">💼</span>{company.jobType}
                        </p>
                      )}
                    </div>
                    {upcomingStep && (
                      <div className="bg-blue-50 rounded-lg px-3 py-2 mb-3">
                        <p className="text-xs text-blue-600 font-medium mb-1">直近の予定</p>
                        <p className="text-sm text-gray-900 font-medium">{upcomingStep.name}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          {format(new Date(upcomingStep.scheduledDate!), 'M月d日 HH:mm')}
                        </p>
                      </div>
                    )}
                    {company.selectionSteps.length > 0 && (
                      <div className="text-xs text-gray-500">
                        選考ステップ: {company.selectionSteps.filter(s => s.status === 'completed').length}/{company.selectionSteps.length} 完了
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )
        )}
      </main>

      {/* ボトムナビゲーション（スマホのみ） */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-200 md:hidden">
        <div className="flex">
          <button
            onClick={() => setCurrentView('schedule')}
            className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
              currentView === 'schedule' ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            <CalendarIcon className="w-5 h-5" />
            <span className="text-xs font-medium">スケジュール</span>
          </button>
          <button
            onClick={() => setCurrentView('list')}
            className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
              currentView === 'list' ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            <Building2 className="w-5 h-5" />
            <span className="text-xs font-medium">企業</span>
          </button>
          <Link
            href="/self-analysis"
            className="flex-1 flex flex-col items-center gap-1 py-3 text-gray-500 transition-colors hover:text-purple-600"
          >
            <Lightbulb className="w-5 h-5" />
            <span className="text-xs font-medium">自己分析</span>
          </Link>
        </div>
      </nav>

      <CompanyModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCompany(undefined);
        }}
        onSave={handleSaveCompany}
        onDelete={handleDeleteCompany}
        company={selectedCompany}
        selfAnalysis={selfAnalysis}
        onAutoSaveAnalysis={handleAutoSaveAnalysis}
      />

      <EventDetailModal
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
        onEditCompany={handleEditCompanyFromEvent}
      />
    </div>
  );
}
