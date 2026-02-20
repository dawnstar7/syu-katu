'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Filter, Building2, Calendar as CalendarIcon, List, Lightbulb } from 'lucide-react';
import Link from 'next/link';
import type { Company, SelectionStatus, CalendarEvent, SelfAnalysisData } from '@/types';
import { STATUS_LABELS, STATUS_COLORS } from '@/types';
import CompanyModal from '@/components/CompanyModal';
import Calendar from '@/components/Calendar';
import UpcomingEvents from '@/components/UpcomingEvents';
import EventDetailModal from '@/components/EventDetailModal';
import AuthButton from '@/components/AuthButton';
import { useAuth } from '@/contexts/AuthContext';
import { getCompanies, saveCompany, deleteCompany as deleteCompanyFromFirestore } from '@/lib/firestore';
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
  const [currentView, setCurrentView] = useState<'list' | 'calendar'>('list');
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
        const loadedCompanies = await getCompanies(user.uid);
        setCompanies(loadedCompanies);
      } catch (error) {
        console.error('データの読み込みに失敗しました:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    if (!authLoading) {
      loadData();
    }
  }, [user, authLoading]);

  // 自己分析データをLocalStorageから読み込む
  useEffect(() => {
    try {
      const saved = localStorage.getItem('selfAnalysisData');
      if (saved) {
        setSelfAnalysis(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

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
                className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ビュー切り替えタブ */}
        <div className="flex gap-2 mb-6">
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* 検索バー */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="企業名、業界で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-gray-900 placeholder:text-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* ステータスフィルター */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as SelectionStatus | 'all')}
                className="px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">すべてのステータス</option>
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        )}

        {/* 統計情報（リストビューのみ） */}
        {currentView === 'list' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">総企業数</p>
            <p className="text-2xl font-bold text-gray-900">{companies.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">選考中</p>
            <p className="text-2xl font-bold text-blue-600">
              {companies.filter((c) =>
                ['es_writing', 'es_submitted', 'document_screening', 'interview_1', 'interview_2', 'interview_3', 'interview_final'].includes(c.currentStatus)
              ).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">内定</p>
            <p className="text-2xl font-bold text-green-600">
              {companies.filter((c) => c.currentStatus === 'offer').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">不合格</p>
            <p className="text-2xl font-bold text-red-600">
              {companies.filter((c) => c.currentStatus === 'rejected').length}
            </p>
          </div>
        </div>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredCompanies.map((company) => {
              // 直近の予定を取得
              const upcomingStep = company.selectionSteps
                .filter(step => step.scheduledDate && new Date(step.scheduledDate) >= new Date())
                .sort((a, b) => new Date(a.scheduledDate!).getTime() - new Date(b.scheduledDate!).getTime())[0];

              return (
                <div
                  key={company.id}
                  onClick={() => handleEditCompany(company)}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all cursor-pointer"
                >
                  {/* 企業名とステータス */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="text-base font-bold text-gray-900 line-clamp-2 flex-1">
                      {company.name}
                    </h3>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${STATUS_COLORS[company.currentStatus]}`}>
                      {STATUS_LABELS[company.currentStatus]}
                    </span>
                  </div>

                  {/* 業界・職種 */}
                  <div className="space-y-1 mb-3">
                    {company.industry && (
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <span className="text-gray-400">📊</span>
                        {company.industry}
                      </p>
                    )}
                    {company.jobType && (
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <span className="text-gray-400">💼</span>
                        {company.jobType}
                      </p>
                    )}
                  </div>

                  {/* 直近の予定 */}
                  {upcomingStep && (
                    <div className="bg-blue-50 rounded-lg px-3 py-2 mb-3">
                      <p className="text-xs text-blue-600 font-medium mb-1">直近の予定</p>
                      <p className="text-sm text-gray-900 font-medium">{upcomingStep.name}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {format(new Date(upcomingStep.scheduledDate!), 'M月d日 HH:mm')}
                      </p>
                    </div>
                  )}

                  {/* 選考進捗 */}
                  {company.selectionSteps.length > 0 && (
                    <div className="text-xs text-gray-500">
                      選考ステップ: {company.selectionSteps.filter(s => s.status === 'completed').length}/{company.selectionSteps.length} 完了
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
        )}
      </main>

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
