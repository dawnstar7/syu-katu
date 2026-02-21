'use client';

import { useState, useEffect } from 'react';
import { X, Sparkles, FileText, MessageSquare, Briefcase, Settings } from 'lucide-react';
import type { Company, SelectionStatus, SelectionStep, ESQuestion, SubmittedDocument, InterviewLog, CompanyAnalysis, AdministrativeInfo, SelfAnalysisData } from '@/types';
import { STATUS_LABELS } from '@/types';
import SelectionStepsManager from './SelectionStepsManager';
import ESManager from './ESManager';
import InterviewLogManager from './InterviewLogManager';
import CompanyAnalysisForm from './CompanyAnalysisForm';
import AdministrativeInfoForm from './AdministrativeInfoForm';

interface CompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (company: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDelete?: (companyId: string) => void;
  company?: Company;
  selfAnalysis?: SelfAnalysisData;
}

type TabType = 'basic' | 'es' | 'interview' | 'analysis' | 'admin';

export default function CompanyModal({ isOpen, onClose, onSave, onDelete, company, selfAnalysis }: CompanyModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('basic');

  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    employeeCount: '',
    location: '',
    website: '',
    description: '',
    jobType: '',
    salary: '',
    workLocation: '',
    benefits: '',
    currentStatus: 'interested' as SelectionStatus,
    priority: 'medium' as 'high' | 'medium' | 'low',
    favorite: false,
    notes: '',
    webTestType: '',
  });

  const [selectionSteps, setSelectionSteps] = useState<SelectionStep[]>([]);
  const [esQuestions, setEsQuestions] = useState<ESQuestion[]>([]);
  const [submittedDocuments, setSubmittedDocuments] = useState<SubmittedDocument[]>([]);
  const [interviewLogs, setInterviewLogs] = useState<InterviewLog[]>([]);
  const [companyAnalysis, setCompanyAnalysis] = useState<CompanyAnalysis>({});
  const [administrativeInfo, setAdministrativeInfo] = useState<AdministrativeInfo>({});

  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // AIで企業情報を自動収集
  const fetchCompanyInfo = async (companyName: string) => {
    if (!companyName.trim()) return;

    setIsLoadingAI(true);
    setAiError(null);

    try {
      const response = await fetch('/api/company-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ companyName }),
      });

      if (!response.ok) {
        throw new Error('企業情報の取得に失敗しました');
      }

      const data = await response.json();

      // 取得したデータでフォームを更新（企業名は既に入力されているのでそのまま）
      setFormData((prev) => ({
        ...prev,
        name: data.name || prev.name,
        industry: data.industry || prev.industry,
        employeeCount: data.employeeCount || prev.employeeCount,
        location: data.location || prev.location,
        website: data.website || prev.website,
        description: data.description || prev.description,
        jobType: data.jobType || prev.jobType,
        salary: data.salary || prev.salary,
        workLocation: data.workLocation || prev.workLocation,
        benefits: data.benefits || prev.benefits,
      }));
    } catch (error) {
      console.error('AI企業情報取得エラー:', error);
      setAiError('企業情報の取得に失敗しました。手動で入力してください。');
    } finally {
      setIsLoadingAI(false);
    }
  };

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name,
        industry: company.industry || '',
        employeeCount: company.employeeCount || '',
        location: company.location || '',
        website: company.website || '',
        description: company.description || '',
        jobType: company.jobType || '',
        salary: company.salary || '',
        workLocation: company.workLocation || '',
        benefits: company.benefits || '',
        currentStatus: company.currentStatus,
        priority: company.priority,
        favorite: company.favorite,
        notes: company.notes || '',
        webTestType: company.webTestType || '',
      });
      setSelectionSteps(company.selectionSteps);
      setEsQuestions(company.esQuestions || []);
      setSubmittedDocuments(company.submittedDocuments || []);
      setInterviewLogs(company.interviewLogs || []);
      setCompanyAnalysis(company.companyAnalysis || {});
      setAdministrativeInfo(company.administrativeInfo || {});
    } else {
      setFormData({
        name: '',
        industry: '',
        employeeCount: '',
        location: '',
        website: '',
        description: '',
        jobType: '',
        salary: '',
        workLocation: '',
        benefits: '',
        currentStatus: 'interested',
        priority: 'medium',
        favorite: false,
        notes: '',
        webTestType: '',
      });
      setSelectionSteps([]);
      setEsQuestions([]);
      setSubmittedDocuments([]);
      setInterviewLogs([]);
      setCompanyAnalysis({});
      setAdministrativeInfo({});
    }
    setActiveTab('basic');
  }, [company, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      selectionSteps,
      esQuestions,
      submittedDocuments,
      interviewLogs,
      companyAnalysis,
      administrativeInfo,
    });
    onClose();
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'basic' as TabType, label: '基本情報', icon: Briefcase },
    { id: 'es' as TabType, label: 'ES・提出書類', icon: FileText },
    { id: 'interview' as TabType, label: '面接・選考', icon: MessageSquare },
    { id: 'analysis' as TabType, label: '企業分析', icon: Sparkles },
    { id: 'admin' as TabType, label: '事務管理', icon: Settings },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* ヘッダー */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 border-b border-blue-800 px-6 py-5 flex items-center justify-between rounded-t-lg">
          <h2 className="text-2xl font-bold text-white">
            {company ? '企業情報を編集' : '企業を追加'}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-blue-100 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* タブナビゲーション */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* 基本情報タブ */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                {/* AI自動収集バナー */}
                {!company && (
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          AI自動収集機能
                        </p>
                        <p className="text-xs text-gray-600 mb-3">
                          企業名を入力して「AI自動入力」ボタンを押すと、AIが企業情報を自動で収集して入力します
                        </p>
                        <button
                          type="button"
                          onClick={() => fetchCompanyInfo(formData.name)}
                          disabled={!formData.name.trim() || isLoadingAI}
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>{isLoadingAI ? 'AI処理中...' : 'AI自動入力'}</span>
                        </button>
                        {aiError && (
                          <p className="text-xs text-red-600 mt-2">{aiError}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">企業情報</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-base font-medium text-gray-900 mb-2">
                        企業名 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        disabled={isLoadingAI}
                        className="w-full px-4 py-3 text-base text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        placeholder="株式会社〇〇"
                      />
                    </div>

                    <div>
                      <label className="block text-base font-medium text-gray-900 mb-2">業界</label>
                      <input
                        type="text"
                        value={formData.industry}
                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                        disabled={isLoadingAI}
                        className="w-full px-4 py-3 text-base text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        placeholder="IT、製造業、金融など"
                      />
                    </div>

                    <div>
                      <label className="block text-base font-medium text-gray-900 mb-2">従業員数</label>
                      <input
                        type="text"
                        value={formData.employeeCount}
                        onChange={(e) => setFormData({ ...formData, employeeCount: e.target.value })}
                        className="w-full px-4 py-3 text-base text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        disabled={isLoadingAI}
                        placeholder="100名、1000名以上など"
                      />
                    </div>

                    <div>
                      <label className="block text-base font-medium text-gray-900 mb-2">本社所在地</label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full px-4 py-3 text-base text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        disabled={isLoadingAI}
                        placeholder="東京都渋谷区"
                      />
                    </div>

                    <div>
                      <label className="block text-base font-medium text-gray-900 mb-2">ホームページ</label>
                      <input
                        type="url"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        className="w-full px-4 py-3 text-base text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        disabled={isLoadingAI}
                        placeholder="https://example.com"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-base font-medium text-gray-900 mb-2">企業説明</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 text-base text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        disabled={isLoadingAI}
                        placeholder="企業の特徴や事業内容など"
                      />
                    </div>
                  </div>
                </div>

                {/* 募集要項 */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">募集要項</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-base font-medium text-gray-900 mb-2">職種</label>
                      <input
                        type="text"
                        value={formData.jobType}
                        onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                        className="w-full px-4 py-3 text-base text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        disabled={isLoadingAI}
                        placeholder="エンジニア、営業など"
                      />
                    </div>

                    <div>
                      <label className="block text-base font-medium text-gray-900 mb-2">給与</label>
                      <input
                        type="text"
                        value={formData.salary}
                        onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                        className="w-full px-4 py-3 text-base text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        disabled={isLoadingAI}
                        placeholder="月給25万円〜など"
                      />
                    </div>

                    <div>
                      <label className="block text-base font-medium text-gray-900 mb-2">勤務地</label>
                      <input
                        type="text"
                        value={formData.workLocation}
                        onChange={(e) => setFormData({ ...formData, workLocation: e.target.value })}
                        className="w-full px-4 py-3 text-base text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        disabled={isLoadingAI}
                        placeholder="東京都、大阪府など"
                      />
                    </div>

                    <div>
                      <label className="block text-base font-medium text-gray-900 mb-2">福利厚生</label>
                      <input
                        type="text"
                        value={formData.benefits}
                        onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                        className="w-full px-4 py-3 text-base text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        disabled={isLoadingAI}
                        placeholder="社会保険完備、リモートワーク可など"
                      />
                    </div>
                  </div>
                </div>

                {/* 選考情報 */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">選考情報</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-base font-medium text-gray-900 mb-2">
                        現在のステータス
                      </label>
                      <select
                        value={formData.currentStatus}
                        onChange={(e) => setFormData({ ...formData, currentStatus: e.target.value as SelectionStatus })}
                        className="w-full px-4 py-3 text-base text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        disabled={isLoadingAI}
                      >
                        {Object.entries(STATUS_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-base font-medium text-gray-900 mb-2">優先度</label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'high' | 'medium' | 'low' })}
                        className="w-full px-4 py-3 text-base text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        disabled={isLoadingAI}
                      >
                        <option value="high">高</option>
                        <option value="medium">中</option>
                        <option value="low">低</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.favorite}
                          onChange={(e) => setFormData({ ...formData, favorite: e.target.checked })}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-base font-medium text-gray-900">お気に入り</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* 選考ステップ */}
                <div>
                  <SelectionStepsManager steps={selectionSteps} onChange={setSelectionSteps} />
                </div>

                {/* メモ */}
                <div>
                  <label className="block text-base font-medium text-gray-900 mb-2">全体メモ</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 text-base text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="気になったことや選考対策のメモなど"
                  />
                </div>
              </div>
            )}

            {/* ES・提出書類タブ */}
            {activeTab === 'es' && (
              <ESManager
                esQuestions={esQuestions}
                onEsQuestionsChange={setEsQuestions}
                submittedDocuments={submittedDocuments}
                onSubmittedDocumentsChange={setSubmittedDocuments}
                selfAnalysis={selfAnalysis}
                company={{ ...formData, companyAnalysis, selectionSteps, esQuestions, submittedDocuments, interviewLogs, administrativeInfo }}
              />
            )}

            {/* 面接・選考タブ */}
            {activeTab === 'interview' && (
              <InterviewLogManager
                interviewLogs={interviewLogs}
                onInterviewLogsChange={setInterviewLogs}
                webTestType={formData.webTestType}
                onWebTestTypeChange={(value) => setFormData({ ...formData, webTestType: value })}
              />
            )}

            {/* 企業分析タブ */}
            {activeTab === 'analysis' && (
              <CompanyAnalysisForm
                analysis={companyAnalysis}
                onChange={setCompanyAnalysis}
                companyName={formData.name}
              />
            )}

            {/* 事務管理タブ */}
            {activeTab === 'admin' && (
              <AdministrativeInfoForm
                info={administrativeInfo}
                onChange={setAdministrativeInfo}
              />
            )}
          </div>

          {/* フッターボタン */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3 justify-between">
            {/* 削除ボタン（編集時のみ表示） */}
            <div>
              {company && onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(company.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  削除
                </button>
              )}
            </div>

            {/* キャンセル・保存ボタン */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {company ? '更新' : '追加'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
