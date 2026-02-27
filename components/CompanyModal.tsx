'use client';

import { useState, useEffect } from 'react';
import { X, Sparkles, FileText, Search, ChevronDown, ChevronUp, Eye, EyeOff, Building2 } from 'lucide-react';
import type { Company, SelectionStatus, SelectionStep, ESQuestion, SubmittedDocument, InterviewLog, CompanyAnalysis, AdministrativeInfo, SelfAnalysisData } from '@/types';
import { STATUS_LABELS } from '@/types';
import SelectionStepsManager from './SelectionStepsManager';
import ESManager from './ESManager';
import InterviewLogManager from './InterviewLogManager';
import CompanyAnalysisForm from './CompanyAnalysisForm';

interface CompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (company: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDelete?: (companyId: string) => void;
  company?: Company;
  selfAnalysis?: SelfAnalysisData;
  onAutoSaveAnalysis?: (companyId: string, analysis: CompanyAnalysis) => Promise<void>;
}

type TabType = 'info' | 'es-interview' | 'research';

export default function CompanyModal({ isOpen, onClose, onSave, onDelete, company, selfAnalysis, onAutoSaveAnalysis }: CompanyModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [showDetails, setShowDetails] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  const fetchCompanyInfo = async (companyName: string) => {
    if (!companyName.trim()) return;
    setIsLoadingAI(true);
    setAiError(null);
    try {
      const response = await fetch('/api/company-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName }),
      });
      if (!response.ok) throw new Error();
      const data = await response.json();
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
      setShowDetails(true);
    } catch {
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
      // 既存企業は詳細がある場合は開いておく
      const hasDetails = !!(company.employeeCount || company.location || company.website || company.description || company.jobType || company.salary);
      setShowDetails(hasDetails);
      const hasAdmin = !!(company.administrativeInfo?.myPageUrl || company.administrativeInfo?.contactName);
      setShowAdmin(hasAdmin);
    } else {
      setFormData({
        name: '', industry: '', employeeCount: '', location: '', website: '', description: '',
        jobType: '', salary: '', workLocation: '', benefits: '',
        currentStatus: 'interested', priority: 'medium', favorite: false, notes: '', webTestType: '',
      });
      setSelectionSteps([]);
      setEsQuestions([]);
      setSubmittedDocuments([]);
      setInterviewLogs([]);
      setCompanyAnalysis({});
      setAdministrativeInfo({});
      setShowDetails(false);
      setShowAdmin(false);
    }
    setActiveTab('info');
  }, [company, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, selectionSteps, esQuestions, submittedDocuments, interviewLogs, companyAnalysis, administrativeInfo });
    onClose();
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'info' as TabType, label: '企業情報', icon: Building2 },
    { id: 'es-interview' as TabType, label: 'ES・面接', icon: FileText },
    { id: 'research' as TabType, label: '企業研究', icon: Search },
  ];

  const inputClass = 'w-full px-4 py-2.5 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">

        {/* ヘッダー */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between rounded-t-lg">
          <h2 className="text-xl font-bold text-white">
            {company ? (formData.name || '企業情報を編集') : '企業を追加'}
          </h2>
          <button onClick={onClose} className="text-white hover:text-blue-100">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* タブ */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
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

        {/* コンテンツ */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6">

            {/* ========== 企業情報タブ ========== */}
            {activeTab === 'info' && (
              <div className="space-y-5">

                {/* AI自動収集（新規時のみ） */}
                {!company && (
                  <div className="flex items-center gap-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <Sparkles className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-600">企業名を入力してAIに基本情報を自動収集させられます</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => fetchCompanyInfo(formData.name)}
                      disabled={!formData.name.trim() || isLoadingAI}
                      className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      {isLoadingAI ? '取得中...' : 'AI自動入力'}
                    </button>
                  </div>
                )}
                {aiError && <p className="text-xs text-red-600">{aiError}</p>}

                {/* 必須項目（常時表示） */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-900 mb-1.5">
                      企業名 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={isLoadingAI}
                      className={inputClass}
                      placeholder="株式会社〇〇"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1.5">業界</label>
                    <input type="text" value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      disabled={isLoadingAI} className={inputClass} placeholder="IT、製造業、金融など" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1.5">ステータス</label>
                    <select value={formData.currentStatus}
                      onChange={(e) => setFormData({ ...formData, currentStatus: e.target.value as SelectionStatus })}
                      className={inputClass} disabled={isLoadingAI}>
                      {Object.entries(STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1.5">優先度</label>
                    <select value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'high' | 'medium' | 'low' })}
                      className={inputClass} disabled={isLoadingAI}>
                      <option value="high">高</option>
                      <option value="medium">中</option>
                      <option value="low">低</option>
                    </select>
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={formData.favorite}
                        onChange={(e) => setFormData({ ...formData, favorite: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded" />
                      <span className="text-sm font-medium text-gray-900">⭐ お気に入り</span>
                    </label>
                  </div>
                </div>

                {/* 詳細情報（折りたたみ） */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowDetails(!showDetails)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 text-left"
                  >
                    <span className="text-sm font-medium text-gray-700">詳細情報（従業員数・給与・福利厚生など）</span>
                    {showDetails ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                  </button>
                  {showDetails && (
                    <div className="p-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-1.5">従業員数</label>
                          <input type="text" value={formData.employeeCount}
                            onChange={(e) => setFormData({ ...formData, employeeCount: e.target.value })}
                            disabled={isLoadingAI} className={inputClass} placeholder="1000名以上など" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-1.5">本社所在地</label>
                          <input type="text" value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            disabled={isLoadingAI} className={inputClass} placeholder="東京都渋谷区" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-1.5">ホームページ</label>
                          <input type="url" value={formData.website}
                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                            disabled={isLoadingAI} className={inputClass} placeholder="https://example.com" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-1.5">職種</label>
                          <input type="text" value={formData.jobType}
                            onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                            disabled={isLoadingAI} className={inputClass} placeholder="エンジニア、営業など" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-1.5">給与</label>
                          <input type="text" value={formData.salary}
                            onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                            disabled={isLoadingAI} className={inputClass} placeholder="月給25万円〜など" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-1.5">勤務地</label>
                          <input type="text" value={formData.workLocation}
                            onChange={(e) => setFormData({ ...formData, workLocation: e.target.value })}
                            disabled={isLoadingAI} className={inputClass} placeholder="東京都など" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-900 mb-1.5">福利厚生</label>
                          <input type="text" value={formData.benefits}
                            onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                            disabled={isLoadingAI} className={inputClass} placeholder="社会保険完備、リモートワーク可など" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-900 mb-1.5">企業説明</label>
                          <textarea value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3} disabled={isLoadingAI} className={inputClass}
                            placeholder="企業の特徴や事業内容など" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 選考ステップ */}
                <SelectionStepsManager steps={selectionSteps} onChange={setSelectionSteps} />

                {/* 事務メモ（折りたたみ） */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowAdmin(!showAdmin)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 text-left"
                  >
                    <span className="text-sm font-medium text-gray-700">事務メモ（マイページ・採用担当者連絡先）</span>
                    {showAdmin ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                  </button>
                  {showAdmin && (
                    <div className="p-4 space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">マイページURL</label>
                        <input type="url" value={administrativeInfo.myPageUrl || ''}
                          onChange={(e) => setAdministrativeInfo({ ...administrativeInfo, myPageUrl: e.target.value })}
                          className={inputClass} placeholder="https://example.com/mypage" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">マイページID</label>
                        <input type="text" value={administrativeInfo.myPageId || ''}
                          onChange={(e) => setAdministrativeInfo({ ...administrativeInfo, myPageId: e.target.value })}
                          className={inputClass} placeholder="user@example.com" autoComplete="off" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">マイページパスワード</label>
                        <div className="relative">
                          <input type={showPassword ? 'text' : 'password'}
                            value={administrativeInfo.myPagePassword || ''}
                            onChange={(e) => setAdministrativeInfo({ ...administrativeInfo, myPagePassword: e.target.value })}
                            className={`${inputClass} pr-10`} placeholder="••••••••" autoComplete="new-password" />
                          <button type="button" onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="pt-1 border-t border-gray-100">
                        <p className="text-xs text-gray-500 mb-2">採用担当者</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">担当者名</label>
                            <input type="text" value={administrativeInfo.contactName || ''}
                              onChange={(e) => setAdministrativeInfo({ ...administrativeInfo, contactName: e.target.value })}
                              className={inputClass} placeholder="山田太郎" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">メール</label>
                            <input type="email" value={administrativeInfo.contactEmail || ''}
                              onChange={(e) => setAdministrativeInfo({ ...administrativeInfo, contactEmail: e.target.value })}
                              className={inputClass} placeholder="recruit@example.com" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">電話</label>
                            <input type="tel" value={administrativeInfo.contactPhone || ''}
                              onChange={(e) => setAdministrativeInfo({ ...administrativeInfo, contactPhone: e.target.value })}
                              className={inputClass} placeholder="03-1234-5678" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 全体メモ */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1.5">メモ</label>
                  <textarea value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3} className={inputClass}
                    placeholder="気になったことや選考対策のメモなど" />
                </div>
              </div>
            )}

            {/* ========== ES・面接タブ ========== */}
            {activeTab === 'es-interview' && (
              <div className="space-y-6">
                <ESManager
                  esQuestions={esQuestions}
                  onEsQuestionsChange={setEsQuestions}
                  submittedDocuments={submittedDocuments}
                  onSubmittedDocumentsChange={setSubmittedDocuments}
                  selfAnalysis={selfAnalysis}
                  company={{ ...formData, companyAnalysis, selectionSteps, esQuestions, submittedDocuments, interviewLogs, administrativeInfo }}
                />
                <div className="border-t border-gray-200 pt-6">
                  <InterviewLogManager
                    interviewLogs={interviewLogs}
                    onInterviewLogsChange={setInterviewLogs}
                    webTestType={formData.webTestType}
                    onWebTestTypeChange={(value) => setFormData({ ...formData, webTestType: value })}
                  />
                </div>
              </div>
            )}

            {/* ========== 企業研究タブ ========== */}
            {activeTab === 'research' && (
              <CompanyAnalysisForm
                analysis={companyAnalysis}
                onChange={async (newAnalysis) => {
                  setCompanyAnalysis(newAnalysis);
                  if (newAnalysis.aiResearch && company?.id && onAutoSaveAnalysis) {
                    await onAutoSaveAnalysis(company.id, newAnalysis);
                  }
                }}
                companyName={formData.name}
              />
            )}
          </div>

          {/* フッター */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3 justify-between">
            <div>
              {company && onDelete && (
                <button type="button" onClick={() => onDelete(company.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">
                  削除
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm">
                キャンセル
              </button>
              <button type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                {company ? '更新' : '追加'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
