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
