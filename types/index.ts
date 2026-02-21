// 選考ステータス
export type SelectionStatus =
  | 'interested' // 興味あり
  | 'es_writing' // ES作成中
  | 'es_submitted' // ES提出済み
  | 'document_screening' // 書類選考中
  | 'interview_1' // 一次面接
  | 'interview_2' // 二次面接
  | 'interview_3' // 三次面接
  | 'interview_final' // 最終面接
  | 'offer' // 内定
  | 'rejected' // 不合格
  | 'declined'; // 辞退

// 選考ステップ
export interface SelectionStep {
  id: string;
  name: string; // ステップ名（例: 書類選考、一次面接）
  deadline?: Date; // 締切日
  scheduledDate?: Date; // 実施予定日
  completedDate?: Date; // 完了日
  status: 'pending' | 'scheduled' | 'completed' | 'failed';
  notes?: string; // メモ
  order: number; // 表示順序
}

// ES設問と回答
export interface ESQuestion {
  id: string;
  question: string; // 設問内容
  answer: string; // 回答内容
  characterLimit?: number; // 文字数制限
  order: number; // 表示順序
}

// 提出書類
export interface SubmittedDocument {
  id: string;
  name: string; // ファイル名
  type: string; // 種類（ES、履歴書、ポートフォリオなど）
  submittedDate?: Date; // 提出日
  notes?: string; // メモ
}

// 面接ログ
export interface InterviewLog {
  id: string;
  round: string; // 面接回（一次面接、二次面接など）
  date?: Date; // 面接日
  interviewers: InterviewerInfo[]; // 面接官情報
  questions: InterviewQuestion[]; // 質問と回答
  reverseQuestions?: string; // 逆質問内容
  impression?: string; // 全体の印象
  result?: string; // 結果・フィードバック
}

// 面接官情報
export interface InterviewerInfo {
  id: string;
  name?: string; // 名前
  position?: string; // 役職
  department?: string; // 部署
  impression?: string; // 印象
}

// 面接質問
export interface InterviewQuestion {
  id: string;
  question: string; // 質問内容
  answer: string; // 自分の回答
  reaction?: string; // 面接官の反応
  order: number;
}

// AI企業研究結果（保存用）
export interface AIResearchResult {
  researchedAt: Date; // 調査日時
  sources: { url: string; title: string; usedFor: string }[]; // 参照ソース
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
}

// 企業分析メモ
export interface CompanyAnalysis {
  // 自分の主観的な分析
  whyThisCompany?: string; // なぜこの会社か
  employeeImpression?: string; // 社員の印象
  matchingPoints?: string; // 自分とのマッチ度
  concerns?: string; // 懸念点・確認したいこと
  // AI企業研究の結果（自動保存）
  aiResearch?: AIResearchResult;
}

// 事務管理情報
export interface AdministrativeInfo {
  myPageUrl?: string; // マイページURL
  myPageId?: string; // マイページID
  myPagePassword?: string; // マイページパスワード
  contactEmail?: string; // 採用担当者メール
  contactPhone?: string; // 採用担当者電話
  contactName?: string; // 採用担当者名
}

// 企業情報
export interface Company {
  id: string;
  name: string; // 企業名
  industry?: string; // 業界
  employeeCount?: string; // 従業員数
  location?: string; // 本社所在地
  website?: string; // ホームページURL
  description?: string; // 企業説明・要約

  // 募集要項
  jobType?: string; // 職種
  salary?: string; // 給与
  workLocation?: string; // 勤務地
  benefits?: string; // 福利厚生

  // 選考情報
  currentStatus: SelectionStatus; // 現在のステータス
  selectionSteps: SelectionStep[]; // 選考ステップ

  // 提出書類・ES関連
  esQuestions: ESQuestion[]; // ES設問と回答
  submittedDocuments: SubmittedDocument[]; // 提出書類管理

  // 選考プロセス記録
  interviewLogs: InterviewLog[]; // 面接ログ
  webTestType?: string; // Webテストの種類（SPI、玉手箱など）

  // 企業分析
  companyAnalysis: CompanyAnalysis; // 企業分析メモ

  // 事務管理
  administrativeInfo: AdministrativeInfo; // 事務管理情報

  // その他
  priority: 'high' | 'medium' | 'low'; // 優先度
  favorite: boolean; // お気に入り
  notes?: string; // 全体メモ

  // タイムスタンプ
  createdAt: Date;
  updatedAt: Date;
}

// 選考ステータスのラベル
export const STATUS_LABELS: Record<SelectionStatus, string> = {
  interested: '興味あり',
  es_writing: 'ES作成中',
  es_submitted: 'ES提出済み',
  document_screening: '書類選考中',
  interview_1: '一次面接',
  interview_2: '二次面接',
  interview_3: '三次面接',
  interview_final: '最終面接',
  offer: '内定',
  rejected: '不合格',
  declined: '辞退',
};

// 優先度のラベル
export const PRIORITY_LABELS: Record<Company['priority'], string> = {
  high: '高',
  medium: '中',
  low: '低',
};

// ステータスの色
export const STATUS_COLORS: Record<SelectionStatus, string> = {
  interested: 'bg-gray-100 text-gray-700',
  es_writing: 'bg-blue-100 text-blue-700',
  es_submitted: 'bg-blue-200 text-blue-800',
  document_screening: 'bg-yellow-100 text-yellow-700',
  interview_1: 'bg-purple-100 text-purple-700',
  interview_2: 'bg-purple-200 text-purple-800',
  interview_3: 'bg-purple-300 text-purple-900',
  interview_final: 'bg-orange-100 text-orange-700',
  offer: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  declined: 'bg-gray-200 text-gray-600',
};

// カレンダーイベント型
export interface CalendarEvent {
  id: string;
  companyId: string;
  companyName: string;
  title: string;
  date: Date;
  type: 'deadline' | 'interview' | 'event';
  stepId?: string; // 選考ステップと紐付ける場合
  notes?: string;
}

// イベントタイプの色
export const EVENT_TYPE_COLORS: Record<CalendarEvent['type'], string> = {
  deadline: 'bg-red-500',
  interview: 'bg-blue-500',
  event: 'bg-green-500',
};

// イベントタイプのラベル
export const EVENT_TYPE_LABELS: Record<CalendarEvent['type'], string> = {
  deadline: '締切',
  interview: '面接',
  event: 'イベント',
};

// 自己分析エピソード
export interface SelfAnalysisEpisode {
  id: string;
  title: string; // エピソードタイトル
  category: 'gakunika' | 'success' | 'failure' | 'challenge' | 'other'; // カテゴリ
  what: string; // 何をしたか
  why: string; // なぜそれをしたか
  how: string; // どのように行ったか
  result: string; // 結果どうなったか
  learning: string; // 学んだこと
  tags: string[]; // タグ（例: リーダーシップ、チームワーク、課題解決など）
  createdAt: Date;
  updatedAt: Date;
}

// 価値観・モチベーション
export interface ValueAndMotivation {
  id: string;
  importantValues: string; // 大切にしていること
  motivationSource: string; // モチベーションの源泉
  excitingMoments: string; // ワクワクする瞬間
  lifeAxis: string; // 人生の軸
  createdAt: Date;
  updatedAt: Date;
}

// 強み・弱み
export interface StrengthAndWeakness {
  id: string;
  type: 'strength' | 'weakness'; // 強みか弱みか
  name: string; // 名前（例: 論理的思考、忍耐力）
  description: string; // 説明
  evidence: string; // 裏付けとなる具体的な事実・エピソード
  tags: string[]; // タグ
  createdAt: Date;
  updatedAt: Date;
}

// 将来ビジョン
export interface FutureVision {
  id: string;
  shortTerm: string; // 短期（1-3年後）
  midTerm: string; // 中期（5年後）
  longTerm: string; // 長期（10年後）
  socialContribution: string; // 社会への貢献
  idealCareer: string; // 理想のキャリア
  createdAt: Date;
  updatedAt: Date;
}

// 自由メモノート
export interface FreeNote {
  id: string;
  title: string; // メモタイトル
  content: string; // メモ内容（自由記述）
  tags: string[]; // タグ（任意）
  color: 'white' | 'yellow' | 'blue' | 'green' | 'pink'; // カード色
  createdAt: Date;
  updatedAt: Date;
}

// 自己分析データ全体
export interface SelfAnalysisData {
  episodes: SelfAnalysisEpisode[]; // エピソード集
  values: ValueAndMotivation | null; // 価値観・モチベーション
  strengths: StrengthAndWeakness[]; // 強み
  weaknesses: StrengthAndWeakness[]; // 弱み
  vision: FutureVision | null; // 将来ビジョン
  freeNotes: FreeNote[]; // 自由メモ
}

// ES生成リクエスト
export interface ESGenerationRequest {
  companyId: string; // 対象企業
  question: string; // ES設問
  characterLimit: number; // 文字数制限
  selectedEpisodes: string[]; // 使用するエピソードID
  selectedStrengths: string[]; // 使用する強みID
  tone: 'passionate' | 'calm' | 'humble' | 'logical'; // トーン
  useCompanyAnalysis: boolean; // 企業分析を活用するか
}

// トーンのラベル
export const TONE_LABELS: Record<ESGenerationRequest['tone'], string> = {
  passionate: '情熱的に',
  calm: '冷静に',
  humble: '謙虚に',
  logical: '論理的に',
};

// エピソードカテゴリのラベル
export const EPISODE_CATEGORY_LABELS: Record<SelfAnalysisEpisode['category'], string> = {
  gakunika: 'ガクチカ',
  success: '成功体験',
  failure: '挫折経験',
  challenge: '困難克服',
  other: 'その他',
};
